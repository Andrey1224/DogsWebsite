'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Heart, Quote } from 'lucide-react';

type Breed = 'french' | 'english';

const breedContent = {
  french: {
    emoji: '🇫🇷',
    title: 'French Bulldog',
    subtitle: 'The Square Flask of Joy and Sass',
    heroImage: '/breeds/french-bulldog-hero.webp',
    heroAlt: 'French Bulldog - Compact companion with bat ears and charming personality',
    intro:
      'A French Bulldog is not just a dog. It is a certified style icon with a perpetually serious, yet incredibly endearing, facial expression. When you bring a Frenchie into your life, you are not just acquiring a pet; you are investing in a 24/7 source of positive energy that fits perfectly on your lap.',
    secret: {
      title: 'What is their secret?',
      text: 'Absolute self-confidence. The Frenchie operates on the principle: "I am adorable, and you know it. Now, please bring me a treat."',
    },
    qualities: {
      title: 'They possess two key positive qualities:',
      items: [
        {
          title: 'The Master of the Comedic Glare',
          description:
            'Their big, dark eyes and frowning brows can melt your heart in a second. They can ask for cheese without uttering a sound, using only their facial expressions. And this expression always leads to a positive outcome for them!',
        },
        {
          title: 'Compact Comfort Energy',
          description:
            "They are the ideal companion for cozy evenings. They are always ready to be close - in your bed, on your favourite blanket, or, even better, right on your head if you're lying awkwardly. They are like a living, warm, slightly snorting anti-stress ball.",
        },
      ],
    },
    conclusion: {
      highlight: 'The French Bulldog is absolute, positive happiness in a square flask.',
      text: "This is your personal, perpetually pleased, slightly stubborn friend with satellite ears who fills your every day with cheerful, low-key presence and boundless love. They are the world's best experts on the dolce vita lifestyle.",
    },
  },
  english: {
    emoji: '🇬🇧',
    title: 'English Bulldog',
    subtitle: 'Your Personal, Wrinkly Cloud of Happiness',
    heroImage: '/breeds/english-bulldog-hero.webp',
    heroAlt: 'English Bulldog - Gentle giant with wrinkly face and devoted personality',
    intro:
      'The English Bulldog is a majestic creature whose rough, gladiator-like appearance conceals the soul of a gentle, devoted teddy bear. Bring one home, and you will understand what absolute cuteness is, wrapped up in folds and accompanied by a sound like a quiet, contented rumble.',
    secret: {
      title: '🥰 An Incredibly Sweet Being',
      text: "A Bulldog's cuteness is not aggressive; it is fundamental. Those round, sorrowful eyes, always looking at you with endless love, will make you forget all your problems. Their clumsy, waddling gait and attempts to jump onto the couch - more like a strongman's lift - are a daily, free comedy sketch. The wrinkles on their forehead? They are just a natural built-in mood indicator: they deepen when he asks for a treat and smooth out when he is sleeping, which is his favourite pastime.",
    },
    qualities: {
      title: '🤝 A Wonderful Companion',
      description:
        "The Bulldog is the king of low-effort, but deep, companionship. He won't demand marathons, but he will demand your sofa. He is the perfect partner for:",
      items: [
        {
          title: 'Movie Nights',
          description: 'His contented sighing nearby creates the perfect cozy atmosphere.',
        },
        {
          title: 'Reading Books',
          description: 'He will serve as a heavy, warm, stabilizing anchor on your lap.',
        },
        {
          title: 'Quiet Walks',
          description: "He doesn't need speed; he just needs the fact of your presence.",
        },
      ],
      conclusion:
        'He is loyal to the end and considers you the most important person in the universe.',
    },
    conclusion: {
      title: '✨ Joy and Happiness You Can Handle',
      highlight: 'The Bulldog brings as much joy and happiness into your home as you can bear.',
      text: 'This happiness is not in a whirlwind of crazy games, but in a calm, profound sense of contentment. He will teach you to appreciate silence (between snores), enjoy simple things (like a soft rug), and love without reservation.',
      footer:
        'The English Bulldog is a marvellous, sweet creature that brings a steady stream of positivity into your life. He is your personal, wrinkly friend who will serve as your pillow, space heater, and therapist.',
    },
  },
};

