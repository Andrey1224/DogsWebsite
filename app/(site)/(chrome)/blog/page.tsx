import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { getOrganizationSchema } from '@/lib/seo/structured-data';
import { buildMetadata } from '@/lib/seo/metadata';
import { sanityFetch } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { ALL_POSTS_QUERY, formatPostDate, type SanityPostPreview } from '@/sanity/lib/queries';
import { BlogClient, type BlogClientPost } from './blog-client';

// ISR: regenerate at most every 60 seconds
export const revalidate = 60;

export const metadata = buildMetadata({
  title: 'Blog — Exotic Bulldog Legacy',
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

export default async function BlogPage() {
  const raw = (await sanityFetch<SanityPostPreview[]>(ALL_POSTS_QUERY)) ?? [];
  const posts = raw.map(normalizePost);

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
      <JsonLd data={getOrganizationSchema()} />
      <BlogClient posts={posts} />
    </main>
  );
}
