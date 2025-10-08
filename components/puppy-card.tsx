import Link from "next/link";

import type { PuppyWithRelations } from "@/lib/supabase/types";

const statusStyles: Record<string, string> = {
  available:
    "border border-accent-aux/50 bg-[color:color-mix(in srgb, var(--accent-aux) 12%, var(--bg))] text-accent-aux",
  reserved:
    "border border-accent/40 bg-[color:color-mix(in srgb, var(--accent) 18%, var(--bg))] text-accent-aux",
  sold:
    "border border-border bg-[color:color-mix(in srgb, var(--text-muted) 18%, var(--bg))] text-muted",
  upcoming: "border border-transparent bg-accent-gradient text-white shadow-sm",
};

export function PuppyCard({ puppy }: { puppy: PuppyWithRelations }) {
  const coverImage = puppy.photo_urls?.[0] ?? "https://images.exoticbulldog.dev/placeholders/puppy.jpg";
  const statusClass =
    statusStyles[puppy.status] ??
    "border border-border bg-[color:color-mix(in srgb, var(--text-muted) 18%, var(--bg))] text-muted";

  const breedRaw = puppy.parents?.sire?.breed ?? puppy.parents?.dam?.breed ?? "";
  const breedLabel = breedRaw
    ? breedRaw
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div
        className="relative h-56 w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${coverImage})` }}
      >
        <span className="absolute left-4 top-4 rounded-full border border-border bg-card/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-aux shadow">
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
          <h3 className="text-lg font-semibold text-text">
            {puppy.name}
          </h3>
          <p className="text-sm text-muted">{puppy.color}</p>
        </div>
        <p className="flex-1 text-sm text-muted">
          {puppy.description ?? "Affectionate, socialized bulldog with up-to-date health checks."}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-text">
            {puppy.price_usd ? `$${puppy.price_usd.toLocaleString()}` : "Contact for pricing"}
          </div>
          <Link
            href={`/puppies/${puppy.slug}`}
            className="rounded-full bg-[color:var(--btn-bg)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--btn-text)] transition hover:brightness-105"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
