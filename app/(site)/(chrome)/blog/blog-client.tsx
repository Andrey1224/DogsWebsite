'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ChevronRight, Clock, ArrowRight, BookOpen } from 'lucide-react';

// Normalised shape consumed by this component.
// Server component maps Sanity data → this type before passing as props.
export type BlogClientPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  featured: boolean;
};

const categories = ['All', 'Health', 'Nutrition', 'Care', 'Breeds'];

const categoryLabel: Record<string, string> = {
  Питание: 'Nutrition',
  Уход: 'Care',
  Здоровье: 'Health',
  Породы: 'Breeds',
};
function displayCategory(cat: string): string {
  return categoryLabel[cat] ?? cat;
}

type Props = { posts: BlogClientPost[] };

export function BlogClient({ posts }: Props) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts =
    activeCategory === 'All' ? posts : posts.filter((post) => post.category === activeCategory);

  const searchedPosts = searchQuery.trim()
    ? filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : filteredPosts;

  const featuredPost = posts.find((p) => p.featured);
  const gridPosts = searchedPosts.filter(
    (p) => !p.featured || activeCategory !== 'All' || searchQuery.trim(),
  );

  return (
    <div className="min-h-screen bg-[#0b101a] font-sans text-slate-300 selection:bg-[#ff6b00] selection:text-white">
      {/* Hero Section */}
      <header className="mx-auto max-w-7xl px-6 pb-12 pt-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ff6b00]/20 bg-[#ff6b00]/10 px-3 py-1 text-sm font-medium text-[#ff6b00]">
          <BookOpen size={16} />
          <span>Knowledge Base</span>
        </div>
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
          Helpful articles about <br />
          <span className="bg-gradient-to-r from-[#ff6b00] to-orange-400 bg-clip-text text-transparent">
            your pets
          </span>
        </h1>
        <p className="mb-10 max-w-2xl text-lg text-slate-400">
          Expert tips on care, nutrition, and health from the Exotic Bulldog Legacy team. We share
          our experience so your puppy grows up healthy and happy.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="mr-2 flex items-center gap-2 text-sm text-slate-500">Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-5 py-2 text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? 'border-[#ff6b00] bg-[#151c2b] text-white'
                  : 'border-transparent bg-[#151c2b]/50 text-slate-400 hover:bg-[#151c2b] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}

          <div className="relative ml-auto hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-full border border-slate-800 bg-[#151c2b] py-2 pl-10 pr-4 text-sm text-white transition-colors focus:border-[#ff6b00] focus:outline-none"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24">
        {/* Featured Article — only shown on "All" tab with no search */}
        {activeCategory === 'All' && !searchQuery.trim() && featuredPost && (
          <Link href={`/blog/${featuredPost.slug}`} className="group mb-16 block cursor-pointer">
            <article className="flex flex-col overflow-hidden rounded-3xl border border-slate-800 bg-[#151c2b] transition-all duration-300 hover:border-slate-700 md:flex-row">
              <div className="relative h-64 overflow-hidden md:h-auto md:w-1/2">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                  Featured
                </div>
              </div>
              <div className="flex flex-col justify-center p-8 md:w-1/2 md:p-12">
                <div className="mb-4 flex items-center gap-4 text-sm text-slate-400">
                  <span className="font-medium text-[#ff6b00]">
                    {displayCategory(featuredPost.category)}
                  </span>
                  <span>•</span>
                  <span>{featuredPost.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {featuredPost.readTime}
                  </span>
                </div>
                <h2 className="mb-4 text-2xl font-bold text-white transition-colors group-hover:text-[#ff6b00] md:text-3xl">
                  {featuredPost.title}
                </h2>
                <p className="mb-8 leading-relaxed text-slate-400">{featuredPost.excerpt}</p>
                <div className="mt-auto">
                  <span className="flex items-center gap-2 font-medium text-white transition-all duration-300 hover:gap-3">
                    Read article <ArrowRight size={18} className="text-[#ff6b00]" />
                  </span>
                </div>
              </div>
            </article>
          </Link>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {gridPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#151c2b] transition-all duration-300 hover:-translate-y-1 hover:border-slate-700"
            >
              <article>
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-[#0b101a]/80 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {displayCategory(post.category)}
                  </div>
                </div>

                <div className="flex flex-grow flex-col p-6">
                  <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
                    <span>{post.date}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {post.readTime}
                    </span>
                  </div>

                  <h3 className="mb-3 text-xl font-bold leading-tight text-white transition-colors group-hover:text-[#ff6b00]">
                    {post.title}
                  </h3>

                  <p className="mb-6 line-clamp-3 flex-grow text-sm text-slate-400">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-slate-800/50 pt-4 text-sm font-medium">
                    <span className="text-slate-300 transition-colors group-hover:text-white">
                      Read more
                    </span>
                    <ChevronRight size={16} className="text-[#ff6b00]" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="py-24 text-center text-slate-500">
            Articles will appear here after publishing in Sanity Studio.
          </p>
        )}
      </main>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-[#151c2b] to-[#0b101a] p-10 text-center md:p-16">
          <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-[80%] -translate-x-1/2 bg-[#ff6b00]/10 blur-[100px]"></div>

          <h2 className="relative z-10 mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to find your perfect bulldog?
          </h2>
          <p className="relative z-10 mx-auto mb-8 max-w-2xl text-slate-400">
            Browse our available puppies or schedule a visit with us.
          </p>
          <div className="relative z-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/puppies"
              className="rounded-full bg-[#ff6b00] px-8 py-3 font-medium text-white transition-colors hover:bg-[#e66000]"
            >
              View puppies
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-slate-700 bg-[#1a2333] px-8 py-3 font-medium text-white transition-colors hover:bg-[#202b3d]"
            >
              Schedule a visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
