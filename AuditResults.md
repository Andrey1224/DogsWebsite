# Code Pointers (home/SEO audit)

## 1) Hero H1 (LCP element)

- File: `app/page.tsx`
- JSX fragment (HeroSection):

```tsx
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
    Reserve your puppy with a secure $300 deposit, then choose appointment pickup in Falkville or
    vetted courier delivery. Health-first pedigrees and transparent updates at every step.
  </p>
</div>
```

## 2) Crisp chat hookup

- File: `app/layout.tsx` (Crisp entry point import/use):

```tsx
import { CrispChat } from '@/components/crisp-chat';
…
<CrispChat />
```

- File: `components/crisp-chat.tsx` (script injection and event wiring):

```tsx
const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
…
function injectScript(): HTMLScriptElement {
  const script = document.createElement('script');
  script.src = 'https://client.crisp.chat/l.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
  return script;
}
…
pushCommand('on', 'session:loaded', sessionHandler);
pushCommand('on', 'website:availability:changed', availabilityHandler);
pushCommand('on', 'chat:opened', chatOpenedHandler);
```

- Env: `.env.local` contains `NEXT_PUBLIC_CRISP_WEBSITE_ID=e7188e7a-3317-4bdc-abe7-1b242b3d9150`.

## 3) Hero image (main home image)

- File: `app/page.tsx` (HeroSection):

```tsx
import Image from 'next/image';
…
<Image
  src="/hero/french-bulldog-hero.webp"
  alt="Premium French Bulldog from Exotic Bulldog Legacy"
  fill
  priority
  placeholder="blur"
  blurDataURL={HERO_BLUR_DATA_URL}
  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 36rem"
  className="object-cover"
/>
```

## 4) Browserslist / JS targets

- No `browserslist` field in `package.json`.
- No `.browserslistrc` file in the project root (only dependency copies under `node_modules/`).

## 5) Global styles & Tailwind config

- Style files found: `app/globals.css` (no additional custom CSS files under `styles/`).
- `app/globals.css` (full content):

```css
@import 'tailwindcss';

:root {
  color-scheme: light;
  --bg: #e1e8ff;
  --bg-card: #ffefcb;
  --text: #464792;
  --text-muted: #555555;
  --accent: #cd98dc;
  --accent-2-start: #ff4d79;
  --accent-2-end: #ff7fa5;
  --accent-aux: #0d1a44;
  --footer-bg: #e5e7eb;
  --border: rgba(0, 0, 0, 0.08);
  --hover: rgba(0, 0, 0, 0.04);
  --btn-bg: var(--accent);
  --btn-text: #111111;
  --link: var(--accent-aux);
}

:root[data-theme='dark'] {
  color-scheme: dark;
  --bg: #0d1a44;
  --bg-card: #5c687a;
  --text: #ffffff;
  --text-muted: #eee5d7;
  --accent: #ffb84d;
  --accent-2-start: #ff4d79;
  --accent-2-end: #ff7fa5;
  --accent-aux: #ffd166;
  --footer-bg: #0a0f24;
  --border: rgba(255, 255, 255, 0.12);
  --hover: rgba(255, 255, 255, 0.06);
  --btn-bg: var(--accent);
  --btn-text: #0d1a44;
  --link: var(--accent);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    color-scheme: dark;
    --bg: #0d1a44;
    --bg-card: #5c687a;
    --text: #ffffff;
    --text-muted: #d1d5db;
    --accent: #ffb84d;
    --accent-2-start: #ff4d79;
    --accent-2-end: #ff7fa5;
    --accent-aux: #ffd166;
    --footer-bg: #0a0f24;
    --border: rgba(255, 255, 255, 0.12);
    --hover: rgba(255, 255, 255, 0.06);
    --btn-bg: var(--accent);
    --btn-text: #0d1a44;
    --link: var(--accent);
  }
}

@theme inline {
  --color-bg: var(--bg);
  --color-card: var(--bg-card);
  --color-text: var(--text);
  --color-muted: var(--text-muted);
  --color-accent: var(--accent);
  --color-accent-aux: var(--accent-aux);
  --color-footer: var(--footer-bg);
  --color-border: var(--border);
  --color-link: var(--link);
  --color-btn: var(--btn-bg);
  --color-btn-text: var(--btn-text);
  --color-hover: var(--hover);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background-color: var(--bg);
  color: var(--text);
  font-family:
    var(--font-geist-sans),
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
  transition:
    color 0.2s ease,
    opacity 0.2s ease;
}

a:not([class]) {
  color: var(--link);
}

a:hover {
  opacity: 0.9;
}

:focus-visible {
  outline: 2px solid var(--accent-aux);
  outline-offset: 2px;
}

.skip-link {
  position: absolute;
  left: -999px;
  top: 1rem;
  z-index: 100;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background-color: var(--btn-bg);
  color: var(--btn-text);
  font-weight: 600;
  transition: transform 0.2s ease;
}

.skip-link:focus {
  left: 1rem;
  transform: translateY(0);
}

* {
  box-sizing: border-box;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(2rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@layer utilities {
  .bg-accent-gradient {
    background-image: linear-gradient(90deg, var(--accent-2-start), var(--accent-2-end));
  }

  .animate-slideUp {
    animation: slideUp 0.5s ease-out forwards;
  }

  /* Hide scrollbar for mobile reviews carousel */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Intro animations */
  @keyframes slowPan {
    from {
      transform: scale(1.05) translateX(0);
    }
    to {
      transform: scale(1.05) translateX(-8px);
    }
  }

  .animate-slowPan {
    animation: slowPan 12s ease-in-out infinite alternate;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeInUp {
    animation: fadeInUp 0.8s ease-out;
  }

  @keyframes pulseSlow {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 0 60px -15px rgba(249, 115, 22, 0.6);
    }
    50% {
      transform: scale(1.03);
      box-shadow: 0 0 75px -10px rgba(249, 115, 22, 0.8);
    }
  }

  .animate-pulse-slow {
    animation: pulseSlow 3s ease-in-out infinite;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slowPanV2 {
    0% {
      transform: scale(1.05);
    }
    50% {
      transform: scale(1.15);
    }
    100% {
      transform: scale(1.05);
    }
  }

  .animate-slowPanV2 {
    animation: slowPanV2 20s ease-in-out infinite;
  }

  @keyframes floatV2 {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .animate-floatV2 {
    animation: floatV2 6s ease-in-out infinite;
  }

  @keyframes randomReveal {
    0%,
    100% {
      opacity: 0;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  .animate-randomReveal1 {
    animation: randomReveal 6s ease-in-out infinite;
  }

  .animate-randomReveal2 {
    animation: randomReveal 7.5s ease-in-out infinite;
  }
}
```

