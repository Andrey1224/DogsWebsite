# 🐾 Sprint 2 Plan — Contacts, Chat, Analytics

**Sprint window:** 5 working days (target)  
**Primary goal:** Capture inbound leads reliably, surface real-time chat, and instrument conversion analytics.

---

## Objectives
- Enable visitors to submit inquiries that persist to Supabase with basic spam protection.
- Configure Crisp chat for proactive engagement and graceful offline handling.
- Track key engagement and conversion events in GA4 and Meta Pixel with consent controls.

---

## Deliverables (Definition of Done)
- Contact form on `/contact` (and contextual embeds) writes to `inquiries` with server-side validation, hCaptcha, and rate limiting.
- Crisp widget loads with project Website ID, displays tailored welcome/offline messaging, and links to fallback channels.
- GA4 and Meta Pixel fire `contact_click`, `form_submit`, `form_success`, and `chat_open` (with consent gating and channel metadata).
- Consent banner controls GA/Pixel load state in compliance with Consent Mode v2 (`ad_user_data`, `ad_personalization`).
- Playwright MCP regression updated to cover contact form happy path + filter-to-inquiry smoke.
- Documentation refreshed: `README.md` environment setup, `AGENTS.md`/`CLAUDE.md` relationship notes, `SPRINT2_PLAN.md` & post-sprint report placeholder.

---

## Backlog & Task Breakdown

| # | Workstream | Tasks | Owner | Dependencies |
|---|-------------|-------|-------|--------------|
| 1 | Inquiry pipeline | Implement `ContactForm` server action → Supabase `inquiries`; add schema validation (Zod); persist metadata (source, puppy slug); wire success/failure UI states. | Dev | Supabase env, form shell in `components/contact-form.tsx`. |
| 2 | Anti-spam | Integrate hCaptcha (server verify via secret key env); add per-IP + per-email rate limiting (KV or Supabase function); log rejects for monitoring. | Dev | hCaptcha keys (user to supply). |
| 3 | Channel links | Audit all CTA buttons; inject `tel:`, `wa.me`, `mailto:` patterns from live contact info; add structured data for contact points. | Dev | Final phone/email from user. |
| 4 | Crisp experience | Load Crisp script lazily; configure `window.$crisp` settings (greeting, offline message → WhatsApp); expose Crisp status in footer/contact. | Dev + Owner | Crisp dashboard access (Owner to confirm copy). |
| 5 | Analytics | Implement GA4/Pixel helpers respecting consent; create event dispatcher; map filters/contact/chat events; document required env vars. | Dev | GA4/META IDs (Owner). |
| 6 | Consent & privacy | Add consent banner (Cookiebot-like custom); persist choices (localStorage + server cookie); reconfigure analytics runtime on toggle. | Dev | Legal copy from Owner. |
| 7 | QA & docs | Update unit tests (vitest) for contact utils; extend Playwright MCP suite; run full lint/type/test; write `SPRINT2_REPORT.md`. | Dev | Prior tasks complete. |

---

## Risks & Mitigations
- **Missing third-party keys/content** → Document required values early; block tasks 2,3,5,6 until provided.
- **Spam/abuse** → Combine hCaptcha with rate limiting and server-side validation; monitor Supabase logs.
- **Consent compliance** → Default to denied; load analytics only post-consent; ensure fallback behaviour tested.
- **Crisp outages** → Provide secondary contact options (WhatsApp/phone) in offline message and footer.

---

## QA & Validation Plan
- Unit: Zod schema, Supabase insert helpers, rate-limit utilities.
- Integration: Playwright MCP scenario — submit valid contact, assert success toast + Supabase row; negative test for missing captcha.
- Manual: Verify Crisp welcome/offline states, GA4 debug view events, Meta Pixel helper via Meta Test Events tool.

---

## Documentation & Reporting
- Keep `README.md` and `.env.example` aligned with new env vars (`HCAPTCHA_SITE_KEY`, `HCAPTCHA_SECRET_KEY`, GA/Pixel IDs).
- Update `AGENTS.md` & `CLAUDE.md` with new module interactions once implemented.
- Prepare `SPRINT2_REPORT.md` template mid-sprint to avoid omissions at close.

---

## Next Steps for Owner
1. Provide production contact phone/email/WhatsApp/Telegram handles.
2. Share hCaptcha site + secret keys (or confirm alternate spam solution).
3. Supply GA4 measurement ID + Meta Pixel ID when ready to activate tracking.
4. Confirm desired Crisp greetings/offline copy and business hours.

_Revision: 2025-02-16_
