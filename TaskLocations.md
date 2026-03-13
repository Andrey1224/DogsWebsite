Implement city/service-area landing pages for the existing Next.js 15 App Router website.

## Goal

Add high-quality local landing pages under `/locations/[slug]` for a small curated set of cities, starting with 2 strong pages only:

- birmingham-al
- huntsville-al

These pages must NOT be thin doorway pages. Each page must provide unique local value:

- unique hero copy
- delivery / pickup logistics specific to that city
- local testimonials if available
- city-specific FAQ
- embedded available puppies grid

## Existing project constraints

- App Router path base: `app/(site)/(chrome)/`
- Existing listing pattern exists at `app/(site)/(chrome)/puppies/page.tsx`
- Existing detail page exists at `app/(site)/(chrome)/puppies/[slug]/page.tsx`
- Revalidation pattern: `export const revalidate = 60`
- Puppies data source: `getFilteredPuppies(filter)` from `lib/supabase/queries.ts`
- `getFilteredPuppies({ status: 'available' })` returns `PuppyWithRelations[]`
- SEO metadata helper already exists: `buildMetadata({ title, description, path, image, noIndex })`
- Breadcrumb component already exists and includes BreadcrumbList JSON-LD internally
- Do NOT create per-city LocalBusiness schema
- Do NOT modify `lib/seo/structured-data.ts` unless absolutely necessary
- Do NOT modify database schema
- Reuse existing puppy card/grid styling patterns
- Keep visual style consistent with current `/puppies` page

## Files to create

1. `lib/data/locations.ts`
2. `app/(site)/(chrome)/locations/[slug]/page.tsx`
3. `app/(site)/(chrome)/locations/page.tsx`

## Files to update

1. `app/sitemap.ts`
2. `components/site-footer.tsx`

## Do not modify unless required

- `components/puppy-card.tsx`
- `components/puppy-filters.tsx`
- `components/puppy-gallery.tsx`
- `lib/supabase/queries.ts`
- `lib/seo/metadata.ts`
- `lib/seo/structured-data.ts`
- `app/robots.ts`

## Data model for locations

Create a typed local data source in `lib/data/locations.ts` for curated city pages only.

Use a type similar to:

- slug
- city
- state
- metaTitle
- metaDescription
- heroTitle
- heroText
- driveTimeMinutes?
- deliveryOptions[] with type + description
- localTestimonials[] optional
- faq[] required
- localContext[] optional
- nearbyAreas[] optional
- isIndexable? optional

Also export:

- full locations array
- helper `getLocationBySlug(slug)`
- helper `getIndexableLocations()`

## Page requirements for `/locations/[slug]`

- Use `revalidate = 60`
- Resolve async params correctly for Next.js 15
- Find location by slug from `lib/data/locations.ts`
- Call `notFound()` for unknown slug
- Generate metadata with `buildMetadata`
- Respect `isIndexable === false` using metadata noIndex
- Render sections in this order:
  1. Breadcrumbs
  2. Hero
  3. Available puppies grid
  4. Delivery / pickup logistics
  5. Testimonials if present
  6. FAQ
  7. CTA
- Use `getFilteredPuppies({ status: 'available' })`
- Reuse existing puppy card presentation patterns
- Keep container sizing aligned with `/puppies` page (`max-w-7xl px-6 md:px-12`)
- Keep dark theme background consistent with existing listing page (`#0B1120` family)

## Important UX rule

Do NOT turn the city page into a clone of `/puppies`.
Do NOT embed full filtering as the main interaction model.
This page is a local landing page with an embedded available puppies section.
A simple CTA link to `/puppies?status=available` is fine.

## `/locations` hub page requirements

Create a simple index page listing service areas:

- title + short intro
- cards/links to available city pages
- consistent styling with site chrome
- only show indexable locations

## Sitemap

Update `app/sitemap.ts`:

- add `/locations`
- add `/locations/[slug]` for indexable locations only

## Footer

Update `components/site-footer.tsx`:

- add links to `/locations`
- add a few priority city links only, not a long spammy city list

## SEO guardrails

Absolutely avoid:

- doorway-page patterns
- duplicate near-identical copy across cities
- fake city-specific addresses
- city-specific LocalBusiness schema
- mass-generated city pages
- long keyword-stuffed city lists

## Content quality standard

Each city page should feel like a real landing page for a real service area.
Use only 2 seed pages for now:

- Birmingham, AL
- Huntsville, AL

## Deliverables

1. Implement the files
2. Keep changes minimal and targeted
3. Show a concise summary of created/updated files
4. Explain any assumptions
