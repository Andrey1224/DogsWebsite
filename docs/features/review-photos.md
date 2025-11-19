# Review Photos Feature

**Status**: ✅ Production Ready
**Migration Applied**: January 18, 2025
**Sprint**: Sprint 4 - SEO, Trust & Local Presence

---

## Overview

The Review Photos feature allows customers to submit public testimonials with optional photo uploads (up to 3 photos per review). Reviews include a 1-5 star rating, visit date, location, and a detailed story about their experience.

### Key Features

- ✅ Public submission form at `/reviews`
- ✅ Client-side photo uploads via signed URLs (bypasses 1MB Server Action limit)
- ✅ hCaptcha spam protection
- ✅ Instant publish workflow (no moderation queue)
- ✅ Client IP tracking for spam mitigation
- ✅ Featured reviews hardcoded in page component
- ✅ Community reviews from database
- ✅ JSON-LD schema markup for SEO

---

## Database Schema

### Table: `reviews`

| Column        | Type        | Description                                      |
| ------------- | ----------- | ------------------------------------------------ |
| `id`          | UUID        | Primary key (auto-generated)                     |
| `author_name` | TEXT        | Customer name shown with testimonial             |
| `location`    | TEXT        | City and state (e.g., "Birmingham, AL")          |
| `visit_date`  | DATE        | When family visited/picked up puppy              |
| `rating`      | SMALLINT    | Star rating (1-5, enforced by CHECK constraint)  |
| `story`       | TEXT        | Customer review text (40-900 characters)         |
| `photo_urls`  | TEXT[]      | Array of up to 3 public URLs from Storage        |
| `source`      | TEXT        | Submission source ('form', 'admin', 'migration') |
| `status`      | TEXT        | Publishing state ('pending', 'published')        |
| `client_ip`   | INET        | Captured IP for spam mitigation                  |
| `created_at`  | TIMESTAMPTZ | When review was stored                           |

**Indexes**:

- `idx_reviews_status_created_at` - For filtering published reviews by date
- `idx_reviews_visit_date` - For sorting by visit date

**Row-Level Security (RLS)**:

- **Enabled**: Yes
- **Policies**:
  - "Public can view published reviews" - `SELECT` where `status = 'published'`
  - "Service role manages reviews" - `ALL` operations for service role

---

## Storage

### Bucket: `reviews`

**Configuration**:

- **ID**: `reviews`
- **Public**: Yes (public read access)
- **File Size Limit**: 5MB per file (5,242,880 bytes)
- **Allowed Types**: JPG, JPEG, PNG, WebP (enforced client-side and server-side)
- **Path Structure**: `submissions/YYYY/timestamp-uuid.{jpg|jpeg|png|webp}`

**Storage Policy**:

- "Public read access for review photos" - `SELECT` on `storage.objects` where `bucket_id = 'reviews'`

---

## Implementation

### Frontend Components

**Location**: `components/reviews/review-form.tsx`

**Features**:

- Form validation (Zod schema)
- Photo upload with preview thumbnails
- Remove photo buttons
- hCaptcha integration
- Progress indicators during upload
- Analytics event tracking
- Instant feedback on submission

**Validation**:

- Name: 2-80 characters
- Location: 2-120 characters
- Visit Month: YYYY-MM format (normalized to YYYY-MM-01)
- Rating: 1-5 (required, radio buttons)
- Story: 40-900 characters
- Photos: Max 3, each ≤5MB, must be JPG/PNG/WebP

### Backend Server Actions

**Location**: `app/reviews/actions.ts`

**Main Action**: `submitReview`

1. Validate form data (Zod schema)
2. Verify hCaptcha token
3. Extract client IP address
4. Insert into `reviews` table via service role
5. Set `status: 'published'` (instant publish)
6. Revalidate `/reviews` page
7. Return success/error with field-specific errors

**Photo Upload**: `app/reviews/upload-actions.ts`

- `createReviewPhotoUploadTarget()` - Generates signed upload URLs (60s validity)
- `getReviewPhotoPublicUrl()` - Resolves storage path to public URL

### Data Layer

**Location**: `lib/reviews/queries.ts`

**Query**: `getPublishedReviews`

- Fetches only reviews where `status = 'published'`
- Orders by `visit_date DESC`
- Uses React `cache()` for deduplication
- Maps database rows to TypeScript types

---

## Data Flow

```
User fills form at /reviews
    ↓
Photos uploaded via signed URL (client → Supabase Storage)
    ↓
Form submitted with photo URLs
    ↓
Server Action: submitReview
    ├─ Validate schema
    ├─ Verify hCaptcha
    ├─ Extract client IP
    └─ Insert to database (status: 'published')
    ↓
Revalidate /reviews page
    ↓
Review appears in listing
```

---

## Migration

**File**: `supabase/migrations/20251222T120000Z_create_reviews_table.sql`

**Applied**: January 18, 2025 via Supabase MCP

**Contents**:

