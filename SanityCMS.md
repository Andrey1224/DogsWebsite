You are working inside the Exotic Bulldog Legacy / PuppyWebsite repository.

Your task is to replace the current mock blog data implementation with a production-ready Sanity CMS integration, so the site owner can create and publish blog posts without developer help.

Important project constraints:

- Next.js 15 App Router
- Tailwind v4
- TypeScript strict mode
- Avoid any
- Use existing theme tokens / utilities, do not hard-code colors
- Keep secrets in .env.local and update .env.example for new env vars
- Do not expose private tokens to the client
- Keep business/operational data in Supabase; this task is only for blog/editorial content
- Do NOT try to merge this into the custom /admin dashboard; use Sanity Studio instead
- Prefer Server Components where possible
- Preserve existing UI/UX and routing structure unless a small refactor is necessary

Current blog structure:
app/(site)/(chrome)/blog/

- page.tsx // server component, blog listing
- blog-client.tsx // client component for filters/search/cards
- [slug]/page.tsx // server component, article page
- [slug]/share-buttons.tsx // client component

Current mock data:
lib/blog/posts.tsx

Current blog data model:
type BlogPost = {
id: number;
slug: string;
title: string;
excerpt: string;
category: string; // 'Питание' | 'Уход' | 'Здоровье' | 'Породы'
readTime: string; // currently manual string like '5 мин'
date: string; // currently string like '10 Марта, 2026'
image: string; // image URL
featured?: boolean;
body: () => React.JSX.Element; // currently hardcoded JSX, must be replaced
};

Current /blog page behavior:

- hardcoded hero title + description
- category filters computed from posts
- client-side search by title + excerpt
- featured article block from featured post
- grid of non-featured posts
- bottom CTA block hardcoded

Current /blog/[slug] page behavior:

- breadcrumb based on category
- article header: category, title, author, date, readTime
- cover image
- share sidebar
- article body from post.body()
- hardcoded author block
- related posts from same array
- final CTA hardcoded

Article body currently contains these visual block types:

- intro paragraph (larger text)
- h2 section headings
- regular paragraphs
- blockquote with orange left border
- unordered list with branded bullets
- info/tip box with icon and title "Совет ветеринара"

Goal:
Implement Sanity CMS for blog posts so the owner can create/edit/publish posts from Sanity Studio, while the public site renders data from Sanity and keeps the current design.

MVP content scope:
Editable in Sanity:

- post title
- slug
- excerpt
- category
- published date
- read time (optional manual override or fallback auto-calculated)
- cover image
- featured flag
- rich article body using Portable Text

Keep in code for now:

- blog listing hero text
- CTA sections
- share buttons
- related posts fallback logic
- sticky contact bar / footer / chrome
- author block can stay hardcoded in code for MVP, unless very easy to abstract cleanly

Recommended Sanity model for MVP:

1. post

- title (required)
- slug (required, generated from title)
- excerpt (required, max sensible editorial length)
- category (required; use predefined string options: Питание, Уход, Здоровье, Породы)
- publishedAt (required; use datetime/date field, not string)
- readTime (optional string like "5 мин")
- mainImage (required)
- featured (boolean)
- body (Portable Text, required)
- seoTitle (optional)
- seoDescription (optional)

Custom Portable Text object types:

- tipBox
  - title
  - body/content

Portable Text should support:

- normal paragraph
- intro/lead paragraph style
- h2
- blockquote
- bullet list
- image block if easy to support cleanly

Implementation requirements:

1. Inspect the current blog files and existing architecture before changing code.
2. Add Sanity dependencies only if they are not already installed.
3. Integrate Sanity Studio inside the same Next.js app, ideally under:
   /studio
4. Create a clean Sanity folder structure, for example:
   sanity/
   lib/
   client.ts
   image.ts
   queries.ts
   schemaTypes/
   postType.ts
   tipBoxType.ts
   index.ts
5. Configure Sanity client for public reads.
6. Replace lib/blog/posts.tsx mock data usage with Sanity queries.
7. Update:
   - app/(site)/(chrome)/blog/page.tsx
   - app/(site)/(chrome)/blog/blog-client.tsx
   - app/(site)/(chrome)/blog/[slug]/page.tsx
     as needed so they consume real data from Sanity.
8. Implement Portable Text rendering with custom components that match the current design as closely as possible.
9. Keep category filter and search UX working.
   - search can remain client-side on fetched posts
10. Related posts:

- keep simple fallback logic: other posts excluding current one, same category preferred if easy

11. Add proper notFound handling for missing slugs.
12. Add metadata support for article pages using Sanity content if possible.
13. Add revalidation support so published/updated posts appear without manual code edits.
    Accept either:

- webhook route with revalidatePath/revalidateTag
- or a clearly documented ISR strategy

14. Update .env.example with any new required env vars.
15. Do not break existing Supabase features or /admin area.

Technical expectations:

- Use TypeScript strict types
- No any
- Keep code readable and minimal
- Reuse existing styling conventions and design tokens
- Do not hardcode brand hex values if tokens/utilities already exist
- Do not introduce unnecessary abstractions
- Avoid large refactors outside the blog/Sanity scope

What I want from you:
A) First, inspect the current implementation and give a short plan:

- files to create
- files to modify
- package changes
- data flow changes
- revalidation approach

B) Then implement the solution.

C) After implementation, provide:

- summary of what changed
- any env vars I must add
- any Sanity project setup steps I must do manually
- how the owner will create a post
- any limitations of the MVP

Suggested output structure:

1. Findings
2. Implementation plan
3. Code changes
4. Manual setup required
5. Validation / test notes

Definition of done:

- /blog renders posts from Sanity
- /blog/[slug] renders article content from Sanity Portable Text
- owner can create/publish a post in Sanity Studio
- current blog design remains intact or very close
- featured post works
- category filters still work
- missing slug returns notFound
- env vars documented
- no TypeScript/lint regressions in changed code

If you see a better structure after inspecting the codebase, you may adjust details, but keep the same product goal and MVP boundaries.
