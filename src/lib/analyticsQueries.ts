import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  limit,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import {
  UserAnalyticsSummary,
  UserProductView,
  ProductAnalyticsSummary,
  ProductViewer,
} from "../types/Analytics";

export async function getUserAnalyticsSummary(
  userId: string
): Promise<UserAnalyticsSummary | null> {
  const summaryRef = doc(db, `users/${userId}/analytics`, "summary");
  const docSnap = await getDoc(summaryRef);
  return docSnap.exists() ? (docSnap.data() as UserAnalyticsSummary) : null;
}

export async function getUserProductHistory(
  userId: string,
  limitCount = 20
): Promise<UserProductView[]> {
  const historyCollection = collection(
    db,
    `users/${userId}/analytics/products`
  );
  const q = query(
    historyCollection,
    orderBy("lastViewed", "desc"),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as UserProductView)
  );
}

export async function getUserRecentlyViewedProducts(
    userId: string,
    days = 30,
    limitCount = 10
): Promise<UserProductView[]> {
    const historyCollection = collection(db, `users/${userId}/analytics/products`);
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);
    const sinceTimestamp = Timestamp.fromDate(sinceDate);

    const q = query(
        historyCollection,
        where("lastViewed", ">=", sinceTimestamp),
        orderBy("lastViewed", "desc"),
        limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProductView));
}

export async function getProductAnalytics(
  productId: string
): Promise<ProductAnalyticsSummary | null> {
  const summaryRef = doc(db, `products/${productId}/analytics`, "summary");
  const docSnap = await getDoc(summaryRef);
  return docSnap.exists()
    ? (docSnap.data() as ProductAnalyticsSummary)
    : null;
}

export async function getProductTopViewers(
    productId: string,
    limitCount = 10
): Promise<ProductViewer[]> {
    const viewersCollection = collection(db, `products/${productId}/analytics/users`);
    const q = query(viewersCollection, orderBy("viewCount", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductViewer));
}

export async function getTrendingProducts(limitCount = 10): Promise<ProductAnalyticsSummary[]> {
    const productsCollection = collection(db, 'products');
    const q = query(
        productsCollection,
        orderBy("analytics.totalViews", "desc"),
        limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data.analytics
        } as ProductAnalyticsSummary
    });
}
