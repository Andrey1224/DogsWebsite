# 🏁 **Sprint 4 Plan (v2.0)**
### Focus: SEO, Trust, Local Presence
**KPI:**  
- Lighthouse SEO ≥ 90 (Mobile)  
- ✅ Rich Results Test OK for Organization, LocalBusiness, Product, FAQPage, ReturnPolicy  
- ✅ Google Search Console shows sitemap indexed ≥ 90%  
- ✅ Core Web Vitals: LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms  

---

## 🌟 **Основные цели**
1. **Technical SEO** — обеспечить индексацию, структурированные данные, и оптимизацию изображений строго по `SPRINT_PLAN.md`.  
2. **Trust Content** — оформить страницы `/policies`, `/faq`, `/reviews` в соответствии со спецификой из `Spec1.md`.  
3. **Local Presence** — добавить точный NAP, карту, `LocalBusiness` и Google Business Profile интеграцию, сохраняя синхронизацию с `lib/config/contact.ts`.  

---

## ⚙️ **Блок 1 — Technical SEO**
- Компонент `<Seo />` с поддержкой title, description, og/tw мета, canonical.
- `app/robots.ts` и `app/sitemap.ts` (Next.js 15): robots.txt и sitemap.xml для всех страниц.
- Миграция `<img>` → `next/image`, WebP/AVIF ≤400KB, preload LCP-изображений.
- Lighthouse Performance ≥ 90.
- Breadcrumbs + JSON-LD `BreadcrumbList` (Дом → Каталог → Щенок).

---

## 🧩 **Блок 2 — Structured Data (JSON-LD)**
Создать `lib/seo/structured-data.ts` с генераторами схем:
| Тип | Назначение | Ключевые поля |
|------|-------------|----------------|
| **Organization** | Владелец сайта | `@type: "Organization"`, `name`, `url`, `logo`, `sameAs[]` |
| **LocalBusiness** | Питомник | `@type: "LocalBusiness"`, `address`, `geo`, `telephone`, `openingHours`, `priceRange`, `areaServed`, `image[]`, `sameAs[]` |
| **Product (Puppy)** | Карточка щенка | `name`, `description`, `image[]`, `brand` (breed), `sku`, `offers.price`, `availability`, `itemCondition: "NewCondition"` |
| **FAQPage** | FAQ | `@type: "FAQPage"`, `mainEntity[]` → вопрос/ответ |
| **ReturnPolicy** | Возвраты | `@type: "MerchantReturnPolicy"`, `returnPolicyCategory`, `merchantReturnDays`, `returnPolicyCountry`, `returnFees`, `returnMethod` |

⚠️ Google 2025: ReturnPolicy должен включать `returnPolicyCountry`, AggregateRating запрещён без реальных отзывов. Проверка через [Rich Results Test](https://search.google.com/test/rich-results).

---

## 💬 **Блок 3 — Trust & Content**
- `/faq` — 5–7 вопросов о доставке, здоровье, гарантии (копия согласована с `Spec1.md`).
- `/policies` — депозит, доставка, гарантия здоровья, privacy, возврат (включая раздел Return Policy с MerchantReturnPolicy JSON-LD).
- `/reviews` — 4–6 отзывов с текстом и медиа (Supabase/YouTube ссылки, подтверждённые владельцем).
- `/about` — актуальный блок о питомнике и лицензиях (обновить, если требуются уточнения).
- Футер: NAP (Name, Address, Phone) из `NEXT_PUBLIC_CONTACT_*` и `lib/config/contact.ts`.

Контент требования: единый формат NAP, телефон в E.164, alt-тексты, уникальный текст без дублей, медиа вне Git (Supabase, YouTube).

---

## 📍 **Блок 4 — Local Presence**
- Подтверждённый Google Business Profile (`Dog Breeder`, `Pet Service`).
- Карта Google Maps embed с `loading="lazy"`.
- Проверить совпадение адреса, телефона и часов в GBP, футере, schema.org.

---

## ♿ **Блок 5 — Accessibility & Core Web Vitals**
- Контраст AA/AAA, alt, aria, tab-навигация, фокус.
- Lighthouse Accessibility ≥ 90.
- CWV: LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms.

---

## 🧪 **Тесты и валидация**
| Тип | Проверка | Инструмент |
|------|-----------|-------------|
| Unit | JSON-LD генераторы | Vitest |
| E2E | canonical, meta, FAQ/JSON-LD | Playwright |
| Audit | Lighthouse SEO + A11y | `npm run lighthouse:seo` |
| Validation | Rich Results Test | Google |
| Indexation | sitemap индексирована ≥90% | GSC |
| Smoke | lint + unit + e2e | `npm run lint`, `npm run test`, `npm run e2e` |

---

## 📦 **Инфраструктура и документация**
- Видео/медиа — вне Git (Supabase, YouTube).
- `.env.example` обновить с адресом, LAT, LNG, HOURS, контактами (если изменятся), синхронизировать с Vercel.
- Вести `SPRINT4_PROGRESS.md` (ежедневные обновления) и `SPRINT4_REPORT.md` (итоги спринта с Lighthouse/Rich Results скриншотами).
- Актуализировать `SPRINT_PLAN.md`, `Spec1.md`, `AGENTS.md`, `CLAUDE.md` при изменении объёма или процесса.
- Зафиксировать в `SPRINT4_PROGRESS.md`, что FAQ контент требует финальной согласованности перед релизом (заметка Phase 3).
- Текущие фото в `/reviews` — заглушки; финальные изображения поставляются клиентом перед релизом и будут оптимизированы (WebP/AVIF ≤400 KB, 1600–1920px) вместе с итоговым Lighthouse прогоном.

---

## ✅ **Definition of Done**
- [ ] JSON-LD схемы валидны ✅  
- [ ] Sitemap.xml и robots.txt корректны ✅  
- [ ] Canonical присутствует ✅  
- [ ] Lighthouse SEO ≥ 90, A11y ≥ 90, Perf ≥ 90 ✅  
- [ ] CWV: LCP ≤ 2.5 s, CLS ≤ 0.1 ✅  
- [ ] Pages `/faq`, `/policies`, `/reviews` опубликованы ✅  
- [ ] Return policy раздел оформлен в `/policies` + MerchantReturnPolicy JSON-LD ✅  
- [ ] Контакты и NAP совпадают с GBP ✅  
- [ ] Sitemap принята в GSC ✅  
- [ ] Фото и видео оптимизированы ✅  
- [ ] Sprint4 Report содержит скриншоты ✅  

---

## 📈 **Трудозатраты**
| Фаза | Время | Описание |
|------|--------|-----------|
| Technical SEO | 0.5–1 д | метаданные, sitemap, robots |
| Structured Data | 1 д | 5 схем JSON-LD |
| Trust Content | 0.5–1 д | страницы FAQ, Policies, Reviews |
| Local Presence | 0.5 д | карта, NAP, GBP |
| Accessibility & CWV | 0.5 д | alt, контраст, perf |
| Tests & Docs | 0.5 д | Playwright, Lighthouse, отчет |
| **Итого** | **3–4 дня** | один dev, 100% готовность |
