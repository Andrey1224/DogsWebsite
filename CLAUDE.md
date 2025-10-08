Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.

Inter-file context: `Spec1.md` is the product requirements source that informs roadmap
priorities. `SPRINT_PLAN.md` breaks that spec into execution sprints and references the
same feature set. `AGENTS.md` is the contributor guide that explains how to work within
those plans, while this `CLAUDE.md` captures agent-specific operating rules. Review the
spec first, then the sprint plan, then follow `AGENTS.md` so all guidance stays aligned.

Sprint 2 contact stack links several files:
- UI submits via `components/contact-form.tsx`, which calls the server action in `app/contact/actions.ts`. Validation helpers live in `lib/inquiries/schema.ts`; rate-limit logic in `lib/inquiries/rate-limit.ts`; captcha checks in `lib/captcha/hcaptcha.ts`.
- Contact metadata (deep links, copy) is centralized in `lib/config/contact.ts` and reused by the contact bar, contact cards, Crisp welcome/offline text, and analytics payloads. Values originate from `NEXT_PUBLIC_CONTACT_*` env vars; confirm those are set in every environment before expecting updates to appear.
- `components/analytics-provider.tsx` must wrap the app (configured from `app/layout.tsx`) so `ContactBar`, `ContactForm`, and `components/crisp-chat.tsx` can call `useAnalytics().trackEvent`. The consent banner (`components/consent-banner.tsx`) also depends on that provider.
- Crisp integration resides in `components/crisp-chat.tsx`; it dispatches custom `crisp:*` events that `ContactBar` listens to for availability messaging.

When modifying any piece of that pipeline, update the rest of the chain and refresh the docs (`README.md`, `AGENTS.md`, sprint reports) so contributors understand the flow.
