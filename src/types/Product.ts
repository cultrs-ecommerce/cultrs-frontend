import { Timestamp } from "firebase/firestore";
import { Category, Condition, Size, ShippingOption } from "@/constants/productEnums";

export interface Product {
  id?: string; // Firestore document ID
  owner_id: string; // User ID of the seller (string, matches Firebase Auth UID)
  title: string; // string
  price: number; // number
  category: Category; // Use the Category union type
  condition: Condition; // Use the Condition union type
  brand?: string; // string (optional)
  description: string; // string
  sizes: Size[]; // Use the Size union type for the array elements
  imageUrls: string[]; // array of strings (Cloud Storage download URLs, max 3)
  tags: string[]; // array of strings
  shippingInfo: ShippingOption; // Use the ShippingOption union type
  measurements?: string; // string (optional)
  material?: string; // string (optional)
  createdAt: Timestamp; // Firestore timestamp
  updatedAt: Timestamp; // Firestore timestamp
  careInstructions?: string;
  status: 'active' | 'sold' | 'draft' | 'paused'; // string (track listing status)
  likesCount: number; // number (to track likes/favorites)
  viewsCount: number; // number (to track views)
}