# Analytics & Consent Improvements Backlog

This file tracks planned follow-up work for the consent-managed analytics stack
(`components/analytics-provider.tsx`, `lib/analytics/*`, `app/api/analytics/meta/route.ts`).
See `memory-bank/systemPatterns.md` for the current architecture and conventions.

## 1. Re-sanitize Meta CAPI `sourceUrl` server-side, restrict to the site's own domain

**Status**: Pending
**Priority**: Medium
**Component**: `app/api/analytics/meta/route.ts`

**Description**:
`sourceUrl` is currently sanitized client-side (via `lib/analytics/safe-url.ts`) before being
sent to `/api/analytics/meta`, but the server trusts that value as-is (only length-capped). A
compromised or modified client could submit an arbitrary `sourceUrl`. The server should
independently re-run the same allowlist sanitization and additionally reject/replace any URL
whose origin doesn't match the site's own domain, rather than forwarding client-supplied
origins to Meta.

**Proposed approach**:

- Reuse `lib/analytics/safe-url.ts` (or a server-safe variant) inside the route handler.
- Validate `new URL(sourceUrl).origin` against the expected site origin (e.g.
  `NEXT_PUBLIC_SITE_URL`); drop or replace `sourceUrl` if it doesn't match.

## 2. Strengthen the PII filter for event params

**Status**: Pending
**Priority**: Medium
**Component**: `lib/analytics/sensitive-params.ts`, `app/api/analytics/meta/route.ts`

**Description**:
The current `stripSensitiveEventParams()` denylist matches exact key names
(`email`, `phone`, `token`, etc.), case-insensitively. It won't catch keys that merely
_contain_ a sensitive fragment (`customer_email`, `contactPhone`, `user_email_address`), and
the Meta route's `sanitizeCustomData()` only allowlists top-level fields — it doesn't
recursively inspect values that happen to be objects for nested PII.

**Proposed approach**:

- Extend `stripSensitiveEventParams()` to also match keys containing a sensitive fragment
  (substring match against the same denylist terms, still case-insensitive), not just exact
  matches — e.g. `customer_email` and `contactPhone` should be stripped.
- Explicitly reject/drop unknown nested objects/arrays anywhere in event params (defense in
  depth beyond the existing top-level allowlist in `sanitizeCustomData()`).
- Add test cases for:
  - `customer_email` (substring match, not just exact `email`)
  - `contactPhone` (substring match, not just exact `phone`)
  - a nested object containing an `email` key (e.g. `{ user: { email: '...' } }`) — must be
    dropped entirely, not partially forwarded.

---

_Last Updated: 2026-08-03_
