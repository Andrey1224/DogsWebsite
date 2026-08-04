# Fix payment reliability & data-integrity bugs

> **Status: implemented, merged, and deployed 2026-08-03.** All database phases are registered in
> the live Supabase migration history, the payment-safe expiry cron is active, and the complete change
> set passed the `dev` preview pipeline before PR #13 merged into `main` as `7810e34`. Post-merge GitHub
> CI and Vercel production deployment `dpl_8qK7T2bki7eZjTZ9rzRjnwNUhRcz` succeeded. Production homepage,
> application health, and webhook health smoke checks returned HTTP 200. The signed Stripe test-mode
> scenarios are complete; a new live-card charge was intentionally left as an owner-operated check.
> The original analysis and rollout order remain below as an operational record.

## Context

While sandbox-testing the (already-shipped) "Pay Full" feature against the live Supabase database, real
Stripe test payments failed to produce reservation records. Investigating that surfaced a cluster of
money-safety bugs — several pre-existing, one introduced by that same day's security fix. The most severe
class is **"customer is charged, but nothing is recorded, and nobody is told."**

Goal: make the payment path fail _loudly and correctly_ instead of silently losing money, and make the
puppy/reservation status pair self-consistent.

Scope decisions confirmed with the user:

1. Ship a small urgent **hotfix** first (payments are broken in production right now), deeper work second.
2. Safety-net depth: unified error contract + no silent swallowing + always alert + persist the error +
   admin banner. **No** Stripe-API reconciliation job.
3. Refund/cancel **auto-releases** the puppy back to `available`.
4. Fix PayPal too (disabled in the UI today, but carries the same bug).

---

## ⚠️ Read this first — the obvious hotfix causes double-sales

**In this system `pending` does not mean "unpaid". It means "paid, but not yet marked paid."**

The flow is pay-→-then-record: `create_reservation_transaction` is only ever called _after_ money is
captured. It inserts the row as `pending`, and a separate, non-transactional `markPaid` call flips it to
`paid`. So **every row stuck at `pending` is a row where the customer's money was already taken.**

That matters because these two predicates select the _same_ rows:

| Query                           | Predicate                                                                         |
| ------------------------------- | --------------------------------------------------------------------------------- |
| `expire_pending_reservations()` | `status='pending' AND expires_at <= NOW()`                                        |
| `getPaymentStatusMismatches()`  | `status='pending' AND external_payment_id IS NOT NULL AND created_at < now-15min` |

The admin banner's definition of _"a webhook failed, a human must rescue this"_ is byte-for-byte the
population the cron would expire **and release the puppy for**. Shipping the corrected expire function
together with a `vercel.json` cron would convert "customer paid, admin sees a warning" into
**"customer paid, record expired, puppy back on sale, sold to a second customer."**

The only thing preventing this today is the `'canceled'` spelling bug raising 23514 — i.e. the P1 bug is
currently load-bearing. Fixing it naively _arms_ the failure.

**Consequences for the plan:**

- Do **not** ship `vercel.json` in the hotfix. It goes last, separately.
- The expire predicate must gain `AND external_payment_id IS NULL` — "only expire rows that never took
  money." With today's code that means nothing is ever expired, which is the correct answer: there is no
  pre-payment hold flow in this system. Ship it correctly spelled (so it stops raising 23514) but inert.
- The puppy-release step needs the same guard. The "has a reservation row but none active" guard does
  **not** help — once the row wrongly flips to `expired` there is no active row, the guard passes, and the
  puppy is released. It must key on _"no row that ever took money"_.
- A **manual triage gate** belongs between the hotfix and the cron. Size it first:
  ```sql
  SELECT payment_provider, count(*) FROM reservations
  WHERE status='pending' AND external_payment_id IS NOT NULL GROUP BY 1;
  ```

---

## Problems found (verified against the live DB and the repo)

