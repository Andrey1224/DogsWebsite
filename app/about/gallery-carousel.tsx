'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function cx(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(' ');
}

type CarouselImage = {
  src: string;
  alt: string;
  blurDataURL?: string;
};

type GalleryCarouselProps = {
  images: CarouselImage[];
  className?: string;
};

export function GalleryCarousel({ images, className }: GalleryCarouselProps) {
  const sanitizedImages = useMemo(() => images.filter((image) => Boolean(image?.src)), [images]);

  const [index, setIndex] = useState(0);
  const total = sanitizedImages.length;

  if (total === 0) {
    return null;
  }

  const current = sanitizedImages[index];
  const handlePrevious = () => setIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  const handleNext = () => setIndex((prev) => (prev === total - 1 ? 0 : prev + 1));

  return (
    <div
      className={cx('relative w-full max-w-full md:max-w-lg lg:max-w-xl xl:max-w-2xl', className)}
    >
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-md">
        <div className="relative w-full aspect-[2/3]">
          <Image
            key={current.src}
            src={current.src}
            alt={current.alt}
            fill
            priority={index === 0}
            placeholder="blur"
            blurDataURL={
              current.blurDataURL ??
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AArgBSURVI2EAAAAASUVORK5CYII='
            }
            sizes="(min-width: 1280px) 672px, (min-width: 1024px) 576px, (min-width: 768px) 512px, 100vw"
            className="h-full w-full object-cover object-center transition-transform duration-500"
          />
        </div>
      </div>

      {total > 1 ? (
        <>
          <button
            type="button"
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-[color:var(--bg)]/90 p-2 text-text shadow transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-[color:var(--bg)]/90 p-2 text-text shadow transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {sanitizedImages.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                onClick={() => setIndex(dotIndex)}
                className={cx(
                  'h-2.5 w-2.5 rounded-full border border-border/70 transition',
                  dotIndex === index ? 'bg-text' : 'bg-bg/70',
                )}
                aria-label={`View image ${dotIndex + 1}`}
                aria-current={dotIndex === index}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
