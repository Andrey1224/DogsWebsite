# TASK Context Notes - Auto-Expiring Reservations

## Problem Snapshot
- Need 15-minute TTL for pending reservations plus safe archiving rules ("active" = `status IN ('pending','paid')` and pending requires `expires_at > now()`).
- While an active reservation exists, UI must block new deposits and admins must be prevented from archiving the puppy.
- Expired pending reservations should automatically flip to `canceled` so the unique index `idx_one_active_reservation_per_puppy` stops blocking new holds.

## Relevant Code & State
### Database
- `supabase/migrations/20251010T021104Z_reservation_constraints.sql` already defines `expires_at`, `expire_pending_reservations()`, and partial unique index (`status IN ('pending','paid')`).
- `supabase/migrations/20251015T000000Z_create_reservation_transaction_function.sql` always inserts reservations as `pending` and currently sets `expires_at` via the caller (defaults to 24h in TS).
- `check_puppy_availability()` trigger still treats every `status IN ('pending','paid')` row as "active" regardless of `expires_at`.
- No cron wired up yet to call `expire_pending_reservations()`; requires service-role client.

### Service Layer
- `ReservationCreationService.calculateDefaultExpiry()` adds **24 hours**; needs 15-minute default.
- `create_reservation_transaction` RPC is the only code path to create reservations; TS layer passes `p_expires_at`.
- No helper exists to detect "active reservations"; admin layer uses `hasActiveReservations()` (counts pending/paid but ignores expiration).
- `PayPal` + `Stripe` handlers invoke `createReservation()` _after_ payment succeeds, so status remains `pending` until someone manually marks `paid`.

### Public UI
- `app/puppies/[slug]/page.tsx` reads via `getPuppyBySlug` and only checks `puppy.status === 'available'`.
- `ReserveButton` renders Stripe + PayPal buttons whenever `isAvailable` is true; no awareness of active reservations.
- Server action `createCheckoutSession` validates slug/status only; no reservation guard.
- PayPal endpoints (`create-order`, `capture`) likewise ignore pending holds.

### Admin UI
- `fetchAdminPuppies()` only returns puppy fields; no reservation metadata.
- `hasActiveReservations(puppyId)` simply counts rows where `status IN ('pending','paid')`.
- `archivePuppyAction` checks the helper but still allows blocking pending rows forever because TTL isn't enforced.
- `PuppyRow` always shows "Archive" CTA; no badge/tooltip describing reservation state.

### Cron / Background
- No `/api/cron/*` route exists; scheduler not configured to call `expire_pending_reservations()`.
- Need a Next.js (Node runtime) route that enforces a shared secret (`CRON_SECRET`?) before invoking Supabase RPC via service-role client.

## Open Items / Considerations
1. **Status lifecycle** - "pending" never flips to "paid" today. Requirement says paid never expires; confirm whether we should mark as `paid` immediately inside webhook handlers (might be future task).
2. **Active helper location** - central helper in `lib/reservations/queries.ts` should power both admin page and public route. Need to ensure it filters out expired pending rows (`expires_at` null vs. past).
3. **UI messaging** - confirm copy for blocked state: "Reservation in progress - please try again in ~15 minutes".
4. **Cron authentication** - repo currently lacks global cron auth pattern; decide between header token or `CRON_SECRET` env var before exposing route.
5. **Testing** - plan to add Vitest coverage for the new helper + `expire_pending_reservations` RPC call mocking as needed; consider adding Playwright/E2E later per spec.
