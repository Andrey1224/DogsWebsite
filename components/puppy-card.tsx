import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import type { PuppyWithRelations } from '@/lib/supabase/types';
import { resolveLocalImage } from '@/lib/utils/images';

const statusStyles: Record<string, string> = {
  available: 'bg-green-500/20 text-green-400 border-green-500/30',
  reserved: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  sold: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

type PuppyCardProps = {
  puppy: PuppyWithRelations;
  /** Index of the card in the list. First 2 cards load eagerly for LCP optimization. */
  index?: number;
};

export function PuppyCard({ puppy, index = 0 }: PuppyCardProps) {
  const coverImage = resolveLocalImage(
    puppy.photo_urls?.[0],
    '/images/reviews/mark-lisa-duke.webp',
  );
  const statusClass =
    statusStyles[puppy.status] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/30';

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

  const isAvailable = puppy.status === 'available';
  const isUnavailable = puppy.status === 'sold' || puppy.status === 'reserved';

  return (
    <article
      className="group h-full rounded-[2rem] border border-slate-800 bg-[#151e32] p-3 transition-all duration-500 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-900/10"
      data-testid="puppy-card"
    >
      {/* Image Container */}
      <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-[1.5rem]">
        <Image
          src={coverImage}
          alt={puppy.name ? `${puppy.name} portrait` : 'Bulldog portrait'}
          fill
          className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
            isUnavailable ? 'grayscale opacity-60' : ''
          }`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading={loading}
        />

        {/* Breed Badge */}
        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {breedLabel || 'Bulldog'}
        </span>

        {/* Status Badge */}
        <span
          className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${statusClass}`}
        >
          {puppy.status}
        </span>

        {/* Floating Action Button (hover, Available only) */}
        {isAvailable && (
          <div className="absolute bottom-4 right-4 translate-y-0 md:translate-y-12 transition-transform duration-300 md:group-hover:translate-y-0">
            <Link
              href={`/puppies/${puppy.slug}`}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white shadow-lg shadow-black/30 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-orange-400/60 hover:text-orange-300"
              aria-label={`View details for ${puppy.name}`}
            >
              <ArrowUpRight size={18} />
            </Link>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-3 pb-2">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white transition-colors group-hover:text-orange-400">
              {puppy.name}
            </h3>
            <p className="text-sm font-medium text-slate-500">{puppy.color}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-white">
              {puppy.price_usd ? `$${puppy.price_usd.toLocaleString()}` : 'Contact'}
            </div>
          </div>
        </div>

        <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-slate-400">
          {puppy.description ?? 'Affectionate, socialized bulldog with up-to-date health checks.'}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 border-t border-slate-800 pt-4">
          {isAvailable ? (
            <Link
              href={`/puppies/${puppy.slug}`}
              className="flex-1 rounded-xl bg-orange-500 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600"
            >
              Reserve Now
            </Link>
          ) : (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-xl bg-slate-800 py-3 text-sm font-semibold text-slate-500"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
