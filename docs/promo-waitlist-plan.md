# Promo waitlist implementation notes

- **Data store**: Decide target (Supabase/Prisma/email service). Schema should capture `email`, `source` (promo modal), timestamps, and basic client metadata (IP/user agent if allowed), plus opt-in flag.
- **Server handler**: Add Next App Router server action or API route to validate email (zod), de-dupe, persist, and return structured `{ success | error }`.
- **Abuse protection**: Wire hCaptcha/ReCaptcha on the client and verify tokens server-side before saving.
- **UI wiring**: Replace `defaultSubscribe` stub in `components/home/promo-modal.tsx` with the real subscribe function and surface server errors to the toast.
- **Notifications/ops**: Emit a log/Slack/webhook on new signup and log errors (`console.error` minimum).
- **Testing**: Unit-test the validator/handler; add e2e/Playwright happy-path + invalid-email flow to ensure modal submit works end-to-end.
- **Env/config**: Document any new secrets (.env.example) and refresh local `.env.local` before running `npm run verify`.
