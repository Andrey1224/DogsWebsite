import Image from 'next/image';
import { Star, MapPin, Quote } from 'lucide-react';

import type { Review } from '@/lib/reviews/types';

type ReviewCardProps = {
  review: Review;
  variant?: 'full' | 'compact';
};

function formatVisitDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function ReviewCard({ review, variant = 'full' }: ReviewCardProps) {
  const isCompact = variant === 'compact';
  const visitLabel = formatVisitDate(review.visitDate);

  return (
    <article className="group break-inside-avoid rounded-3xl border border-slate-800 bg-[#151e32] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-600 hover:shadow-2xl">
      {/* Header with stars and decorative quote */}
      <div className="mb-4 flex items-start justify-between">
        <span className="flex gap-1" role="img" aria-label={`${review.rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={14}
              className="fill-orange-400 text-orange-400"
              aria-hidden="true"
            />
          ))}
        </span>
        <Quote
          size={20}
          className="text-slate-700 transition-colors group-hover:text-orange-500/50"
          aria-hidden="true"
        />
      </div>

      {/* Review text */}
      <p
        className={`mb-6 text-sm leading-relaxed text-slate-300 ${isCompact ? 'line-clamp-4' : ''}`}
      >
        &ldquo;{review.body}&rdquo;
      </p>

      {/* Photo */}
      {review.photoUrl ? (
        <div className="relative mb-6 aspect-video overflow-hidden rounded-2xl">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
          <Image
            src={review.photoUrl}
            alt={`Review from ${review.authorName}`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : null}

      {/* Author info */}
      <div className="flex items-center gap-3 border-t border-slate-800 pt-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-sm font-bold text-orange-400">
          {review.authorName.charAt(0)}
        </div>
        <div>
          <div className="text-sm font-bold text-white">{review.authorName}</div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            {review.authorLocation ? (
              <>
                <MapPin size={10} aria-hidden="true" /> {review.authorLocation}
              </>
            ) : null}
            {visitLabel ? (
              <>
                {review.authorLocation ? ' • ' : null}
                <span className="text-slate-600">{visitLabel}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
