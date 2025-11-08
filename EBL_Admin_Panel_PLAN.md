# EBL Admin Panel Delivery Plan

## 1. Scope & Success Criteria
- **Objective**: embed a secure `/admin` surface that lets the owner create, edit, and retire puppy listings without developer involvement while keeping the public catalog in sync (`revalidatePath` after each mutation ensures the ISR cache refreshes as recommended by Next.js App Router docs[^1]).
- **In-Scope MVP**: password-based auth, protected layout/middleware, puppy list with inline status + price editing, create/delete flows with confirmations, toast feedback, and per-mutation revalidation.
- **Out of Scope**: media uploads, inquiry/reservation UI, granular roles (see PRD §5).

## 2. Phased Implementation Plan

| Phase | Focus | Key Deliverables | Owner | Status |
| --- | --- | --- | --- | --- |
| P1 | Auth Foundations | `.env` secrets, `/admin/login`, secure cookie, middleware + layout guard, sign-out path | Dev | ✅ Done |
| P2 | Data Access Layer | Server-only Supabase client helpers, Zod schemas, shared enum/constants | Dev | ✅ Done |
| P3 | Puppies Index UI | `/admin/puppies` route, table skeleton, responsive layout, shadcn inputs/selects | Dev | ✅ Done |
| P4 | Mutations | Server Actions for status, price, create, delete; toast wiring; optimistic UX; cache revalidation[^1] | Dev | 🔲 Todo |
| P5 | DX & QA | Validation states, error UX, mobile pass on Galaxy S25 Ultra, regression checklist (`lint`, `test`, `e2e`), docs updates (`SPRINTx_REPORT`, `.env.example`) | Dev | 🔲 Todo |

## 3. Detailed Work Breakdown

### P1 — Auth Foundations
- Define `ADMIN_LOGIN`, `ADMIN_PASSWORD`, `ADMIN_SESSION_TTL_HOURS` in `.env.example` and local env.
- Create `/admin/login` page (server component) with a `use client` form that posts to a Server Action:
  - Validates credentials, sets `httpOnly`, `secure`, `sameSite='lax'` cookie via `cookies()` API (per Next.js guidance on managing cookies inside Server Actions[^2]).
  - Redirects to `/admin/puppies` on success; returns field errors on failure.
- Implement `middleware.ts` to gate `/admin/*` paths and redirect unauthenticated users to `/admin/login` while preserving `nextUrl` for potential deep-link support (aligns with the upgraded middleware redirect pattern in Next.js docs[^3]).
- Add `app/admin/layout.tsx` server component guard that double-checks the session and renders `<Redirect />` on missing/expired cookies.
- Implement `/admin/sign-out` Server Action that deletes the session cookie (per Next.js authentication guidance on deleting cookies[^4]) and redirects to `/admin/login`.

### P2 — Data Access Layer
- Create `lib/admin/session.ts` to encapsulate signing/verifying a session payload (e.g., `crypto.randomUUID()` + expiry timestamp).
- Introduce `lib/admin/supabase.ts` (server-only) that uses the service-role key, ensuring no client credentials leak.
- Define shared Zod schemas for puppy CRUD in `lib/admin/puppies/schema.ts` (status enum, price validation, birth date rule `<= today`).
- Add helper for slug creation with collision handling (slugify + suffix counter), tracked in PRD Open Questions.

### P3 — Puppies Index UI
- Route: `app/admin/puppies/page.tsx` loads puppies sorted by `created_at DESC` via server component.
- Layout: responsive grid/table with columns (Name, Status, Price, Birth Date, Actions). Ensure tap targets ≥44px and mobile-first CSS tokens.
- Actions column: `Open public page` (link to `/puppies/[slug]`), `Delete` button triggering confirm dialog that repeats the puppy name.
- Inline controls:
  - Status select using shadcn `<Select>` with enum options.
  - Price input with USD prefix, numeric keyboard on mobile.
  - Birth date shown read-only for MVP (editable later if needed).

### P4 — Mutations
- Server Actions (`'use server'` in `app/admin/puppies/actions.ts`):
  - `updateStatus`, `updatePrice`, `createPuppy`, `deletePuppy`.
  - Each action: parse via schema, authorize session, run Supabase mutation, call `revalidatePath('/puppies')` plus `revalidatePath('/puppies/[slug]')` when slug affected[^1].
  - Handle Supabase errors with structured messages for UI toasts.
- Client components wrap actions via `useTransition` for non-blocking state, mirroring Next.js pattern for inline updates.
- Delete flow uses modal requiring the user to type/confirm the puppy name for safety.

### P5 — DX, QA, Documentation
- Validation UX: inline error states, disabled controls while pending, `sonner` toasts for success/error states as per FR-F1/FR-F3.
- Accessibility: aria labels on icon buttons, keyboard focus rings, proper semantics.
- Testing:
  - Unit tests for schema + slug helper.
  - Integration test (Vitest) for session helper.
  - Playwright admin smoke test (login + status toggle) gated behind `ADMIN_*` env.
- Documentation updates:
  - `SPRINT_PLAN.md` and latest `SPRINTx_REPORT.md` with progress.
  - `.env.example` for new admin secrets.
  - Note in `Spec1.md` linking to this plan when shipping the admin console.

## 4. Progress Log

| Date | Phase | Status Update | Next Step |
| --- | --- | --- | --- |
| 2024-11-24 | P3 Puppies Index UI | ✅ Built responsive table UI with disabled inline controls + actions placeholders, powered by `fetchAdminPuppies()`. Previewed via Playwright MCP. | Start **P4 Mutations** (wire Server Actions + toasts). |
| 2024-11-24 | P2 Data Layer | ✅ Added admin Supabase helper, puppy schemas (Zod), slug utilities, and CRUD query wrappers to unblock upcoming UI/actions. | Begin **P3 Puppies Index UI** (table layout + data fetch). |
| 2024-11-24 | P1 Auth Foundations | ✅ Added env vars, cookie-backed session helpers, login form/action, middleware + guarded layout, and placeholder puppies route. | Start **P2 Data Access Layer** (service-role client + schemas). |
| 2024-11-24 | Planning | ✅ Captured delivery plan in `EBL_Admin_Panel_PLAN.md`, aligned with PRD TL;DR, referenced Next.js Server Action & middleware docs via Context7. | Kick off **P1 Auth Foundations**: add env vars + login form skeleton. |

*(Add a new row per significant checkpoint; keep the latest entry on top.)*

## 5. Open Items & Risks
- **Slug collisions**: need final confirmation on auto-suffix format (Open Question in PRD §17).
- **Session storage**: confirm whether encrypted cookie payload is sufficient or if Supabase table required for revocation (MVP assumes signed cookie).
- **Mobile QA device**: require Galaxy S25 Ultra viewport specs for manual verification.
- **Delete guardrails**: consider soft-delete flag vs hard delete; PRD currently implies hard delete.

---

[^1]: Next.js App Router recommends calling `revalidatePath()` inside Server Actions after mutations to refresh cached routes (`docs/01-app/03-api-reference/04-functions/revalidatePath.mdx`).
[^2]: Cookie operations should happen inside Server Actions using the `cookies()` API so the server tree re-renders with updated state (`docs/01-app/01-getting-started/08-updating-data.mdx`).
[^3]: Middleware should redirect unauthenticated requests to `/login`, preserving original path (`errors/middleware-upgrade-guide.mdx`).
[^4]: Session cookies can be deleted server-side using `cookies().delete('session')` as shown in the Next.js authentication guide (`docs/01-app/02-guides/authentication.mdx`).
