'use client';

import { useState, useMemo } from "react";
import Image from "next/image";

function cx(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

type CarouselImage = {
  src: string;
  alt: string;
};

type GalleryCarouselProps = {
  images: CarouselImage[];
  className?: string;
};

export function GalleryCarousel({ images, className }: GalleryCarouselProps) {
  const sanitizedImages = useMemo(
    () => images.filter((image) => Boolean(image?.src)),
    [images],
  );

  const [index, setIndex] = useState(0);
  const total = sanitizedImages.length;

  if (total === 0) {
    return null;
  }

  const current = sanitizedImages[index];
  const handlePrevious = () => setIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  const handleNext = () => setIndex((prev) => (prev === total - 1 ? 0 : prev + 1));

  return (
    <div className={cx("relative", className)}>
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-md">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          width={900}
          height={650}
          priority={index === 0}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AArgBSURVI2EAAAAASUVORK5CYII="
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="h-full w-full object-cover transition-transform duration-500"
        />
      </div>

      {total > 1 ? (
        <>
          <button
            type="button"
            onClick={handlePrevious}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-[color:var(--bg)]/80 p-2 text-text shadow transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[color:var(--bg)]/80 p-2 text-text shadow transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="Next image"
          >
            ›
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {sanitizedImages.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                onClick={() => setIndex(dotIndex)}
                className={cx(
                  "h-2.5 w-2.5 rounded-full border border-border/70 transition",
                  dotIndex === index ? "bg-text" : "bg-bg/70",
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
