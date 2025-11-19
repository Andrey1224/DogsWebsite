#!/usr/bin/env node

/**
 * Image Optimization Script
 *
 * Automatically optimizes all images in the /public directory:
 * - Compresses WebP and AVIF images
 * - Converts JPG/PNG to WebP + AVIF formats
 * - Maintains originals as fallback
 *
 * Run: npm run optimize-images
 */

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');

// Target quality and size
const WEBP_QUALITY = 85;
const AVIF_QUALITY = 80; // AVIF achieves same quality at lower setting
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Get all image files recursively from a directory
 */
async function getImageFiles(dir) {
  const files = [];

  async function scan(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await scan(fullPath);
      } else if (/\.(jpg|jpeg|png|webp|avif)$/i.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  await scan(dir);
  return files;
}

/**
 * Get file size in KB
 */
async function getFileSizeKB(filePath) {
  const stats = await fs.stat(filePath);
  return (stats.size / 1024).toFixed(1);
}

/**
 * Optimize a single image
 */
async function optimizeImage(filePath) {
  const relativePath = path.relative(PUBLIC_DIR, filePath);
  const ext = path.extname(filePath).toLowerCase();
  const baseName = path.basename(filePath, ext);
  const dirName = path.dirname(filePath);

  log(`\n📸 Processing: ${relativePath}`, 'cyan');

  try {
    const originalSize = await getFileSizeKB(filePath);
    const image = sharp(filePath);
    const metadata = await image.metadata();

    log(`   Original: ${originalSize}KB (${metadata.width}x${metadata.height})`, 'dim');

    // Resize if too large
    const needsResize = metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT;
    if (needsResize) {
      image.resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const results = [];

    // Convert JPG/PNG to modern formats
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      // Generate WebP
      const webpPath = path.join(dirName, `${baseName}.webp`);
      await image.clone().webp({ quality: WEBP_QUALITY }).toFile(webpPath);

      const webpSize = await getFileSizeKB(webpPath);
      const webpSaved = (((originalSize - webpSize) / originalSize) * 100).toFixed(0);
      results.push(`✓ WebP: ${webpSize}KB (${webpSaved}% saved)`);

      // Generate AVIF
      const avifPath = path.join(dirName, `${baseName}.avif`);
      await image.clone().avif({ quality: AVIF_QUALITY }).toFile(avifPath);

      const avifSize = await getFileSizeKB(avifPath);
      const avifSaved = (((originalSize - avifSize) / originalSize) * 100).toFixed(0);
      results.push(`✓ AVIF: ${avifSize}KB (${avifSaved}% saved)`);
    }

    // Optimize existing WebP
    else if (ext === '.webp') {
      const tempPath = filePath + '.tmp';
      await image.webp({ quality: WEBP_QUALITY }).toFile(tempPath);

      const newSize = await getFileSizeKB(tempPath);

      // Only replace if we saved space
      if (parseFloat(newSize) < parseFloat(originalSize)) {
        await fs.rename(tempPath, filePath);
        const saved = (((originalSize - newSize) / originalSize) * 100).toFixed(0);
        results.push(`✓ Optimized: ${newSize}KB (${saved}% saved)`);
      } else {
        await fs.unlink(tempPath);
        results.push(`→ Already optimized`);
      }
    }

    // Optimize existing AVIF
    else if (ext === '.avif') {
      const tempPath = filePath + '.tmp';
      await image.avif({ quality: AVIF_QUALITY }).toFile(tempPath);

      const newSize = await getFileSizeKB(tempPath);

      // Only replace if we saved space
      if (parseFloat(newSize) < parseFloat(originalSize)) {
        await fs.rename(tempPath, filePath);
        const saved = (((originalSize - newSize) / originalSize) * 100).toFixed(0);
        results.push(`✓ Optimized: ${newSize}KB (${saved}% saved)`);
      } else {
        await fs.unlink(tempPath);
        results.push(`→ Already optimized`);
      }
    }

    results.forEach((result) => log(`   ${result}`, 'green'));

    return true;
  } catch (error) {
    log(`   ✗ Error: ${error.message}`, 'yellow');
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  log('\n🖼️  Image Optimization Script\n', 'cyan');
  log(`Scanning: ${PUBLIC_DIR}\n`);

  const imageFiles = await getImageFiles(PUBLIC_DIR);

  if (imageFiles.length === 0) {
    log('No images found to optimize.', 'yellow');
    return;
  }

  log(`Found ${imageFiles.length} images to process\n`, 'cyan');

  let optimized = 0;
  let failed = 0;

  for (const filePath of imageFiles) {
    const success = await optimizeImage(filePath);
    if (success) {
      optimized++;
    } else {
      failed++;
    }
  }

  log('\n' + '='.repeat(60), 'cyan');
  log(`✨ Optimization Complete!`, 'green');
  log(`   Processed: ${imageFiles.length} images`, 'dim');
  log(`   Optimized: ${optimized}`, 'green');
  if (failed > 0) {
    log(`   Failed: ${failed}`, 'yellow');
  }
  log('='.repeat(60) + '\n', 'cyan');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
