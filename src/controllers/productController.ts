import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  writeBatch,
  deleteField,
  serverTimestamp,
  Timestamp,
  limit,
  documentId,
  deleteDoc,
  addDoc,
  updateDoc
} from 'firebase/firestore';
import { Product } from "@/types/Product";
import { ProductImage } from "@/types/ProductImage";
import { Size } from "@/constants/productEnums";
import { ProductWithSeller } from "@/types/ProductWithSeller";
import { User } from "@/types/User";

/**
 * Saves a new product with its images to Firestore.
 * This function uses a batch write to ensure atomic operations.
 *
 * @param productData The product data (without images).
 * @param imageFiles An array of base64 encoded image strings.
 * @returns The ID of the newly created product.
 * @throws Throws an error if the operation fails.
 */
export const saveProduct = async (productData: Omit<Product, 'id' | 'imageCount' | 'primaryImageUrl' | 'createdAt' | 'updatedAt' | 'status' | 'likesCount' | 'viewsCount'>, imageFiles: string[]): Promise<string> => {
  const batch = writeBatch(db);
  const productRef = doc(collection(db, "products"));

  const primaryImageUrl = imageFiles.length > 0 ? imageFiles[0] : undefined;

  const newProduct: Omit<Product, 'id'> = {
    ...productData,
    imageCount: imageFiles.length,
    primaryImageUrl,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
    status: 'active',
    likesCount: 0,
    viewsCount: 0,
  };

  batch.set(productRef, newProduct);

  imageFiles.forEach((imageData, index) => {
    const imageRef = doc(collection(db, "productImages"));
    const newImage: Omit<ProductImage, 'id'> = {
      productId: productRef.id,
      imageData,
      order: index,
      uploadedAt: serverTimestamp() as Timestamp,
      isPrimary: index === 0,
    };
    batch.set(imageRef, newImage);
  });

  try {
    await batch.commit();
    return productRef.id;
  } catch (error) {
    console.error("Error saving product:", error);
    throw new Error("Failed to save product. Please try again.");
  }
};

/**
 * Updates an existing product with its images to Firestore.
 *
 * @param productId The ID of the product to update.
 * @param productData The product data to update.
 * @param newImageFiles An array of new base64 encoded image strings.
 * @throws Throws an error if the operation fails.
 */
export const updateProduct = async (productId: string, productData: {owner_id: string, title: string, price: number, category: string, condition: string, description: string, sizes: Size[], tags: string[], shippingInfo: string, brand?: string, material?: string, careInstructions?: string}, newImageFiles: string[]): Promise<void> => {
  const batch = writeBatch(db);
  const productRef = doc(db, "products", productId);

  // 1. Delete old images
  const oldImages = await getProductImages(productId);
  oldImages.forEach(image => {
    const imageRef = doc(db, "productImages", image.id!);
    batch.delete(imageRef);
  });

  // 2. Add new images
  const primaryImageUrl = newImageFiles.length > 0 ? newImageFiles[0] : undefined;
  newImageFiles.forEach((imageData, index) => {
    const imageRef = doc(collection(db, "productImages"));
    const newImage: Omit<ProductImage, 'id'> = {
      productId: productId,
      imageData,
      order: index,
      uploadedAt: serverTimestamp() as Timestamp,
      isPrimary: index === 0,
    };
    batch.set(imageRef, newImage);
  });
  
  // 3. Update product document
  batch.update(productRef, {
    ...productData,
    imageCount: newImageFiles.length,
    primaryImageUrl: primaryImageUrl || deleteField(),
    updatedAt: serverTimestamp()
  });

  try {
    await batch.commit();
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error("Failed to update product.");
  }
}

/**
 * Retrieves a single product and all its associated images.
 *
 * @param productId The ID of the product to retrieve.
 * @returns A product object with an array of its images, or null if not found.
 * @throws Throws an error if the operation fails.
 */
