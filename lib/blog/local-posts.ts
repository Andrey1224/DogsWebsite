import type { BlogClientPost } from '@/app/(site)/(chrome)/blog/blog-client';
import type { PostCategory } from '@/sanity/lib/queries';

export type LocalPostDetails = Omit<BlogClientPost, 'category'> & {
  category: PostCategory;
  categoryLabel?: string;
  imageAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt: string; // ISO format for sorting
};

export const LOCAL_POSTS: LocalPostDetails[] = [
  {
    id: 'local-post-dry-food-vs-raw-diet-bulldogs',
    slug: 'dry-food-vs-raw-diet-bulldogs',
    title:
      'Dry Food vs. Raw Diet for Bulldogs: How Industrial Kibble Destroys the Bulldog Microbiome',
    excerpt:
      'Many French and English Bulldog owners struggle with itching, red paws, ear infections, gas, and loose stools. At Exotic Bulldog Legacy, we believe the root problem often starts in the gut — and industrial kibble is one of the biggest reasons bulldogs suffer.',
    category: 'Nutrition',
    categoryLabel: 'Bulldog Nutrition',
    readTime: '7 min',
    date: 'July 1, 2026',
    image: '/images/blog/dry-food-vs-raw-diet-bulldogs.jpg',
    imageAlt:
      'French Bulldog and English Bulldog with fresh raw food, meat, organs, fish, vegetables, and supplements for a bulldog nutrition article.',
    featured: true, // Mark as featured manifesto article
    seoTitle: 'Dry Food vs Raw Diet for Bulldogs | Bulldog Microbiome & Allergies',
    seoDescription:
      'Why industrial dry food contributes to itching, red paws, yeast, gas, and gut imbalance in French and English Bulldogs — and why raw feeding matters.',
    publishedAt: '2026-07-01T21:45:00.000Z',
  },
];

export function getLocalPost(slug: string): LocalPostDetails | undefined {
  return LOCAL_POSTS.find((p) => p.slug === slug);
}
