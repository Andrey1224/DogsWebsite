# Reviews MVP — Completion Note

Date: 2025-02-10
Owner: Codex

Summary of the Reviews MVP work captured from `reviews_mvp_spec_final.md` and the prototype in `Reviews_Elemenet.md` before retiring those files.

## What was delivered

- **Data model:** `reviews` table with enums + indexes, storage bucket `reviews`, migration `supabase/migrations/20251222T120000Z_create_reviews_table.sql`; queries in `lib/reviews/queries.ts` and types in `lib/reviews/types.ts`.
- **Public UI:**
  - Homepage carousel (`components/reviews/review-carousel.tsx` + `review-card.tsx`) sourced from `is_published=true AND is_featured=true`.
  - `/reviews` page (`app/reviews/page.tsx`) with aggregate rating JSON-LD, masonry grid, and review submission form.
  - Review form (`components/reviews/review-form.tsx`) with hCaptcha, single-photo upload, and unpublished-by-default inserts.
- **Admin:** CRUD and publish/feature toggles live under `/admin/reviews` (service-role client, session auth). Featured requires published; delete cleans up storage.
- **SEO:** Organization AggregateRating JSON-LD on `/reviews`; badges for source (`manual` vs `facebook_manual`); NAP alignment preserved.
- **Anti-abuse:** hCaptcha on public form; RLS restricts anon SELECT to `is_published=true`.

## Notes

- The earlier React prototype carousel (`Reviews_Elemenet.md`) and the inline spec (`reviews_mvp_spec_final.md`) were superseded by the shipped implementation above and removed from the repo.
- Server-side analytics: GA4/Pixel wired via `AnalyticsProvider`; GA4 Measurement Protocol can emit `deposit_paid` when `GA4_API_SECRET` is set.