export const getProductWithImages = async (productId: string): Promise<(Product & { images: ProductImage[] }) | null> => {
  const productRef = doc(db, "products", productId);
  try {
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      console.warn(`Product with ID ${productId} not found.`);
      return null;
    }

    const productData = { id: productSnap.id, ...productSnap.data() } as Product;
    const images = await getProductImages(productId);

    return { ...productData, images };
  } catch (error) {
    console.error("Error getting product with images:", error);
    throw new Error("Failed to retrieve product details.");
  }
};

/**
 * Retrieves all images for a specific product, ordered by the 'order' field.
 *
 * @param productId The ID of the product whose images are to be retrieved.
 * @returns A promise that resolves to an array of ProductImage objects.
 * @throws Throws an error if the query fails.
 */
export const getProductImages = async (productId: string): Promise<ProductImage[]> => {
  try {
    const imagesRef = collection(db, "productImages");
    const q = query(imagesRef, where("productId", "==", productId), orderBy("order"));
    const querySnapshot = await getDocs(q);
    const images: ProductImage[] = [];
    querySnapshot.forEach((doc) => {
      images.push({ id: doc.id, ...doc.data() } as ProductImage);
    });
    return images;
  } catch (error) {
    console.error("Error getting product images:", error);
    throw new Error("Failed to retrieve product images.");
  }
};


/**
 * Fetches all active products with their primary images for listing pages.
 * @returns A promise that resolves to an array of active products.
 */
