# 📋 Анализ незавершенных задач проекта

**Дата анализа:** 2025-12-21
**Анализируемые документы:** SPRINT_PLAN.md, PRD.md, UI_BACKLOG.md, SEO_PLAN.md, QUALITY_PLAN.md, promo-waitlist-plan.md

**✨ Последние изменения (2025-12-22):**

- ✅ Завершен высокий приоритет SEO: LocalBusiness/Product/FAQPage schemas
- ✅ Добавлен NAP block в footer с кликабельными контактами
- ✅ Улучшен Google Maps embed с зонами доставки
- ✅ FAQ расширен: 6→25 вопросов в 6 категориях (Pricing, Delivery, Health, Breeding, AKC, Support)
- ✅ Policies страница подтверждена как готовая (6 секций: Deposit, Health, Delivery, Refunds, Privacy, Documents)
- ✅ Email notifications готовы + production-grade testing plan (Stripe CLI, Idempotency, DMARC, Observability)
- ✅ **LCP оптимизация завершена** (2025-12-22): 1195ms → **414ms (-65%)**, render delay: 724ms → 79ms (-89%)
  - Hero carousel: добавлен fetchPriority="high", убрана transition для первого отображения
  - Preconnect hints: GA4, Facebook Pixel, Crisp Chat
  - Отложенная загрузка: GA4/Facebook Pixel переведены на strategy="lazyOnload"
- 📊 Прогресс: **42/65 задач** завершено (65%)

---

## 🔴 Высокий приоритет (Критично для продакшна)

### SEO & Structured Data (Sprint 4)

**Статус:** ✅ Завершено (2025-12-21)

**Реализовано:**

- [x] **JSON-LD LocalBusiness/PetStore schema** — критично для локального SEO
  - ✅ Реализовано в `lib/seo/structured-data.ts` → функция `getLocalBusinessSchema()`
  - ✅ Добавлено в `app/layout.tsx` (строка 95) — отображается на всех страницах
  - ✅ Включает полный NAP, coordinates, hours, areaServed

- [x] **JSON-LD Product schema** для отдельных щенков
  - ✅ Реализовано в `lib/seo/structured-data.ts` → функция `getProductSchema()`
  - ✅ Добавлено в `app/puppies/[slug]/page.tsx` (строка 156)
  - ✅ Поля: name, price, image, availability, sku, brand, offers

- [x] **JSON-LD FAQPage schema**
  - ✅ Реализовано в `lib/seo/structured-data.ts` → функция `getFaqSchema()`
  - ✅ Добавлено в `app/faq/page.tsx` (строка 31)
  - ✅ Автоматически генерируется из `faq-data.ts`

**Источник:** SPRINT_PLAN.md Sprint 4, SEO_PLAN.md

---

### Контент страницы (Sprint 4)

**Статус:** ✅ Завершено (2025-12-22)

**Реализовано:**

- [x] **FAQ страница** — ✅ Завершено (2025-12-22)
  - ✅ Расширено с 6 до 25 вопросов в 6 категориях
  - ✅ Категории: Reservation & Payments (6), Pickup & Delivery (5), Health & Veterinary (5), Breeding Program (3), AKC Registration (3), Ongoing Support (3)
  - ✅ Добавлены иконки: Heart (Breeding), Award (AKC), MessageCircle (Support)
  - ✅ Safe/neutral формулировки без точных цифр и обещаний
  - ✅ JSON-LD FAQPage schema автоматически обновляется через `faqItemsFlat`
  - Файл: `app/faq/faq-data.ts`

- [x] **Policies страница** — ✅ Завершено (проверено 2025-12-22)
  - ✅ Все 4 требуемые секции реализованы: Deposits, Refunds, Health, Delivery (SPRINT_PLAN.md строка 145)
  - ✅ Дополнительно: Privacy & Payments, Documents & Contracts
  - ✅ JSON-LD MerchantReturnPolicy schema для SEO
  - ✅ Trust signals: "AKC Registered", "Vet Certified", "Secure Payments"
  - ✅ Четкие условия: $300 deposit non-refundable, 12-month health guarantee, flight nanny delivery
  - ✅ Professional формулировки для legal compliance и customer trust
  - Файл: `app/policies/page.tsx`

- [x] **NAP блок в footer** (Name, Address, Phone) — ✅ Завершено (2025-12-21)
  - ✅ Добавлена секция "Contact" в footer с телефоном, email, адресом
  - ✅ Все контакты кликабельны (`tel:`, `mailto:`, Google Maps directions)
  - ✅ Grid layout обновлен: Brand (3 cols) + Explore/Support/Contact (по 2 cols) + Hours (3 cols)
  - Файл: `components/site-footer.tsx` (строки 53-68)

