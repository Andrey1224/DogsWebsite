# Sprint 4 Report — SEO, Trust & Local Presence

**Iteration Window:** 2025-10-13 → 2025-10-14  
**Scope Reference:** `Spec1.md`, `SPRINT_PLAN.md`, `sprint_4_plan_final.md`

---

## Highlights

- Implemented centralized SEO helpers (`lib/seo/metadata.ts`, `lib/seo/structured-data.ts`) and wired Organization/PetStore/Product/FAQPage schemas across key routes.
- Delivered trust content updates: refreshed `/faq`, `/policies`, `/reviews`, NAP footer, and added breadcrumbs + JSON-LD.
- Verified structured data via Google preset (Organization, PetStore, FAQPage, ItemList, Product) for `/`, `/faq`, `/reviews`, `/puppies/[slug]`.
- Strengthened accessibility with global `focus-visible` outline, skip link, and CDN preconnect for faster hero loads.

---

## Testing & Validation

| Type | Result | Notes |
|------|--------|-------|
| `npm run lint` | ✅ | Zero warnings |
| `npm run test` | ✅ | 49 unit tests passing |
| `npm run e2e` | ✅ | 23 Playwright specs passed (local CDN requests to `images.exoticbulldog.dev` return 500 but do not break tests) |
| Lighthouse (Mobile) | Home Perf 0.79 / A11y 0.96 / SEO 1.00; Reviews Perf 0.75 / A11y 0.96 / SEO 1.00 | Scores limited by temporary imagery and Supabase CDN fetch failures (offline in local env); final optimisation scheduled with production assets |
| Rich Results | ✅ for `/`, `/faq`, `/reviews`, `/puppies/duke-english-bulldog` | `structured-data-testing-tool --presets Google` |

Artifacts:  
- `lighthouse-home.json`, `lighthouse-reviews.json` (mobile audits)  
- `FAQPOLICIESREVIEWS.md` (content + rich results log)

---

## Pending for Release

1. Replace remaining placeholder photos (catalog/gallery) with client assets; hero + reviews already converted to WebP ≤400 KB. Re-run optimisation pipeline (WebP/AVIF ≤400 KB, 1600–1920 px).
2. Re-run Lighthouse after final imagery and update this report with new metrics/screenshots.  
3. Confirm Google Business Profile sync + Vercel ENV once production data is in place.  
4. Attach final screenshots (Lighthouse, Rich Results, key pages) before deployment sign-off.

---

_Last updated: 2025-10-14_
