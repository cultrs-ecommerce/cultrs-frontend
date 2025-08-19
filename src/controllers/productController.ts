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

/**
 * Calculates the Levenshtein distance between two strings.
 * @param a The first string.
 * @param b The second string.
 * @returns The Levenshtein distance.
 */
const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Fetches all active products from Firestore.
 * @returns A promise that resolves to an array of active products.
 */
export const getAllProducts = async (): Promise<Product[]> => {
    try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("status", "==", "active"));
        const querySnapshot = await getDocs(q);
        const products: Product[] = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() } as Product);
        });
        return products;
    } catch (error) {
        console.error("Error fetching all products:", error);
        throw error;
    }
};

/**
 * Searches for products using a fuzzy matching algorithm.
 * @param query The search query.
 * @returns A promise that resolves to an array of products sorted by relevance.
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
    try {
        const allProducts = await getAllProducts();
        const searchTerms = query.toLowerCase().split(" ").filter(term => term);

        const scoredProducts = allProducts.map(product => {
            let score = 0;

            const searchableIndex = [
                { text: product.title, weight: 10 },
                { text: product.description, weight: 2 },
                { text: product.category, weight: 5 },
                { text: product.material, weight: 3 },
                { text: product.condition, weight: 3 },
                { text: product.brand, weight: 3 },
                { text: product.careInstructions, weight: 1 },
                { text: product.tags.join(" "), weight: 5 },
                { text: product.sizes.join(" "), weight: 3 }
            ].filter(field => field.text);

            searchTerms.forEach(term => {
                searchableIndex.forEach(field => {
                    const fieldTerms = field.text.toLowerCase().split(" ");
                    fieldTerms.forEach(fieldTerm => {
                        const distance = levenshteinDistance(term, fieldTerm);
                        const similarity = 1 - distance / Math.max(term.length, fieldTerm.length);
                        // very low similarity since there may not be many products initially
                        if (similarity > 0.5) {
                            score += similarity * field.weight;
                        }
                    });
                });
            });

            return { product, score };
        });

        const filteredAndSortedProducts = scoredProducts
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.product);

        return filteredAndSortedProducts;
    } catch (error) {
        console.error("Error searching products:", error);
        throw error;
    }
};