**Источник:** SPRINT_PLAN.md Sprint 4, PRD.md

---

### Локализация и карта (PRD Must Have)

**Статус:** ✅ Частично завершено (2025-12-21)

**Реализовано:**

- [x] **Google Maps embed** с городом в Алабаме
  - ✅ Реализовано в `components/site-footer.tsx` (строки 195-236)
  - ✅ Использует координаты из `BUSINESS_PROFILE.coordinates`
  - ✅ Карта с overlay card: название, адрес, телефон, ссылка на directions
  - ✅ Lazy loading для производительности

- [x] **Зоны доставки** — ✅ Информация добавлена (2025-12-21)
  - ✅ Отображается в map overlay: "Delivery available: Alabama, Georgia, Florida, Tennessee"
  - ✅ Берется из `BUSINESS_PROFILE.areaServed`
  - Файл: `components/site-footer.tsx` (строки 222-225)
  - ⚠️ Стоимость доставки не указана (требуется контент от владельца)

**Источник:** PRD.md (Must Have), SPRINT_PLAN.md Sprint 4

---

### Analytics (Sprint 3 - Phase 5)

**Статус:** ✅ Реализовано (server-side GA4)

**Реализовано:**

- [x] **Server-side GA4 event `deposit_paid`** — Measurement Protocol
  - Файл: `lib/analytics/server-events.ts` (`trackDepositPaid`)
  - Используется в Stripe webhook handler
  - Требуется env: `GA4_API_SECRET`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`
  - В DEV выводится в лог, в PROD отправляет на GA4

**Источник:** SPRINT_PLAN.md Sprint 3, SEO_PLAN.md строка 33

---

## 🟡 Средний приоритет (Важно после запуска)

### Performance & UX (Sprint 5)

**Статус:** Частично реализовано

**Реализовано:**

- [x] **LCP оптимизация** — ✅ Завершено (2025-12-22)
  - ✅ Результат: **LCP 414ms** (было 1195ms) — улучшение на **65%**
  - ✅ Render delay: **79ms** (было 724ms) — улучшение на **89%**
  - ✅ Соответствует Core Web Vitals (цель ≤ 2500ms)
  - **Изменения:**
    - `components/hero-carousel.tsx:52-78` — добавлен `fetchPriority="high"`, убрана transition для первого отображения LCP элемента
    - `app/layout.tsx:72-104` — preconnect hints для GA4, Facebook Pixel, Crisp Chat
    - `components/analytics-provider.tsx:201-242` — GA4 и Facebook Pixel переведены на `strategy="lazyOnload"`
  - **Влияние на третьи стороны:**
    - GTM main thread: 17ms → 9ms (-47%)
    - Facebook Pixel main thread: 19ms → 4ms (-79%)
  - Источник: SEO_PLAN.md строка 26

**Что не хватает:**

- [ ] **Branded 404/500 страницы**
  - Источник: SPRINT_PLAN.md строка 175
  - Файлы: `app/not-found.tsx`, `app/error.tsx`
  - Требуется: Кастомный дизайн с брендингом

**Завершено:**

- [x] **Accessibility audit полный** — ✅ Завершено (2025-12-22)
  - Источник: SPRINT_PLAN.md строка 153
  - Проверено/обновлено: alt texts, focus visible, accordion/FAQ labels, menu focus trap
  - Тесты: `tests/a11y/components.test.tsx`, `tests/a11y/pages.test.tsx`

**Источник:** SPRINT_PLAN.md Sprint 5, SEO_PLAN.md

---

### Infrastructure (Sprint 5)

**Статус:** Частично реализовано

**Что не хватает:**

- [ ] **Supabase backups + restore guide**
  - Источник: SPRINT_PLAN.md строка 176
  - Действие: Настроить автоматические бэкапы в Supabase Dashboard
  - Документация: Создать restore guide

- [x] **Custom domain DNS + HTTPS** — ✅ Завершено (2025-12-22)
  - Источник: SPRINT_PLAN.md строка 178
  - Требуется: Настройка домена через Vercel

- [x] **Email notifications для клиентов**
  - Customer + owner deposit emails реализованы и протестированы (Stripe webhook flow, Resend delivery OK)
  - Файл: `lib/emails/deposit-notifications.ts`; проверено через EMAIL_TESTING_PLAN.md

**Источник:** SPRINT_PLAN.md Sprint 5

---

### Testing (Sprint 5)

**Статус:** Частично реализовано

**Что не хватает:**

- [ ] **E2E полный флоу** `view puppy → chat → reserve → webhook`
  - Источник: SPRINT_PLAN.md строка 173
  - Статус: Частично реализовано (`tests/e2e/reservation.spec.ts`)
  - Нужно: Включить проверку чата (Crisp) в тест

**Источник:** SPRINT_PLAN.md Sprint 5

---

## 🟢 Низкий приоритет (Should Have & Nice to Have)

### Promo Waitlist Feature

**Статус:** UI готов, backend не реализован

**Что не хватает:**

- [ ] **Backend для promo waitlist**
  - UI готов: `components/home/promo-modal.tsx`
  - Источник: `docs/promo-waitlist-plan.md`
  - Нужно:
    - Создать таблицу в Supabase для email подписок
    - Server action для валидации и сохранения email
    - hCaptcha интеграция
    - Email уведомления владельцу о новых подписках
  - Файлы для создания:
    - `app/waitlist/actions.ts` — server action
    - `lib/waitlist/schema.ts` — Zod validation
    - `supabase/migrations/...create_waitlist.sql`

**Источник:** `docs/promo-waitlist-plan.md`

---

### Content & Media (PRD Should Have)

**Статус:** Не реализовано

**Что не хватает:**

- [ ] **Галерея/Stories** — Reels/Shorts embedding
  - Источник: PRD.md строка 37
  - Платформы: YouTube Shorts, Instagram Reels, TikTok
  - Файл: Создать `components/media-gallery.tsx`

- [ ] **Подписка на Telegram-канал** о новых пометах
  - Источник: PRD.md строка 38
  - Требуется: Создать Telegram канал, добавить ссылку на сайт

- [x] **Оптимизация всех изображений** WebP/AVIF ≤ 400 KB — ✅ Завершено (2025-12-22)
  - Источник: SPRINT_PLAN.md строка 154, PRD.md строка 74
  - Статус: Все изображения оптимизированы
  - Действие: Проверка завершена

**Источник:** PRD.md Should Have, SPRINT_PLAN.md

---

### UI Improvements (UI_BACKLOG.md)

**Статус:** Minor issue

**Что не хватает:**

- [x] **Contact Bar выравнивание** с 5 кнопками — ✅ Завершено (2025-12-22)
  - Источник: `docs/planning/UI_BACKLOG.md`
  - Priority: Low
  - Файл: `components/contact-bar.tsx`
  - Проблема: Элементы слегка смещены на определенных размерах экрана
  - Действие: Adjust spacing/padding for 5-button layout

**Источник:** `docs/planning/UI_BACKLOG.md`

---

## 🔧 Quality & DevOps (QUALITY_PLAN.md)

### L1 – Обязательно

**Статус:** ✅ Все задачи L1 завершены

- ✅ L1.1 Type Safety (Supabase types, устранение `any`)
- ✅ L1.2 Prettier formatting
- ✅ L1.3 CI базовый уровень (`npm ci`, порядок шагов)
- ✅ L1.4 Unit-тесты (puppy-card, contact form, deposit calculation)
- ✅ L1.5 E2E reservation flow

---

### L2 – Желательно

**Статус:** Частично реализовано

**Что не хватает:**

- [ ] **L2.1.1 Supabase в CI** с локальной БД и проверкой миграций
  - Источник: QUALITY_PLAN.md строка 384
  - Действие: Добавить Postgres service в CI, запускать `supabase db reset`
  - Статус: Blocked — staging Supabase access issues

- [ ] **L2.2.1 E2E админка → публичный сайт**
  - Источник: QUALITY_PLAN.md строка 431
  - Файл: `tests/e2e/admin.spec.ts`
  - Сценарий: Изменение статуса щенка в админке → проверка на публичном сайте

- [x] **L2.4.1 Интеграционные тесты для платежных API (Stripe)** — ✅ Run (24 Dec 2025)
  - Тест: `tests/integration/stripe-webhook.integration.test.ts`
  - Охват: `checkout.session.completed`, idempotency, bad signature, `checkout.session.expired`
  - Требует: Supabase local + ключи окружения
  - Required env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `STRIPE_WEBHOOK_SECRET`
  - Optional env: `SUPABASE_ANON_KEY`, `STRIPE_SECRET_KEY` (если не делаем Stripe API calls)
  - Ports: API `54321`, DB `54322`
  - Why: Postgres падал на `COALESCE(NEW.id, 0)` из-за `uuid` vs `integer`. Исправлено новой миграцией с UUID placeholder.
  - Запуск:
    - `supabase start`
    - `npx supabase db reset`
    - `SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_SERVICE_ROLE_KEY=... SUPABASE_DB_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres STRIPE_WEBHOOK_SECRET=... npm run test -- tests/integration/stripe-webhook.integration.test.ts`

**Источник:** `docs/planning/QUALITY_PLAN.md`

---

### L3 – Продвинуто

**Статус:** Не реализовано

**Что не хватает:**

- [ ] **L3.1.1 SonarCloud quality gate**
  - Источник: QUALITY_PLAN.md строка 525
  - Действие: Подключить репозиторий к SonarCloud
  - Метрики: coverage ≥ 80%, no critical issues

- [ ] **L3.2.1 Gitleaks в CI** для проверки секретов
  - Источник: QUALITY_PLAN.md строка 543
  - Действие: Добавить job с Gitleaks в `.github/workflows/ci.yml`

- [ ] **L3.2.2 npm audit / Snyk** для зависимостей
  - Источник: QUALITY_PLAN.md строка 556
  - Действие: Добавить `npm audit` в CI

- [ ] **L3.2.3 Разделение ключей Supabase** (prod/staging/CI)
  - Источник: QUALITY_PLAN.md строка 569
  - Действие: Создать отдельные проекты/ключи для каждого окружения

- [ ] **L3.3.1 RLS интеграционные тесты**
  - Источник: QUALITY_PLAN.md строка 583
  - Действие: Тесты для Row Level Security политик

- [ ] **L3.4.1 Sentry** для мониторинга ошибок
  - Источник: QUALITY_PLAN.md строка 601
  - Действие: Подключить Sentry к Next.js фронту и API routes

- [ ] **L3.4.2 Синтетический мониторинг** (Playwright)
  - Источник: QUALITY_PLAN.md строка 615
  - Действие: Регулярные проверки ключевых флоу + Slack уведомления

**Источник:** `docs/planning/QUALITY_PLAN.md`

---

## ✅ Что УЖЕ реализовано (Reference)

### Sprints 0-3 (Core Features)

- ✅ **Sprint 0** — Infrastructure, CI/CD, Supabase setup
- ✅ **Sprint 1** — UI Layout, Puppies Catalog, Routing
- ✅ **Sprint 2** — Contact form, Crisp chat, Analytics (GA4/Meta Pixel), Consent Mode
- ✅ **Sprint 3** — Payments (Stripe + PayPal), Webhooks, Reservations, Idempotency

### Sprint 4 (Partial)

- ✅ **About page** — Updated with breed-focused content
- ✅ **Reviews** — Public submission form with photo uploads (up to 3 photos)
- ✅ **Review Photos** — Client-side uploads via signed URLs
- ✅ **Reviews migration** applied to production

### Sprint 5 (Partial)

- ✅ **Pre-commit hooks** — Husky + lint-staged
- ✅ **Admin Panel** — Puppies CRUD (`/admin/puppies`)
  - Auth (session-based)
  - Create/Edit/Delete puppies
  - Status management
  - Soft delete (archiving)

### Additional Features

- ✅ **Soft delete (archiving)** for puppies
- ✅ **30-day delayed archiving** — pg_cron job
- ✅ **Webhook monitoring & alerting** — Email/Slack alerts for webhook failures
- ✅ **Email notifications** — Owner notifications for inquiries and deposits
- ✅ **Type safety** — Supabase generated types, eliminated `any` in critical flows
- ✅ **CI/CD** — GitHub Actions with lint, typecheck, test, build, E2E
- ✅ **Testing** — Unit tests (Vitest), E2E tests (Playwright), A11y tests

### Quality (L1 Complete)

- ✅ **L1.1** Type Safety (Supabase types, no `any` in critical code)
- ✅ **L1.2** Prettier formatting
- ✅ **L1.3** CI basics (`npm ci`, proper step order)
- ✅ **L1.4** Unit tests (puppy-card, contact form, deposit calculation)
- ✅ **L1.5** E2E reservation flow

---

## 📊 Сводная статистика

### По спринтам

| Sprint   | Статус                        | Прогресс |
| -------- | ----------------------------- | -------- |
| Sprint 0 | ✅ Завершен                   | 100%     |
| Sprint 1 | ✅ Завершен                   | 100%     |
| Sprint 2 | ✅ Завершен                   | 100%     |
| Sprint 3 | ⚠️ Частично (Phase 5 pending) | 95%      |
| Sprint 4 | ✅ Завершен                   | 100%     |
| Sprint 5 | ⚠️ Частично                   | 75%      |

### По категориям

| Категория        | Завершено | В работе | Не начато | Всего  |
| ---------------- | --------- | -------- | --------- | ------ |
| Core Features    | 19        | 1        | 4         | 24     |
| SEO              | 8         | 0        | 1         | 9      |
| Content          | 5         | 0        | 1         | 6      |
| Testing (L1)     | 5         | 0        | 0         | 5      |
| Testing (L2-L3)  | 0         | 0        | 7         | 7      |
| Infrastructure   | 4         | 0        | 3         | 7      |
| Quality (DevOps) | 1         | 0        | 6         | 7      |
| **Итого**        | **42**    | **1**    | **22**    | **65** |

---

## 🎯 Рекомендации по приоритетам

### Критично перед продакшн запуском (1-2 недели)

**🎉 ВСЕ КРИТИЧНЫЕ ЗАДАЧИ ЗАВЕРШЕНЫ!**

**✅ Завершено (2025-12-22):**

- ✅ NAP block в footer
- ✅ JSON-LD structured data (LocalBusiness, Product, FAQPage)
- ✅ Google Maps embed с зонами доставки
- ✅ FAQ страница (6→25 вопросов в 6 категориях)
- ✅ Policies страница (6 секций: Deposit, Health, Delivery, Refunds, Privacy, Documents)
- ✅ Email notifications (customer + owner deposit confirmations)
  - ✅ Production-grade testing plan создан (`EMAIL_TESTING_PLAN.md`)
  - ✅ Включает: Stripe CLI testing, Idempotency tests, DMARC rollout, Deliverability Insights, Observability
  - ✅ Код уже реализован в `lib/emails/deposit-notifications.ts`
  - ⚠️ Требуется: Manual testing перед production deploy (следовать EMAIL_TESTING_PLAN.md)

### Важно в первые недели после запуска (2-4 недели)

1. **Performance:**
   - ✅ ~~Довести LCP до ≤ 2.5s~~ — Завершено! LCP = 414ms (2025-12-22)
   - Создать branded 404/500 страницы

2. **Analytics:**
   - ✅ ~~Настроить server-side GA4 `deposit_paid` event~~ — Уже реализовано в `lib/analytics/server-events.ts`

3. **Infrastructure:**
   - Настроить Supabase backups
   - Подключить custom domain

### Можно отложить (1-3 месяца)

1. **Promo waitlist** — UI готов, backend можно реализовать позже
2. **Stories/Reels галерея** — nice to have
3. **L2/L3 quality improvements** — DevOps luxuries (SonarCloud, Sentry, etc.)

---

## 📝 Заметки

- **Все критичные платежные функции работают** — Stripe, PayPal, webhooks, reservations
- **Безопасность и валидация в порядке** — hCaptcha, rate limiting, email validation
- **Основная функциональность MVP готова** — catalog, contact, payments, admin panel
- **Crisp mobile widget скрыт** — применена более устойчивая детекция мобилок (width/pointer) + viewport meta
- **SEO инфраструктура завершена (2025-12-21)** — LocalBusiness, Product, FAQPage schemas + NAP block
- **Весь контент готов (2025-12-22):**
  - FAQ: 25 вопросов в 6 категориях с safe формулировками
  - Policies: 6 секций (Deposit, Health, Delivery, Refunds, Privacy, Documents)
  - About, Reviews — ранее завершены
- **Email notifications готовы (2025-12-22):**
  - Customer + Owner deposit confirmation emails реализованы
  - Production-grade testing plan создан: EMAIL_TESTING_PLAN.md
  - Включает best practices: Stripe CLI, Idempotency, DMARC, Observability
- **LCP оптимизация завершена (2025-12-22):**
  - LCP улучшен с 1195ms до 414ms (-65%)
  - Render delay улучшен с 724ms до 79ms (-89%)
  - Полностью соответствует Core Web Vitals (цель ≤ 2500ms)
  - Отложенная загрузка третьих сторон: GTM, Facebook Pixel на lazyOnload
- **🎉 ВСЕ КРИТИЧНЫЕ ЗАДАЧИ ДЛЯ ПРОДАКШН ЗАВЕРШЕНЫ!**
- **Sprint 4 завершен** — 100% готовности
- **Sprint 5** — 75% готовности (осталось: branded 404/500, accessibility audit, backups)

---

**Последнее обновление:** 2025-12-22 (LCP оптимизация завершена: 1195ms → 414ms, -65%)
**Следующая ревизия:** После выполнения среднего приоритета (Branded 404/500, Accessibility audit)
