import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Build image URLs directly from env vars so this module works regardless of
// whether the Sanity client was created (i.e. even when projectId is unset).
const builder = imageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
});

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
