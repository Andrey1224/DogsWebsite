"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, PawPrint } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ParentPhotoCarouselProps = {
  title: "Sire" | "Dam";
  parentName?: string | null;
  photos?: string[] | null;
};

export function ParentPhotoCarousel({ title, parentName, photos }: ParentPhotoCarouselProps) {
  const media = useMemo(() => (photos ?? []).filter((src): src is string => Boolean(src)), [photos]);
  const [index, setIndex] = useState(0);
  const total = media.length;
  const displayName = parentName ?? "TBD";

  useEffect(() => {
    setIndex(0);
  }, [total]);

  const showControls = total > 1;
  const hasPhotos = total > 0;
  const current = hasPhotos ? media[index] : null;

  return (
    <article className="space-y-3 rounded-2xl border border-border/80 bg-bg/40 p-4">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-aux">{title}</p>
        <p className="text-sm font-semibold text-text">{displayName}</p>
      </header>
      {hasPhotos ? (
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <Image
              key={current}
              src={current ?? ""}
              alt={`${title} ${displayName} photo ${index + 1}`}
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 768px) 45vw, 100vw"
              className="object-cover object-center"
              priority={index === 0}
            />
          </div>
          {showControls ? (
            <>
              <button
                type="button"
                onClick={() => setIndex((prev) => (prev === 0 ? total - 1 : prev - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-[color:var(--bg)]/90 p-2 text-text shadow transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                aria-label="Previous parent photo"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIndex((prev) => (prev === total - 1 ? 0 : prev + 1))}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[color:var(--bg)]/90 p-2 text-text shadow transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                aria-label="Next parent photo"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                {media.map((_, dotIndex) => (
                  <button
                    key={`${title}-${dotIndex}`}
                    type="button"
                    onClick={() => setIndex(dotIndex)}
                    className={`h-2 w-2 rounded-full border border-border transition ${dotIndex === index ? "bg-text" : "bg-bg/60"}`}
                    aria-label={`View ${title.toLowerCase()} photo ${dotIndex + 1}`}
                    aria-current={dotIndex === index}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : (
        <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 px-6 text-center text-xs text-muted">
          <PawPrint className="h-5 w-5 text-muted" aria-hidden="true" />
          <p>Upload up to three photos in the admin panel to showcase the {title.toLowerCase()}.</p>
        </div>
      )}
    </article>
  );
}
