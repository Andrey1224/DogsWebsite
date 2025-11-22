import type { ElementType, ReactNode } from 'react';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Heart,
  PlayCircle,
  Star,
  ShieldCheck,
} from 'lucide-react';

import { FaqAccordion } from '@/components/home/faq-accordion';
import { FeaturedReviewsCarousel } from '@/components/home/featured-reviews';
import { buildMetadata } from '@/lib/seo/metadata';
import { getFeaturedReviews } from '@/lib/reviews/queries';
import type { Review } from '@/lib/reviews/types';

export const metadata = buildMetadata({
  title: 'Premium Bulldog Breeder in Alabama | Exotic Bulldog Legacy',
  description:
    'Discover French and English bulldog puppies raised with health-first standards, transparent pedigrees, and concierge ownership support in Montgomery, Alabama.',
  path: '/',
  image: 'https://images.exoticbulldog.dev/hero/english-bulldog.jpg',
});

type FeatureItem = {
  title: string;
  description: string;
  icon: ElementType;
};

const features: FeatureItem[] = [
  {
    title: 'Health-first standards',
    description:
      'AKC pedigrees, OFA screenings, and transparent vet documentation for every sire and dam.',
    icon: Heart,
  },
  {
    title: 'Curated matches',
    description:
      'Filter by breed, color, and temperament to find the bulldog that fits your family routine.',
    icon: CheckCircle2,
  },
  {
    title: 'Guided ownership',
    description:
      'Personal support before and after adoption, plus secure deposits handled via Stripe & PayPal.',
    icon: ShieldCheck,
  },
];

const faqs = [
  {
    question: 'How do I place a deposit?',
    answer:
      "Open the puppy's detail page and tap Reserve with Stripe or PayPal. The $300 deposit immediately marks the puppy as reserved while we finalize your contract and pickup timeline.",
  },
  {
    question: 'Is the deposit refundable?',
    answer:
      'Deposits are non-refundable because we pause all other inquiries for that puppy. If your timing changes, we can transfer the deposit to another available or upcoming puppy by agreement.',
  },
  {
    question: 'What are the pickup options?',
    answer:
      'You can pick up in Montgomery by appointment or choose courier delivery. We partner with trusted ground transport and flight nannies; travel fees are quoted at cost and due prior to departure.',
  },
];

const HERO_BLUR_DATA_URL =
  'data:image/webp;base64,UklGRlQBAABXRUJQVlA4IEgBAAAQCACdASooABsAPmUqj0WkIqEarfwAQAZEtgBOnKCp3vin0kYHgND/YJATZuuDAGkuJRRwYyXqy2jw6H5CcGwiBicy17fTEcAAAP6ilW9OHLZNo2xQNS0RM4xaI/dxLyfhpPwjpfHpuczC9xEeg8rQ464DYWkL2Xx3th+VF1+Debr9jE+tWvm51DfnwboUnlYOWCnm6oNpElxn5bEoN5DbSjsItcfeh7NzZFhJFl9WY5uwFGNM0vmT0x4ztGsqy01xzHIy4GZWGAJMIsHW5MdUJxsYRy86+qgyTZC4VjvQLScmuGePccUbroCFPwDLa5HbMEf1g4BOjjNONgvP/VptLpNlEi9CVQAz/OYUhstkcOJ8ndQsV59jOGjabqM7vOgYw6GyfbrM2dTr0JIz2X+loBgD1eOyng452NFz8BptkoiqU4GZcAAA';

type ActionLinkProps = {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
};

function ActionLink({ href, children, variant = 'primary', className = '' }: ActionLinkProps) {
  const base =
    'inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all';
  const styles =
    variant === 'primary'
      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600'
      : 'border border-slate-700 bg-slate-800 text-white hover:border-slate-600 hover:bg-slate-700';

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}

export default function Home() {
  return (
    <>
      <link rel="preload" as="image" href="/hero/hero-1600.webp" type="image/webp" />
      <link rel="preload" as="image" href="/hero/hero-1600.avif" type="image/avif" />

      <main className="min-h-screen bg-[#0B1120] text-white selection:bg-orange-500/30">
        <HeroSection />
        <FeaturesSection />
        <FaqSection />
        <Suspense fallback={null}>
          <ReviewsSectionLoader />
        </Suspense>
        <CallToAction />
      </main>
    </>
  );
}

async function ReviewsSectionLoader() {
  const featuredReviews = await getFeaturedReviews();
  if (!featuredReviews.length) return null;
  return <ReviewsSection reviews={featuredReviews} />;
}

