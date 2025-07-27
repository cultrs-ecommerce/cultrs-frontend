import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

interface Product {
    id?: string; // Firestore document ID
    owner_id: string; // User ID of the seller (string, matches Firebase Auth UID)
    title: string; // string
    price: number; // number (store as number for easier querying/sorting by price)
    category: string; // string (will store one of the values from your categories list)
    condition: string; // string (will store one of the values from your conditions list)
    brand?: string; // string (optional)
    description: string; // string
    sizes: string[]; // array of strings (will store selected sizes from your sizes list)
    imageUrls: string[]; // array of strings (Cloud Storage download URLs, max 3)
    tags: string[]; // array of strings (flexible for user-generated or pre-defined tags)
    shippingInfo: 'seller_pays' | 'buyer_pays' | 'pickup_only'; // string (using a union type for clarity)
    measurements?: string; // string (optional)
    material?: string; // string (optional)
    createdAt: firebase.firestore.Timestamp; // Firestore timestamp for when the listing was created
    updatedAt: firebase.firestore.Timestamp; // Firestore timestamp for when the listing was last updated
    status: 'active' | 'sold' | 'draft' | 'paused'; // string (track listing status)
    likesCount: number; // number (to track likes/favorites)
    viewsCount: number; // number (to track views)
  }
  