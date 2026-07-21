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
    featured: false,
    seoTitle: 'Dry Food vs Raw Diet for Bulldogs | Bulldog Microbiome & Allergies',
    seoDescription:
      'Why industrial dry food contributes to itching, red paws, yeast, gas, and gut imbalance in French and English Bulldogs — and why raw feeding matters.',
    publishedAt: '2026-07-01T21:45:00.000Z',
  },
  {
    id: 'local-post-ultimate-guide-for-new-bulldog-owners',
    slug: 'ultimate-guide-for-new-bulldog-owners',
    title: 'French and English Bulldogs: The Ultimate Guide for New Owners',
    excerpt:
      'French and English Bulldogs are charismatic family members with the personality of a CEO and the face of an angel. Here is your essential guide to respiratory care, harnesses, climate control, water safety, joint protection, wrinkle hygiene, and nutrition — everything new owners need for a happy, healthy bulldog.',
    category: 'Care',
    categoryLabel: 'Bulldog Owner School',
    readTime: '7 min',
    date: 'July 21, 2026',
    image: '/images/blog/ultimate-guide-for-new-bulldog-owners.jpg',
    imageAlt:
      'French Bulldog and English Bulldog relaxing together comfortably on a couch, illustrating a new-owner care guide.',
    featured: true,
    seoTitle: 'The Ultimate Guide for New French & English Bulldog Owners',
    seoDescription:
      'Essential care guide for new French and English Bulldog owners: respiratory health, harnesses, climate control, water safety, joint care, wrinkle hygiene, and nutrition.',
    publishedAt: '2026-07-21T12:00:00.000Z',
  },
  {
    id: 'local-post-puppy-potty-training-101',
    slug: 'puppy-potty-training-101',
    title: 'Puppy Potty Training 101: From Pads to Outdoors Without Stress',
    excerpt:
      'Potty training is one of the first and most important steps in helping a new puppy adjust to your home. Explore indoor pads vs. outdoor training, the "landing strip" method, age-based bladder control milestones, and the golden rules for stress-free success.',
    category: 'Care',
    categoryLabel: 'Bulldog Owner School',
    readTime: '6 min',
    date: 'July 21, 2026',
    image: '/images/blog/puppy-potty-training-101.jpg',
    imageAlt: 'Bulldog puppy learning an indoor potty training routine.',
    featured: false,
    seoTitle: 'Puppy Potty Training 101 | Pads vs. Outdoor Training Guide',
    seoDescription:
      'A step-by-step guide to puppy potty training: indoor pads vs. outdoor training, the landing strip method, age-based bladder control, and golden rules for success.',
    publishedAt: '2026-07-21T11:00:00.000Z',
  },
];

export function getLocalPost(slug: string): LocalPostDetails | undefined {
  return LOCAL_POSTS.find((p) => p.slug === slug);
}
