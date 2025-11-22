'use client';

import Image from 'next/image';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { resolveLocalImage } from '@/lib/utils/images';
import { ShareButton } from './puppy-detail/share-button';
import type { PuppyStatus } from '@/lib/supabase/types';

type PuppyGalleryProps = {
  photos: string[];
  videos?: string[] | null;
  name?: string | null;
  status: PuppyStatus;
  shareUrl: string;
};

const placeholder = '/reviews/cameron-milo.webp';

export function PuppyGallery({ photos, videos = [], name, status, shareUrl }: PuppyGalleryProps) {
  const media = (photos.length ? photos : [placeholder]).map((url) =>
    resolveLocalImage(url, placeholder),
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const isAvailable = status === 'available';
  const isSold = status === 'sold';

  return (
    <div className="space-y-6">
      <div className="group relative aspect-square overflow-hidden rounded-[2.5rem] border border-slate-700/50 shadow-2xl shadow-black/50">
        <Image
          src={media[activeIndex]}
          fill
          alt={name ? `${name} photo ${activeIndex + 1}` : 'Puppy photo'}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={activeIndex === 0}
          loading={activeIndex === 0 ? 'eager' : 'lazy'}
        />

        {/* Status Badge Overlay (Top Left) */}
        <div className="absolute left-6 top-6">
          {isSold ? (
            <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-300 backdrop-blur-md">
              <CheckCircle2 size={14} /> Sold
            </div>
          ) : isAvailable ? (
            <div className="flex items-center gap-2 rounded-full bg-green-500/90 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-green-500/20 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
              </span>
              Available
            </div>
          ) : (
            <div className="rounded-full border border-orange-500/30 bg-orange-500/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-orange-400 backdrop-blur-md">
              {status}
            </div>
          )}
        </div>

        {/* Share Button (Top Right) */}
        <div className="absolute right-6 top-6">
          <ShareButton title={name || 'Puppy'} url={shareUrl} />
        </div>
      </div>
      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          {media.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl transition-all ${
                index === activeIndex
                  ? 'opacity-100 ring-2 ring-orange-500 ring-offset-2 ring-offset-[#0B1120]'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={url}
                alt="Puppy thumbnail"
                fill
                className="object-cover"
                sizes="96px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
      {/* Video Links */}
      {videos?.length ? (
        <div className="rounded-3xl border border-slate-700/50 bg-[#1E293B]/50 p-4">
          <p className="text-sm font-semibold text-white">Video snippets</p>
          <ul className="mt-2 space-y-2 text-sm text-orange-400">
            {videos.map((video) => (
              <li key={video}>
                <a
                  href={video}
                  target="_blank"
                  rel="noreferrer"
                  className="underline transition-colors hover:text-orange-300"
                >
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
