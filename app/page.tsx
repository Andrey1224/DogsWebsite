import type { ElementType, ReactNode } from 'react';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Heart,
  PlayCircle,
  Star,
  ShieldCheck,
  CreditCard,
  MapPin,
} from 'lucide-react';

import { HeroCarousel } from '@/components/hero-carousel';

import { PromoGate } from '@/components/home/promo-gate';
import { IntroShell } from '@/components/intro-shell';
import { buildMetadata } from '@/lib/seo/metadata';
import { getFeaturedReviews } from '@/lib/reviews/queries';
import type { Review } from '@/lib/reviews/types';

// Dynamic imports for below-the-fold components to reduce initial bundle size
// These components load in a separate chunk, improving Time to Interactive (TTI)
const FaqAccordion = dynamic(
  () => import('@/components/home/faq-accordion').then((mod) => ({ default: mod.FaqAccordion })),
  {
    loading: () => null,
  },
);

const FeaturedReviewsCarousel = dynamic(
  () =>
    import('@/components/home/featured-reviews').then((mod) => ({
      default: mod.FeaturedReviewsCarousel,
    })),
  {
    loading: () => null,
  },
);

export const metadata = buildMetadata({
  title: 'Bulldog Puppies in Alabama | Exotic Bulldog Legacy',
  description:
    'French and English bulldog puppies available in Alabama with secure deposits, Montgomery pickup, and vetted delivery options from Exotic Bulldog Legacy.',
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
      "First, contact us to schedule a visit or video call to meet your future puppy. Once you've chosen your match, you can place a $300 deposit online (via Stripe or PayPal) or in person. The deposit immediately marks the puppy as reserved while we finalize your contract and pickup timeline.",
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
    <IntroShell>
      <>
        <PromoGate />
        <main className="min-h-screen bg-[#0B1120] text-white selection:bg-orange-500/30">
          <HeroSection />
          <FeaturesSection />
          <LogisticsSection />
          <FaqSection />
          <Suspense fallback={null}>
            <ReviewsSectionLoader />
          </Suspense>
          <CallToAction />
        </main>
      </>
    </IntroShell>
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
            Bulldog puppies available in Alabama
          </div>
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl">
            French &amp; English bulldog puppies <br /> available in{' '}
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Falkville, Alabama
            </span>
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-slate-400 md:text-xl">
            Contact us to meet your future puppy, then secure your reservation with a $300 deposit.
            Choose appointment pickup in Falkville or vetted courier delivery. Health-first
            pedigrees and transparent updates at every step.
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
          <HeroCarousel />
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

function LogisticsSection() {
  return (
    <section className="bg-[#0B1120] py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:px-20 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-orange-400">
            Reserve &amp; pickup made simple
          </div>
          <h2 className="text-3xl font-bold md:text-4xl">
            How our puppy deposit and pickup options work
          </h2>
          <p className="text-lg leading-relaxed text-slate-400">
            We encourage you to contact us first to discuss your needs, schedule a kennel visit, or
            arrange a video call to meet your future puppy. Once you&apos;ve found your perfect
            match, you can secure your puppy with a $300 deposit (online or in person). We&apos;ll
            then confirm your reservation, lock availability, and coordinate pickup in Falkville,
            Alabama (by appointment) or arrange trusted delivery to your door.
          </p>
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-[#0f1629] p-6">
            <div className="flex gap-4">
              <div className="mt-1 rounded-xl bg-green-500/15 p-3 text-green-300">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Secure deposit</h3>
                <p className="text-sm text-slate-400">
                  Stripe or PayPal checkout marks your bulldog puppy as reserved immediately and we
                  send the contract next.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 rounded-xl bg-blue-500/15 p-3 text-blue-300">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Pickup or delivery</h3>
                <p className="text-sm text-slate-400">
                  Meet us by appointment in Montgomery or request vetted courier/flight nanny
                  delivery. We share transport quotes upfront.
                </p>
              </div>
            </div>
            <div className="flex gap-2 text-sm text-slate-400">
              <CheckCircle2 size={18} className="text-orange-400" />
              <span>
                Health records, microchip, and post-pickup support included with every puppy.
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-[2rem] border border-slate-800 bg-gradient-to-b from-[#1a2333] to-[#0f1629] p-8 shadow-2xl">
          <div className="rounded-2xl border border-slate-700/60 bg-[#0B1120]/60 p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
              Quick steps to reserve
            </p>
            <ol className="mt-4 space-y-3 text-slate-300">
              <li className="flex gap-3">
                <span className="mt-0.5 text-xs font-bold text-orange-400">1</span>
                <span>
                  Browse{' '}
                  <Link href="/puppies" className="text-orange-300 underline">
                    available puppies
                  </Link>{' '}
                  and{' '}
                  <Link href="/contact" className="text-orange-300 underline">
                    contact us
                  </Link>{' '}
                  to schedule a visit or video call.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 text-xs font-bold text-orange-400">2</span>
                <span>
                  Select <strong>Reserve with Stripe or PayPal</strong> to place your $300 deposit.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 text-xs font-bold text-orange-400">3</span>
                <span>Confirm pickup in Falkville, AL or request a delivery quote.</span>
              </li>
            </ol>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6 text-sm text-slate-200">
            <div className="flex items-center gap-2 text-orange-300">
              <ShieldCheck size={18} />
              <span>Health guarantee + lifetime support on every placement.</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <ActionLink href="/puppies" variant="primary">
                View available puppies
              </ActionLink>
              <ActionLink href="/contact" variant="secondary">
                Ask about delivery
              </ActionLink>
            </div>
          </div>
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
          <h2 className="text-3xl font-bold md:text-4xl">
            Deposit, pickup, and puppy care questions answered
          </h2>
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