function HeroSection() {
  return (
    <header className="relative overflow-hidden px-6 pt-32 pb-20 md:px-20">
      <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-400">
            <Star size={12} className="fill-orange-400" />
            Premium Breeder in Alabama
          </div>
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl">
            Trusted French &amp; English bulldogs, <br /> raised with{' '}
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              southern warmth
            </span>
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-slate-400 md:text-xl">
            Discover a curated catalog of champion-line bulldogs bred for health, temperament, and
            lifelong companionship.
          </p>
          <div className="flex flex-wrap gap-4">
            <ActionLink href="/puppies" variant="primary">
              View available puppies <ArrowUpRight size={18} />
            </ActionLink>
            <ActionLink href="/contact" variant="secondary">
              Schedule a video call <PlayCircle size={18} />
            </ActionLink>
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-[3rem] border border-slate-700/50 shadow-2xl shadow-orange-900/20 transition-transform duration-700 hover:rotate-0 rotate-2">
            <div className="relative h-[500px] w-full">
              <Image
                src="/hero/hero-1600.webp"
                alt="Healthy French and English bulldog puppies"
                fill
                priority
                placeholder="blur"
                blurDataURL={HERO_BLUR_DATA_URL}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 36rem"
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/80 via-transparent to-transparent" />

            <div className="absolute bottom-8 left-8 flex max-w-xs items-center gap-4 rounded-2xl border border-slate-600/50 bg-[#1E293B]/90 p-4 backdrop-blur-md">
              <div className="rounded-full bg-green-500/20 p-2">
                <ShieldCheck className="text-green-400" size={24} />
              </div>
              <div>
                <p className="text-sm font-bold">Health Guarantee</p>
                <p className="text-xs text-slate-400">Vet-checked & vaccinated</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function FeaturesSection() {
  return (
    <section className="bg-[#0f1629] py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-20">
        <div className="mb-16 items-end justify-between md:flex">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-orange-400">
              About the breeder
            </p>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              A family-run program built on trust
            </h2>
            <p className="text-slate-400">
              We blend veterinary best practices with genuine love for the breed.
            </p>
          </div>
          <Link
            href="/about"
            className="group mt-6 hidden items-center gap-2 text-slate-300 transition-colors hover:text-white md:flex"
          >
            Learn more about us
            <ArrowRight className="transition-transform group-hover:translate-x-1" size={18} />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="group rounded-3xl border border-slate-700/50 bg-[#1E293B] p-8 transition-colors hover:border-orange-500/30"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1120] transition-transform group-hover:scale-110">
                  <Icon className="text-orange-400" size={24} />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="relative overflow-hidden bg-[#0B1120] py-24">
      <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-blue-600/5 blur-[100px]" />

      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-orange-400">
            Quick Answers
          </p>
          <h2 className="text-3xl font-bold md:text-4xl">Your questions, answered</h2>
        </div>

        <FaqAccordion faqs={faqs} />

        <div className="mt-10 text-center">
          <Link
            href="/faq"
            className="rounded-full border border-slate-700 px-6 py-2 text-sm text-slate-400 transition-colors hover:text-white"
          >
            See all FAQs
          </Link>
        </div>
      </div>
    </section>
  );
}

function ReviewsSection({ reviews }: { reviews: Review[] }) {
  return (
    <section className="relative flex items-center overflow-hidden bg-[#0f1629] py-24">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 md:px-20 lg:grid-cols-3">
        <div className="z-20 space-y-6 lg:col-span-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-orange-400">
            Featured Raves
          </h3>
          <h2 className="text-4xl font-bold leading-tight md:text-5xl">
            What our <br />
            <span className="text-orange-500">customers</span> <br />
            are saying
          </h2>
          <p className="text-lg leading-relaxed text-slate-400">
            Real stories from families who found their perfect companions with us.
          </p>
          <div className="pt-4">
            <ActionLink href="/reviews" variant="primary">
              Read all reviews <ArrowUpRight size={18} />
            </ActionLink>
          </div>
        </div>

        <div className="relative lg:col-span-2">
          <FeaturedReviewsCarousel reviews={reviews} />
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="bg-[#0B1120] px-6 py-20 md:px-20">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[3rem] border border-slate-700/50 bg-gradient-to-r from-[#1E293B] to-[#1a2333] p-12 text-center shadow-2xl">
        <div className="absolute inset-0 opacity-5 [background-image:url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <h2 className="relative z-10 mb-6 text-3xl font-bold md:text-5xl">
          Ready to find your perfect bulldog?
        </h2>
        <p className="relative z-10 mx-auto mb-8 max-w-xl text-slate-400">
          Browse our curated catalog of available puppies or schedule a kennel visit.
        </p>
        <div className="relative z-10 flex justify-center gap-4">
          <ActionLink href="/puppies" variant="primary">
            View available puppies
          </ActionLink>
          <ActionLink href="/contact" variant="secondary">
            Schedule a visit
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
