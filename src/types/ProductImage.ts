import { Timestamp } from "firebase/firestore";

// New ProductImage interface for separate collection
export interface ProductImage {
  id?: string;
  productId: string; // Reference to parent product
  imageData: string; // Base64 image data
  order: number; // 0, 1, 2, 3, 4 (for ordering images)
  uploadedAt: Timestamp;
  isPrimary?: boolean; // Mark the main display image
}
