# Documentation Map

## Core Documentation (Root Directory)

**Primary References:**

- [`README.md`](../README.md) - Project setup, quick start, tech stack
- [`CLAUDE.md`](../CLAUDE.md) - AI agent operating manual, architecture overview, commands
- [`AGENTS.md`](../AGENTS.md) - Contributor practices and coding guidelines
- [`Spec1.md`](../Spec1.md) - Product requirements document (PRD)
- [`SPRINT_PLAN.md`](../SPRINT_PLAN.md) - Master execution roadmap
- [`GEMINI.md`](../GEMINI.md) - Google Gemini AI context and project overview

---

## Database (`docs/database/`)

**Migration Management:**

- [`migrations.md`](database/migrations.md) - Database migration tracking and status
- [`migration-guide.md`](database/migration-guide.md) - Step-by-step migration procedures

---

## Admin Panel (`docs/admin/`)

**Requirements & Planning:**

- [`admin-panel-prd.md`](admin/admin-panel-prd.md) - Product requirements, scope, NFRs, DoD
- [`admin-panel-changelog.md`](admin/admin-panel-changelog.md) - Implementation history and bugfixes

**Architecture Decision Records (ADRs):**

- [`adr-parent-metadata.md`](admin/adr-parent-metadata.md) - Parent metadata architecture evolution
- [`adr-client-side-uploads.md`](admin/adr-client-side-uploads.md) - File upload implementation (signed URLs)

---

## Payments (`docs/payments/`)

- [`payments-architecture.md`](payments/payments-architecture.md) - Stripe + PayPal integration architecture

---

## Deployment (`docs/deployment/`)

**Feature Deployment Guides:**

- [`soft-delete-feature.md`](deployment/soft-delete-feature.md) - Soft delete (archiving) deployment instructions

---

## Design & UI (`docs/design/`)

Currently empty. Future home for:

- UI/UX specifications
- Design system documentation
- Component library guidelines

---

## Sprint History (`docs/history/sprints/`)

**Completed Sprints:**

- [`sprint-0-report.md`](history/sprints/sprint-0-report.md) - Initial setup & foundation
- [`sprint-1-report.md`](history/sprints/sprint-1-report.md) - Catalog & static pages
- [`sprint-2-report.md`](history/sprints/sprint-2-report.md) - Contact system & analytics
- [`sprint-3-report.md`](history/sprints/sprint-3-report.md) - Payment flow & reservations
- [`sprint-4-report.md`](history/sprints/sprint-4-report.md) - SEO & trust content
- [`sprint-5-report.md`](history/sprints/sprint-5-report.md) - Test coverage initiative

---

## Archive (`docs/archive/`)

**Historical Artifacts:**

- `EBL_Admin_Panel_PLAN.md` - Original admin panel implementation plan
- `PARENT_SELECTION_REPORT.md` - Parent dropdown → direct selection refactor
- `PARENT_SELECTION_IMPLEMENTATION_REPORT.md` - Metadata fields implementation

**Incident Reports (`docs/archive/incidents/`):**

- [`2025-02-urgent-migration.md`](archive/incidents/2025-02-urgent-migration.md) - Emergency migration fix documentation

These files are kept for historical reference but superseded by current ADRs.

---

## Documentation Maintenance

When making changes, keep these synchronized:

- Core docs (README, CLAUDE, AGENTS, Spec1, SPRINT_PLAN)
- Admin changelog when adding features
- Create new ADRs for significant architectural decisions
- Update sprint reports at sprint completion

**Contributing:** See [`AGENTS.md`](../AGENTS.md) for documentation standards.
