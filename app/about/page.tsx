import { Baby, Heart, Quote, ShieldCheck } from 'lucide-react';
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
    "Discover Exotic Bulldog Legacy's family-run French and English Bulldog breeding program in Alabama and the journey that inspired it.",
  path: '/about',
});

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

        {/* French Bulldog */}
        <section className="mt-16 space-y-6 rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="font-serif text-3xl font-bold text-text">
            French Bulldog: The Square Flask of Joy and Sass
          </h2>
          <div className="space-y-4 text-sm text-muted md:text-base">
            <p>
              A French Bulldog is not just a dog. It is a certified style icon with a perpetually
              serious, yet incredibly endearing, facial expression. When you bring a Frenchie into
              your life, you are not just acquiring a pet; you are investing in a 24/7 source of
              positive energy that fits perfectly on your lap.
            </p>
            <p>
              What is their secret? Absolute self-confidence. The Frenchie operates on the
              principle: &ldquo;I am adorable, and you know it. Now, please bring me a treat.&rdquo;
            </p>
            <p className="font-medium text-text">They possess two key positive qualities:</p>
            <p>
              <strong className="text-text">The Master of the Comedic Glare:</strong> Their big,
              dark eyes and frowning brows can melt your heart in a second. They can ask for cheese
              without uttering a sound, using only their facial expressions. And this expression
              always leads to a positive outcome for them!
            </p>
            <p>
              <strong className="text-text">Compact Comfort Energy:</strong> They are the ideal
              companion for cozy evenings. They are always ready to be close—in your bed, on your
              favourite blanket, or, even better, right on your head if you&rsquo;re lying
              awkwardly. They are like a living, warm, slightly snorting anti-stress ball.
            </p>
            <p className="font-medium text-text">
              The Bottom Line: The French Bulldog is absolute, positive happiness in a square flask.
              This is your personal, perpetually pleased, slightly stubborn friend with satellite
              ears who fills your every day with cheerful, low-key presence and boundless love. They
              are the world&rsquo;s best experts on the dolce vita lifestyle.
            </p>
          </div>
        </section>

        {/* English Bulldog */}
        <section className="mt-16 space-y-6 rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="font-serif text-3xl font-bold text-text">
            🇬🇧 English Bulldog: Your Personal, Wrinkly Cloud of Happiness
          </h2>
          <div className="space-y-4 text-sm text-muted md:text-base">
            <p>
              The English Bulldog is a majestic creature whose rough, gladiator-like appearance
              conceals the soul of a gentle, devoted teddy bear. Bring one home, and you will
              understand what absolute cuteness is, wrapped up in folds and accompanied by a sound
              like a quiet, contented rumble.
            </p>
            <p className="font-medium text-text">🥰 An Incredibly Sweet Being</p>
            <p>
              A Bulldog&rsquo;s cuteness is not aggressive; it is fundamental. Those round,
              sorrowful eyes, always looking at you with endless love, will make you forget all your
              problems. Their clumsy, waddling gait and attempts to jump onto the couch—more like a
              strongman&rsquo;s lift—are a daily, free comedy sketch. The wrinkles on their
              forehead? They are just a natural built-in mood indicator: they deepen when he asks
              for a treat and smooth out when he is sleeping, which is his favourite pastime.
            </p>
            <p className="font-medium text-text">🤝 A Wonderful Companion</p>
            <p>
              The Bulldog is the king of low-effort, but deep, companionship. He won&rsquo;t demand
              marathons, but he will demand your sofa. He is the perfect partner for:
            </p>
            <p>
              <strong className="text-text">Movie Nights:</strong> His contented sighing nearby
              creates the perfect cozy atmosphere.
            </p>
            <p>
              <strong className="text-text">Reading Books:</strong> He will serve as a heavy, warm,
              stabilizing anchor on your lap.
            </p>
            <p>
              <strong className="text-text">Quiet Walks:</strong> He doesn&rsquo;t need speed; he
              just needs the fact of your presence.
            </p>
            <p>
              He is loyal to the end and considers you the most important person in the universe.
            </p>
            <p className="font-medium text-text">✨ Joy and Happiness You Can Handle</p>
            <p>
              The Bulldog brings as much joy and happiness into your home as you can bear. This
              happiness is not in a whirlwind of crazy games, but in a calm, profound sense of
              contentment. He will teach you to appreciate silence (between snores), enjoy simple
              things (like a soft rug), and love without reservation.
            </p>
            <p className="font-medium text-text">
              The Bottom Line: The English Bulldog is a marvellous, sweet creature that brings a
              steady stream of positivity into your life. He is your personal, wrinkly friend who
              will serve as your pillow, space heater, and therapist.
            </p>
          </div>
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
