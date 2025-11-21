'use client';

import Link from 'next/link';
import { useCallback, useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';

import type { Review } from '@/lib/reviews/types';
import { ReviewCard } from './review-card';

type ReviewCarouselProps = {
  reviews: Review[];
};

export function ReviewCarousel({ reviews }: ReviewCarouselProps) {
  const autoplay = useRef(
    Autoplay({
      delay: 4200,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'center',
      loop: true,
      slidesToScroll: 1,
    },
    [autoplay.current],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (reviews.length === 0) return null;

  return (
    <section className="border-t border-border bg-card/60 py-14 text-text dark:bg-gradient-to-b dark:from-[#1f2340] dark:via-[#1b1f35] dark:to-[#181b2f] dark:text-white">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent dark:text-amber-300">
              Featured raves
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-text dark:text-white sm:text-3xl">
              Families who love their EBL bulldogs
            </h2>
            <p className="max-w-2xl text-sm text-muted dark:text-white/70">
              Curated highlights from published reviews. We rotate fresh stories from Facebook and
              the community as they get approved.
            </p>
          </div>
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--btn-bg)] px-5 py-2.5 text-sm font-semibold text-[color:var(--btn-text)] shadow-lg transition hover:brightness-105 dark:bg-amber-300 dark:text-[#1b1f35] dark:hover:brightness-110"
          >
            Read all reviews
            <span aria-hidden="true">→</span>
          </Link>
        </header>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="min-w-full flex-shrink-0 sm:min-w-[80vw] md:min-w-[70vw] lg:min-w-[55vw] xl:min-w-[45vw]"
                >
                  <ReviewCard review={review} variant="compact" />
                </div>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 flex items-center justify-between px-2">
            <button
              type="button"
              onClick={scrollPrev}
              className="pointer-events-auto hidden rounded-full border border-border bg-white/80 px-3 py-2 text-lg font-bold text-text shadow-sm backdrop-blur hover:bg-white lg:inline-flex dark:border-white/30 dark:bg-white/15 dark:text-white dark:hover:bg-white/25"
              aria-label="Previous review"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="pointer-events-auto hidden rounded-full border border-border bg-white/80 px-3 py-2 text-lg font-bold text-text shadow-sm backdrop-blur hover:bg-white lg:inline-flex dark:border-white/30 dark:bg-white/15 dark:text-white dark:hover:bg-white/25"
              aria-label="Next review"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
