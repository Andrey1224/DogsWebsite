import { Suspense } from "react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PuppyCard } from "@/components/puppy-card";
import { PuppyFilters } from "@/components/puppy-filters";
import { getFilteredPuppies } from "@/lib/supabase/queries";
import type { PuppyFilter } from "@/lib/supabase/queries";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Available French & English Bulldog Puppies",
  description:
    "Browse Exotic Bulldog Level’s catalog of available and upcoming French and English bulldog puppies, complete with health details and secure reservations.",
  path: "/puppies",
});

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
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Puppies", href: "/puppies" },
        ]}
      />
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent-aux">
          Puppies
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-text">
          French & English bulldogs available and upcoming
        </h1>
        <p className="text-sm text-muted">
          Browse our current litters, review temperament notes, and reserve the companion who fits
          your lifestyle. Filters adjust in real-time so you can compare options confidently.
        </p>
      </div>

      <Suspense fallback={null}>
        <PuppyFilters />
      </Suspense>

      {puppies.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/70 p-10 text-center text-sm text-muted">
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
