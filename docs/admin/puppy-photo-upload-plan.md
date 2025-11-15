# Puppy Photo Upload Plan

## Context

- `app/admin/(dashboard)/puppies/create-puppy-panel.tsx` already handles form UI, slug generation, and parent photo uploads via `ParentPhotoUpload`, but it does not expose any control for the core puppy gallery (`puppies.photo_urls`).
- Client-side uploads are performed through `useMediaUpload` (`lib/admin/hooks/use-media-upload.ts`) plus the signed URL helpers in `app/admin/(dashboard)/puppies/upload-actions.ts`, so we should reuse the same pattern to stay under the 1 MB Server Action limit (`docs/admin/adr-client-side-uploads.md`).
- The public site pulls from `puppy.photo_urls` for hero images (`components/puppy-card.tsx`, `components/puppy-gallery.tsx`, `app/puppies/[slug]/page.tsx`), so persisting the uploaded URLs into that column is enough—no extra rendering work is required.
- `createPuppyAction` (`app/admin/(dashboard)/puppies/actions.ts`) currently extracts only sire/dam photo URLs before calling `insertAdminPuppy`, and `mapCreatePayload` (`lib/admin/puppies/queries.ts`) ignores gallery photos entirely even though `puppies.photo_urls TEXT[]` already exists in the schema/migrations.

## Goals

- Let admins attach up to three puppy gallery photos while creating a record, using the same UX affordances (preview, removal, upload progress) we already ship for parent photos.
- Persist the uploaded URLs to `puppies.photo_urls` so that cards/details immediately reflect the gallery without extra manual edits.
- Preserve existing validation, reset, and toast flows so that adding puppy photos does not regress the current happy path.

## Constraints & Assumptions

- Storage bucket stays `puppies`; we only need to namespace new files (e.g., `tempId/gallery/...`) to avoid clobbering parent folders.
- Limit remains three photos per puppy per stakeholder request; enforce both client-side (slice selected files) and in the schema (array max length).
- We only need create-time uploads for now; editing/replacing gallery photos can be a follow-up story.
- New UI should coexist with the existing two-column grid in `CreatePuppyPanel`, so plan for responsive layout (likely another `ParentPhotoUpload`-style block).
- Typescript strict + ESLint will fail CI if we forget to thread new props through all call sites.

## Implementation Plan

1. **Introduce a reusable puppy photo uploader**
   - Option A: generalize `ParentPhotoUpload` into a more flexible `PhotosUploadField` that accepts a `name`/`label` prop; Option B: create a dedicated `PuppyPhotoUpload` component under `components/admin/`.
   - Requirements: limit to 3 images, preview selected files, allow removal before upload, show upload spinner/progress, disable while `isUploading`.
   - Expose `onFilesSelected`, `uploadedUrls`, and share styling with parent uploaders for consistency.

2. **Augment `CreatePuppyPanel` client logic**
   - Add `puppyFiles`/`puppyPhotoUrls` state alongside the existing sire/dam arrays; wire the new upload component to these setters.
   - In `handleSubmit`, reuse the current `crypto.randomUUID()` temp folder but add a `gallery` subfolder (`${tempId}/gallery`), call `uploadFiles(puppyFiles, ...)`, and append the resulting URLs to FormData under a new key such as `photoUrls`.
   - Gate submission when uploads are running, display toast messages similar to "Uploading sire photos...", and reset puppy photo state after a successful create (alongside the form reset we already do).

3. **Validate payload on the server**
   - Extend `createPuppySchema` (`lib/admin/puppies/schema.ts`) with an optional `photoUrls` array (max length 3, url strings). Update `CreatePuppyInput` type automatically via inference.
   - In `createPuppyAction`, read `formData.getAll("photoUrls")`, filter for strings, and pass them through to the parsed payload (falling back to `undefined` when empty).
   - Keep error messaging consistent (e.g., surface schema violations as `fieldErrors.photoUrls`).

4. **Persist gallery URLs**
   - Update `mapCreatePayload` and `insertAdminPuppy` (`lib/admin/puppies/queries.ts`) to accept `{ photoUrls?: string[] }` and map to the `photo_urls` column (use `null` when none provided to avoid empty arrays if that matches current conventions).
   - Ensure the Supabase type definitions already covering `photo_urls` stay in sync—no change expected, but confirm `Puppy` export still matches.
   - Double-check that any downstream admin queries selecting limited columns still work (no need to eagerly fetch `photo_urls` for the table view).

5. **Documentation & UX polish**
   - Update admin docs (e.g., `docs/admin/admin-panel-changelog.md`) to mention the new upload capability and remind contributors about the three-photo cap.
   - Consider adding helper text under the new field (accepted formats, max images) to mirror the parent sections.

6. **Testing & QA**
   - Add a unit test covering `createPuppyAction` parsing of `photoUrls` or, at minimum, a test around `mapCreatePayload` to verify `photo_urls` is propagated.
   - Smoke-test the admin form locally: select ≤3 puppy images, ensure uploads complete, verify Supabase row has `photo_urls` populated, and confirm the public puppy page renders the new gallery without refresh glitches.
   - Regression checklist: create without photos, create with only parents, attempt 4th image (should be blocked client-side), and handle upload failures gracefully (toast + no submission).

## Open Questions / Follow-Ups

- Should we surface these gallery photos elsewhere in the admin (list thumbnails, detail drawers)? Out of scope but worth noting.
- Do we need drag-and-drop ordering for the three photos, or is selection order sufficient?
- Should we reuse the same storage folder when editing later to avoid orphaned images? Future enhancement once edit flow exists.
