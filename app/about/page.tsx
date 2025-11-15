import Image from 'next/image';
import { Baby, Heart, Home, Quote, ShieldCheck, Stethoscope } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { getOrganizationSchema } from '@/lib/seo/structured-data';
import { buildMetadata } from '@/lib/seo/metadata';
import { AnalyticsCtaLink } from './analytics-cta-link';
import { GalleryCarousel } from './gallery-carousel';

export const dynamic = 'force-static';

export const metadata = buildMetadata({
  title: 'About — Exotic Bulldog Legacy',
  description:
    'Discover Exotic Bulldog Legacy’s family-run French and English Bulldog breeding program in Alabama and the journey that inspired it.',
  path: '/about',
});

const NURSERY_BLUR =
  'data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAAAQAgCdASoQABAAA4BaJQBOgCHfNUNt3b+AAP7niTyaxqqP7GlhJWrQ3MAcRzDQH2dJnjFMuREZprYzLmDcHzD/i2adQ3zcXGW80ZoIRTOEiii9ZqjZ3/RAAAA=';
const VET_BLUR =
  'data:image/webp;base64,UklGRjAAAABXRUJQVlA4ICQAAABQAQCdASoQABAAD8BaJQBOgCgAAP7vsd/vEb+Fbe/ZlFPlcAA=';

const galleryImages = [
  {
    src: '/about/family-bulldogs.webp',
    alt: 'Exotic Bulldog Legacy family with French and English Bulldog puppies in Alabama',
    blurDataURL:
      'data:image/webp;base64,UklGRogAAABXRUJQVlA4IHwAAABwAgCdASoQABAAA4BaJYwCdAaeQ3/WSf8PzX2AAP7mpSNPhA+Tgu2igCdau2BWnxlPABFDGp88RR6Ky3HclrwpqtCwMyhTy2iB1M+h1VBGkWZNiz4PaWGOLV8Anu1HSNE3iroNePZuf29LeNkSaNGuJsgl1MZPkDo704AA',
  },
  {
    src: '/about/puppy-play.webp',
    alt: 'French Bulldog puppies playing at an Alabama breeder nursery',
    blurDataURL:
      'data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAADQAQCdASoQABAAA4BaJbACdAEJSxFcAADxvgTzzlkcQWpE53W3MW+Dbu2llKOhAnaPyatgke1phORJ3cc9SQ7+AIZpwRgL7idApv1X+nE1yTJ8/oSkJ99sQL4jvAAA',
  },
  {
    src: '/about/nursery.webp',
    alt: 'English Bulldog kennel nursery in Montgomery Alabama',
    blurDataURL:
      'data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAAAQAgCdASoQABAAA4BaJQBOgCHfNUNt3b+AAP7niTyaxqqP7GlhJWrQ3MAcRzDQH2dJnjFMuREZprYzLmDcHzD/i2adQ3zcXGW80ZoIRTOEiii9ZqjZ3/RAAAA=',
  },
];

const highlights = [
  {
    icon: ShieldCheck,
    title: 'Health-first philosophy',
    text: 'Parents are DNA-tested and OFA-screened so every pairing reduces hereditary risks while building sound temperaments.',
  },
  {
    icon: Baby,
    title: 'Enrichment-driven raising',
    text: 'Early Neurological Stimulation, gentle kid exposure, sound desensitization, and crate conditioning come standard.',
  },
  {
    icon: Heart,
    title: 'Lifetime breeder support',
    text: 'We stay in touch long after pickup with nutrition plans, training tips, and quick answers—whenever you need us.',
  },
];

const storyParagraphs = [
  'We are a small family breeder in Alabama, and our story starts in the 1980s when a little French Bulldog named Roman stole our hearts. What began as a personal passion quickly grew into a program grounded in ethics, health, and lifelong devotion to the breed.',
  'Decades of showing dogs, learning from mentors, and refining our craft taught us that bulldogs thrive when science meets compassion. Parents are carefully matched, and every puppy is raised in-home with structure, play, and gentle socialization so they transition confidently into their forever families.',
  'Each bulldog leaves with a veterinary exam, vaccination record, and a promise: we will always be a call away for nutrition, training, or a quick photo update. Bulldogs are our family, and helping them bring joy to yours is our greatest reward.',
];

const stats = [
  { label: 'Years with bulldogs', value: '35+' },
  { label: 'Healthy placements', value: '400+' },
  { label: 'Lifetime support', value: '100%' },
];

const milestones = [
  {
    year: '1980s',
    title: 'Roman joins the family',
    description:
      'Our first French Bulldog, Roman, arrived in Ukraine and sparked a lifelong passion for the breed.',
  },
  {
    year: '2000s',
    title: 'Show ring experience',
    description:
      'Weekends on the road deepened our network with top breeders and veterinarians across the Southeast.',
  },
  {
    year: '2020s',
    title: 'Alabama family kennel',
    description:
      'Montgomery became home to Exotic Bulldog Legacy—pairing science-backed breeding with warm Southern hospitality.',
  },
];