| #   | Problem                                                                                                                                          | Impact                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0  | `lib/reservations/create.ts` called the RPC via the **anon** client; the `REVOKE ... FROM anon` migration removed that grant                     | **Every** Stripe + PayPal payment → `permission denied` → 500, no reservation. Production is broken. _(fix written locally, uncommitted)_                            |
| P1  | Live `expire_pending_reservations()` writes `'canceled'` (one l); the constraint fix allows only `'cancelled'`                                   | Raises 23514 as soon as any expired pending row exists. **Currently load-bearing — see ⚠️ above.**                                                                   |
| P2  | `isUniqueExternalPaymentError()` matches generic `'duplicate key value'` / `'external_payment_id'`                                               | The **puppy-level** unique index error is misread as "duplicate payment" → HTTP 200, no reservation, no alert, no retry. **Silent money loss.**                      |
| P3  | Three layers enforce "puppy taken" with three different errors (RPC sentinel / trigger sentence / index violation); only the first is recognised | Same condition → 200-silent, 500-forever, or 200-swallowed depending on which layer fires                                                                            |
| P4  | `RACE_CONDITION_LOST` returns 200 with no reservation and no alert                                                                               | Customer charged for an already-sold puppy; system reports success                                                                                                   |
| P5  | `markFailed` / `markAsFailed` have **zero** production callers → `processing_error` never written; no admin surface for failed webhooks          | Failures leave no durable trace                                                                                                                                      |
| P6  | RLS is **enabled with zero policies** on `reservations`/`puppies`, but `lib/reservations/queries.ts` uses a module-level **anon** client         | Every `ReservationQueries.*` call silently no-ops: PayPal markPaid, PayPal refund, admin cancel, and `getPaymentStatusMismatches` (the admin's only safety banner)   |
| P7  | Refund (Stripe + PayPal) and admin cancel never touch `puppies.status`                                                                           | Puppy stranded `reserved`/`sold`, silently unsellable forever                                                                                                        |
| P8  | No `vercel.json` → the expiry cron is never scheduled (docs claim it is)                                                                         | The only self-healing job never runs                                                                                                                                 |
| P9  | `ALERT_EMAILS` blank → `''.split(',')` = `['']` (truthy) defeats the `OWNER_EMAIL` fallback; throttle keyed on `provider:eventType` only         | Alerts can go to nobody; distinct failures within 15 min are swallowed                                                                                               |
| P10 | Webhook pre-check matched any prior paid reservation by `puppy_id`                                                                               | Legitimate second payment dropped _(already removed locally, uncommitted)_                                                                                           |
| P11 | `app/api/paypal/capture/route.ts` creates the reservation and **never calls `markPaid` at all**                                                  | Every PayPal reservation ever created is `pending` forever — and is therefore in the blast radius of ⚠️ above                                                        |
| P12 | The 5-minute `processing_started_at` idempotency window returns `duplicate:true, success:true`                                                   | A retry inside 5 min of a failed attempt → **HTTP 200**, Stripe stops retrying, reservation stays `pending` forever. Hit every time by the dashboard "Resend" button |
| P13 | `lib/reservations/queries.ts` has no `import 'server-only'` (unlike `idempotency.ts` / `server-queries.ts`)                                      | Putting the service-role key in that module risks bundling `SUPABASE_SERVICE_ROLE_KEY` into a client chunk                                                           |

Good news: the RPC's `RAISE EXCEPTION` wording has never changed across versions, and
`WebhookEventsServer.markFailed` already exists with the right shape — it just needs calling.

---

## Phase 1 — HOTFIX (small, urgent, ships first)

1. **Service-role for all reservation DB access** (P0/P6)
   - `lib/reservations/queries.ts:21` — replace the module-level `createSupabaseClient()` singleton with a
     lazy cached service-role getter, mirroring `lib/supabase/queries.ts:9-16`.
   - **Add `import 'server-only'` in the same commit** (P13).
   - `lib/reservations/create.ts:305` (`checkDuplicateReservation`) and `create.ts:230`
     (`createWithConfirmedPayment`, which also uses the anon `ReservationQueries.updateStatus`).
   - `lib/reservations/create.ts:60` — already switched locally; keep.

   **Pre-deploy audit** — turning this on makes `hasActiveReservation` (called on the public checkout path,
   `actions.ts:90`) return real data for the first time. Puppies where an admin "cancelled" a reservation
   (a no-op today) and manually flipped the puppy back to `available` will become **unsellable**, with a
   misleading "try again in ~15 minutes" message that never resolves for a `paid` row:

   ```sql
   SELECT p.id, p.slug, p.status, r.status, r.expires_at
   FROM puppies p JOIN reservations r ON r.puppy_id = p.id
   WHERE p.status = 'available'
     AND (r.status='paid' OR (r.status='pending' AND (r.expires_at IS NULL OR r.expires_at > now())));
   ```

2. **Keep** the already-written removal of the `puppy_id`-based pre-check in `lib/stripe/webhook-handler.ts` (P10).

3. **Migration A — rewrite `expire_pending_reservations()`** (P1)
   - Correct spelling so it stops raising 23514; write `'expired'` (the dedicated, currently-unreachable status).
   - **Add `AND external_payment_id IS NULL`** to both the expiry and the puppy-release predicates (⚠️).
   - Use `DROP FUNCTION IF EXISTS` + `CREATE`, not `CREATE OR REPLACE` — some environments still have the
     `RETURNS VOID` variant and replace would fail with _"cannot change return type"_.
   - Never touch a puppy that has zero reservation rows (protects manual admin holds).

4. **Fix P11** — make the PayPal capture route mark the reservation paid.

**Not in the hotfix:** `vercel.json`. See the ordering section.

---

## Phase 2 — Reliability & integrity

### 2.1 One error contract for "puppy taken" (P2, P3)

Reachability note: the RPC checks `puppies.status <> 'available'` and raises `PUPPY_NOT_AVAILABLE` _before_
inserting, so the trigger/index disagreement is only reachable in the desync state
`puppies.status='available'` **and** an active reservation row exists — produced by admin manual edits or by
a careless auto-release helper. Aligning them therefore buys **observability**, not unblocking.

**Preferred fix — sweep inline inside the RPC.** After `SELECT ... FOR UPDATE` on the puppy and before the
availability check: expire that puppy's stale rows (subject to the never-took-money guard), then recompute
availability from reservation rows rather than from `puppies.status` alone. This makes RPC, trigger and
index agree _by construction_ and demotes the cron to janitorial work, removing the hot path's dependency
on a cron for correctness.

**Stop the raw Postgres string escaping at all** — catch it in the RPC and re-raise a sentinel:

```sql
EXCEPTION WHEN unique_violation THEN
  GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
  IF v_constraint = 'idx_one_active_reservation_per_puppy' THEN
    RAISE EXCEPTION 'PUPPY_NOT_AVAILABLE';
  ELSE
    RAISE EXCEPTION 'DUPLICATE_EXTERNAL_PAYMENT';
  END IF;
```

Two cautions: you **must** discriminate on `CONSTRAINT_NAME` (otherwise a genuine
`unique_external_payment_per_provider` violation gets mapped to "puppy taken"); and a plpgsql `EXCEPTION`
block opens a subtransaction — scope it to the INSERT and re-raise, so the `UPDATE puppies SET status=...`
rolls back too.

**Keep the unique index.** The trigger's `SELECT COUNT(*) = 0` is not concurrency-safe — under READ
COMMITTED two concurrent inserts both see zero and both pass. The only reason that hasn't bitten is the
RPC's `FOR UPDATE`, which is a property of one function, not of the table. The index is the only real
double-booking guarantee; dropping it to fix an error-_string_ problem is the wrong trade.

Also narrow `isUniqueExternalPaymentError()` to `unique_external_payment_per_provider` only (defense in
depth), and uncross the codes: `PUPPY_NOT_FOUND` currently maps to code `PUPPY_NOT_AVAILABLE`.

⚠️ **Aligning the trigger has a sting**: `markPaid` sets `status='paid'`, which satisfies the trigger's
UPDATE guard. With a stricter trigger, a puppy carrying a leftover expired-pending row makes `markPaid`
itself raise → 500 → retry loop. This is another reason to prefer the inline sweep over just tightening
the trigger.

### 2.2 Invariant: money taken + nothing recorded ⇒ alert + persist (P4, P5)

- **Implement it inside the handler, not the route.** `app/api/stripe/webhook/route.ts` gates on
  `if (result.success || result.duplicate)`, so `duplicate:true` short-circuits the alert path even when
  `success:false` — and `RACE_CONDITION_LOST` sets `duplicate:true`. Add an explicit
  `alertMoneyTakenNoRecord()` call at the point of failure.
- Return **200** where a retry cannot help (genuinely taken puppy, stale event); **500** only for transient failures.
- Wire up the existing, unused `WebhookEventsServer.markFailed`.
- **Fix P12**: treat `processing_started_at` as a concurrency lock, not a processed marker. `processed=true`
  → 200 (true duplicate); fresh `processing_started_at` but not processed → **500** so it is retried later.
  Never 200 for the latter.
- Tighten the invariant to "money was taken **for a puppy** and nothing was recorded" — if there is no
  `puppy_id` at all, log and persist but do not page.
- `handleChargeRefunded` currently returns `success:false` when no reservation is found → 500 → Stripe
  retries for 3 days → with this invariant, an infinite alert loop on exactly the money-loss case. Make it
  200 + one alert + persisted error.

### 2.3 Auto-release on refund / cancel (P7)

One shared helper (`releasePuppyIfNoActiveReservations(puppyId)`) called from `handleChargeRefunded`,
`handleCaptureRefunded`, and `ReservationQueries.cancel`.

- Its predicate must be **identical to the trigger's**, and it must be a single SQL statement / RPC — not
  read-then-write in TypeScript — or it manufactures the very desync state that makes 2.1 reachable.
- **Partial refunds**: Stripe fires `charge.refunded` for these too and the handler unconditionally sets
  `refunded`. Auto-releasing on a $100 partial refund of a $2,000 sale puts a sold puppy back on the
  market. Gate the release on `charge.refunded === true` / `amount_refunded >= amount`.

### 2.4 Alerting fixes (P9)

- Filter empty strings from `ALERT_EMAILS` before falling back to `OWNER_EMAIL`; assert at least one
  recipient resolves (`to: []` makes Resend throw, and `allSettled` swallows it).
- **Do not key the throttle on event id** — that makes every key unique and removes throttling entirely. Key
  on `provider:paymentIntentId` (stable across Stripe retries and across the
  `completed`/`async_payment_succeeded` pair) plus a global rate cap with a "M more suppressed" summary.
- The in-memory map is per-lambda; N cold instances = N alerts. If throttling must be reliable it belongs in
  Postgres (`last_alerted_at` on `webhook_events`).
- Stale-event (>2h) drops are the worst storm candidate — re-pointing an endpoint or replaying a log dumps
  hundreds at once. Alert once with a count.

### 2.5 Admin visibility

Extend the **existing** yellow banner in `app/admin/(dashboard)/reservations/page.tsx:56-76` — no new page.
Add failed webhook events (`processed=false AND processing_error IS NOT NULL`) and puppy/reservation
desync. Note `getPaymentStatusMismatches` only starts returning rows once Phase 1 fixes its client (P6).

### 2.6 PayPal parity

PayPal inherits the client fix from Phase 1; additionally apply 2.2 and 2.3 to
`lib/paypal/webhook-handler.ts`, plus the P11 `markPaid` fix.

---

## Deploy ordering (each step gates the next)

1. **Phase 1 code** (service-role + `server-only` + P11) — after running the pre-deploy audit query.
2. **Migration A** (`expire_pending_reservations`, inert). Deploy alone.
3. **TypeScript error-mapping deploy — _before_ Migration B.** The mapping is additive (`.includes()`), so a
   build that understands both the old sentence and the new sentinel works against both schemas. The
   reverse order leaves a window where the DB raises a sentinel the deployed code doesn't know → with the
   narrowed matcher no longer catching `duplicate key value`, that path returns **500** and enters a retry loop.
4. **Manual triage** of existing `pending` rows against the Stripe/PayPal dashboards (human gate).
5. **Migration B** (trigger + RPC inline sweep + exception mapping).
6. **Auto-release helper** — must land _after_ Migration B, never before.
7. **`vercel.json` cron — last**, and only once steps 2–6 are verified. Confirm the env var is named exactly
   `CRON_SECRET` (the route 401s otherwise, and Vercel only sends the bearer header for that name). Add an
   alert on any non-200 cron response — otherwise you ship a permanently-401ing cron, which is the same
   silence this whole plan is trying to eliminate.

---

## Verification

Unit/integration (`npx vitest run`). There is currently **no test anywhere** covering
`isUniqueExternalPaymentError` — which is precisely why the silent-money-loss path went unnoticed.
Nothing asserts the trigger's message either, so changing it is safe (`schema.ts:290`'s identical string
constant has zero consumers).