- Tailwind config: no `tailwind.config.*` present (project uses Tailwind v4 default config).

## 6) Imports on home/layout

- `app/layout.tsx` imports:

```tsx
import { Geist, Geist_Mono } from 'next/font/google';
import { AnalyticsProvider } from '@/components/analytics-provider';
import { ContactBar } from '@/components/contact-bar';
import { ConsentBanner } from '@/components/consent-banner';
import { CrispChat } from '@/components/crisp-chat';
import { JsonLd } from '@/components/json-ld';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { ThemeProvider } from '@/components/theme-provider';
import {
  validateDevelopmentEnvironment,
  validateProductionEnvironment,
} from '@/lib/env-validation';
import { getDefaultMetadata } from '@/lib/seo/metadata';
import { getLocalBusinessSchema, getOrganizationSchema } from '@/lib/seo/structured-data';
import './globals.css';
```

- `app/page.tsx` imports:

```tsx
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
  CreditCard,
  MapPin,
} from 'lucide-react';

import { FaqAccordion } from '@/components/home/faq-accordion';
import { FeaturedReviewsCarousel } from '@/components/home/featured-reviews';
import { IntroShell } from '@/components/intro-shell';
import { buildMetadata } from '@/lib/seo/metadata';
import { getFeaturedReviews } from '@/lib/reviews/queries';
import type { Review } from '@/lib/reviews/types';
```

- Component import block example (header): `components/site-header.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, PawPrint, ChevronRight } from 'lucide-react';
```

## 7) Scripts & external resources

- `app/layout.tsx` head links (preconnect/prefetch):

```tsx
{
  supabaseHostname && (
    <>
      <link rel="dns-prefetch" href={`https://${supabaseHostname}`} />
      <link rel="preconnect" href={`https://${supabaseHostname}`} crossOrigin="anonymous" />
    </>
  );
}
```

- `app/layout.tsx` inline theme boot script in `<body>`:

```tsx
<script dangerouslySetInnerHTML={{ __html: themeScript }} />
```

- `app/page.tsx` hero preload:

```tsx
<link rel="preload" as="image" href="/hero/french-bulldog-hero.webp" type="image/webp" />
```

- No `<Script>` (next/script) usage directly inside `app/layout.tsx` or `app/page.tsx`; no custom `_document.tsx` found. External chat script is injected via `components/crisp-chat.tsx` (`https://client.crisp.chat/l.js`).
