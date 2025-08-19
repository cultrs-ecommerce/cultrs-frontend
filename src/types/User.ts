import { Timestamp } from "firebase/firestore";

export interface User {
  id: string; // Corresponds to Firebase Auth UID
  email: string;
  name: string;
  profilePictureUrl?: string;
  listedProducts: string[]; // Array of product IDs
  rating: number;
  reviewsCount: number;
  itemsSold: number;
  zipCode?: number;
  createdAt: Timestamp;
}
