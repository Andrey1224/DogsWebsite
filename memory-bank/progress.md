# Project Progress

## Milestones

- [x] **Sprint 0-5**: Core platform, payments, admin, SEO, testing coverage (Completed Feb 2025).
- [x] **LCP Optimization**: Achieved ~500ms improvement (Jan 2025).
- [x] **Reviews MVP**: Public reviews with photo uploads (Feb 2025).
- [x] **Payment Enhancements**: Automated refunds, Admin Dashboard, Critical Stripe Fix (Jan 2026).
- [ ] **AI Context Standards**: Memory Bank adoption & Docs Linting (In Progress).

## Recent Wins

- Fixed admin puppy status dropdown not reflecting database updates after page refresh.
- Fixed critical Stripe webhook bug preventing "paid" status updates.
- Consolidated fragmented history files into `docs/history/`.
- Established `docs/llms.txt` as the documentation source of truth.

## Known Debt

- **Manual Docs Sync**: `public/llms.txt` relies on `npm run docs:sync-llms`.
- **E2E Coverage**: Rate-limiting and full checkout flows need deeper E2E coverage (currently mocked).