export default function AboutPage() {
  return (
    <main id="main-content" className="bg-bg">
      <JsonLd data={getOrganizationSchema()} />
      <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-10 xl:px-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
          ]}
        />

        {/* Hero */}
        <section className="mt-8 grid gap-6 md:grid-cols-12 items-start md:items-center">
          <div className="space-y-6 md:col-span-12 lg:col-span-6">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent-aux">
              Our story
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-text md:text-4xl">
              A boutique breeding program built on trust, transparency, and care
            </h1>
            <div className="space-y-4 text-sm text-muted md:text-base">
              {storyParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <blockquote className="flex items-start gap-3 rounded-3xl border border-border bg-card/60 p-6 text-base text-muted shadow-sm md:text-lg">
              <Quote className="mt-1 h-6 w-6 text-accent" aria-hidden="true" />
              <span className="font-medium text-text">
                &ldquo;Every puppy deserves a healthy start and a loving home.&rdquo;
              </span>
            </blockquote>
            <div className="flex flex-wrap items-center gap-6">
              <AnalyticsCtaLink
                href="/puppies"
                prefetch={false}
                className="inline-flex items-center rounded-2xl bg-accent-gradient px-6 py-3 text-sm font-semibold text-text shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                Meet Our Puppies →
              </AnalyticsCtaLink>
              <dl className="grid grid-cols-3 gap-4 text-left text-sm text-muted">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-medium text-text">{stat.value}</dt>
                    <dd>{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="md:col-span-12 lg:col-span-6">
            <GalleryCarousel className="mx-auto w-full" images={galleryImages} />
          </div>
        </section>

        {/* Highlights */}
        <section className="mt-16">
          <h2 className="sr-only">Program foundations</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <HighlightCard key={item.title} {...item} />
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-text">My journey with bulldogs</h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {milestones.map((milestone) => (
              <li key={milestone.year} className="space-y-2">
                <span className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-aux">
                  {milestone.year}
                </span>
                <h3 className="text-lg font-semibold text-text">{milestone.title}</h3>
                <p className="text-sm text-muted">{milestone.description}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Media + Copy */}
        <section className="mt-16 grid gap-6 md:grid-cols-12">
          <figure className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm aspect-[2/3] md:col-span-12 lg:col-span-6">
            <Image
              src="/about/nursery.webp"
              alt="French Bulldog nursery space prepared for litters in Alabama"
              width={900}
              height={1350}
              placeholder="blur"
              blurDataURL={NURSERY_BLUR}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
          </figure>
          <div className="flex flex-col gap-6 md:col-span-12 lg:col-span-6">
            <div className="rounded-3xl border border-border bg-card p-6 flex-1">
              <h3 className="text-lg font-semibold text-text mb-2">
                Where puppies grow &amp; thrive
              </h3>
              <p className="text-sm text-muted">
                Puppies are raised in dedicated nursery and play spaces with HEPA filtration, daily
                sanitation, and climate control tuned for brachycephalic comfort.
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-6 flex-1">
              <h3 className="text-lg font-semibold text-text mb-2">Supervised outdoor play</h3>
              <p className="text-sm text-muted">
                Supervised outdoor play builds confidence while early leash work prepares them for
                real-world routines.
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-6 flex-1">
              <h3 className="text-lg font-semibold text-text mb-2">Round-the-clock care</h3>
              <p className="text-sm text-muted">
                24/7 monitoring and support ensuring every puppy receives individual attention and
                care tailored to their needs.
              </p>
            </div>
          </div>
        </section>

        {/* Facility & Veterinary */}
        <section className="mt-16 grid gap-6 md:grid-cols-12">
          <div className="flex flex-col gap-6 md:col-span-12 lg:col-span-6 lg:order-1">
            <div className="rounded-3xl border border-border bg-card p-6 flex-1">
              <div className="flex items-center gap-2 text-text mb-2">
                <Home className="h-5 w-5" aria-hidden="true" />
                <h3 className="text-lg font-semibold">Our facility</h3>
              </div>
              <p className="text-sm text-muted">
                In-home nursery, play yards, and whelping suites with round-the-clock supervision,
                plus tailored enrichment for every developmental milestone.
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-6 flex-1">
              <div className="flex items-center gap-2 text-text mb-2">
                <Stethoscope className="h-5 w-5" aria-hidden="true" />
                <h3 className="text-lg font-semibold">Veterinary partners</h3>
              </div>
              <p className="text-sm text-muted">
                Board-certified reproductive veterinarians in Montgomery and Birmingham manage
                progesterone timing, C-sections when needed, and newborn wellness exams.
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-6 flex-1">
              <div className="flex items-center gap-2 text-text mb-2">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                <h3 className="text-lg font-semibold">Health protocols</h3>
              </div>
              <p className="text-sm text-muted">
                Comprehensive health screening and vaccination protocols ensure every puppy meets
                the highest standards before joining their new family.
              </p>
            </div>
          </div>
          <figure className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm aspect-[2/3] md:col-span-12 lg:col-span-6 lg:order-2">
            <Image
              src="/about/vet-check.webp"
              alt="English Bulldog veterinary health check at Montgomery Alabama kennel"
              width={900}
              height={1350}
              placeholder="blur"
              blurDataURL={VET_BLUR}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
          </figure>
        </section>

        {/* CTA */}
        <section className="mt-16">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-text">
              Schedule a visit or a live video walkthrough
            </h2>
            <p className="mt-3 text-sm text-muted md:text-base">
              We welcome families by appointment in Montgomery, AL and host virtual meet-and-greets
              for out-of-state adopters. Reach out—we are happy to introduce you to the puppies.
            </p>
            <AnalyticsCtaLink
              href="/puppies"
              prefetch={false}
              className="mt-6 inline-flex items-center rounded-2xl border border-transparent bg-accent-gradient px-6 py-3 text-sm font-semibold text-text shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              See available puppies
            </AnalyticsCtaLink>
          </div>
        </section>
      </div>
    </main>
  );
}

type HighlightCardProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  text: string;
};

function HighlightCard({ icon: Icon, title, text }: HighlightCardProps) {
  return (
    <article className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-transform duration-300 hover:scale-[1.03]">
      <div className="flex items-center gap-2 text-text">
        <Icon className="h-5 w-5" aria-hidden="true" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <p className="mt-3 text-sm text-muted">{text}</p>
    </article>
  );
}
