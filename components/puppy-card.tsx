import Image from 'next/image';
import Link from 'next/link';

import type { PuppyWithRelations } from '@/lib/supabase/types';
import { resolveLocalImage } from '@/lib/utils/images';

const statusStyles: Record<string, string> = {
  available:
    'border border-accent-aux/50 bg-[color:color-mix(in srgb, var(--accent-aux) 12%, var(--bg))] text-accent-aux',
  reserved:
    'border border-accent/40 bg-[color:color-mix(in srgb, var(--accent) 18%, var(--bg))] text-accent-aux',
  sold: 'border border-border bg-[color:color-mix(in srgb, var(--text-muted) 18%, var(--bg))] text-muted',
  upcoming: 'border border-transparent bg-accent-gradient text-white shadow-sm',
};

type PuppyCardProps = {
  puppy: PuppyWithRelations;
  /** Index of the card in the list. First 2 cards load eagerly for LCP optimization. */
  index?: number;
};

export function PuppyCard({ puppy, index = 0 }: PuppyCardProps) {
  const coverImage = resolveLocalImage(puppy.photo_urls?.[0], '/reviews/mark-lisa-duke.webp');
  const statusClass =
    statusStyles[puppy.status] ??
    'border border-border bg-[color:color-mix(in srgb, var(--text-muted) 18%, var(--bg))] text-muted';

  // Priority: Use direct puppy.breed field (new approach)
  // Fallback: Use parent breed if puppy.breed is not set (backward compatibility)
  const breedRaw = puppy.breed ?? puppy.parents?.sire?.breed ?? puppy.parents?.dam?.breed ?? '';
  const breedLabel = breedRaw
    ? breedRaw
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : '';

  // Optimize loading: First 2 cards load eagerly for LCP, rest lazy load
  const isAboveFold = index < 2;
  const loading = isAboveFold ? 'eager' : 'lazy';

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      data-testid="puppy-card"
    >
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={coverImage}
          alt={puppy.name ? `${puppy.name} portrait` : 'Bulldog portrait'}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 24rem"
          loading={loading}
        />
        <span className="absolute left-4 top-4 rounded-full border border-border bg-card/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-aux shadow">
          {breedLabel || 'Bulldog'}
        </span>
        <span
          className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass}`}
        >
          {puppy.status}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          <h3 className="text-lg font-semibold text-text">{puppy.name}</h3>
          <p className="text-sm text-muted">{puppy.color}</p>
        </div>
        <p className="flex-1 text-sm text-muted">
          {puppy.description ?? 'Affectionate, socialized bulldog with up-to-date health checks.'}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-text">
            {puppy.price_usd ? `$${puppy.price_usd.toLocaleString()}` : 'Contact for pricing'}
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
