# Sanity Blog Integration — Handoff

Implemented: 2026-03-11
Last updated: 2026-03-11
Scope: blog listing `/blog` and article pages `/blog/[slug]`
Packages added: `next-sanity@11`, `@sanity/image-url`, `react-is`, `styled-components`

---

## 1. Files changed

### New — Sanity infrastructure

| File                               | Responsibility                                                                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `sanity.config.ts`                 | Sanity Studio config — projectId, dataset, schema registration, Studio base path `/studio`                                                    |
| `sanity/schemaTypes/postType.ts`   | Sanity document schema for a blog post (all editable fields)                                                                                  |
| `sanity/schemaTypes/tipBoxType.ts` | Portable Text object type for the info/tip box block                                                                                          |
| `sanity/schemaTypes/index.ts`      | Exports all schema types; imported by `sanity.config.ts`                                                                                      |
| `sanity/lib/client.ts`             | Creates the Sanity client (null-safe: returns `null` if `projectId` is unset). Exports `sanityFetch()` wrapper used by all data-fetching code |
| `sanity/lib/image.ts`              | Exports `urlFor(source)` — builds Sanity CDN image URLs via `@sanity/image-url`                                                               |
| `sanity/lib/queries.ts`            | All GROQ query strings, TypeScript types (`SanityPost`, `SanityPostPreview`, `SitemapPost`), and `formatPostDate()`                           |

### New — App routes

| File                                | Responsibility                                                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/studio/[[...tool]]/page.tsx`   | Renders embedded Sanity Studio at `/studio`                                                                                                                        |
| `app/api/revalidate/blog/route.ts`  | Webhook endpoint — validates secret, calls `revalidatePath` to clear ISR cache after a post is published/updated/deleted                                           |
| `components/blog/portable-text.tsx` | Renders Sanity Portable Text to styled HTML; maps every block type (`lead`, `h2`, `blockquote`, `bullet`, `tipBox`, inline `image`) to the existing article design |
| `public/images/tatiana-author.jpg`  | Real author photo displayed in the author block on every article page                                                                                              |

### Modified

| File                                       | What changed                                                                                                                                             |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/(site)/(chrome)/blog/page.tsx`        | Replaced `force-static` + mock data with `revalidate = 60` + `sanityFetch(ALL_POSTS_QUERY)`; normalises Sanity shape to `BlogClientPost[]`               |
| `app/(site)/(chrome)/blog/blog-client.tsx` | Removed inline `BlogPost` type and hardcoded `blogPosts` array; now accepts `posts: BlogClientPost[]` as a prop                                          |
| `app/(site)/(chrome)/blog/[slug]/page.tsx` | Replaced JSX body with `<BlogPortableText>`; `generateStaticParams` fetches slugs from Sanity; `generateMetadata` builds per-post SEO from Sanity fields |
| `app/sitemap.ts`                           | Adds blog post URLs fetched from Sanity; uses `_updatedAt` for accurate `lastModified`                                                                   |
| `next.config.ts`                           | Added `cdn.sanity.io` to `images.remotePatterns`; excluded `/studio` routes from `X-Frame-Options: DENY` header                                          |
| `middleware.ts`                            | Extended to protect `/studio` in production — requires the admin session cookie, redirects to `/admin/login` if absent                                   |
| `.env.example`                             | Documents three new env vars (see section 3)                                                                                                             |

### Deleted

| File                 | Reason                                                 |
| -------------------- | ------------------------------------------------------ |
| `lib/blog/posts.tsx` | Replaced by Sanity; was the hardcoded mock-data module |

---

## 2. Required env vars

Add to `.env.local`:

```bash
# Sanity project ID — found in sanity.io/manage → project settings
NEXT_PUBLIC_SANITY_PROJECT_ID=

# Dataset name (default: production)
NEXT_PUBLIC_SANITY_DATASET=production

# Webhook secret — any random string, 32+ characters
# Must match the header value you set in the Sanity webhook config
SANITY_REVALIDATE_SECRET=
```

> `NEXT_PUBLIC_` vars are safe to expose to the browser (they contain no secrets).
> `SANITY_REVALIDATE_SECRET` is server-only — never prefix it with `NEXT_PUBLIC_`.

---

## 3. Local setup (step by step)

```bash
# 1. Create a Sanity project (if you don't have one)
npx sanity@latest init
# — choose "create new project"
# — note the projectId it gives you

# 2. Add env vars
echo "NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id" >> .env.local
echo "NEXT_PUBLIC_SANITY_DATASET=production"         >> .env.local
echo "SANITY_REVALIDATE_SECRET=some_random_secret"   >> .env.local

# 3. Allow localhost in Sanity CORS
#    sanity.io/manage → your project → API → CORS Origins
#    Add: http://localhost:3000  (check "Allow credentials")

# 4. Start dev server
npm run dev

# 5. Open Studio and create your first post
#    http://localhost:3000/studio
```

---

## 4. How to create a post in `/studio`

1. Open `http://localhost:3000/studio` (dev) or `https://yourdomain.com/studio` (prod — requires admin login).
2. Click **Статья → New**.
3. Fill in the required fields:

