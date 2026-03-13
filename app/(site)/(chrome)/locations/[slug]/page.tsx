import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { PuppyCard } from '@/components/puppy-card';
import { getFilteredPuppies } from '@/lib/supabase/queries';
import { buildMetadata } from '@/lib/seo/metadata';
import { getLocationBySlug } from '@/lib/data/locations';

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const loc = getLocationBySlug(slug);
  if (!loc) return {};
  return buildMetadata({
    title: loc.metaTitle,
    description: loc.metaDescription,
    path: `/locations/${slug}`,
    noIndex: loc.isIndexable === false,
  });
}

export default async function LocationPage({ params }: { params: Params }) {
  const { slug } = await params;
  const loc = getLocationBySlug(slug);
  if (!loc) notFound();

  const allPuppies = await getFilteredPuppies({ status: 'available' });
  const puppies = allPuppies.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#0B1120] pb-20 font-sans text-white">
      {/* Breadcrumbs (SEO only) */}
      <div className="sr-only">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Locations', href: '/locations' },
            { label: `${loc.city}, ${loc.state}`, href: `/locations/${loc.slug}` },
          ]}
        />
      </div>

      {/* Hero */}
      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-32 md:px-12">
        <div className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="relative z-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-400">
            {loc.city}, {loc.state}
            {loc.driveTimeMinutes && (
              <span className="text-orange-300/70">· ~{loc.driveTimeMinutes} min drive</span>
            )}
          </div>
          <h1 className="mb-5 text-4xl font-bold leading-tight md:text-6xl">{loc.heroTitle}</h1>
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-400">{loc.heroText}</p>
          {loc.nearbyAreas && loc.nearbyAreas.length > 0 && (
            <p className="mb-8 text-sm text-slate-500">
              Serving: {loc.nearbyAreas.join(' · ')} and surrounding areas
            </p>
          )}
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Get in Touch
          </Link>
        </div>
      </div>

      {/* Available Puppies */}
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-8">
          <div className="mb-2 text-xs font-bold uppercase tracking-widest text-orange-400">
            Available Now
          </div>
          <h2 className="text-3xl font-bold">Puppies Ready for {loc.city} Families</h2>
        </div>
        {puppies.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-[#151e32]/50 p-10 text-center text-sm text-slate-400">
            No puppies are available right now. Check back soon or{' '}
            <Link href="/contact" className="text-orange-400 hover:underline">
              contact us
            </Link>{' '}
            about upcoming litters.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {puppies.map((puppy, index) => (
                <PuppyCard key={puppy.id} puppy={puppy} index={index} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/puppies"
                className="inline-flex items-center gap-2 text-sm font-semibold text-orange-400 hover:text-orange-300"
              >
                View all puppies →
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Delivery & Pickup Logistics */}
      {loc.deliveryOptions.length > 0 && (
        <div className="mx-auto mt-24 max-w-7xl px-6 md:px-12">
          <div className="mb-8">
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-orange-400">
              Getting Your Puppy
            </div>
            <h2 className="text-3xl font-bold">Delivery &amp; Pickup Options</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loc.deliveryOptions.map((option) => (
              <div
                key={option.type}
                className="rounded-2xl border border-slate-800 bg-[#151e32] p-6"
              >
                <div className="mb-3 text-sm font-bold uppercase tracking-wide text-orange-400">
                  {option.type}
                </div>
                <p className="text-sm leading-relaxed text-slate-400">{option.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonials */}
      {loc.localTestimonials && loc.localTestimonials.length > 0 && (
        <div className="mx-auto mt-24 max-w-7xl px-6 md:px-12">
          <div className="mb-8">
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-orange-400">
              Happy Families
            </div>
            <h2 className="text-3xl font-bold">What {loc.city} Buyers Say</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loc.localTestimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-slate-800 bg-[#151e32] p-6">
                <p className="mb-4 text-sm leading-relaxed text-slate-300">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="text-sm font-semibold text-white">{t.name}</div>
                <div className="text-xs text-slate-500">{t.city}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {loc.faq.length > 0 && (
        <div className="mx-auto mt-24 max-w-3xl px-6 md:px-12">
          <div className="mb-8">
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-orange-400">
              Questions
            </div>
            <h2 className="text-3xl font-bold">{loc.city} FAQ</h2>
          </div>
          <div className="space-y-3">
            {loc.faq.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-slate-800 bg-[#151e32] p-6"
              >
                <summary className="cursor-pointer list-none text-base font-semibold text-white marker:hidden">
                  {item.question}
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* CTA Block */}
      <div className="mx-auto mt-24 max-w-7xl px-6 md:px-12">
        <div className="rounded-3xl border border-slate-800 bg-[#151e32] p-10 text-center md:p-16">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to find your puppy?</h2>
          <p className="mx-auto mb-8 max-w-xl text-slate-400">
            Browse our available litters or reach out and we&apos;ll help you find the perfect match
            for your {loc.city} family.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/puppies"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Browse Puppies
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-8 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