export function BreedSelector() {
  const [activeBreed, setActiveBreed] = useState<Breed>('french');
  const content = breedContent[activeBreed];

  return (
    <div className="space-y-12">
      {/* Breed Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveBreed('french')}
            className={`rounded-full px-6 py-3 text-sm font-semibold transition-all ${
              activeBreed === 'french'
                ? 'bg-accent-gradient text-text shadow-md'
                : 'text-muted hover:text-text'
            }`}
          >
            🇫🇷 French Bulldog
          </button>
          <button
            type="button"
            onClick={() => setActiveBreed('english')}
            className={`rounded-full px-6 py-3 text-sm font-semibold transition-all ${
              activeBreed === 'english'
                ? 'bg-accent-gradient text-text shadow-md'
                : 'text-muted hover:text-text'
            }`}
          >
            🇬🇧 English Bulldog
          </button>
        </div>
      </div>

      {/* Breed Content */}
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="grid gap-8 md:grid-cols-12 items-center">
          {/* Image */}
          <div className="md:col-span-12 lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/10 to-accent-aux/10 p-8 text-center">
                <div className="space-y-4">
                  <div className="text-8xl">{content.emoji}</div>
                  <p className="text-sm text-muted">
                    Add your breed photo here:
                    <br />
                    <code className="text-xs">{content.heroImage}</code>
                  </p>
                </div>
              </div>
              {/* Uncomment when images are ready:
              <Image
                src={content.heroImage}
                alt={content.heroAlt}
                fill
                className="object-cover object-center"
                sizes="(min-width: 1024px) 40vw, 100vw"
                priority
              />
              */}
            </div>
          </div>

          {/* Title & Intro */}
          <div className="space-y-6 md:col-span-12 lg:col-span-7">
            <div>
              <h2 className="font-serif text-4xl font-bold tracking-tight text-text md:text-5xl lg:text-6xl">
                {content.title}
              </h2>
              <p className="mt-2 font-serif text-xl text-accent-aux md:text-2xl">
                {content.subtitle}
              </p>
            </div>
            <p className="text-base text-muted md:text-lg leading-relaxed">{content.intro}</p>
          </div>
        </section>

        {/* Secret Section */}
        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-text md:text-2xl">{content.secret.title}</h3>
          <blockquote className="mt-4 flex items-start gap-4 rounded-2xl bg-accent-gradient/10 p-6">
            <Quote className="mt-1 h-6 w-6 flex-shrink-0 text-accent" aria-hidden="true" />
            <p className="text-lg font-medium text-text md:text-xl italic">{content.secret.text}</p>
          </blockquote>
        </section>

        {/* Qualities Section */}
        <section className="space-y-6">
          <h3 className="text-2xl font-semibold text-text md:text-3xl">
            {content.qualities.title}
          </h3>
          {'description' in content.qualities && (
            <p className="text-base text-muted md:text-lg">{content.qualities.description}</p>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {content.qualities.items.map((quality, index) => (
              <article
                key={index}
                className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-transform duration-300 hover:scale-[1.02]"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
                    <Check className="h-5 w-5 text-accent" aria-hidden="true" />
                  </div>
                  <h4 className="text-lg font-semibold text-text">{quality.title}</h4>
                </div>
                <p className="text-sm text-muted md:text-base">{quality.description}</p>
              </article>
            ))}
          </div>

          {'conclusion' in content.qualities && (
            <blockquote className="mt-6 flex items-start gap-4 rounded-2xl border border-accent/30 bg-card p-6">
              <Heart className="mt-1 h-6 w-6 flex-shrink-0 text-accent" aria-hidden="true" />
              <p className="text-base font-medium text-text md:text-lg italic">
                {content.qualities.conclusion}
              </p>
            </blockquote>
          )}
        </section>

        {/* Conclusion Section */}
        <section className="rounded-3xl border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-accent-aux/5 p-8 shadow-lg">
          {'title' in content.conclusion && (
            <h3 className="mb-4 text-2xl font-semibold text-text md:text-3xl">
              {content.conclusion.title}
            </h3>
          )}
          <blockquote className="mb-6 rounded-2xl bg-card/80 p-6 text-center">
            <Quote className="mx-auto mb-4 h-8 w-8 text-accent" aria-hidden="true" />
            <p className="font-serif text-xl font-bold text-text md:text-2xl lg:text-3xl">
              {content.conclusion.highlight}
            </p>
          </blockquote>
          <p className="text-base text-muted md:text-lg leading-relaxed">
            {content.conclusion.text}
          </p>
          {'footer' in content.conclusion && (
            <p className="mt-4 text-base font-medium text-text md:text-lg">
              {content.conclusion.footer}
            </p>
          )}
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h3 className="text-2xl font-semibold text-text md:text-3xl">
              Ready to Meet Your Perfect Match?
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted md:text-lg">
              Browse our available puppies and find the {content.title.toLowerCase()} that will
              bring joy, laughter, and endless love into your home.
            </p>
            <Link
              href="/puppies"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-accent-gradient px-8 py-4 text-base font-semibold text-text shadow-lg transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              See Available Puppies →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
