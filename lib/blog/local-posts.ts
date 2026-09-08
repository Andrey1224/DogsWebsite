import type { BlogClientPost } from '@/app/(site)/(chrome)/blog/blog-client';
import type { PostCategory } from '@/sanity/lib/queries';

export type LocalPostDetails = Omit<BlogClientPost, 'category'> & {
  category: PostCategory;
  categoryLabel?: string;
  imageAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: string;
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
    seoTitle: 'Raw vs Kibble for Bulldogs | Gut Health & Microbiome',
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
    seoTitle: 'New French & English Bulldog Owner Guide',
    seoDescription:
      'New French or English Bulldog owner? Learn daily care, breathing and heat safety, exercise, water safety, wrinkle hygiene, nutrition, and puppy preparation.',
    updatedAt: '2026-08-02T21:30:00.000Z',
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
    seoTitle: 'How to Potty Train a Puppy: Step-by-Step',
    seoDescription:
      'Learn how to potty train a puppy with pads or outdoor trips, a realistic age-based schedule, positive reinforcement, accident cleanup, and transition steps.',
    updatedAt: '2026-08-02T21:30:00.000Z',
    publishedAt: '2026-07-21T11:00:00.000Z',
  },
  {
    id: 'local-post-bringing-puppy-home-first-weeks',
    slug: 'bringing-puppy-home-first-weeks',
    title: 'Bringing a Puppy Home: Stress-Free Training from Day One',
    excerpt:
      'Bringing a puppy home is exciting, but the first few weeks shape habits that can last a lifetime. Learn how to build a safe routine, potty habits, calm boundaries, confidence, and essential first commands from day one.',
    category: 'Care',
    categoryLabel: 'Bulldog Owner School',
    readTime: '8–9 min',
    date: 'September 8, 2026',
    image: '/images/blog/bringing-puppy-home-first-weeks.jpg',
    imageAlt:
      'Young girl training a bulldog puppy outdoors with a high-five during early puppy training',
    featured: false,
    seoTitle: 'Bringing a Puppy Home: First Weeks Training Guide',
    seoDescription:
      'Bringing a puppy home? Learn how to build a safe routine, potty habits, calm boundaries, confidence, and essential puppy training from day one.',
    publishedAt: '2026-09-08T12:00:00.000Z',
  },
  {
    id: 'local-post-choose-healthy-bulldog-puppy-health-tests',
    slug: 'choose-healthy-bulldog-puppy-health-tests',
    title: 'How to Choose a Healthy Bulldog Puppy: DNA Health Tests & Vet Checkup Guide',
    excerpt:
      'Choosing a Bulldog puppy is about more than color, wrinkles, or personality. Learn which parent DNA tests, veterinary checks, and health records can help you make a more informed decision before bringing your puppy home.',
    category: 'Health',
    categoryLabel: 'Bulldog Health',
    readTime: '7–8 min',
    date: 'September 8, 2026',
    image: '/images/blog/choose-healthy-bulldog-puppy-health-tests.jpg',
    imageAlt:
      'Veterinarian examining a French Bulldog puppy with a stethoscope during a pre-sale puppy health check.',
    featured: false,
    seoTitle: 'How to Choose a Healthy Bulldog Puppy | Health Tests',
    seoDescription:
      'Learn what DNA health tests, veterinary checks, records, and breeder questions to review before choosing a French or English Bulldog puppy.',
    publishedAt: '2026-09-08T12:05:00.000Z',
  },
  {
    id: 'local-post-high-carb-commercial-dog-food-risks',
    slug: 'high-carb-commercial-dog-food-risks',
    title: 'Why High-Carbohydrate Commercial Dog Food Can Harm Your Dog’s Health',
    excerpt:
      'Commercial dog food often contains far more carbohydrates than dogs naturally need. This article explains how high-carb diets affect digestion, skin health, and metabolism, and how to choose food that better supports your dog’s natural nutritional needs.',
    category: 'Nutrition',
    categoryLabel: 'Bulldog Nutrition',
    readTime: '5 min',
    date: 'March 11, 2026',
    image: '/images/blog/high-carb.jpg', // Placeholder
    imageAlt: 'Dog eating food from a bowl illustrating healthy vs high carbohydrate dog diet',
    featured: true,
    seoTitle: 'High-Carb Dog Food: Why Commercial Diets May Harm Your Dog',
    seoDescription:
      'Learn how high-carbohydrate commercial dog food affects digestion, skin health, and metabolism. Discover how to choose a healthier diet for your dog.',
    publishedAt: '2026-03-11T21:03:37.502Z',
  },
];

export function getLocalPost(slug: string): LocalPostDetails | undefined {
  return LOCAL_POSTS.find((p) => p.slug === slug);
}