| Field                           | Notes                                                                    |
| ------------------------------- | ------------------------------------------------------------------------ |
| **Title**                       | Post title                                                               |
| **Slug**                        | Click _Generate_ — auto-fills from title                                 |
| **Excerpt**                     | 1–2 sentence excerpt shown on listing cards (max 300 chars)              |
| **Category**                    | Pick one: Nutrition / Care / Health / Breeds                             |
| **Published at**                | Set to today or a future date                                            |
| **Read time**                   | Optional, e.g. `5 min`                                                   |
| **Cover image**                 | Upload the cover image; fill in alt text; use hotspot to set focal point |
| **Featured**                    | Toggle on for exactly one post — appears as the featured hero on `/blog` |
| **Body**                        | Rich text editor; see block types below                                  |
| **SEO title / SEO description** | Optional overrides; if blank, title and excerpt are used                 |

4. Click **Publish**. The post appears on the site within 60 seconds (ISR) or immediately if the webhook is configured.

### Available rich text blocks

| Block style | How to select  | Result                                               |
| ----------- | -------------- | ---------------------------------------------------- |
| Normal      | Default        | Standard paragraph                                   |
| Lead        | Style dropdown | Larger intro paragraph (displayed at top of article) |
| Heading H2  | Style dropdown | Section heading                                      |
| Blockquote  | Style dropdown | Blockquote with orange left border                   |
| Bullet list | `-` or toolbar | List with orange bullet markers                      |
| **Tip box** | `+` → TipBox   | Info box with 💡 icon and title                      |
| Image       | `+` → Image    | Inline article image with optional alt text          |

### Image upload tips

- Any aspect ratio is accepted — the cover image displays at its natural ratio on the article page.
- After uploading the cover image, click **Edit hotspot** and drag the circle to the most important part of the photo (e.g. the dog's face). This ensures the crop on listing cards stays focused on the right area.
- Recommended minimum cover width: **1200 px**.

---

## 5. How webhook revalidation works

**Without a webhook**, published posts appear after at most 60 seconds (ISR `revalidate = 60`).

**With a webhook**, posts appear immediately after publishing.

### Setup in Sanity Console

1. Go to `sanity.io/manage` → your project → **API → Webhooks → New webhook**
2. Configure:
   - **URL**: `https://yourdomain.com/api/revalidate/blog`
   - **Method**: POST
   - **Dataset**: production
   - **Filter**: `_type == "post"`
   - **Trigger on**: Create, Update, Delete
   - **HTTP Headers**: add `x-sanity-secret` = `<your SANITY_REVALIDATE_SECRET value>`

### What the webhook does

`app/api/revalidate/blog/route.ts`:

1. Validates the `x-sanity-secret` header using `crypto.timingSafeEqual` (timing-safe comparison).
2. Returns `401` if the secret is wrong, `500` if `SANITY_REVALIDATE_SECRET` is not set on the server.
3. On success, calls `revalidatePath('/blog', 'page')` and `revalidatePath('/blog/[slug]', 'page')` — this clears the Next.js ISR cache for the listing page and all article pages.

### Slug change behaviour

When a slug is changed in Sanity:

- The webhook clears all `/blog/[slug]` cached pages.
- The **new slug** is generated on demand on next request.
- The **old slug** returns `notFound()` (404) on next request — the post no longer exists in Sanity for that slug.
- There is no automatic redirect from old → new slug (see MVP limitations).

---

## 6. How `/studio` protection works in production

`middleware.ts` protects `/studio` in production by checking for the admin session cookie (`admin_session`) set by the `/admin/login` flow.

```
Request to /studio
       │
       ▼
NODE_ENV === 'production'?
       │
      Yes → admin_session cookie present?
              │
             No  → redirect to /admin/login?from=/studio
             Yes → allow through
       │
       No (dev) → allow through
```

In development, `/studio` is always accessible without login for convenience.

**In production**: log into `/admin` first, then navigate to `/studio`. The same admin credentials work for both.

> If you need per-editor Sanity accounts (multiple editors with different permissions), configure Sanity's own RBAC at `sanity.io/manage → project → Members`. The middleware check is a minimum gate, not a replacement for Sanity-level access control.

---

## 7. Known MVP limitations

| Limitation                      | Detail                                                                                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Author block is hardcoded**   | Name, bio, and photo are in JSX (`[slug]/page.tsx`). Suitable for a single-author blog; extract to a Sanity singleton or `author` document type if multiple authors are needed. |
| **Read time is manual**         | The `Read time` field is a plain string. It is not auto-calculated from body word count.                                                                                        |
| **No slug redirect**            | If a slug is changed in Sanity, the old URL returns 404. Add a `redirects` entry in `next.config.ts` or store previous slugs in Sanity if permanent redirects are needed.       |
| **No per-editor Sanity auth**   | `/studio` is gated by the shared admin cookie, not individual Sanity accounts.                                                                                                  |
| **Client-side search only**     | The search box on `/blog` filters posts already loaded in the browser. For full-text search across many posts, integrate Sanity's search API or Algolia.                        |
| **Related posts are automatic** | Two posts are selected by category match, then recency. There is no manual "related posts" field in the schema.                                                                 |
| **No draft preview**            | Published posts only. Sanity's Live Preview / Presentation mode is not configured.                                                                                              |
