/**
 * @fileoverview Utility functions for client-side image compression.
 * This file provides tools to validate, resize, and compress images to meet specific size constraints
 * before they are uploaded or stored, primarily for use with Firestore to avoid large document sizes.
 */

// #region Validation

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const MAX_IMAGES = 5;
const MAX_ORIGINAL_SIZE_MB = 100; 
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validates image files based on count, size, and type.
 *
 * @param imageFiles An array of File objects from a file input.
 * @returns An object containing the validation status and a list of errors.
 */
export const validateImageFiles = (imageFiles: File[]): ValidationResult => {
  const errors: string[] = [];

  if (imageFiles.length > MAX_IMAGES) {
    errors.push(`You can upload a maximum of ${MAX_IMAGES} images.`);
  }

  for (const file of imageFiles) {
    if (file.size > MAX_ORIGINAL_SIZE_MB * 1024 * 1024) {
      errors.push(`Image "${file.name}" exceeds the ${MAX_ORIGINAL_SIZE_MB}MB size limit.`);
    }
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      errors.push(`Image format for "${file.name}" is not supported. Please use JPEG, PNG, or WebP.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// #endregion

// #region Size Calculation

/**
 * Calculates the approximate size of a base64 string in kilobytes (KB).
 *
 * @param base64String The base64 encoded string.
 * @returns The size in KB.
 */
export const getBase64SizeInKB = (base64String: string): number => {
  const base64Data = base64String.substring(base64String.indexOf(',') + 1);
  const byteLength = (base64Data.length * 3) / 4 - (base64Data.match(/=/g) || []).length;
  return byteLength / 1024;
};

// #endregion

// #region Core Compression Logic

/**
 * Calculates new dimensions for an image to fit within a maximum width, while maintaining aspect ratio.
 *
 * @param originalWidth The original width of the image.
 * @param originalHeight The original height of the image.
 * @param maxWidth The maximum desired width.
 * @returns An object with the new calculated width and height.
 */
export const calculateOptimalDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number
): { width: number; height: number } => {
  if (originalWidth <= maxWidth) {
    return { width: originalWidth, height: originalHeight };
  }
  const aspectRatio = originalHeight / originalWidth;
  return {
    width: maxWidth,
    height: Math.round(maxWidth * aspectRatio),
  };
};

export interface CompressionResult {
  compressedBase64: string;
  finalSizeKB: number;
  attempts: number;
  success: boolean;
  message: string;
}

/**
 * Compresses a single base64 image to a target size using a combination of quality and dimension reduction.
 *
 * @param base64String The base64 string of the image to compress.
 * @param maxSizeKB The target maximum size in KB. Defaults to 600.
 * @param initialQuality The starting JPEG quality (0.0 to 1.0). Defaults to 0.8.
 * @param maxWidth The maximum width for the image. Defaults to 1200.
 * @returns A promise that resolves with the compression result.
 */
export const compressImageToSize = (
  base64String: string,
  maxSizeKB = 600,
  initialQuality = 0.8,
  maxWidth = 1200
): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    const originalSizeKB = getBase64SizeInKB(base64String);
    console.log(`Original image size: ${originalSizeKB.toFixed(2)} KB`);

    if (originalSizeKB <= maxSizeKB) {
      console.log('Image is already under the size limit.');
      return resolve({
        compressedBase64: base64String,
        finalSizeKB: originalSizeKB,
        attempts: 0,
        success: true,
        message: 'No compression needed.',
      });
    }

    const img = new Image();
    img.src = base64String;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Failed to get canvas context.'));

      let { width, height } = calculateOptimalDimensions(img.width, img.height, maxWidth);
      canvas.width = width;
      canvas.height = height;

      let currentQuality = initialQuality;
      let attempts = 0;
      const MAX_ATTEMPTS = 15;

      const compressionStep = () => {
        attempts++;
        console.log(`Compression Attempt #${attempts}: Quality=${currentQuality.toFixed(2)}, Dimensions=${width}x${height}`);

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', currentQuality);
        const currentSizeKB = getBase64SizeInKB(compressedBase64);

        if (currentSizeKB <= maxSizeKB || attempts >= MAX_ATTEMPTS) {
          const success = currentSizeKB <= maxSizeKB;
          console.log(`Compression finished. Final size: ${currentSizeKB.toFixed(2)} KB. Success: ${success}`);
          return resolve({
            compressedBase64,
            finalSizeKB: currentSizeKB,
            attempts,
            success,
            message: success ? 'Compression successful.' : 'Max attempts reached; could not meet size target.',
          });
        }

        if (currentQuality > 0.3) {
          currentQuality -= 0.1;
        } else {
          width = Math.round(width * 0.9);
          height = Math.round(height * 0.9);
          canvas.width = width;
          canvas.height = height;
          currentQuality = 0.7; // Reset quality for new dimensions
        }
        
        // Non-blocking loop
        requestAnimationFrame(compressionStep);
      };

      compressionStep();
    };

    img.onerror = () => reject(new Error('Failed to load image for compression.'));
  });
};

// #endregion

// #region Batch Processing

/**
 * Compresses an array of base64 image strings in parallel.
 *
 * @param imageArray An array of objects, each containing a base64 string.
 * @param maxSizeKB The target maximum size for each image in KB.
 * @returns A promise that resolves with an array of compression results.
 */
export const compressImageArray = async (
  imageArray: { base64: string }[],
  maxSizeKB = 600
): Promise<CompressionResult[]> => {
  console.log(`Starting compression for ${imageArray.length} images...`);
  const startTime = Date.now();

  const compressionPromises = imageArray.map(image => 
    compressImageToSize(image.base64, maxSizeKB)
  );
  
  const results = await Promise.all(compressionPromises);
  
  const endTime = Date.now();
  console.log(`Total compression time: ${(endTime - startTime) / 1000} seconds`);
  
  return results;
};

/**
 * Generates a small thumbnail from a base64 image, suitable for previews.
 *
 * @param base64String The base64 string of the source image.
 * @param maxSizeKB The target maximum size for the thumbnail in KB. Defaults to 50.
 * @param maxWidth The maximum width of the thumbnail. Defaults to 200.
 * @returns A promise that resolves with the compressed thumbnail base64 string.
 */
export const generateThumbnail = async (
  base64String: string,
  maxSizeKB = 50,
  maxWidth = 200
): Promise<string> => {
    try {
        const result = await compressImageToSize(base64String, maxSizeKB, 0.7, maxWidth);
        if (!result.success) {
            console.warn("Thumbnail generation exceeded size limit, but returning best effort image.");
        }
        return result.compressedBase64;
    } catch (error) {
        console.error("Failed to generate thumbnail:", error);
        throw new Error("Thumbnail generation failed.");
    }
};

// #endregion
