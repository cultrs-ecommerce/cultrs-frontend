import { db } from "../firebaseConfig";
import {
  doc,
  serverTimestamp,
  runTransaction,
  increment, // Import increment directly
} from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";
import { ProductViewEvent } from "../types/Analytics";

const BATCH_SIZE = 10;
const TIME_LIMIT_MS = 60000; // 1 minute
const LOCAL_STORAGE_KEY = "analyticsQueue";

let analyticsQueue: ProductViewEvent[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

// Debounce map to prevent rapid views of the same product
const debounceMap = new Map<string, NodeJS.Timeout>();
const DEBOUNCE_TIME_MS = 5000; // 5 seconds

// Load queue from localStorage on startup
if (typeof window !== "undefined") {
  try {
    const storedQueue = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedQueue) {
      analyticsQueue = JSON.parse(storedQueue);
    }
  } catch (error) {
    console.error("Failed to parse analytics queue from localStorage", error);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}

export async function flushAnalyticsQueue(isUnloading = false) {
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  if (analyticsQueue.length === 0) {
    return;
  }

  const eventsToProcess = [...analyticsQueue];
  const failedEvents: ProductViewEvent[] = [];
  analyticsQueue = [];
  localStorage.removeItem(LOCAL_STORAGE_KEY);

  if (isUnloading && navigator.sendBeacon) {
    const beaconUrl = "/api/analytics";
    try {
      const blob = new Blob([JSON.stringify(eventsToProcess)], { type: "application/json" });
      navigator.sendBeacon(beaconUrl, blob);
    } catch (e) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(eventsToProcess));
    }
    return;
  }

  for (const event of eventsToProcess) {
    try {
      await runTransaction(db, async (transaction) => {
        const { userId, productId } = event;

        const userProductRef = doc(db, `users/${userId}/analytics/products`, productId);
        const userSummaryRef = doc(db, `users/${userId}/analytics`, "summary");
        const productUserRef = doc(db, `products/${productId}/analytics/users`, userId);
        const productSummaryRef = doc(db, `products/${productId}/analytics`, "summary");

        const [
            userProductDoc,
            userSummaryDoc,
            productUserDoc,
            productSummaryDoc,
        ] = await Promise.all([
            transaction.get(userProductRef),
            transaction.get(userSummaryRef),
            transaction.get(productUserRef),
            transaction.get(productSummaryRef),
        ]);

        const now = serverTimestamp();

        if (userProductDoc.exists()) {
          transaction.update(userProductRef, {
            viewCount: increment(1), // Corrected usage
            lastViewed: now,
          });
        } else {
          transaction.set(userProductRef, {
            viewCount: 1,
            firstViewed: now,
            lastViewed: now,
          });
        }

        if (userSummaryDoc.exists()) {
          transaction.update(userSummaryRef, {
            totalViews: increment(1), // Corrected usage
            uniqueProductsViewed: userProductDoc.exists() ? increment(0) : increment(1), // Corrected usage
            lastActivity: now,
          });
        } else {
          transaction.set(userSummaryRef, {
            totalViews: 1,
            uniqueProductsViewed: 1,
            lastActivity: now,
          });
        }

        if (productUserDoc.exists()) {
            transaction.update(productUserRef, {
              viewCount: increment(1), // Corrected usage
              lastViewed: now,
            });
        } else {
            transaction.set(productUserRef, {
                viewCount: 1,
                lastViewed: now,
            });
        }

        if (productSummaryDoc.exists()) {
          transaction.update(productSummaryRef, {
            totalViews: increment(1), // Corrected usage
            uniqueViewers: productUserDoc.exists() ? increment(0) : increment(1), // Corrected usage
            lastViewed: now,
          });
        } else {
          transaction.set(productSummaryRef, {
            totalViews: 1,
            uniqueViewers: 1,
            lastViewed: now,
          });
        }
      });
    } catch (error) {
      console.error(`Failed to process analytics event for product ${event.productId}. Re-queuing.`, error);
      failedEvents.push(event);
    }
  }

  if (failedEvents.length > 0) {
    analyticsQueue.unshift(...failedEvents);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(analyticsQueue));
  }

  console.log(`Analytics flushed. Processed: ${eventsToProcess.length - failedEvents.length}, Failed: ${failedEvents.length}`);
}

export function trackProductView(userId: string, productId: string) {
    const debounceKey = `${userId}-${productId}`;
    if (debounceMap.has(debounceKey)) {
        return;
    }

    const timeout = setTimeout(() => {
        debounceMap.delete(debounceKey);
    }, DEBOUNCE_TIME_MS);
    debounceMap.set(debounceKey, timeout);

  try {
    const analytics = getAnalytics();
    logEvent(analytics, 'view_item', {
        item_id: productId,
    });
  } catch(error) {
    console.error("Firebase Analytics tracking failed.", error)
  }

  const event: ProductViewEvent = {
    userId,
    productId,
    timestamp: Date.now(),
  };

  analyticsQueue.push(event);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(analyticsQueue));

  if (analyticsQueue.length >= BATCH_SIZE) {
    flushAnalyticsQueue();
  } else if (!flushTimeout) {
    flushTimeout = setTimeout(() => flushAnalyticsQueue(), TIME_LIMIT_MS);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => flushAnalyticsQueue(true));
}
