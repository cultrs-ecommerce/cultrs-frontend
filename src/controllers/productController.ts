import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs,
  limit,
  documentId,
} from "firebase/firestore";
import { Product } from "@/types/Product";

// Assuming your Product interface doesn't include the File objects for images
interface ProductDataWithoutImages
  extends Omit<
    Product,
    "imageUrls" | "createdAt" | "updatedAt" | "status" | "likesCount" | "viewsCount"
  > {}

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const createProduct = async (
  productData: ProductDataWithoutImages,
  imageFiles: File[],
): Promise<void> => {
  try {
    // 1. Convert images to Base64 strings
    const imageUrls: string[] = [];
    for (const imageFile of imageFiles) {
      const base64String = await toBase64(imageFile);
      imageUrls.push(base64String);
    }

    // 2. Prepare product data for Firestore
    const newProduct: Omit<Product, "id"> = {
      ...productData,
      imageUrls: imageUrls,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: "active", // Set initial status
      likesCount: 0, // Set initial likes count
      viewsCount: 0, // Set initial views count
    };

    // 3. Add the new product to Firestore
    await addDoc(collection(db, "products"), newProduct);
  } catch (error) {
    console.error("Error creating product: ", error);
    // You might want to throw the error or handle it in a way that the UI can respond
    throw error;
  }
};

export const fetchSellerProducts = async (
  sellerId: string,
  currentProductId: string,
): Promise<Product[]> => {
  if (!sellerId) return [];
  try {
    const productsRef = collection(db, "products");
    const q = query(
      productsRef,
      where("owner_id", "==", sellerId),
      where(documentId(), "!=", currentProductId),
      limit(3),
    );

    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    return products;
  } catch (error) {
    console.error("Error fetching seller products:", error);
    return [];
  }
};