export const getAllProductsWithPrimaryImages = async (): Promise<Product[]> => {
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
 * Updates the images for a given product.
 * This function will delete all existing images and replace them with the new ones.
 *
 * @param productId The ID of the product to update.
 * @param newImages An array of new base64 encoded image strings.
 * @throws Throws an error if the operation fails.
 */
export const updateProductImages = async (productId: string, newImages: string[]): Promise<void> => {
  const batch = writeBatch(db);
  const productRef = doc(db, "products", productId);

  // 1. Delete old images
  const oldImages = await getProductImages(productId);
  oldImages.forEach(image => {
    const imageRef = doc(db, "productImages", image.id!);
    batch.delete(imageRef);
  });

  // 2. Add new images
  const primaryImageUrl = newImages.length > 0 ? newImages[0] : undefined;
  newImages.forEach((imageData, index) => {
    const imageRef = doc(collection(db, "productImages"));
    const newImage: Omit<ProductImage, 'id'> = {
      productId: productId,
      imageData,
      order: index,
      uploadedAt: serverTimestamp() as Timestamp,
      isPrimary: index === 0,
    };
    batch.set(imageRef, newImage);
  });

  // 3. Update product document
  batch.update(productRef, {
    imageCount: newImages.length,
    primaryImageUrl: primaryImageUrl || deleteField(),
    updatedAt: serverTimestamp()
  });

  try {
    await batch.commit();
  } catch (error) {
    console.error("Error updating product images:", error);
    throw new Error("Failed to update product images.");
  }
};

/**
 * Deletes a product and all of its associated images from Firestore.
 *
 * @param productId The ID of the product to delete.
 * @throws Throws an error if the operation fails.
 */
export const deleteProduct = async (productId: string): Promise<void> => {
  const batch = writeBatch(db);
  const productRef = doc(db, "products", productId);

  // Delete product document
  batch.delete(productRef);

  // Delete associated images
  const images = await getProductImages(productId);
  images.forEach(image => {
    const imageRef = doc(db, "productImages", image.id!);
    batch.delete(imageRef);
  });

  try {
    await batch.commit();
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Failed to delete product.");
  }
};

/**
 * Migrates existing products with `imageUrls` to the new `productImages` collection structure.
 * This is a one-time operation.
 *
 * @returns A summary of the migration process.
 * @throws Throws an error if the migration fails.
 */
export const migrateExistingProducts = async (): Promise<{ migrated: number; skipped: number; errors: number; }> => {
  const productsRef = collection(db, "products");
  const snapshot = await getDocs(productsRef);
  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const productDoc of snapshot.docs) {
    const product = productDoc.data() as any;
    if (product.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
      const batch = writeBatch(db);
      const productId = productDoc.id;

      product.imageUrls.forEach((url: string, index: number) => {
        const imageRef = doc(collection(db, "productImages"));
        const newImage: Omit<ProductImage, 'id'> = {
          productId: productId,
          imageData: url, // Assuming imageUrls are base64 strings
          order: index,
          uploadedAt: serverTimestamp() as Timestamp,
          isPrimary: index === 0,
        };
        batch.set(imageRef, newImage);
      });

      const productRef = doc(db, "products", productId);
      batch.update(productRef, {
        imageUrls: deleteField(),
        imageCount: product.imageUrls.length,
        primaryImageUrl: product.imageUrls[0],
        updatedAt: serverTimestamp()
      });

      try {
        await batch.commit();
        migrated++;
        console.log(`Migrated product ${productId}`);
      } catch (error) {
        errors++;
        console.error(`Error migrating product ${productId}:`, error);
      }
    } else {
      skipped++;
    }
  }
  console.log(`Migration complete. Migrated: ${migrated}, Skipped: ${skipped}, Errors: ${errors}`);
  return { migrated, skipped, errors };
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
 * Searches for products using a fuzzy matching algorithm.
 * @param query The search query.
 * @returns A promise that resolves to an array of products sorted by relevance.
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
    try {
        const allProducts = await getAllProductsWithPrimaryImages();
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

/**
 * Retrieves the latest product listings.
 * @param count The number of listings to retrieve.
 * @returns A promise that resolves to an array of the latest products.
 */
export const getLatestListings = async (count = 10): Promise<Product[]> => {
  try {
    const productsRef = collection(db, "products");
    const q = query(
      productsRef,
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });

    const productsWithOwners = await Promise.all(products.map(async (product) => {
      if (product.owner_id) {
        const userRef = doc(db, "users", product.owner_id);
        const userSnap = await getDoc(userRef);
        const ownerName = userSnap.exists() ? (userSnap.data() as any).name : 'Unknown Seller';
        return { ...product, seller: {name: ownerName} };
      }
      return { ...product, seller: {name: 'Unknown Seller'} };
    }));

    return productsWithOwners as ProductWithSeller[];
  } catch (error) {
    console.error("Error fetching latest listings:", error);
    throw new Error("Failed to fetch latest listings.");
  }
};

export const fetchProductsAndSellers = async (filter?: string): Promise<ProductWithSeller[]> => {
  try {
    const productsRef = collection(db, "products");
    let q = query(productsRef, where("status", "==", "active"));

    if (filter === 'newlyCreated') {
      q = query(q, orderBy("createdAt", "desc"));
    }

    const querySnapshot = await getDocs(q);
    const productsData: Product[] = [];
    querySnapshot.forEach((doc) => {
      productsData.push({ id: doc.id, ...doc.data() } as Product);
    });

    const productsWithSellers: ProductWithSeller[] = await Promise.all(
      productsData.map(async (product) => {
        let seller: User;
        if (product.owner_id) {
          const userDocRef = doc(db, "users", product.owner_id);
          const userDocSnap = await getDoc(userDocRef);
          seller = userDocSnap.exists()
            ? ({ id: userDocSnap.id, ...userDocSnap.data() } as User)
            : { id: 'unknown', name: 'Unknown Seller', email: '', listedProducts: [], rating: 0, reviewsCount: 0, itemsSold: 0, createdAt: Timestamp.now() };
        } else {
          seller = { id: 'unknown', name: 'Unknown Seller', email: '', listedProducts: [], rating: 0, reviewsCount: 0, itemsSold: 0, createdAt: Timestamp.now() };
        }
        return { ...product, seller };
      })
    );
    return productsWithSellers;
  } catch (error) {
    console.error("Error fetching data: ", error);
    throw new Error("Failed to fetch products and sellers.");
  }
};