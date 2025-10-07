"use client";

import Image from "next/image";
import { useState } from "react";

type PuppyGalleryProps = {
  photos: string[];
  videos?: string[] | null;
  name?: string | null;
};

const placeholder = "https://images.exoticbulldog.dev/placeholders/puppy.jpg";

export function PuppyGallery({ photos, videos = [], name }: PuppyGalleryProps) {
  const media = photos.length ? photos : [placeholder];
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <Image
          src={media[activeIndex]}
          fill
          alt={name ? `${name} photo ${activeIndex + 1}` : "Puppy photo"}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      {media.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {media.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border transition ${
                index === activeIndex
                  ? "border-emerald-500 ring-2 ring-emerald-200"
                  : "border-transparent"
              }`}
            >
              <Image src={url} alt="Puppy thumbnail" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
      {videos?.length ? (
        <div className="mt-6 rounded-3xl border border-neutral-200 bg-white/80 p-4 dark:border-neutral-800 dark:bg-neutral-900/80">
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Video snippets</p>
          <ul className="mt-2 space-y-2 text-sm text-emerald-600">
            {videos.map((video) => (
              <li key={video}>
                <a href={video} target="_blank" rel="noreferrer" className="underline">
                  Watch clip
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
