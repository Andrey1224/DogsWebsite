/**
 * Image Compression Utility Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compressImage, compressImages, estimateCompressedSize } from './image-compression';

// Mock browser-image-compression
vi.mock('browser-image-compression', () => ({
  default: vi.fn((file, options) => {
    // Simulate compression by reducing size by ~70%
    const compressedSize = file.size * 0.3;
    return Promise.resolve(
      new Blob([new ArrayBuffer(compressedSize)], {
        type: file.type,
      }),
    );
  }),
}));

describe('Image Compression Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('compressImage', () => {
    it('compresses large images', async () => {
      // Create 1MB test file
      const largeFile = new File([new ArrayBuffer(1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });

      const result = await compressImage(largeFile);

      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe('large.jpg');
      expect(result.size).toBeLessThan(largeFile.size);
    });

    it('skips compression for already small files', async () => {
      // Create 100KB test file (below 400KB threshold)
      const smallFile = new File([new ArrayBuffer(100 * 1024)], 'small.jpg', {
        type: 'image/jpeg',
      });

      const result = await compressImage(smallFile);

      expect(result).toBe(smallFile); // Same instance returned
    });

    it('preserves original filename', async () => {
      const file = new File([new ArrayBuffer(1024 * 1024)], 'test-image.png', {
        type: 'image/png',
      });

      const result = await compressImage(file);

      expect(result.name).toBe('test-image.png');
    });

    it('handles compression errors gracefully', async () => {
      const imageCompression = await import('browser-image-compression');
      vi.mocked(imageCompression.default).mockRejectedValueOnce(new Error('Compression failed'));

      const file = new File([new ArrayBuffer(1024 * 1024)], 'error.jpg', {
        type: 'image/jpeg',
      });

      const result = await compressImage(file);

      // Should return original file on error
      expect(result).toBe(file);
    });

    it('accepts custom compression options', async () => {
      const imageCompression = await import('browser-image-compression');

      const file = new File([new ArrayBuffer(1024 * 1024)], 'custom.jpg', {
        type: 'image/jpeg',
      });

      await compressImage(file, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1024,
        initialQuality: 0.9,
      });

      expect(imageCompression.default).toHaveBeenCalledWith(
        file,
        expect.objectContaining({
          maxSizeMB: 0.2,
          maxWidthOrHeight: 1024,
          initialQuality: 0.9,
        }),
      );
    });
  });

  describe('compressImages', () => {
    it('compresses multiple images in parallel', async () => {
      const files = [
        new File([new ArrayBuffer(1024 * 1024)], 'image1.jpg', { type: 'image/jpeg' }),
        new File([new ArrayBuffer(2 * 1024 * 1024)], 'image2.png', { type: 'image/png' }),
        new File([new ArrayBuffer(500 * 1024)], 'image3.webp', { type: 'image/webp' }),
      ];

      const results = await compressImages(files);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result).toBeInstanceOf(File);
        expect(result.name).toBe(files[index].name);
      });
    });

    it('handles empty array', async () => {
      const results = await compressImages([]);

      expect(results).toEqual([]);
    });
  });

  describe('estimateCompressedSize', () => {
    it('returns original size for small files', () => {
      const smallFile = new File([new ArrayBuffer(200 * 1024)], 'small.jpg', {
        type: 'image/jpeg',
      });

      const estimate = estimateCompressedSize(smallFile);

      expect(estimate).toBe(smallFile.size / 1024 / 1024);
    });

    it('estimates ~70% compression for large files', () => {
      const largeFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });

      const estimate = estimateCompressedSize(largeFile);

      expect(estimate).toBeLessThan(largeFile.size / 1024 / 1024);
      expect(estimate).toBeGreaterThan(0);
    });

    it('respects maximum target size', () => {
      const hugeFile = new File([new ArrayBuffer(10 * 1024 * 1024)], 'huge.jpg', {
        type: 'image/jpeg',
      });

      const estimate = estimateCompressedSize(hugeFile);

      // Should not exceed 400KB target
      expect(estimate).toBeLessThanOrEqual(0.4);
    });

    it('returns size for already small files', () => {
      const tinyFile = new File([new ArrayBuffer(1024)], 'tiny.jpg', {
        type: 'image/jpeg',
      });

      const estimate = estimateCompressedSize(tinyFile);

      // Should return actual size for small files (no compression needed)
      expect(estimate).toBeLessThan(0.4); // Below max threshold
    });
  });
});
