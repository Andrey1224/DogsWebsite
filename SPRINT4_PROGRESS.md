# Sprint 4 Progress Tracker — SEO, Trust & Local Presence

**Sprint Duration:** _TBD_ (Kickoff to completion)  
**Reference Docs:** `SPRINT_PLAN.md`, `Spec1.md`, `sprint_4_plan_final.md`, `AGENTS.md`, `CLAUDE.md`  
**Tracking Rules:** Update this file daily with status, blockers, next steps. Sync final outcomes into `SPRINT4_REPORT.md`.

---

## 📊 Phase Overview

| Phase | Scope | Status | Target Dates | Notes |
|-------|-------|--------|--------------|-------|
| Phase 1 | Technical SEO (meta, robots, sitemap, images, breadcrumbs) | ✅ Complete | Day 1 | Canonical/meta helper, dynamic robots/sitemap, breadcrumbs, image optimization delivered. |
| Phase 2 | Structured Data (Organization, LocalBusiness, Product, FAQPage, MerchantReturnPolicy) | ✅ Complete | Day 2 | Generators + page integrations live (home, puppies, policies, FAQ, reviews). |
| Phase 3 | Trust Content (Policies, FAQ, Reviews, About, NAP updates) | 🟡 In progress | Day 3 | Reviews page skeleton + NAP/Footer refresh kicked off. |
| Phase 4 | Local Presence (Google Maps embed, GBP sync) | ⬜️ Not started | Day 3–4 | |
| Phase 5 | Accessibility & Core Web Vitals (contrast, focus, alt, CWV tuning) | ⬜️ Not started | Day 4 | |
| Phase 6 | Tests & Documentation (lint/test/e2e, Lighthouse, Rich Results, reports) | ⬜️ Not started | Day 4–5 | |

Legend: ✅ Complete · 🟡 In progress · ⬜️ Not started

---

## ✅ Definition of Done (Sprint 4)

- JSON-LD схемы валидны (`Organization`, `LocalBusiness`, `Product`, `FAQPage`, `MerchantReturnPolicy`).  
- `robots.txt`, `sitemap.xml`, canonical и OG/Twitter мета настроены.  
- Страницы `/faq`, `/policies`, `/reviews` обновлены, Return Policy включена в `/policies`.  
- Контакты и NAP в футере соответствуют `NEXT_PUBLIC_CONTACT_*` и Google Business Profile.  
- Lighthouse SEO/A11y/Perf ≥ 90; CWV: LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms.  
- `npm run lint`, `npm run test`, `npm run e2e` выполнены без ошибок.  
- Скриншоты Lighthouse и Rich Results добавлены в `SPRINT4_REPORT.md`.  
- `.env.example` и Vercel переменные обновлены (если требуются новые LAT/LNG/HOURS).  

---

## 📆 Daily Log

> Формат: `YYYY-MM-DD` — **Phase X** — краткий статус / next steps / blockers.

- 2025-10-13 — **Phase 1** — Стартовали Technical SEO, готовим список мета/robots/sitemap задач. Context7 запросы запланированы для актуальных Next.js и schema.org рекомендаций.
- 2025-10-13 — **Phase 1** — Добавили централизованный SEO-хелпер, обновили метаданные всех страниц, внедрили `app/robots.ts` + `app/sitemap.ts`, удалили устаревший `public/robots.txt`, проверили `npm run lint`.
- 2025-10-13 — **Phase 1** — Развернули компонент `Breadcrumbs` с JSON-LD, подключили его на ключевых страницах, оптимизировали LCP-фото (hero, карточки щенков) через `next/image`, повторно прогнали `npm run lint`.
- 2025-10-13 — **Phase 2** — Добавили `lib/config/business.ts`, JSON-LD генераторы для Organization/LocalBusiness/Product/ReturnPolicy, подключили `JsonLd` компонент, обновили `.env.example` и env-валидацию под LAT/LNG/HOURS, `npm run lint`.
- 2025-10-13 — **Phase 2** — Создали `/faq` с FAQPage JSON-LD, добавили схему на страницу, расширили `app/sitemap.ts`, `npm run lint` (контент черновой, потребуется финальное согласование перед релизом).
- 2025-10-13 — **Phase 3** — Сверстали `/reviews` с ItemList/AggregateRating JSON-LD, расширили хедер навигацией, обновили футер (NAP + карта + часы), синхронизировали env-доки, `npm run lint`.
- 2025-10-14 — **Phase 3** — Заменили FAQ/Policies/Reviews на утверждённые тексты, добавили локальные фото отзывов, обновили MerchantReturnPolicy schema и повторно прогнали `npm run lint`.

---

## 🧭 Next Steps

1. Подготовить финальный контент и медиа для `/reviews` и `/faq`, согласовать с владельцем.  
2. Добавить Google Maps embed/GBP синк и контакт бар с новыми данными (Phase 4 kickoff).  
3. Продолжать обновлять лог и синхронизировать результаты в `SPRINT4_REPORT.md`.

---

_Last updated: 2025-10-13_
