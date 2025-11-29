'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, MapPin, Star, UserCircle2 } from 'lucide-react';

import type { Review } from '@/lib/reviews/types';

type FeaturedReviewsCarouselProps = {
  reviews: Review[];
};

function formatReviewDate(review: Review): string {
  const rawDate = review.visitDate ?? review.createdAt;
  const parsed = new Date(rawDate);

  if (Number.isNaN(parsed.getTime())) {
    return 'Recent visit';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(parsed);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function StarRow({ rating: _rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={16} className="fill-orange-400 text-orange-400" />
      ))}
    </div>
  );
}

export function FeaturedReviewsCarousel({ reviews }: FeaturedReviewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(reviews.length > 1 ? 1 : 0);

  if (reviews.length === 0) return null;

  const goToNext = () => {
    if (reviews.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const goToPrev = () => {
    if (reviews.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <div className="relative min-h-[520px] md:min-h-[500px] lg:min-h-[480px]">
      <div className="absolute -top-16 right-0 z-30 flex gap-3">
        <button
          type="button"
          onClick={goToPrev}
          disabled={reviews.length <= 1}
          className="rounded-full border border-slate-700 bg-[#0f1629] p-3 text-slate-300 transition-all hover:border-orange-500 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Previous review"
        >
          <ArrowLeft size={22} />
        </button>
        <button
          type="button"
          onClick={goToNext}
          disabled={reviews.length <= 1}
          className="rounded-full border border-slate-700 bg-[#0f1629] p-3 text-slate-300 transition-all hover:border-orange-500 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Next review"
        >
          <ArrowRight size={22} />
        </button>
      </div>

      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center [perspective:1000px]">
        {reviews.map((review, index) => {
          let position = index - currentIndex;

          if (currentIndex === 0 && index === reviews.length - 1) position = -1;
          if (currentIndex === reviews.length - 1 && index === 0) position = 1;

          const isActive = position === 0;
          const isPrev = position === -1;
          const isNext = position === 1;

          if (
            Math.abs(position) > 1 &&
            !(currentIndex === 0 && index === reviews.length - 1) &&
            !(currentIndex === reviews.length - 1 && index === 0)
          ) {
            return null;
          }

          return (
            <div
              key={review.id}
              className={`absolute flex h-full min-h-[380px] w-[90%] flex-col justify-between rounded-3xl p-8 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] md:w-[620px] ${
                isActive
                  ? 'translate-x-0 scale-100 border border-slate-700/50 bg-[#1E293B] opacity-100 shadow-2xl shadow-orange-500/10 z-20'
                  : 'pointer-events-none border border-transparent bg-[#111827] opacity-40 blur-[1px] z-10'
              } ${isPrev ? '-translate-x-[15%] scale-90 md:-translate-x-[60%] md:-rotate-2' : ''} ${
                isNext ? 'translate-x-[15%] scale-90 md:translate-x-[60%] md:rotate-2' : ''
              }`}
            >
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <StarRow rating={review.rating} />
                  <span className="text-sm font-medium text-slate-500">
                    {formatReviewDate(review)}
                  </span>
                </div>
                <h3 className="mb-4 text-2xl font-bold leading-snug text-white">
                  {review.headline ?? 'Happy bulldog family'}
                </h3>
                <p className="text-base leading-relaxed text-slate-300">
                  &ldquo;{review.body}&rdquo;
                </p>
              </div>
              <div className="mt-8 flex items-end justify-between border-t border-slate-700/50 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-orange-300">
                    <UserCircle2 />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{review.authorName}</h4>
                    {review.authorLocation ? (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={12} />
                        <span>{review.authorLocation}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
