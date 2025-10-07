import { Suspense } from "react";

import { PuppyCard } from "@/components/puppy-card";
import { PuppyFilters } from "@/components/puppy-filters";
import { getFilteredPuppies } from "@/lib/supabase/queries";
import type { PuppyFilter } from "@/lib/supabase/queries";

export const revalidate = 60;

const statusValues = new Set(["available", "reserved", "sold", "upcoming"]);
const breedValues = new Set(["french_bulldog", "english_bulldog"]);

type SearchParams = {
  status?: string;
  breed?: string;
};

export default async function PuppiesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const filter: PuppyFilter = {
    status:
      resolvedSearchParams.status && statusValues.has(resolvedSearchParams.status)
        ? (resolvedSearchParams.status as PuppyFilter['status'])
        : "all",
    breed:
      resolvedSearchParams.breed && breedValues.has(resolvedSearchParams.breed)
        ? (resolvedSearchParams.breed as PuppyFilter['breed'])
        : "all",
  };

  const puppies = await getFilteredPuppies(filter);

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-6 py-12">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">
          Puppies
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          French & English bulldogs available and upcoming
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Browse our current litters, review temperament notes, and reserve the companion who fits
          your lifestyle. Filters adjust in real-time so you can compare options confidently.
        </p>
      </div>

      <Suspense fallback={null}>
        <PuppyFilters />
      </Suspense>

      {puppies.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white/60 p-10 text-center text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-300">
          No puppies match the selected filters right now. Adjust your search or reach out via the
          contact bar for upcoming litters.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {puppies.map((puppy) => (
            <PuppyCard key={puppy.id} puppy={puppy} />
          ))}
        </div>
      )}
    </div>
  );
}
