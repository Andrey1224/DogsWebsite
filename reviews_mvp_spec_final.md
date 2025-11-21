# Reviews MVP System — SPEC (PuppyWebsite)

Version: 1.1 (Refined)
Status: Final

## 1. Overview / Summary

Goal: Implement a simple, reliable internal reviews system that:

- Stores all reviews in Supabase (reviews table)
- Allows users to submit reviews via a public form
- Provides admin moderation tools (publish/unpublish, feature, edit, delete)
- Displays reviews on:
  - Homepage as a featured carousel
  - A standalone `/reviews` page with all published reviews
- Includes SEO JSON-LD AggregateRating

Tech stack:

- Next.js 15 App Router, TypeScript, Tailwind
- Supabase Postgres + Storage
- Admin panel with session-based auth (already exists)
- hCaptcha for anti-spam

## 2. Goals / Non-Goals

### Goals

- One source of truth: Supabase `reviews`
- Two review types:
  - manual — from public form
  - facebook_manual — manually copied from FB
- Moderation:
  - New manual reviews = unpublished
  - Admin: publish/unpublish, feature, edit, delete
- UI:
  - Carousel (6–10 featured reviews)
  - `/reviews` page: all published, newest-first
  - Average rating + count for SEO + UI
- SEO: AggregateRating only
- Image support: 1 image per review, stored in `reviews` bucket

### Non-Goals

- Facebook API sync
- Likes, replies, filters, pagination
- Email notifications
- Multi-image galleries
- User accounts for reviewers

## 3. Architecture Overview

### Components

- Next.js frontend (public pages + admin)
- Supabase DB + Storage
- Public Supabase client → only SELECT published reviews
- Admin Supabase client (service-role) for CRUD
- Admin auth (existing login/password + HMAC session)
- hCaptcha validation on review submission

## 4. Data Model

### 4.1 Enums

```
review_source = 'manual' | 'facebook_manual'
```

### 4.2 Table: reviews

| Field           | Type          | Required | Description              |
| --------------- | ------------- | -------- | ------------------------ |
| id              | uuid          | yes      | Primary key              |
| source          | review_source | yes      | manual / facebook_manual |
| is_published    | boolean       | yes      | true = visible publicly  |
| author_name     | text          | yes      | User name                |
| author_location | text          | no       | City/region              |
| rating          | int 1–5       | yes      | Review rating            |
| body            | text          | yes      | Full review text         |
| headline        | text          | no       | Optional short title     |
| visit_date      | date          | no       | Optional                 |
| photo_url       | text          | no       | Path in Storage          |
| source_url      | text          | no       | FB link                  |
| is_featured     | boolean       | yes      | Show in carousel         |
| created_at      | timestamptz   | yes      | Default now()            |
| updated_at      | timestamptz   | yes      | Default now()            |

### Indexes

- `(is_published, created_at DESC)`
- `(is_featured, is_published)`
- `(source)`

### Business rules

- rating ∈ [1,5]
- manual reviews created with is_published=false
- facebook_manual reviews created with is_published=true (admin adds them)
- is_featured = true only allowed when is_published=true

## 5. Storage (Supabase bucket)

Bucket: `reviews`
Path format: `reviews/{review_id}/{uuid}.jpg|png|webp`
Limit: 1 image, ≤2MB
On delete: remove folder then delete DB row
On replace: upload new → update DB → delete old

## 6. Public UI

### 6.1 Carousel on homepage

- Source: `is_published=true AND is_featured=true LIMIT 10`
- scroll-snap horizontal slider
- Card contents:
  - name
  - location (optional)
  - rating (stars)
  - text → 4-line clamp
  - image (optional)
  - badge:
    - “From Facebook review” if source=facebook_manual
    - “From EBL Family” if manual

Fallback: hide component if <1 review

### 6.2 `/reviews` page

- Server-side fetch of all `is_published=true`
- Sort: newest-first
- Display:
  - Average rating (1 decimal)
  - Count of published reviews
  - Cards full text
  - Optional image thumbnail
  - Badge by source
- No pagination in MVP

### 6.3 “Leave a Review” form

Fields:

- author_name (required)
- author_location (optional)
- rating (required 1–5)
- body (required, 20–2000 chars)
- photo (optional, ≤2MB)
- checkbox “I agree to publish…” (required)

Actions (server):

- Validate Zod schema
- Validate hCaptcha
- Upload photo (if provided)
- Insert review:
  - source = manual
  - is_published = false
  - is_featured = false

Response:

- Success → clear form + message
- Failure → inline errors

## 7. Admin Panel

Path: `/admin/reviews`

### 7.1 List view

Columns:

- Name
- Source
- Rating
- Published (toggle)
- Featured (toggle)
- Created_at
- Actions: Edit / Delete

Filters:

- All / Published / Pending
- Source (optional)

Actions:

- Publish/unpublish:
  - unpublish → is_featured=false
- Toggle featured:
  - only if is_published=true
- Delete:
  - delete Storage folder
  - delete DB row

### 7.2 Add Facebook review

Fields:

- author_name (required)
- author_location (optional)
- rating (1–5)
- body (required)
- photo (optional)
- source_url (optional)

Defaults:

- source = facebook_manual
- is_published = true

### 7.3 Edit review

Fields editable:

- author_name
- location
- rating
- body
- headline
- visit_date
- photo (replace logic)
- is_featured
- is_published

## 8. SEO (JSON-LD)

On `/reviews`:

```
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Exotic Bulldog Legacy",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": <avgRating>,
    "reviewCount": <countPublished>
  }
}
```

No individual review entities in MVP.

## 9. RLS / Security

Public (anon) SELECT allowed only if:

```
is_published = true
```

Admin operations:

- via server actions using service-role Supabase client
- protected by admin session middleware

Anti-spam:

- hCaptcha required for public form

## 10. Non-functional Requirements

- Load up to ~500 reviews without pagination
- Carousel loads max 10
- Graceful fallback if Supabase is down
- Clear user feedback on form submit
- No client-side errors on empty or low review count

## 11. Edge Cases

- 0 reviews → show friendly empty state
- invalid rating → validation error
- image too large → validation error
- failed upload → do not create DB row
- toggling featured on unpublished → error
- deleting featured review → carousel updates on next render (revalidate)

## 12. Migration Plan (simple)

1. Create `reviews` table + indexes + RLS
2. Create Storage bucket `reviews`
3. Add Review form component + server action
4. Add carousel to homepage
5. Create `/reviews` page
6. Build admin CRUD section
7. Add SEO JSON-LD
8. QA → push to production
