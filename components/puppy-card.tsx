import Link from "next/link";

import type { PuppyWithRelations } from "@/lib/supabase/types";

const statusStyles: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700",
  reserved: "bg-amber-100 text-amber-700",
  sold: "bg-neutral-200 text-neutral-600",
  upcoming: "bg-sky-100 text-sky-700",
};

export function PuppyCard({ puppy }: { puppy: PuppyWithRelations }) {
  const coverImage = puppy.photo_urls?.[0] ?? "https://images.exoticbulldog.dev/placeholders/puppy.jpg";
  const statusClass = statusStyles[puppy.status] ?? "bg-neutral-200 text-neutral-600";

  const breedRaw = puppy.parents?.sire?.breed ?? puppy.parents?.dam?.breed ?? "";
  const breedLabel = breedRaw
    ? breedRaw
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
      <div
        className="relative h-56 w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${coverImage})` }}
      >
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-700 shadow">
          {breedLabel || "Bulldog"}
        </span>
        <span
          className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass}`}
        >
          {puppy.status}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {puppy.name}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">{puppy.color}</p>
        </div>
        <p className="flex-1 text-sm text-neutral-600 dark:text-neutral-300">
          {puppy.description ?? "Affectionate, socialized bulldog with up-to-date health checks."}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {puppy.price_usd ? `$${puppy.price_usd.toLocaleString()}` : "Contact for pricing"}
          </div>
          <Link
            href={`/puppies/${puppy.slug}`}
            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-500"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
