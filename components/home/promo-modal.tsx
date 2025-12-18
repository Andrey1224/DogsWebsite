'use client';

import { useEffect, useState, useCallback, type FormEvent } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Lock, PawPrint, PlayCircle, X } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { Toaster, toast } from 'sonner';
import { z } from 'zod';

const PUPPY_SLIDES = [
  {
    id: 1,
    image: '/promo/brown-puppy-promo.webp',
    badge: 'Heartbreaker',
    title: 'Chestnut Brindle',
    subtitle: 'Ready for reservations',
    alt: 'Brindle brown bulldog puppy sitting on a white blanket',
  },
  {
    id: 2,
    image: '/promo/merle-two-puppies-promo.webp',
    badge: 'Double Trouble',
    title: 'Merle Siblings',
    subtitle: 'Limited spots',
    alt: 'Two merle bulldog puppies laying together on a couch',
  },
  {
    id: 3,
    image: '/promo/dark-fluff-promo.webp',
    badge: 'Fluff Boss',
    title: 'Shadow Fluff',
    subtitle: 'Arrives this week',
    alt: 'Dark fluffy bulldog puppy with white paws',
  },
  {
    id: 4,
    image: '/promo/brown-and-white-puppy-promo.webp',
    badge: 'Sweetie Pie',
    title: 'Cinnamon & Cream',
    subtitle: 'High interest',
    alt: 'Brown and white bulldog puppy lying on a bed',
  },
  {
    id: 5,
    image: '/promo/merle-puppy.webp',
    badge: 'Charm Bomb',
    title: 'Silver Merle',
    subtitle: 'Few spots left',
    alt: 'Merle bulldog puppy looking at the camera',
  },
];

type SubscribeResult = { error?: string; success?: boolean; message?: string };

type PromoModalProps = {
  open: boolean;
  onClose: () => void;
  subscribe?: (email: string) => Promise<SubscribeResult>;
};

const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const defaultSubscribe = async (email: string): Promise<SubscribeResult> => {
  // Stubbed request; replace with server action later
  await new Promise((resolve) => setTimeout(resolve, 800));
  const result = subscribeSchema.safeParse({ email });
  if (!result.success) return { error: result.error.issues[0]?.message ?? 'Invalid email' };
  return { success: true, message: 'Welcome to the waitlist!' };
};

export function PromoModal({ open, onClose, subscribe = defaultSubscribe }: PromoModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [open]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 250);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '');

    setIsSubmitting(true);
    const result = await subscribe(email);
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(result.message ?? 'Welcome to the waitlist!');
    handleClose();
  };

  if (!open) return null;

  return (
    <>
      <Toaster position="top-center" richColors theme="dark" />
      <div
        className={`fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      <div
        className={`fixed left-1/2 top-1/2 z-[10000] w-[95%] max-w-4xl -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out ${
          isVisible ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-95'
        }`}
      >
        <div className="relative flex min-h-[500px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#141923]/80 backdrop-blur-xl shadow-2xl md:flex-row">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 z-20 rounded-full border border-white/5 bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Close promo"
          >
            <X size={20} />
          </button>

          <div className="group relative w-full bg-gray-900 md:w-5/12">
            <div className="relative h-64 overflow-hidden md:h-full" ref={emblaRef}>
              <div className="flex h-full">
                {PUPPY_SLIDES.map((slide) => (
                  <div key={slide.id} className="relative h-full min-w-0 flex-[0_0_100%]">
                    <Image
                      src={slide.image}
                      alt={slide.alt}
                      fill
                      sizes="(min-width: 768px) 40vw, 90vw"
                      className="object-cover"
                      priority={slide.id === 1}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent opacity-90" />
                    <div className="absolute left-4 top-4">
                      <span className="rounded bg-[#FF6B00] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                        {slide.badge}
                      </span>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h4 className="text-lg font-bold leading-tight text-white">{slide.title}</h4>
                      <div className="mt-2 h-0.5 w-16 rounded-full bg-[#FF6B00]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white opacity-0 backdrop-blur-sm transition duration-300 hover:bg-black/50 group-hover:opacity-100"
              onClick={scrollPrev}
              aria-label="Previous puppy"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white opacity-0 backdrop-blur-sm transition duration-300 hover:bg-black/50 group-hover:opacity-100"
              onClick={scrollNext}
              aria-label="Next puppy"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex w-full flex-col justify-center bg-gradient-to-br from-white/[0.02] to-transparent p-8 md:w-7/12 md:p-12">
            <div className="mb-3 flex items-center gap-2">
              <PawPrint className="text-[#FF6B00]" size={16} />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                VIP Access
              </span>
            </div>

            <h3 className="mb-4 text-3xl font-bold leading-tight text-white md:text-4xl">
              Don&apos;t miss the <br />
              <span className="bg-gradient-to-r from-[#FF6B00] to-[#FF9E40] bg-clip-text text-transparent">
                Perfect Puppy
              </span>
            </h3>

            <p className="mb-8 font-light leading-relaxed text-gray-400">
              Our litters are often reserved before they are publicly listed. Join the{' '}
              <strong className="text-gray-200">Priority Waitlist</strong> to receive photos and
              pricing 24 hours before everyone else.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white transition placeholder-gray-600 focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-[#FF6B00] px-6 py-4 font-bold text-white shadow-lg shadow-orange-900/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    'Join Waitlist'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl px-6 py-4 font-semibold text-gray-400 transition hover:bg-white/5 hover:text-white"
                >
                  Maybe later
                </button>
              </div>
            </form>

            <p className="mt-6 flex items-center gap-1.5 text-[11px] text-gray-500">
              <Lock size={12} />
              Secured by HCaptcha. No spam guaranteed.
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
              <PlayCircle size={14} className="text-[#FF6B00]" />
              Preview only — wire to real waitlist action later.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
