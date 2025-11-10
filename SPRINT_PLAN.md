# 🐾 Exotic Bulldog Legacy — Sprint Plan (Next.js + Supabase + Crisp + Stripe/PayPal)

> 1-week sprints · Team size: 1–2 devs  
> Focus: MVP landing with catalog, chat, and deposit flow

---

## Sprint 0 – Kickoff & Infrastructure (1 week)

**Goals:**  
Initialize project, CI/CD, Supabase, and integrations.

### Tasks
- [ ] Create GitHub repo + Vercel project (Hobby tier)  
- [ ] Add `.env.example` (placeholders for all keys: Supabase, Stripe, PayPal, Crisp, GA4, Pixel)
- [ ] Setup CI (GitHub Actions): typecheck, lint, build
- [ ] Create Supabase project, apply SQL schema, enable RLS  
- [ ] Create Storage buckets (`puppies`, `parents`, `litters`)  
- [ ] Define public vs signed policies + EXIF-clean rule for images  
- [ ] Connect Crisp widget (free tier, Website ID)  
- [ ] Connect GA4 + Meta Pixel (empty events for now)  
- [ ] Create base Next.js app (App Router, Tailwind v4, shadcn/ui, TS strict)
- [ ] Add basic CSP + security headers (Referrer-Policy, X-Frame-Options, etc.)
- [ ] Temporary `robots.txt` → `Disallow: /` until release

### Deliverables / DoD
✅ Deployed dev preview on `*.vercel.app`  
✅ Supabase tables + Storage buckets live  
✅ Crisp widget visible  
✅ GA4 tracks `page_view`  
✅ CI green (build + lint)

---

## Sprint 1 – UI Layout & Puppies Catalog (1 week)

**Goals:**  
Base UI, routing, catalog pages, Supabase integration.

### Tasks
- [x] Pages: `/`, `/puppies`, `/puppies/[slug]`, `/about`, `/policies`, `/contact`
- [x] Components: `Hero`, `PuppyCard`, `PuppyGallery`, `ContactBar` (sticky)
- [x] Integrate Supabase (SSR/ISR): read `puppies`, `parents`, `litters`
- [x] Add demo seed (8–12 puppies) + CRUD via Supabase Studio
- [x] Responsive design + basic brand theme (warm natural tones)
- [x] Define cache strategy (ISR vs dynamic) in README
- [x] Add loading/empty/error states to lists and details

### DoD
✅ Catalog grid + filters (breed/status)  
✅ Puppy detail page with gallery  
✅ Lighthouse ≥ 90 (Perf/SEO) on Home  
✅ Demo content loaded from Supabase

---

## Sprint 2 – Contacts, Chat, Analytics (1 week)

**Goals:**  
Lead capture + conversion tracking.

### Tasks
- [x] Deep links: `tel:`, `sms:`, `wa.me`, `t.me`, `ig.me`, `mailto:`  
- [x] Crisp setup: welcome message, offline redirect (“If offline → WhatsApp”)  
- [x] Add GA4 events: `contact_click(channel, puppy_slug)`, `form_submit`, `form_success`
- [x] Add Meta Pixel + Advanced Matching (email/phone only with consent)
- [x] Implement Consent Mode v2 (`ad_user_data`, `ad_personalization`)  
- [x] Add contact form (`Server Action → inquiries`)  
- [x] Add hCaptcha and minimal rate limit to prevent spam

### DoD
✅ Click events visible in GA4  
✅ Crisp chat functional (online/offline)  
✅ Contact form writes to `inquiries`  
✅ hCaptcha passes + rate limit working  
✅ Consent Mode banner controls GA/Pixel

---

## Sprint 3 – Deposit Payment Flow ($300) (1 week)

**Goals:**  
Process deposits via Stripe + PayPal, mark puppies reserved.

### Tasks
- [x] Stripe Checkout Session (server action) on puppy pages  
- [x] PayPal Smart Buttons (`actions.order.capture`) as alternative  
- [x] Webhooks:
  - `/api/stripe/webhook` — handle `checkout.session.completed`, async success/fail, expired
  - `/api/paypal/webhook` — verify signature before fulfillment
  - `/api/paypal/capture` — server-side capture + reservation
- [x] Idempotency: unique keys (`stripe_payment_intent`, `paypal_capture_id`)
- [x] Log webhook payloads + results (for debugging + retry visibility)
- [ ] Add Slack/email alert for webhook 5xx _(moved to Phase 6 monitoring)_
- [x] Prevent double-reserve (status check before redirect)
- [ ] GA4 event: `deposit_paid` (value=300, label=puppy_slug, provider) _(planned for Phase 5 analytics)_

### DoD
✅ Test payments update reservation + puppy.status=`reserved`  
✅ Webhooks logged + idempotent  
✅ Retry works without duplication  
⚠️ GA4 `deposit_paid` event pending (tracked in Sprint 3 Phase 5)

---

## Branding & Theme Reference

