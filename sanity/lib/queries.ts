import type { PortableTextBlock } from '@portabletext/types';

export type PostCategory = 'Nutrition' | 'Care' | 'Health' | 'Breeds';

export type SanityImageRef = {
  asset: { _ref: string };
  alt?: string;
  hotspot?: { x: number; y: number; width: number; height: number };
  crop?: { top: number; bottom: number; left: number; right: number };
};

export type SanityPostPreview = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  category: PostCategory;
  publishedAt: string;
  readTime?: string;
  mainImage: SanityImageRef;
  featured: boolean;
};

export type SanityPost = SanityPostPreview & {
  body: PortableTextBlock[];
  seoTitle?: string;
  seoDescription?: string;
};

/** All posts, ordered: featured first, then newest. */
export const ALL_POSTS_QUERY = `
  *[_type == "post" && defined(slug.current)] | order(featured desc, publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    category,
    publishedAt,
    readTime,
    mainImage,
    "featured": coalesce(featured, false)
  }
`;

/** Full post by slug (includes body). */
export const POST_BY_SLUG_QUERY = `
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    category,
    publishedAt,
    readTime,
    mainImage,
    "featured": coalesce(featured, false),
    body,
    seoTitle,
    seoDescription
  }
`;

/** Slugs only, for generateStaticParams. */
export const ALL_POST_SLUGS_QUERY = `
  *[_type == "post" && defined(slug.current)] {
    "slug": slug.current
  }
`;

/** Slugs + last-modified date, for sitemap generation. */
export const SITEMAP_POSTS_QUERY = `
  *[_type == "post" && defined(slug.current)] {
    "slug": slug.current,
    "_updatedAt": _updatedAt
  }
`;

export type SitemapPost = {
  slug: string;
  _updatedAt: string;
};

/** Format ISO date to Russian locale, e.g. "10 марта 2026 г." */
export function formatPostDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
