import { Timestamp } from "firebase/firestore";

export interface ProductViewEvent {
  userId: string;
  productId: string;
  timestamp: number; // Using number (Date.now()) for easy serialization
}

export interface UserAnalyticsSummary {
  totalViews: number;
  uniqueProductsViewed: number;
  lastActivity: Timestamp;
}

export interface UserProductView {
  id: string; // productId
  viewCount: number;
  firstViewed: Timestamp;
  lastViewed: Timestamp;
}

export interface ProductAnalyticsSummary {
  totalViews: number;
  uniqueViewers: number;
  lastViewed: Timestamp;
}

export interface ProductViewer {
    id: string; // userId
    viewCount: number;
    lastViewed: Timestamp;
}
