import { Suspense } from 'react';
import Link from 'next/link';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { FaqAccordion } from '@/components/home/faq-accordion';
import { JsonLd } from '@/components/json-ld';
import { PuppyCard } from '@/components/puppy-card';
import { PuppyFilters } from '@/components/puppy-filters';
import { bucketPuppiesByStatus, getFilteredPuppies } from '@/lib/supabase/queries';
import type { PuppyFilter } from '@/lib/supabase/queries';
import { buildMetadata } from '@/lib/seo/metadata';
import { getFaqSchema } from '@/lib/seo/structured-data';

export const revalidate = 60;

export const metadata = buildMetadata({
  title: 'Available French & English Bulldog Puppies in Alabama',
  description:
    'Browse available French and English Bulldog puppies in Alabama. View current profiles, health details, pricing, and Falkville-area pickup or delivery options.',
  path: '/puppies',
});

const statusValues = new Set(['available', 'reserved', 'sold', 'upcoming']);
const breedValues = new Set(['french_bulldog', 'english_bulldog']);
const sexValues = new Set(['male', 'female']);

const puppiesFaqs = [
  {
    question: 'How can I check current puppy availability?',
    answer:
      "The Available Now section above always reflects the current database — every puppy's status badge (Available, Reserved, Upcoming, Unavailable) is live. You can also filter by breed, sex, or price above to narrow the list.",
  },
  {
    question: 'What health and veterinary records come with a puppy?',
    answer:
      "Every puppy receives a comprehensive vet exam, age-appropriate vaccinations, and a microchip before going home. You'll receive vet health and vaccination records, a deworming record, and microchip registration details. Ask us for available parent health-testing documentation.",
  },
  {
    question: 'When is the deposit paid?',
    answer:
      "A puppy is only considered reserved once we've confirmed your application and you've signed a contract — an inquiry or a scheduled call does not, by itself, reserve a puppy. After your application and the puppy's availability are confirmed and the contract is signed, a $300 deposit reserves the puppy; the remaining balance is due as outlined in your signed contract.",
  },
  {
    question: 'What pickup or delivery options are available?',
    answer:
      'Pickup takes place by appointment near Falkville, Alabama. Delivery options, including flight-nanny transport, may also be available depending on your location and timing — contact us for details, or see our Terms page for the full delivery policy.',
  },
];

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
  const { available, upcoming, past } = bucketPuppiesByStatus(puppies);

  // Hero copy/eyebrow/CTA reflect *global* availability, independent of whatever
  // status/breed/sex/price/search filters are applied to the grid below — a narrow
  // filter match (or zero matches) must never make the hero claim "no puppies available"
  // when available puppies exist elsewhere in the catalog, or vice versa.
  const globalPuppies = await getFilteredPuppies({});
  const hasGlobalAvailable = bucketPuppiesByStatus(globalPuppies).available.length > 0;

  const puppiesFaqSchema = getFaqSchema(puppiesFaqs);

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

      <JsonLd id="puppies-faq-schema" data={puppiesFaqSchema} />

      {/* Compact Hero */}
      <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-28 md:px-12">
        <div className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 pl-1 text-xs font-bold uppercase tracking-widest text-orange-400">
            {hasGlobalAvailable ? 'Available Now' : 'Current Availability'}
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-tight md:text-6xl">
            Available French & English Bulldog <br />
            <span className="bg-gradient-to-r from-slate-200 to-slate-500 bg-clip-text text-transparent">
              Puppies in Alabama
            </span>
          </h1>
          <p className="max-w-xl text-lg text-slate-400">
            {hasGlobalAvailable
              ? 'Meet our currently available French and English Bulldog puppies near Falkville, Alabama. Open a profile for photos, pricing, temperament notes, and available health information.'
              : 'No puppies are available to reserve today. Browse previously placed puppies below or contact us about upcoming litters.'}
          </p>
          <div className="mt-6">
            {hasGlobalAvailable ? (
              <Link
                // Clears any active status/breed/sex/price/search filters so the anchor target
                // actually shows available inventory, even if the current filter selection
                // excludes every available puppy.
                href="/puppies?status=available#available-now"
                className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600"
              >
                View Available Puppies
              </Link>
            ) : (
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600"
              >
                Ask About Upcoming Litters
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <Suspense fallback={null}>
        <PuppyFilters />
      </Suspense>

      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Puppy Inventory — Available Now / Upcoming Litters / Past Puppies */}
        <div id="available-now">
          {puppies.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-[#151e32]/50 p-10 text-center text-sm text-slate-400">
              No puppies match the selected filters right now. Adjust your search or reach out via
              the contact bar for upcoming litters.
            </div>
          ) : (
            <>
              {available.length > 0 && (
                <>
                  <h2 className="mb-6 text-2xl font-bold text-white md:text-3xl">Available Now</h2>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {available.map((puppy, index) => (
                      <PuppyCard key={puppy.id} puppy={puppy} index={index} />
                    ))}
                  </div>
                </>
              )}

              {upcoming.length > 0 && (
                <div className={available.length > 0 ? 'mt-16' : ''}>
                  <h2 className="text-2xl font-bold text-white md:text-3xl">Upcoming Litters</h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate-400">
                    These litters aren&apos;t available to reserve yet — contact us to ask about
                    timing.
                  </p>
                  <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {upcoming.map((puppy, index) => (
                      <PuppyCard key={puppy.id} puppy={puppy} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {past.length > 0 && (
                <div className={available.length > 0 || upcoming.length > 0 ? 'mt-16' : ''}>
                  {available.length === 0 && upcoming.length === 0 && (
                    <p className="mb-3 text-sm font-medium text-slate-400">
                      No puppies are currently available or upcoming.
                    </p>
                  )}
                  <h2 className="text-2xl font-bold text-white md:text-3xl">Past Puppies</h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate-400">
                    These puppies have already been reserved or placed with their families.
                  </p>
                  <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {past.map((puppy, index) => (
                      <PuppyCard key={puppy.id} puppy={puppy} index={index} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* How the Process Works */}
        <div className="mt-16 rounded-3xl border border-slate-800 bg-[#0f1629] p-8">
          <h2 className="text-2xl font-bold text-white md:text-3xl">How the Process Works</h2>
          <ol className="mt-6 space-y-4 text-sm leading-relaxed text-slate-300 md:text-base">
            <li className="flex gap-3">
              <span className="mt-0.5 text-xs font-bold text-orange-400">1</span>
              <span>Review the current puppy profile and available records.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 text-xs font-bold text-orange-400">2</span>
              <span>
                <Link href="/contact" className="text-orange-400 hover:underline">
                  Contact us
                </Link>{' '}
                to ask questions and schedule a video call or visit.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 text-xs font-bold text-orange-400">3</span>
              <span>
                After buyer approval and a signed contract, the deposit reserves the puppy.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 text-xs font-bold text-orange-400">4</span>
              <span>Coordinate Falkville-area pickup or an approved delivery option.</span>
            </li>
          </ol>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white md:text-3xl">Puppy FAQ</h2>
          <div className="mt-6">
            <FaqAccordion faqs={puppiesFaqs} />
          </div>
        </div>

        {/* Pickup & Delivery */}
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

        {/* Additional SEO/local context and internal links */}
        <div className="mt-16">
          <p className="max-w-xl text-sm text-slate-500">
            Learn how to choose a healthy puppy in our{' '}
            <Link
              href="/blog/choose-healthy-bulldog-puppy-health-tests"
              className="text-orange-400 hover:underline"
            >
              DNA &amp; Health Tests Guide
            </Link>
            .
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm font-medium sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
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
  );
}
