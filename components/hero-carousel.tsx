'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

const HERO_BLUR_DATA_URL =
  'data:image/webp;base64,UklGRlQBAABXRUJQVlA4IEgBAAAQCACdASooABsAPmUqj0WkIqEarfwAQAZEtgBOnKCp3vin0kYHgND/YJATZuuDAGkuJRRwYyXqy2jw6H5CcGwiBicy17fTEcAAAP6ilW9OHLZNo2xQNS0RM4xaI/dxLyfhpPwjpfHpuczC9xEeg8rQ464DYWkL2Xx3th+VF1+Debr9jE+tWvm51DfnwboUnlYOWCnm6oNpElxn5bEoN5DbSjsItcfeh7NzZFhJFl9WY5uwFGNM0vmT0x4ztGsqy01xzHIy4GZWGAJMIsHW5MdUJxsYRy86+qgyTZC4VjvQLScmuGePccUbroCFPwDLa5HbMEf1g4BOjjNONgvP/VptLpNlEi9CVQAz/OYUhstkcOJ8ndQsV59jOGjabqM7vOgYw6GyfbrM2dTr0JIz2X+loBgD1eOyng452NFz8BptkoiqU4GZcAAA';

const carouselImages = [
  {
    src: '/images/home/hero/puppy-play.webp',
    alt: 'Playful Bulldog Puppy',
  },
  {
    src: '/images/home/hero/dog-running.webp',
    alt: 'French Bulldog Running',
  },
  {
    src: '/images/home/hero/dusya.webp',
    alt: 'French Bulldog with Toy',
  },
  {
    src: '/images/home/hero/puppy-eating.webp',
    alt: 'Bulldog Puppy Feeding Time',
  },
  {
    src: '/images/home/hero/puppy-hiding.webp',
    alt: 'Adorable Bulldog Puppy',
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
    <div className="relative overflow-hidden rounded-[3rem] border border-slate-700/50 shadow-2xl shadow-orange-900/20 transition-transform duration-700 hover:rotate-0 rotate-2">
      <div
        className="relative h-[500px] w-full overflow-hidden rounded-[3rem]"
        suppressHydrationWarning
      >
        {carouselImages.map((image, index) => (
          <Image
            key={image.src}
            src={image.src}
            alt={image.alt}
            fill
            priority={index === 0}
            placeholder={index === 0 ? 'blur' : undefined}
            blurDataURL={index === 0 ? HERO_BLUR_DATA_URL : undefined}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 32rem"
            suppressHydrationWarning
            className={`object-cover absolute inset-0 transition-opacity duration-1500 ease-in-out ${
              mounted && currentIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/80 via-transparent to-transparent z-20 pointer-events-none" />

      {/* Health Guarantee Badge */}
      <div className="absolute top-8 right-8 flex max-w-xs items-center gap-4 rounded-2xl border border-slate-600/50 bg-[#1E293B]/90 p-4 backdrop-blur-md z-30">
        <div className="rounded-full bg-green-500/20 p-2">
          <ShieldCheck className="text-green-400" size={24} />
        </div>
        <div>
          <p className="text-sm font-bold">Health Guarantee</p>
          <p className="text-xs text-slate-400">Vet-checked & vaccinated</p>
        </div>
      </div>
    </div>
  );
}
