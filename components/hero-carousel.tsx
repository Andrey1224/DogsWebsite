'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

const HERO_BLUR_DATA_URL =
  'data:image/webp;base64,UklGRlQBAABXRUJQVlA4IEgBAAAQCACdASooABsAPmUqj0WkIqEarfwAQAZEtgBOnKCp3vin0kYHgND/YJATZuuDAGkuJRRwYyXqy2jw6H5CcGwiBicy17fTEcAAAP6ilW9OHLZNo2xQNS0RM4xaI/dxLyfhpPwjpfHpuczC9xEeg8rQ464DYWkL2Xx3th+VF1+Debr9jE+tWvm51DfnwboUnlYOWCnm6oNpElxn5bEoN5DbSjsItcfeh7NzZFhJFl9WY5uwFGNM0vmT0x4ztGsqy01xzHIy4GZWGAJMIsHW5MdUJxsYRy86+qgyTZC4VjvQLScmuGePccUbroCFPwDLa5HbMEf1g4BOjjNONgvP/VptLpNlEi9CVQAz/OYUhstkcOJ8ndQsV59jOGjabqM7vOgYw6GyfbrM2dTr0JIz2X+loBgD1eOyng452NFz8BptkoiqU4GZcAAA';

const carouselImages = [
  {
    src: '/images/home/hero/litter-grass-trio.webp',
    alt: 'Three bulldog puppies snuggled together outdoors',
  },
  {
    src: '/images/home/hero/car-ride-quartet.webp',
    alt: 'Four French bulldog puppies riding together',
  },
  {
    src: '/images/home/hero/lap-cuddle-duo.webp',
    alt: 'Bulldog puppies being held and cuddled',
  },
  {
    src: '/images/home/hero/play-session-trio.webp',
    alt: 'Bulldog puppies playing together outdoors',
  },
  {
    src: '/images/home/hero/blanket-nose-boop.webp',
    alt: 'Two bulldog puppies nose to nose on a blanket',
  },
  {
    src: '/images/home/hero/patio-pillow-duo.webp',
    alt: 'Two bulldog puppies resting on a patio pillow',
  },
  {
    src: '/images/home/hero/couch-kisses-duo.webp',
    alt: 'Two bulldog puppies playing on a couch',
  },
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-[3rem] border border-slate-700/50 shadow-2xl shadow-orange-900/20 transition-transform duration-700 hover:rotate-0 rotate-2">
      <div
        className="relative h-[500px] w-full overflow-hidden rounded-[3rem]"
        suppressHydrationWarning
      >
        {carouselImages.map((image, index) => {
          const isLCP = index === 0;
          const isActive = mounted && currentIndex === index;

          return (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              fill
              priority={isLCP}
              fetchPriority={isLCP ? 'high' : undefined}
              placeholder={isLCP ? 'blur' : undefined}
              blurDataURL={isLCP ? HERO_BLUR_DATA_URL : undefined}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 32rem"
              suppressHydrationWarning
              className={`object-cover absolute inset-0 ${
                // First image (LCP): instant display, no transition on mount
                isLCP && !mounted
                  ? 'opacity-100 z-10'
                  : isLCP && mounted
                    ? `transition-opacity duration-500 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`
                    : `transition-opacity duration-1500 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`
              }`}
            />
          );
        })}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/80 via-transparent to-transparent z-20 pointer-events-none" />
      </div>

      {/* Vet-checked Badge: sits below the card, fully off the photo itself */}
      <div className="absolute top-full right-4 mt-4 flex max-w-[11rem] sm:max-w-xs items-center gap-3 sm:gap-4 rounded-2xl border border-slate-600/50 bg-[#1E293B]/90 p-3 sm:p-4 backdrop-blur-md z-30 shadow-xl shadow-black/30">
        <div className="rounded-full bg-green-500/20 p-2 shrink-0">
          <ShieldCheck className="text-green-400" size={24} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-bold">Vet-Checked</p>
          <p className="text-xs text-slate-400">Age-appropriate vaccinations</p>
        </div>
      </div>
    </div>
  );
}
