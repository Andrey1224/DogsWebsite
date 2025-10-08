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
- Color tokens live in `app/globals.css`: light palette (`#F9FAFB`/`#FFFFFF` backgrounds, `#111111` / `#555555` typography, `#FFB84D` primary accent, gradient `#FF4D79→#FF7FA5`, aux navy `#0D1A44`) and dark palette (`#0D1A44` / `#1C1C1C` backgrounds, `#FFFFFF` / `#D1D5DB` typography, same accent/gradient, aux gold `#FFD166`). `@theme inline` maps those variables to Tailwind utilities (`bg-bg`, `bg-card`, `text-muted`, `border-border`, `bg-accent-gradient`). Pages and components rely on those classes plus `color-mix` helpers for accent tints. Any new surface should extend the tokens first so both themes stay consistent.
- `components/theme-provider.tsx` applies the chosen theme (`light`, `dark`, or `system`) to `document.documentElement` (setting `data-theme="light" | "dark"`) and persists the preference; the header’s `components/theme-toggle.tsx` calls `useTheme()` to switch modes. Any UI that needs theme awareness should consume that hook rather than duplicating storage or media-query logic.

When modifying any piece of that pipeline, update the rest of the chain and refresh the docs (`README.md`, `AGENTS.md`, sprint reports) so contributors understand the flow.
