/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback, type FormEvent } from 'react';
import { X, Lock, ChevronLeft, ChevronRight, PawPrint } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { Toaster, toast } from 'sonner';
import { z } from 'zod';

// --- MOCK SERVER ACTION (В реальном проекте вынеси в actions.ts) ---
// Пример валидации Zod схемы для email
const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Имитация серверного экшена
const subscribeAction = async (formData: FormData) => {
  // В Next.js 15 это будет 'use server' функция
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Имитация задержки сети

  const email = formData.get('email');
  if (typeof email !== 'string') {
    return { error: 'Email is required' };
  }
  const result = subscribeSchema.safeParse({ email });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid email' };
  }

  // Здесь логика сохранения в БД (Supabase/Prisma/Firebase)
  console.log('Subscribed:', email);
  return { success: true };
};

// --- DATA: Фото щенков ---
const PUPPY_SLIDES = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop',
    badge: 'COMING SOON',
    title: "Luna's Litter",
    subtitle: 'Arrives in 5 days',
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800&auto=format&fit=crop',
    badge: 'NEW ARRIVAL',
    title: 'Apollo',
    subtitle: 'Available for deposit',
  },
  {
    id: 3,
    image:
      'https://images.unsplash.com/photo-1558118070-0eb29f270921?q=80&w=800&auto=format&fit=crop',
    badge: 'RESERVED',
    title: 'Bella',
    subtitle: 'Going home soon',
  },
];

export default function PromoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Для анимации CSS
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Embla Carousel Hook
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Логика появления (через 1.5 сек)
  useEffect(() => {
    // Проверка localStorage, чтобы не показывать надоедливо
    const hasSeenPromo = localStorage.getItem('exotic_promo_seen_v1');

    // Убери '!hasSeenPromo', если хочешь тестировать каждый раз
    if (!hasSeenPromo) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        // Небольшая задержка для плавного fade-in
        requestAnimationFrame(() => setIsVisible(true));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), 500); // Ждем окончания анимации
    localStorage.setItem('exotic_promo_seen_v1', 'true');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await subscribeAction(formData);

    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Welcome to the waitlist!');
      handleClose();
    }
  };

  if (!isOpen)
    return (
      // Кнопка для ручного вызова (только для демо/тестов)
      <div className="fixed bottom-6 right-6 z-50">
        <Toaster position="top-center" richColors />
        <button
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => setIsVisible(true), 10);
          }}
          className="bg-gray-800 border border-gray-600 text-white px-4 py-2 rounded-full text-xs hover:bg-gray-700 transition shadow-lg"
        >
          ↺ Open Preview Modal
        </button>
      </div>
    );

  return (
    <>
      <Toaster position="top-center" richColors theme="dark" />

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        className={`fixed left-1/2 top-1/2 z-[10000] w-[95%] max-w-4xl -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out ${
          isVisible
            ? 'opacity-100 scale-100 translate-y-[-50%]'
            : 'opacity-0 scale-95 translate-y-[-40%]'
        }`}
      >
        {/* Glass Panel */}
        <div className="relative bg-[#141923]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px]">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition border border-white/5"
          >
            <X size={20} />
          </button>

          {/* LEFT SIDE: Embla Carousel */}
          <div className="w-full md:w-5/12 relative bg-gray-900 group">
            <div className="overflow-hidden h-64 md:h-full relative" ref={emblaRef}>
              <div className="flex h-full">
                {PUPPY_SLIDES.map((slide) => (
                  <div className="flex-[0_0_100%] min-w-0 relative h-full" key={slide.id}>
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent opacity-90" />

                    {/* Content on Image */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#FF6B00] text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg tracking-wider uppercase">
                        {slide.badge}
                      </span>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6">
                      <h4 className="text-white font-bold text-lg leading-tight">{slide.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-0.5 w-full bg-[#FF6B00] rounded-full" />
                        <span className="text-gray-300 text-xs whitespace-nowrap">
                          {slide.subtitle}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Navigation Buttons */}
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 backdrop-blur-sm"
              onClick={scrollPrev}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 backdrop-blur-sm"
              onClick={scrollNext}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* RIGHT SIDE: Content & Form */}
          <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-white/[0.02] to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <PawPrint className="text-[#FF6B00]" size={16} />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                VIP Access
              </span>
            </div>

            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              Don&apos;t miss the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FF9E40]">
                Perfect Puppy
              </span>
            </h3>

            <p className="text-gray-400 mb-8 leading-relaxed font-light">
              Our litters are often reserved before they are publicly listed. Join the
              <strong className="text-gray-200"> Priority Waitlist</strong> to receive photos and
              pricing 24 hours before everyone else.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] placeholder-gray-600 transition disabled:opacity-50"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#FF6B00] hover:bg-orange-600 text-white font-bold px-6 py-4 rounded-xl transition shadow-lg shadow-orange-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Join Waitlist'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-4 rounded-xl font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition"
                >
                  Maybe later
                </button>
              </div>
            </form>

            <p className="text-[11px] text-gray-500 mt-6 flex items-center gap-1.5">
              <Lock size={12} />
              Secured by HCaptcha. No spam guaranteed.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
