import { Breadcrumbs } from '@/components/breadcrumbs';
import { buildMetadata } from '@/lib/seo/metadata';
import { sanityFetch } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { ALL_POSTS_QUERY, formatPostDate, type SanityPostPreview } from '@/sanity/lib/queries';
import { BlogClient, type BlogClientPost } from './blog-client';

import { LOCAL_POSTS } from '@/lib/blog/local-posts';

// ISR: regenerate at most every 60 seconds
export const revalidate = 60;

export const metadata = buildMetadata({
  title: 'Blog',
  description:
    'Expert tips on care, nutrition, and health for French and English Bulldogs from the Exotic Bulldog Legacy team.',
  path: '/blog',
});

function normalizePost(post: SanityPostPreview): BlogClientPost {
  return {
    id: post._id,
    slug: post.slug.current,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    readTime: post.readTime ?? '',
    date: formatPostDate(post.publishedAt),
    image: urlFor(post.mainImage).width(800).height(600).fit('crop').auto('format').url(),
    featured: post.featured,
  };
}

interface SortingPost {
  post: BlogClientPost;
  publishedAt: string;
  featured: boolean;
}

export default async function BlogPage() {
  const raw = (await sanityFetch<SanityPostPreview[]>(ALL_POSTS_QUERY)) ?? [];

  const sanityItems: SortingPost[] = raw.map((post) => ({
    post: normalizePost(post),
    publishedAt: post.publishedAt,
    featured: post.featured,
  }));

  const localItems: SortingPost[] = LOCAL_POSTS.map((post) => ({
    post: {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      readTime: post.readTime,
      date: formatPostDate(post.publishedAt),
      image: post.image,
      imageAlt: post.imageAlt,
      featured: post.featured,
    },
    publishedAt: post.publishedAt,
    featured: post.featured,
  }));

  const combined = [...localItems, ...sanityItems].sort((a, b) => {
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1;
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const posts = combined.map((item) => item.post);

  return (
    <main id="main-content">
      <div className="sr-only">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
          ]}
        />
      </div>
      <BlogClient posts={posts} />
    </main>
  );
}
