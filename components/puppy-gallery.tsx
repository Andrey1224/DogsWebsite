'use client';

import Image from 'next/image';
import { useState } from 'react';

import { resolveLocalImage } from '@/lib/utils/images';

type PuppyGalleryProps = {
  photos: string[];
  videos?: string[] | null;
  name?: string | null;
};

const placeholder = '/reviews/cameron-milo.webp';

export function PuppyGallery({ photos, videos = [], name }: PuppyGalleryProps) {
  const media = (photos.length ? photos : [placeholder]).map((url) =>
    resolveLocalImage(url, placeholder),
  );
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <Image
          src={media[activeIndex]}
          fill
          alt={name ? `${name} photo ${activeIndex + 1}` : 'Puppy photo'}
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
                  ? 'border-accent-aux/50 ring-2 ring-[color:color-mix(in srgb, var(--accent-aux) 35%, transparent)]'
                  : 'border-border'
              }`}
            >
              <Image src={url} alt="Puppy thumbnail" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
      {videos?.length ? (
        <div className="mt-6 rounded-3xl border border-border bg-card p-4">
          <p className="text-sm font-semibold text-text">Video snippets</p>
          <ul className="mt-2 space-y-2 text-sm text-accent-aux">
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
