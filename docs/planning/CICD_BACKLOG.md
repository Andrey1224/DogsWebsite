# CI/CD Performance Backlog

This file tracks planned follow-up work for `.github/workflows/ci.yml`. See the
2026-08-04 pipeline audit that already shipped the two highest-value fixes
(dropped `optimize-images` from the CI build step, deduped push/pull_request
runs for same-repo PRs — commit `13eae01`) for baseline numbers.

## 1. Cache Playwright browser binaries

**Status**: Pending
**Priority**: Medium
**Component**: `.github/workflows/ci.yml` ("Install Playwright browsers" step)

**Description**:
Every run does a full `npx playwright install --with-deps`, downloading Chromium/Firefox/WebKit
from scratch (observed 40s–90s per run). The binaries only change when the `@playwright/test`
version bumps.

**Proposed approach**:

- Add an `actions/cache` step keyed on `${{ runner.os }}-playwright-${{ hashFiles('package-lock.json') }}`
  (or the installed Playwright version) caching `~/.cache/ms-playwright`.
- Skip the install step (or run it without `--with-deps`, or with `--with-deps` only on cache
  miss) when the cache hits.

## 2. Parallelize independent CI steps into separate jobs

**Status**: Pending
**Priority**: Low
**Component**: `.github/workflows/ci.yml`

**Description**:
Lint, typecheck, and unit tests currently run sequentially in one job (~1–1.5 min combined) before
Build/E2E. They don't depend on each other and could run as parallel jobs (fanning out after a
shared install/cache step), trimming wall-clock time at the cost of a slightly more complex
workflow (duplicated `env:` blocks or a reusable setup job, separate `npm ci` per job unless
using `actions/cache` for `node_modules`).

**Proposed approach**:

- Split `checks` into `lint`, `typecheck`, `unit-tests`, and `build-and-e2e` jobs.
- Share dependency install via `actions/cache` on `node_modules` (or accept the ~20s `npm ci`
  cost per job, which is already fast thanks to `setup-node`'s npm cache).
- Weigh added workflow complexity against the time saved (likely 1–2 min) before implementing.