- **Design Tokens:**  
  `--bg #F9FAFB`, `--bg-card #FFFFFF`, `--text #111111`, `--text-muted #555555`, `--accent #FFB84D`, `--accent-2-start #FF4D79`, `--accent-2-end #FF7FA5`, `--accent-aux #0D1A44`, `--footer-bg #E5E7EB` (light) and `--bg #0D1A44`, `--bg-card #1C1C1C`, `--text #FFFFFF`, `--text-muted #D1D5DB`, `--accent #FFB84D`, `--accent-2-start #FF4D79`, `--accent-2-end #FF7FA5`, `--accent-aux #FFD166`, `--footer-bg #0A0F24` (dark). Shared tokens: `--border`, `--hover`, `--btn-bg`, `--btn-text`, `--link`.
- **CSS Implementation:** Variables declared in `:root` (light) and `[data-theme="dark"]`; Tailwind maps utilities like `bg-bg`, `bg-card`, `text-text`, `text-muted`, and `bg-accent-gradient`.
- **Theme Provider:** `components/theme-provider.tsx` synchronises `data-theme` on `document.documentElement`, persists preference (`light`, `dark`, `system`), and exposes `useTheme()`.
- **Usage Guidance:** Prefer `bg-[color:var(--btn-bg)]` / `text-[color:var(--btn-text)]` for primary CTAs and `.bg-accent-gradient` for hero CTAs. Extend tokens centrally before introducing new palette values.
- **Accessibility Targets:** Maintain WCAG AA contrast on light/dark surfaces; verify hero, buttons, cards, badges, and alerts after palette updates.

---

## Sprint 4 – SEO, Trust & Local Presence (1 week)

**Goals:**  
Organic visibility, policies, credibility.

### Tasks
- [ ] JSON-LD markup:  
  - `Organization`, `LocalBusiness/PetStore` (city AL, phone +1)  
  - `Product` (puppies)  
  - `FAQPage`
- [ ] NAP block (name, address, phone) in footer  
- [ ] Google Maps embed (city + service area)  
- [ ] Pages: `Policies`, `FAQ`, `Reviews`
- [ ] FAQ copy finalized with owner review (draft content in place; adjust before release)
- [ ] Policies: deposits, refunds, health, delivery  
- [ ] Reviews: 4–6 testimonials (text + photo/video)  
- [ ] Accessibility: alt texts, focus visible, contrast ≥ 4.5:1  
- [ ] Image optimization: WebP/AVIF ≤ 400 KB, width 1600–1920px  
- [ ] Store long videos externally (YouTube unlisted / Vimeo)

### DoD
✅ Rich Results Test passes (Organization, LocalBusiness, Product, FAQ)  
✅ Content published (Policies, FAQ, Reviews)  
✅ SEO score ≥ 90 (Lighthouse)  
✅ Accessible UI verified

---

## Sprint 5 – QA, Security & Release (0.5–1 week)

**Goals:**  
Finalize performance, reliability, and compliance.

### Tasks
- [ ] Playwright tests: view puppy → chat → reserve → webhook flow  
- [ ] Optimize LCP (≤ 2.5 s mobile) and CLS (≤ 0.1)  
- [ ] Add branded 404/500 pages  
- [ ] Enable Supabase backups + restore guide  
- [ ] Privacy/Cookie banner + Consent Mode sync  
- [ ] Configure DNS + HTTPS for custom domain  
- [ ] Add minimal admin ops (SQL scripts for bulk updates/imports)  
  - [ ] `/admin` console for puppies management  
    - [x] P1 Auth foundations (env vars, login form, session cookie, middleware)  
    - [x] P2 Data layer (service-role helper, Zod schemas, slug utilities, queries)  
    - [x] P3 UI table (responsive list, inline controls placeholders)  
    - [x] P4 Mutations (Server Actions for status/price/create/delete + toasts)  
    - [x] P5 QA (Playwright admin smoke tests, docs updates)  
- [ ] Email notifications (Resend/Postmark):
  - to owner: new inquiry / deposit paid  
  - to buyer: confirmation + contact info

### DoD
✅ All e2e tests green  
✅ No console errors / 5xx in logs  
✅ Backups verified  
✅ Emails delivered successfully  
✅ Prod build ready on custom domain

---

## Roles & Responsibilities

| Role | Responsibilities |
|------|------------------|
| **Owner** | Provides media (photos, videos, copy), confirms policies/FAQ/prices, holds Supabase & Crisp access |
| **Developer** | Implements code, integrations, webhooks, analytics, tests, deployments |
| **Designer** | Tailwind/shadcn UI, brand consistency, responsive layout |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-------------|
| Heavy media slows site | Host long videos on YouTube/Vimeo, compress photos ≤ 400 KB |
| Webhook retries / duplicates | Use idempotency + logging |
| Spam via contact forms | hCaptcha + server-side validation |
| Missing backups | Schedule Supabase backups, document restore |
| Consent compliance (EU ads) | Implement Consent Mode v2 defaults deny |

---

**Expected Total Duration:** ~5.5–6 weeks (MVP ready for production)  
**Stack:** Next.js 15 · Tailwind v4 · Supabase · Stripe/PayPal · Crisp · GA4 · Meta Pixel

---

_© 2025 Exotic Bulldog Legacy — MVP Sprint Plan_
