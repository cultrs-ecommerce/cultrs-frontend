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
import {
  validateImageFiles as validateFiles,
  compressImageArray,
  generateThumbnail,
  ValidationResult,
} from '@/lib/ImageCompressionUtils';


/**
 * Converts a File object to a base64 string.
 * @param file The file to convert.
 * @returns A promise that resolves with the base64 string.
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Validates image files before processing.
 * @param imageFiles An array of File objects.
 * @returns A validation result object.
 */
export const validateImages = (imageFiles: File[]): ValidationResult => {
    return validateFiles(imageFiles);
};

/**
 * Saves a new product with its images to Firestore after compression.
 * This function uses a batch write to ensure atomic operations.
 *
 * @param productData The product data (without images).
 * @param imageFiles An array of File objects for the product images.
 * @returns The ID of the newly created product.
 * @throws Throws an error if validation or the save operation fails.
 */
export const saveProduct = async (
  productData: Omit<Product, 'id' | 'imageCount' | 'primaryImageUrl' | 'createdAt' | 'updatedAt' | 'status' | 'likesCount' | 'viewsCount'>,
  imageFiles: File[]
): Promise<string> => {
  // 1. Validate images
  const validation = validateImages(imageFiles);
  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  // 2. Convert files to base64
  const base64Images = await Promise.all(imageFiles.map(fileToBase64));
  const imageObjects = base64Images.map(base64 => ({ base64 }));

  // 3. Compress images
  console.log("Starting image compression...");
  const compressedResults = await compressImageArray(imageObjects);
  const failedCompressions = compressedResults.filter(r => !r.success);
  if (failedCompressions.length > 0) {
    // Optionally, handle partially successful uploads or just fail
    throw new Error(`Failed to compress ${failedCompressions.length} images to the required size.`);
  }

  const compressedImagesData = compressedResults.map(r => r.compressedBase64);

  // 4. Generate Thumbnail
  let primaryImageUrl: string | undefined = undefined;
  if (compressedImagesData.length > 0) {
    console.log("Generating thumbnail...");
    primaryImageUrl = await generateThumbnail(compressedImagesData[0]);
  }

  // 5. Prepare and execute batch write to Firestore
  const batch = writeBatch(db);
  const productRef = doc(collection(db, "products"));

  const newProduct: Omit<Product, 'id'> = {
    ...productData,
    imageCount: compressedImagesData.length,
    primaryImageUrl,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
    status: 'active',
    likesCount: 0,
    viewsCount: 0,
  };
  batch.set(productRef, newProduct);

  compressedImagesData.forEach((imageData, index) => {
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
    console.log(`Product saved successfully with ID: ${productRef.id}`);
    return productRef.id;
  } catch (error) {
    console.error("Error saving product:", error);
    throw new Error("Failed to save product. Please try again.");
  }
};

/**
 * Updates the images for a given product with new, compressed images.
 * This function will delete all existing images and replace them with the new ones.
 *
 * @param productId The ID of the product to update.
 * @param newImageFiles An array of new File objects for the images.
 * @throws Throws an error if validation or the update operation fails.
 */
export const updateProductImages = async (productId: string, newImageFiles: File[]): Promise<void> => {
  // 1. Validate new images
  const validation = validateImages(newImageFiles);
  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }
  
  // 2. Convert and compress new images
  console.log(`Starting image compression for product update: ${productId}`);
  const base64Images = await Promise.all(newImageFiles.map(fileToBase64));
  const imageObjects = base64Images.map(base64 => ({ base64 }));
  
  const compressedResults = await compressImageArray(imageObjects);
  const failedCompressions = compressedResults.filter(r => !r.success);
  if (failedCompressions.length > 0) {
    throw new Error(`Failed to compress ${failedCompressions.length} new images.`);
  }
  
  const newCompressedImages = compressedResults.map(r => r.compressedBase64);

  // 3. Generate new thumbnail
  let newPrimaryImageUrl: string | undefined = undefined;
  if (newCompressedImages.length > 0) {
    console.log("Generating new thumbnail...");
    newPrimaryImageUrl = await generateThumbnail(newCompressedImages[0]);
  }

  const batch = writeBatch(db);
  const productRef = doc(db, "products", productId);

  // 4. Delete old images
  const oldImages = await getProductImages(productId);
  console.log(`Deleting ${oldImages.length} old images.`);
  oldImages.forEach(image => {
    const imageRef = doc(db, "productImages", image.id!);
    batch.delete(imageRef);
  });

  // 5. Add new images
  console.log(`Adding ${newCompressedImages.length} new images.`);
  newCompressedImages.forEach((imageData, index) => {
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

  // 6. Update product document with new image info
  batch.update(productRef, {
    imageCount: newCompressedImages.length,
    primaryImageUrl: newPrimaryImageUrl || deleteField(),
    updatedAt: serverTimestamp()
  });

  try {
    await batch.commit();
    console.log("Product images updated successfully.");
  } catch (error) {
    console.error("Error updating product images:", error);
    throw new Error("Failed to update product images.");
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
export const updateProduct = async (productId: string, productData: {owner_id: string, title: string, price: number, category: string, condition: string, description: string, sizes: Size[], tags: string[], shippingInfo: string, brand?: string, material?: string, careInstructions?: string}, newImageFiles: File[]): Promise<void> => {
  const batch = writeBatch(db);
  const productRef = doc(db, "products", productId);

  const validation = validateImages(newImageFiles);
  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }
  
  // 2. Convert and compress new images
  console.log(`Starting image compression for product update: ${productId}`);
  const base64Images = await Promise.all(newImageFiles.map(fileToBase64));
  const imageObjects = base64Images.map(base64 => ({ base64 }));
  
  const compressedResults = await compressImageArray(imageObjects);
  const failedCompressions = compressedResults.filter(r => !r.success);
  if (failedCompressions.length > 0) {
    throw new Error(`Failed to compress ${failedCompressions.length} new images.`);
  }
  
  const newCompressedImages = compressedResults.map(r => r.compressedBase64);

  // 3. Generate new thumbnail
  let newPrimaryImageUrl: string | undefined = undefined;
  if (newCompressedImages.length > 0) {
    console.log("Generating new thumbnail...");
    newPrimaryImageUrl = await generateThumbnail(newCompressedImages[0]);
  }

  // 1. Delete old images
  const oldImages = await getProductImages(productId);
  oldImages.forEach(image => {
    const imageRef = doc(db, "productImages", image.id!);
    batch.delete(imageRef);
  });

  // 2. Add new images
  newCompressedImages.forEach((imageData, index) => {
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
    imageCount: newCompressedImages.length,
    primaryImageUrl: newPrimaryImageUrl || deleteField(),
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
