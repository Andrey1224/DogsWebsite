/**
 * Client-side Image Compression Utility
 *
 * Automatically compresses images before upload to reduce file size
 * and improve page load performance.
 */

import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  /**
   * Maximum width/height in pixels (default: 1920)
   */
  maxSizeMB?: number;
  /**
   * Maximum file size in MB (default: 0.4 = 400KB)
   */
  maxWidthOrHeight?: number;
  /**
   * Use WebP format (default: true)
   */
  useWebWorker?: boolean;
  /**
   * Image quality 0-1 (default: 0.85)
   */
  initialQuality?: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxSizeMB: 0.4, // 400KB target
  maxWidthOrHeight: 1920, // Full HD max dimension
  useWebWorker: true, // Don't block main thread
  initialQuality: 0.85, // Good balance of quality/size
};

/**
 * Compress an image file before upload
 *
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed file with original name preserved
 *
 * @example
 * ```ts
 * const compressedFile = await compressImage(file);
 * // Upload compressedFile instead of original
 * ```
 */
export async function compressImage(file: File, options: CompressionOptions = {}): Promise<File> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Check if file is already small enough
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB <= mergedOptions.maxSizeMB) {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Image Compression] File already optimized: ${file.name} (${fileSizeMB.toFixed(2)}MB)`,
        );
      }
      return file;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Image Compression] Compressing: ${file.name} (${fileSizeMB.toFixed(2)}MB)`);
    }

    const compressedFile = await imageCompression(file, mergedOptions);

    const compressedSizeMB = compressedFile.size / 1024 / 1024;
    const savedMB = fileSizeMB - compressedSizeMB;
    const savedPercent = ((savedMB / fileSizeMB) * 100).toFixed(1);

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Image Compression] ✓ Compressed ${file.name}: ${fileSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB (saved ${savedPercent}%)`,
      );
    }

    // Preserve original file name
    return new File([compressedFile], file.name, {
      type: compressedFile.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('[Image Compression] Failed to compress image:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Compress multiple images in parallel
 *
 * @param files - Array of image files to compress
 * @param options - Compression options
 * @returns Array of compressed files
 *
 * @example
 * ```ts
 * const compressedFiles = await compressImages(fileList);
 * ```
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {},
): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file, options)));
}

/**
 * Get estimated compression savings
 *
 * @param file - The image file to analyze
 * @returns Estimated size after compression in MB
 */
export function estimateCompressedSize(file: File): number {
  const fileSizeMB = file.size / 1024 / 1024;

  // If already small, no compression needed
  if (fileSizeMB <= DEFAULT_OPTIONS.maxSizeMB) {
    return fileSizeMB;
  }

  // Estimate ~70% compression for large images
  const estimatedSize = Math.min(fileSizeMB * 0.3, DEFAULT_OPTIONS.maxSizeMB);
  return Math.max(estimatedSize, 0.05); // Minimum 50KB
}
