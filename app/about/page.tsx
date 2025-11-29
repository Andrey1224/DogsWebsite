// New dark About page with breed spotlights
import Image from 'next/image';
import Link from 'next/link';
import { AboutBreedCarousel } from '@/components/about-breed-carousel';
import {
  Shield,
  Sparkles,
  Users,
  Award,
  Star,
  Bone,
  PlayCircle,
  BookOpen,
  Coffee,
  ArrowRight,
} from 'lucide-react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { getOrganizationSchema } from '@/lib/seo/structured-data';
import { buildMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-static';

export const metadata = buildMetadata({
  title: 'About — Exotic Bulldog Legacy',
  description:
    "Discover Exotic Bulldog Legacy's family-run French and English Bulldog breeding program in Alabama and the journey that inspired it.",
  path: '/about',
});

const stats = [
  { value: '10+', label: 'Years with bulldogs' },
  { value: '100+', label: 'Healthy placements' },
  { value: '100%', label: 'Lifetime support' },
];

const values = [
  {
    icon: Shield,
    iconColor: 'text-orange-400',
    title: 'Health-first philosophy',
    desc: 'Parents are DNA-tested and OFA-screened. Every pairing reduces hereditary risks while building sound temperaments.',
  },
  {
    icon: Sparkles,
    iconColor: 'text-purple-400',
    title: 'Enrichment-driven raising',
    desc: 'Early Neurological Stimulation, gentle kid exposure, and sound desensitization come standard for every pup.',
  },
  {
    icon: Users,
    iconColor: 'text-blue-400',
    title: 'Lifetime breeder support',
    desc: 'We stay in touch long after pickup. Nutrition plans, training tips, and quick answers whenever you need us.',
  },
];

export default function AboutPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#0B1120] pb-20 font-sans text-white">
      {/* SEO - Hidden Breadcrumbs */}
      <div className="sr-only">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
          ]}
        />
      </div>
      <JsonLd data={getOrganizationSchema()} />

      {/* --- HERO SECTION --- */}
      <header className="relative mx-auto max-w-7xl px-6 pb-20 pt-32 md:px-12">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Text Content */}
          <div className="relative z-10 space-y-8">
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-400">
              <span className="h-[1px] w-8 bg-orange-500" /> Our Story
            </div>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              A boutique program built on <br />
              <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                trust &amp; transparency
              </span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-slate-400">
              We are a small family breeder in Alabama, founded in 2019 with one goal in mind:
              raising healthy, confident, and well-balanced Bulldogs. What began with a single puppy
              who stole our hearts grew into a program shaped by intention, responsibility, and
              genuine care.
            </p>
            <p className="max-w-xl text-lg leading-relaxed text-slate-400">
              Every pairing, every pregnancy, and every puppy is raised as if they were our own. No
              shortcuts. No guesswork. Just honest communication, ethical practices, and a
              commitment to giving each pup the strongest possible start.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 border-t border-slate-800 pt-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="mb-1 text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <div className="rounded-r-xl border-l-4 border-orange-500 bg-[#1E293B] p-6 italic text-slate-300">
                &ldquo;Every puppy deserves a healthy start and a loving home. That is our only
                metric of success.&rdquo;
              </div>
            </div>
          </div>

          {/* Image Composition */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-r from-orange-500 to-purple-600 opacity-20 blur-2xl" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-slate-700/50 shadow-2xl">
              <Image
                src="/images/about/family-bulldogs.webp"
                alt="Breeder holding puppy"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent opacity-60" />

              {/* Floating Badge */}
              <div className="absolute bottom-8 right-8 max-w-[200px] rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
                <div className="mb-1 flex items-center gap-2 font-bold text-white">
                  <Award className="text-yellow-400" size={20} />
                  <span>Award Winning</span>
                </div>
                <p className="text-xs text-slate-200">
                  Recognized for excellence in temperament and health.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- VALUES SECTION --- */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {values.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.title}
                className="group rounded-3xl border border-slate-800 bg-[#151e32] p-8 transition-all duration-300 hover:-translate-y-2 hover:border-orange-500/30"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B1120] transition-transform group-hover:scale-110">
                  <IconComponent className={item.iconColor} size={28} />
                </div>
                <h2 className="mb-3 text-xl font-bold text-white">{item.title}</h2>
                <p className="text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- BREED SPOTLIGHT: FRENCHIE --- */}
      <section className="relative overflow-hidden bg-[#0f1629] py-24">
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 md:px-12 lg:grid-cols-2">
          {/* Image Side */}
          <div className="relative order-2 lg:order-1">
            <AboutBreedCarousel
              breedName="french"
              images={[
                {
                  src: '/images/about/carousel/french-1.webp',
                  alt: 'French Bulldog puppy',
                },
                {
                  src: '/images/about/carousel/AboutFrienchie.webp',
                  alt: 'French Bulldog portrait',
                },
                {
                  src: '/images/about/carousel/AboutHappyFrienchie.webp',
                  alt: 'Happy French Bulldog',
                },
                {
                  src: '/images/about/carousel/AboutFunnyFrienchie.webp',
                  alt: 'Playful French Bulldog',
                },
                {
                  src: '/images/about/carousel/KussakaAbout.webp',
                  alt: 'French Bulldog Kussaka',
                },
              ]}
            />
          </div>

          {/* Content Side */}
          <div className="order-1 lg:order-2">
            <div className="mb-4 inline-block rounded-full bg-purple-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-purple-400">
              The Entertainer
            </div>
            <h2 className="mb-6 text-4xl font-bold">
              French Bulldog: <br />
              The Square Flask of Joy
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-slate-400">
              Not just a dog, but a certified style icon with a perpetually serious, yet incredibly
              endearing facial expression. You aren&apos;t just acquiring a pet; you are investing
              in a 24/7 source of positive energy.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="mt-1 h-fit rounded-lg bg-purple-500/20 p-2">
                  <Star size={20} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Master of the Comedic Glare</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Their big, dark eyes can melt your heart in a second. They ask for cheese
                    without uttering a sound.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 h-fit rounded-lg bg-purple-500/20 p-2">
                  <Bone size={20} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Compact Comfort Energy</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Always ready to be close—on your bed, or right on your head. A living, warm,
                    slightly snorting anti-stress ball.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BREED SPOTLIGHT: ENGLISH BULLDOG --- */}
      <section className="relative bg-[#0B1120] py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 md:px-12 lg:grid-cols-2">
          {/* Content Side */}
          <div className="space-y-8">
            <div className="mb-2 inline-block rounded-full bg-orange-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-orange-400">
              🇬🇧 The Classic
            </div>
            <h2 className="text-4xl font-bold">
              English Bulldog: <br />
              Your Wrinkly Cloud of Happiness
            </h2>
            <p className="text-lg leading-relaxed text-slate-400">
              A majestic creature whose rough, gladiator-like appearance conceals the soul of a
              gentle, devoted teddy bear. The king of low-effort, deep companionship.
            </p>

            <div className="space-y-4 rounded-2xl border border-slate-800 bg-[#1E293B]/50 p-6">
              <h3 className="mb-4 border-b border-slate-700 pb-2 font-bold text-white">
                Perfect Partner For:
              </h3>

              <div className="group flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                  <PlayCircle size={20} />
                </div>
                <div>
                  <span className="block font-bold text-slate-200">Movie Nights</span>
                  <span className="text-xs text-slate-500">
                    His contented sighing creates the cozy atmosphere.
                  </span>
                </div>
              </div>

              <div className="group flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-400 transition-colors group-hover:bg-green-500 group-hover:text-white">
                  <BookOpen size={20} />
                </div>
                <div>
                  <span className="block font-bold text-slate-200">Reading Books</span>
                  <span className="text-xs text-slate-500">
                    A heavy, warm, stabilizing anchor on your lap.
                  </span>
                </div>
              </div>

              <div className="group flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-400 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                  <Coffee size={20} />
                </div>
                <div>
                  <span className="block font-bold text-slate-200">Quiet Walks</span>
                  <span className="text-xs text-slate-500">
                    He doesn&apos;t need speed; he just needs your presence.
                  </span>
                </div>
              </div>
            </div>

            <p className="border-l-2 border-slate-700 pl-4 text-sm italic text-slate-500">
              &ldquo;The English Bulldog is a steady stream of positivity. He is your pillow, space
              heater, and therapist.&rdquo;
            </p>
          </div>

          {/* Image Side */}
          <div className="relative">
            <AboutBreedCarousel
              breedName="english"
              images={[
                {
                  src: '/images/about/carousel/english-1.webp',
                  alt: 'English Bulldog puppy',
                },
                // User will add more images later
              ]}
            />
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-orange-500 opacity-20 blur-3xl" />
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-3xl font-bold">
            Ready to add a &ldquo;Cloud of Happiness&rdquo; to your life?
          </h2>
          <p className="mb-8 text-slate-400">
            We welcome families by appointment in Montgomery, AL and host virtual meet-and-greets.
          </p>
          <Link
            href="/puppies"
            className="mx-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-10 py-4 font-bold text-white shadow-lg shadow-orange-500/25 transition-transform hover:scale-105"
          >
            See available puppies <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  );
}
