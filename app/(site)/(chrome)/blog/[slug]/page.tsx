import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { cache } from 'react';
import { ArrowLeft, ChevronRight, Clock, Calendar, User } from 'lucide-react';
import type { Metadata } from 'next';

import { sanityFetch } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import {
  ALL_POST_SLUGS_QUERY,
  POST_BY_SLUG_QUERY,
  ALL_POSTS_QUERY,
  formatPostDate,
  type SanityPost,
  type SanityPostPreview,
} from '@/sanity/lib/queries';
import { buildMetadata } from '@/lib/seo/metadata';
import { BlogPortableText } from '@/components/blog/portable-text';
import { ShareButtons } from './share-buttons';

// ISR: regenerate at most every 60 seconds
export const revalidate = 60;

// Pre-render known slugs at build time; new slugs are generated on-demand
export async function generateStaticParams() {
  const slugs = (await sanityFetch<Array<{ slug: string }>>(ALL_POST_SLUGS_QUERY)) ?? [];
  return slugs.map((s) => ({ slug: s.slug }));
}

type Params = Promise<{ slug: string }>;

// Cache fetch per request so generateMetadata + page don't double-fetch
const getPost = cache(async (slug: string): Promise<SanityPost | null> => {
  return sanityFetch<SanityPost>(POST_BY_SLUG_QUERY, { slug });
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const imageUrl = urlFor(post.mainImage).width(1200).auto('format').url();

  return buildMetadata({
    title: post.seoTitle ?? `${post.title} — Exotic Bulldog Legacy`,
    description: post.seoDescription ?? post.excerpt,
    path: `/blog/${post.slug.current}`,
    image: imageUrl,
  });
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  // Related: other published posts, same category preferred
  const allPosts = (await sanityFetch<SanityPostPreview[]>(ALL_POSTS_QUERY)) ?? [];
  const sameCategory = allPosts.filter(
    (p) => p.slug.current !== slug && p.category === post.category,
  );
  const others = allPosts.filter((p) => p.slug.current !== slug && p.category !== post.category);
  const relatedPosts = [...sameCategory, ...others].slice(0, 2);

  const coverUrl = urlFor(post.mainImage).width(1200).auto('format').url();
  const formattedDate = formatPostDate(post.publishedAt);

  return (
    <div className="min-h-screen bg-[#0b101a] pb-24 font-sans text-slate-300 selection:bg-[#ff6b00] selection:text-white">
      {/* Breadcrumb */}
      <nav className="mx-auto flex max-w-4xl flex-wrap items-center gap-2 px-6 pb-6 pt-24 text-sm text-slate-500">
        <Link
          href="/blog"
          className="flex items-center gap-1 transition-colors hover:text-[#ff6b00]"
        >
          <ArrowLeft size={14} /> Back to blog
        </Link>
        <span>/</span>
        <Link href="/" className="transition-colors hover:text-[#ff6b00]">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link href="/blog" className="transition-colors hover:text-[#ff6b00]">
          Blog
        </Link>
        <ChevronRight size={14} />
        <span className="text-slate-300">{post.category}</span>
      </nav>

      <article className="mx-auto max-w-4xl px-6">
        {/* Article header */}
        <header className="mb-10 text-center md:text-left">
          <div className="mb-6 inline-block rounded-full border border-[#ff6b00]/20 bg-[#ff6b00]/10 px-3 py-1 text-sm font-medium text-[#ff6b00]">
            {post.category}
          </div>
          <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl">
            {post.title}
          </h1>
          <div className="mb-8 flex flex-wrap items-center justify-center gap-6 border-b border-slate-800 pb-8 text-sm text-slate-400 md:justify-start">
            <div className="flex items-center gap-2">
              <User size={16} className="text-[#ff6b00]" />
              <span className="font-medium text-slate-300">Tatiana (Exotic Bulldog Legacy)</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Updated: {formattedDate}</span>
            </div>
            {post.readTime && (
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{post.readTime} read</span>
              </div>
            )}
          </div>
        </header>

        {/* Cover image */}
        <div className="mb-12 w-full overflow-hidden rounded-3xl border border-slate-800">
          <Image
            src={coverUrl}
            alt={post.mainImage.alt ?? post.title}
            width={1200}
            height={800}
            sizes="100vw"
            className="h-auto w-full"
            priority
          />
        </div>

        {/* Content + share sidebar */}
        <div className="flex flex-col gap-12 md:flex-row">
          {/* Sticky share sidebar (desktop) */}
          <aside className="hidden h-max flex-col gap-4 md:sticky md:top-24 md:flex">
            <ShareButtons slug={post.slug.current} />
          </aside>

          {/* Article body */}
          <div className="max-w-3xl min-w-0">
            <BlogPortableText value={post.body} />
          </div>
        </div>

        {/* Author block (E-E-A-T) */}
        <div className="mt-16 flex flex-col items-center gap-6 rounded-3xl border-t border-slate-800 bg-[#151c2b]/30 p-8 pt-10 md:flex-row md:items-start">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[#ff6b00] bg-slate-800">
            <Image
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
              alt="Tatiana — author"
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <h4 className="mb-2 text-lg font-bold text-white">
              Tatiana — Founder of Exotic Bulldog Legacy
            </h4>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              A breeder with years of experience specialising in French and English Bulldogs. My
              goal is not just breeding, but improving the health of the breed and finding perfect
              companions for loving families.
            </p>
            <Link href="/about" className="text-sm font-medium text-[#ff6b00] hover:underline">
              Our story &rarr;
            </Link>
          </div>
        </div>
      </article>

      {/* Related articles + CTA */}
      <section className="mx-auto mt-24 max-w-7xl px-6">
        {relatedPosts.length > 0 && (
          <>
            <h3 className="mb-8 text-2xl font-bold text-white">You might also like</h3>
            <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2">
              {relatedPosts.map((related) => {
                const relatedImg = urlFor(related.mainImage)
                  .width(400)
                  .height(128)
                  .fit('crop')
                  .auto('format')
                  .url();
                return (
                  <Link
                    key={related._id}
                    href={`/blog/${related.slug.current}`}
                    className="group flex h-32 cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-[#151c2b] transition-all hover:border-slate-700"
                  >
                    <div className="relative w-1/3 shrink-0 overflow-hidden">
                      <Image
                        src={relatedImg}
                        alt={related.mainImage.alt ?? related.title}
                        fill
                        sizes="(max-width: 768px) 33vw, 16vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col justify-center p-4">
                      <span className="mb-1 text-xs font-bold text-[#ff6b00]">
                        {related.category.toUpperCase()}
                      </span>
                      <h4 className="text-sm font-medium leading-tight text-white transition-colors group-hover:text-[#ff6b00] md:text-base">
                        {related.title}
                      </h4>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Final CTA */}
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-[#151c2b] to-[#1a2333] p-8 text-center md:flex-row md:p-12 md:text-left">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-white">Found what you were looking for?</h2>
            <p className="text-slate-400">Meet our available puppies, raised with love and care.</p>
          </div>
          <Link
            href="/puppies"
            className="flex shrink-0 items-center gap-2 rounded-full bg-[#ff6b00] px-8 py-4 font-medium text-white transition-colors hover:bg-[#e66000]"
          >
            View puppies <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
