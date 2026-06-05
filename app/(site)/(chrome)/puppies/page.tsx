import { Suspense } from 'react';
import Link from 'next/link';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { PuppyCard } from '@/components/puppy-card';
import { PuppyFilters } from '@/components/puppy-filters';
import { getFilteredPuppies } from '@/lib/supabase/queries';
import type { PuppyFilter } from '@/lib/supabase/queries';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 60;

export const metadata = buildMetadata({
  title: 'Available French & English Bulldog Puppies',
  description:
    "Browse Exotic Bulldog Legacy's catalog of available and upcoming French and English bulldog puppies, complete with health details and secure reservations.",
  path: '/puppies',
});

const statusValues = new Set(['available', 'reserved', 'sold', 'upcoming']);
const breedValues = new Set(['french_bulldog', 'english_bulldog']);
const sexValues = new Set(['male', 'female']);

type SearchParams = {
  status?: string;
  breed?: string;
  sex?: string;
  price?: string;
  search?: string;
};

export default async function PuppiesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};

  // Parse price range from format "min-max"
  const priceRange = resolvedSearchParams.price;
  let priceMin: number | undefined;
  let priceMax: number | undefined;
  if (priceRange && priceRange !== 'all') {
    const [min, max] = priceRange.split('-').map(Number);
    priceMin = !isNaN(min) ? min : undefined;
    priceMax = !isNaN(max) ? max : undefined;
  }

  const filter: PuppyFilter = {
    status:
      resolvedSearchParams.status && statusValues.has(resolvedSearchParams.status)
        ? (resolvedSearchParams.status as PuppyFilter['status'])
        : 'all',
    breed:
      resolvedSearchParams.breed && breedValues.has(resolvedSearchParams.breed)
        ? (resolvedSearchParams.breed as PuppyFilter['breed'])
        : 'all',
    sex:
      resolvedSearchParams.sex && sexValues.has(resolvedSearchParams.sex)
        ? (resolvedSearchParams.sex as PuppyFilter['sex'])
        : 'all',
    priceMin,
    priceMax,
    search: resolvedSearchParams.search || undefined,
  };

  const puppies = await getFilteredPuppies(filter);

  return (
    <div className="min-h-screen bg-[#0B1120] pb-20 font-sans text-white">
      {/* Breadcrumbs (SEO only) */}
      <div className="sr-only">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Puppies', href: '/puppies' },
          ]}
        />
      </div>

      {/* Header Section */}
      <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-32 md:px-12">
        {/* Background Glow */}
        <div className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-blue-600/10 blur-[100px]" />

        <div className="relative z-10 flex flex-col items-end justify-between gap-6 md:flex-row">
          <div className="max-w-2xl">
            <div className="mb-3 pl-1 text-xs font-bold uppercase tracking-widest text-orange-400">
              Current Litters
            </div>
            <h1 className="mb-4 text-4xl font-bold leading-tight md:text-6xl">
              French & English bulldogs <br />
              <span className="bg-gradient-to-r from-slate-200 to-slate-500 bg-clip-text text-transparent">
                available now
              </span>
            </h1>
            <p className="max-w-xl text-lg text-slate-400">
              Browse our current litters, review temperament notes, and reserve the companion who
              fits your lifestyle.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
              Exotic Bulldog Legacy is based near Falkville, just outside Cullman, Alabama. We offer
              pickup by appointment and can discuss delivery options for families across North
              Alabama, including Birmingham, Huntsville, Decatur, Madison, and nearby communities.
            </p>
            <div className="mt-6 flex flex-col gap-3 text-sm font-medium sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
              <Link
                href="/locations"
                className="text-orange-400 transition-colors hover:text-orange-300"
              >
                Pickup &amp; delivery areas
              </Link>
              <Link href="/faq" className="text-orange-400 transition-colors hover:text-orange-300">
                Puppy FAQ
              </Link>
              <Link
                href="/contact"
                className="text-orange-400 transition-colors hover:text-orange-300"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <Suspense fallback={null}>
        <PuppyFilters />
      </Suspense>

      {/* Grid Section */}
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {puppies.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-[#151e32]/50 p-10 text-center text-sm text-slate-400">
            No puppies match the selected filters right now. Adjust your search or reach out via the
            contact bar for upcoming litters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {puppies.map((puppy, index) => (
              <PuppyCard key={puppy.id} puppy={puppy} index={index} />
            ))}
          </div>
        )}

        <div className="mt-16 rounded-3xl border border-slate-800 bg-[#0f1629] p-8">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Pickup &amp; Delivery Options for Alabama Buyers
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-400 md:text-base">
            Found a puppy you love? Families from Birmingham, Huntsville, and surrounding Alabama
            communities can review pickup and delivery options before reaching out.
          </p>
          <div className="mt-6 flex flex-col gap-3 text-sm font-medium sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <Link
              href="/locations/birmingham-al"
              className="text-orange-400 transition-colors hover:text-orange-300"
            >
              Birmingham pickup details
            </Link>
            <Link
              href="/locations/huntsville-al"
              className="text-orange-400 transition-colors hover:text-orange-300"
            >
              Huntsville pickup details
            </Link>
            <Link
              href="/locations"
              className="text-orange-400 transition-colors hover:text-orange-300"
            >
              View all service areas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