**The double-sale regression test (most important):** seed a `pending` row with
`external_payment_id='pi_x'` and `expires_at` an hour ago, puppy `reserved`. Call
`expire_pending_reservations()`. **Assert the row is still `pending` and the puppy still `reserved`.**

Others:

- Seed `pending` + `external_payment_id IS NULL` + expired → becomes `expired`, puppy → `available`.
- Puppy `reserved` with zero reservation rows (manual admin hold) → untouched.
- Two concurrent `create_reservation_transaction` calls for one puppy → exactly one wins; the loser's error
  contains `PUPPY_NOT_AVAILABLE` and **not** `duplicate key value`.
- A genuine duplicate `external_payment_id` still maps to duplicate-payment, not puppy-taken.
- Expired-pending row present + `markPaid` on a newer row → must not raise (the 2.1 sting).
- Same event twice, 2 min apart, first attempt failed after `markProcessing` → second returns **500**, not 200.
- Sell → refund → re-sell the same puppy end-to-end → succeeds. Partial refund → puppy **not** released.
- `ALERT_EMAILS=''` resolves to `[OWNER_EMAIL]`; 50 distinct failures in 60s → ≤ rate cap.
- A client component importing `lib/reservations/queries.ts` must fail the build.

E2E against the Stripe **sandbox** with `stripe listen`, checking the DB via Supabase MCP after each step:
deposit flow, full-payment flow, the second-payment case that failed during testing (must alert + persist,
not be swallowed), refund → puppy released.

