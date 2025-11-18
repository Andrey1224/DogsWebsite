# Breed Photos

This directory contains hero images for the Breeds page (`/breeds`).

## Required Images

Add the following images to this directory:

### French Bulldog

- **File**: `french-bulldog-hero.webp`
- **Dimensions**: Portrait orientation (4:5 aspect ratio recommended, e.g., 800x1000px)
- **Content**: A charming French Bulldog photo showing their distinctive bat ears and personality
- **Suggested shots**:
  - Sitting in someone's lap
  - Funny sleeping pose
  - Close-up showing their expressive face and big eyes

### English Bulldog

- **File**: `english-bulldog-hero.webp`
- **Dimensions**: Portrait orientation (4:5 aspect ratio recommended, e.g., 800x1000px)
- **Content**: An English Bulldog photo highlighting their wrinkly face and gentle nature
- **Suggested shots**:
  - Relaxing on a couch/sofa
  - Close-up showing wrinkles and sweet expression
  - Cuddling or being affectionate

## Image Optimization

- **Format**: WebP preferred (fallback to JPEG/PNG acceptable)
- **Size**: Optimize for web (target < 400KB)
- **Quality**: High quality, sharp focus on the dog's face
- **Background**: Clean, not too cluttered

## After Adding Images

Once you've added the images, uncomment the `<Image>` component in:

- `/app/breeds/breed-selector.tsx` (around line 158)

Remove or comment out the placeholder div with emoji.