1. Create `reviews` table with constraints
2. Create indexes for performance
3. Enable Row-Level Security
4. Create RLS policies
5. Add table and column comments
6. Create `reviews` storage bucket (via DO block)
7. Create storage access policy

**Applied Using**:

```bash
# Via Supabase MCP
mcp__supabase__apply_migration({
  name: "create_reviews_table",
  query: "..." # Full SQL from migration file
})
```

---

## Testing

### Unit Tests

**Location**: `app/reviews/actions.test.ts`

- Form validation edge cases
- hCaptcha verification
- Database persistence
- Error handling

**Location**: `lib/reviews/schema.test.ts`

- Schema validation
- Field error messages
- Photo URL validation

### Manual Testing Checklist

- [ ] Submit review without photos
- [ ] Submit review with 1-3 photos
- [ ] Verify photo upload progress indicators
- [ ] Test photo removal before submit
- [ ] Verify hCaptcha challenge appears
- [ ] Submit with invalid hCaptcha token (should fail)
- [ ] Verify review appears immediately after submit
- [ ] Check photo URLs are publicly accessible
- [ ] Verify JSON-LD schema includes reviews
- [ ] Test form validation (name too short, story too long, etc.)

---

## Analytics Events

| Event                         | Properties    | Trigger                   |
| ----------------------------- | ------------- | ------------------------- |
| `review_form_submit`          | none          | Form submission starts    |
| `review_form_success`         | none          | Review successfully saved |
| `review_photo_upload_success` | `photo_count` | Photos uploaded           |

---

## Admin Panel

**Status**: ❌ Not Implemented

Currently, there is no admin interface for reviews management. Reviews are auto-published on submission.

**If moderation is desired**, implement:

1. Change `status: 'pending'` in `app/reviews/actions.ts:108`
2. Create `/admin/reviews` routes
3. Add publish/reject actions
4. Update `getPublishedReviews` query to cache properly

---

## Security Considerations

### Spam Protection

- hCaptcha verification (server-side)
- Client IP tracking
- Rate limiting (via hCaptcha)
- Photo size limits (5MB)
- Text length limits (900 chars max)

### Data Privacy

- Client IP stored for spam mitigation only
- No email/phone required
- GDPR-compliant (minimal PII)
- Photos are public (user consent via form)

### Storage Security

- Signed URLs expire after 60 seconds
- Public bucket allows read-only
- File type validation client and server-side
- No executable files allowed

---

## Environment Variables

**Required**:

```bash
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=     # For form validation
HCAPTCHA_SECRET_KEY=               # For server-side verification
SUPABASE_URL=                       # Database connection
SUPABASE_ANON_KEY=                 # Public client key
SUPABASE_SERVICE_ROLE=             # Service role for server actions
```

**Optional** (for local testing):

```bash
NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN= # Bypass hCaptcha in dev
HCAPTCHA_BYPASS_TOKEN=
```

---

## Future Enhancements

### Potential Features

- [ ] Admin moderation queue
- [ ] Email notifications for new reviews
- [ ] Photo moderation/approval
- [ ] Review editing (by author or admin)
- [ ] Review replies (business responses)
- [ ] Review flagging/reporting
- [ ] Average rating calculation
- [ ] Review pagination (if > 20 reviews)
- [ ] Review sorting (newest, highest rated, etc.)
- [ ] Review filtering (by rating, date range)
- [ ] Photo gallery view
- [ ] Video testimonials support

### Performance Optimizations

- [ ] Image optimization (WebP conversion, thumbnails)
- [ ] Lazy loading for photos
- [ ] CDN caching for photos
- [ ] Review caching (Redis/Vercel KV)

---

## Troubleshooting

### Issue: Photos not uploading

**Cause**: Signed URL expired (60s limit)

**Solution**: Ensure photos upload immediately after URL generation. Consider increasing timeout if needed.

---

### Issue: Reviews not appearing

**Cause**: Status is 'pending' instead of 'published'

**Solution**: Check `app/reviews/actions.ts:108` - ensure `status: 'published'`

---

### Issue: hCaptcha failing in production

**Cause**: Invalid site key or secret key

**Solution**: Verify `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` and `HCAPTCHA_SECRET_KEY` in environment variables

---

## Related Documentation

- [SPRINT_PLAN.md](../../SPRINT_PLAN.md) - Sprint 4 deliverables
- [CLAUDE.md](../../CLAUDE.md) - Database schema and migrations
- Migration file: `supabase/migrations/20251222T120000Z_create_reviews_table.sql`
- Form component: `components/reviews/review-form.tsx`
- Server actions: `app/reviews/actions.ts`
- Queries: `lib/reviews/queries.ts`
- Schema: `lib/reviews/schema.ts`

---

## Changelog

| Date         | Change                           | Author      |
| ------------ | -------------------------------- | ----------- |
| Jan 18, 2025 | Migration applied to production  | Claude Code |
| Dec 22, 2024 | Feature implementation completed | Claude Code |
| Dec 22, 2024 | Migration file created           | Claude Code |