Then `npm run verify`, and update `memory-bank/activeContext.md` per the Definition of Done.

**Test data hygiene**: use a disposable puppy and delete it plus its reservations/webhook_events rows
afterwards. Return `RESEND_DELIVERY_MODE` to `"never"` and restore the live Stripe keys in `.env.local`.

---

## Critical files

- `lib/reservations/queries.ts` — anon client `:21`, missing `server-only`, `hasActiveReservation` `:177`, `getPaymentStatusMismatches` `:358`
- `lib/reservations/create.ts` — error mapping `:120-152`, anon client `:305`, expiry `:242` (JSDoc says 24h, code says 15 min — reconcile)
- `lib/stripe/webhook-handler.ts` — `isUniqueExternalPaymentError` `:107`, `createReservationFromSession` `:477`, refund handler `:841`
- `lib/reservations/idempotency.ts` — the 5-minute window at `:96-108` and `:134-146`
- `lib/paypal/webhook-handler.ts`, `app/api/paypal/capture/route.ts` (P11)
- `lib/webhooks/webhook-events-server.ts` (wire up `markFailed`)
- `lib/monitoring/webhook-alerts.ts`
- `app/admin/(dashboard)/reservations/page.tsx` + its `actions.ts`
- `supabase/migrations/` — Migration A and Migration B
- `vercel.json` (new, last)

## Operational note

Per `CLAUDE.md`, Supabase schema changes must be coordinated with the maintainer. Both migrations change
live production behaviour, so each is applied only after explicit confirmation.
