'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface BreedCarouselImage {
  src: string;
  alt: string;
}

interface AboutBreedCarouselProps {
  images: BreedCarouselImage[];
  breedName: 'french' | 'english';
}

const BREED_BLUR_DATA_URL =
  'data:image/webp;base64,UklGRlQBAABXRUJQVlA4IEgBAAAQCACdASooABsAPmUqj0WkIqEarfwAQAZEtgBOnKCp3vin0kYHgND/YJATZuuDAGkuJRRwYyXqy2jw6H5CcGwiBicy17fTEcAAAP6ilW9OHLZNo2xQNS0RM4xaI/dxLyfhpPwjpfHpuczC9xEeg8rQ464DYWkL2Xx3th+VF1+Debr9jE+tWvm51DfnwboUnlYOWCnm6oNpElxn5bEoN5DbSjsItcfeh7NzZFhJFl9WY5uwFGNM0vmT0x4ztGsqy01xzHIy4GZWGAJMIsHW5MdUJxsYRy86+qgyTZC4VjvQLScmuGePccUbroCFPwDLa5HbMEf1g4BOjjNONgvP/VptLpNlEi9CVQAz/OYUhstkcOJ8ndQsV59jOGjabqM7vOgYw6GyfbrM2dTr0JIz2X+loBgD1eOyng452NFz8BptkoiqU4GZcAAA';

export function AboutBreedCarousel({ images, breedName }: AboutBreedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div
      className={`
        aspect-square
        overflow-hidden
        rounded-[3rem]
        border border-slate-700/50
        ${breedName === 'french' ? 'rotate-2' : '-rotate-2'}
        transition-transform duration-500 hover:rotate-0
      `}
    >
      <div
        className="relative aspect-square w-full overflow-hidden rounded-[3rem]"
        suppressHydrationWarning
      >
        {images.map((image, index) => (
          <Image
            key={image.src}
            src={image.src}
            alt={image.alt}
            fill
            priority={index === 0}
            placeholder={index === 0 ? 'blur' : undefined}
            blurDataURL={index === 0 ? BREED_BLUR_DATA_URL : undefined}
            sizes="(max-width: 1024px) 100vw, 50vw"
            suppressHydrationWarning
            className={`object-cover absolute inset-0 transition-opacity duration-1500 ease-in-out ${
              mounted && currentIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent opacity-60 pointer-events-none" />
    </div>
  );
}
