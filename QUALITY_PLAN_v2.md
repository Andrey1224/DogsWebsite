# Puppywebsite – План улучшения качества и надёжности (v2)

Этот документ описывает шаги по усилению типобезопасности, тестового покрытия и CI/CD
для проекта **Puppywebsite** (Next.js + TypeScript + Supabase) с упором на:

- понятные уровни приоритета,
- конкретные шаги,
- метрики «готово / не готово» (Definition of Done),
- место для владельцев и сроков.

Рекомендуется хранить файл в репозитории как `docs/QUALITY_PLAN.md`.

---

## Как использовать этот план

- У каждой ключевой задачи должны быть:
  - **Owner** – ответственный разработчик/тимлид;
  - **Target date** – плановая дата завершения;
  - **Status** – `TODO / In Progress / Done`;
  - **DoD (Definition of Done)** – 2–5 конкретных критериев, по которым однозначно понятно, что задача завершена.
- План удобно использовать как основу для спринтов:
  - при планировании заполнять `Owner`, `Target date`, `Status`;
  - считать задачу завершённой только если все пункты её DoD выполнены и CI зелёный..

---

## Уровни

- **L1 – Обязательно**: нужно сделать в первую очередь, чтобы прод был безопасным.
- **L2 – Желательно**: следующий шаг после L1, улучшает устойчивость и DX.
- **L3 – Продвинуто**: когда база закрыта, усиливаем качество до enterprise-уровня.

---

## L1 – Обязательно

Минимальный набор задач, чтобы проект был безопасен для продакшена
(особенно вокруг платежей, резерваций и админки).

### L1.1. Type Safety и Supabase Types

**Цель:** убрать `any/unknown` из критичных потоков и перестать держать типы БД руками.

#### Задача L1.1.1 – Генерация типов Supabase

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** Done

**Шаги:**

_Важно: Supabase CLI (включая `npm run supabase:types`) запускаем только локально вручную — Codex/CI не выполняют эту команду._

1. Добавить скрипт в `package.json`:
   ```jsonc
   {
     "scripts": {
       "supabase:types": "supabase gen types typescript --linked > lib/supabase/database.types.ts",
     },
   }
   ```
2. Один раз запустить локально:
   ```bash
   npx supabase gen types typescript --linked > lib/supabase/database.types.ts
   ```

**DoD:**

- [x] В репозитории есть `lib/supabase/database.types.ts`.
- [x] `npm run supabase:types` отрабатывает без ошибок локально.
- [x] `npm run typecheck`, `npm run test` и `npm run build` проходят локально и в CI после генерации типов (typecheck/test ✅ в песочнице, `npm run build` подтверждён локально пользователем, см. лог от `npm run build`).

---

#### Задача L1.1.2 – Перевести код на `Database[...]` и удалить ручные модели

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** Done

**Шаги:**

1. В местах, где используются модели из `lib/supabase/types.ts`, заменить их на:

   ```ts
   import type { Database } from '@/lib/supabase/database.types';

   type PuppyRow = Database['public']['Tables']['puppies']['Row'];
   type PuppyInsert = Database['public']['Tables']['puppies']['Insert'];
   type PuppyUpdate = Database['public']['Tables']['puppies']['Update'];
   ```

2. Постепенно выпилить самописные интерфейсы из `lib/supabase/types.ts`.
3. До полного перехода оставить в `lib/supabase/types.ts` только alias’ы на `Database[...]`, чтобы не ломать существующие импорты; после успешной миграции файл можно удалить.

**DoD:**

- [x] `lib/supabase/types.ts` больше не содержит ручных интерфейсов БД (теперь все экспортируемые модели — alias’ы на `Database[...]`).
- [x] Все места, где используются типы таблиц, ссылаются на `Database[...]` (каждый импорт тянет тип из `lib/supabase/database.types.ts` через новые alias’ы в `lib/supabase/types.ts`; следующий шаг — постепенно удалять сами alias’ы, когда модули перейдут на прямые импорты).
- [x] `npm run typecheck` проходит без новых ошибок.

---

#### Задача L1.1.3 – Убрать `any/unknown` в платежах и админ-кверях

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** Done

**Зона:**

- `lib/stripe/webhook-handler.ts`
- `app/api/stripe/webhook/route.ts`
- `lib/admin/puppies/queries.ts`
- любые runtime-модули в `lib/reservations/*.ts` (тесты могут продолжать использовать `as any` для моков)

**Шаги:**

1. В `webhook-handler.ts` заменить `any/unknown` на официальные типы Stripe:

   ```ts
   import Stripe from 'stripe';

   type StripeEvent = Stripe.Event;
   ```

2. Развести обработчики по типам событий (`payment_intent.succeeded`, `checkout.session.completed` и т.п.), чтобы минимизировать касты.
3. В `queries.ts` использовать `PuppyRow / PuppyInsert / PuppyUpdate` вместо `any` и цепочек `as unknown as`.

**DoD:**

- [x] В указанных runtime-файлах нет «голых» `any`/`unknown as` (Stripe webhook payloadы сериализуются в `Json`, админ-запросы используют типизированные `returns<...>()` без двойных кастов).
- [x] Для webhook’ов Stripe используются типы из Stripe SDK как в обработчике, так и в `app/api/stripe/webhook/route.ts` (обработчик принимает `Stripe.Event`, вспомогательная сериализация приводит payload к JSON).
- [x] Команда `rg -n "\bas any\b" lib app | grep -v '\.test'` не возвращает новых попаданий (проверено в рамках задачи).
- [x] Все изменения проходят `npm run typecheck` и тесты.

---

### L1.2. Форматирование (Prettier)

**Цель:** единый стиль кода, без форматного мусора в PR.

#### Задача L1.2.1 – Включить Prettier и формат-чек

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** Done

**Шаги:**

1. Убедиться, что `prettier` указан в `devDependencies` (он уже установлен в репозитории).
2. Создать `prettier.config.cjs` в корне:
   ```js
   /** @type {import("prettier").Config} */
   module.exports = {
     semi: true,
     singleQuote: true,
     trailingComma: 'all',
     printWidth: 100,
   };
   ```
3. Добавить (или обновить) скрипты в `package.json`:
   ```jsonc
   {
     "scripts": {
       "format": "prettier --check .",
       "format:fix": "prettier --write .",
     },
   }
   ```
4. В `.github/workflows/ci.yml` добавить шаг после установки зависимостей и перед `lint`:
   ```yaml
   - name: Prettier
     run: npm run format
   ```

**DoD:**

- [x] В репозитории есть `prettier.config.cjs`.
- [x] `npm run format` проходит локально (`npm run format:fix` применён один раз, затем `npm run format` → ✅).
- [x] CI падает, если форматинг не соответствует (шаг Prettier добавлен в `.github/workflows/ci.yml` перед `lint`).

---

### L1.3. CI – базовый уровень

**Цель:** воспроизводимые сборки и предсказуемый пайплайн.

#### Задача L1.3.1 – Перейти на `npm ci`

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** Done

**Шаги:**

1. В `.github/workflows/ci.yml` заменить:
   ```yaml
   run: npm install
   ```
   на:
   ```yaml
   run: npm ci
   ```

**DoD:**

- [x] Все CI job’ы используют `npm ci` (шаг Install dependencies обновлён, перезапуск workflow ещё не проверен).
- [ ] CI успешно проходит после изменения (потребуется дождаться ближайшего PR/Push; пока отметка оставлена открытой).

---

#### Задача L1.3.2 – Проверить порядок шагов CI

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** Done

**Требуемый порядок в CI:**

1. Установка зависимостей (`npm ci`).
2. `npm run lint`.
3. `npm run typecheck`.
4. `npm run test` (Vitest).
5. `npm run build` (Next.js).
6. Playwright против **прод-билда**, а не `next dev`:
   - reuse готового билда из шага 5;
   - поднять `next start` (например, через `start-server-and-test` или `concurrently`);
   - только после этого запускать `npm run e2e`.

**DoD:**

- [x] В workflow явно видны шаги 1–6, без запуска Playwright на `next dev` (после Unit tests запускается `npm run build`, затем Playwright ставит браузеры и `npm run e2e`; в `playwright.config.ts` при `CI` сервер стартует через `npm run start -- --hostname 0.0.0.0 --port 3000`).
- [x] Падение на любом шаге блокирует merge в `main` (workflow состоит из последовательных шагов; action остаётся единственной проверкой перед main).

---

#### Задача L1.3.3 – Ограничить доступ CI к Supabase

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** TODO

**Шаги:**

1. Проверить, какие ключи использует `scripts/verify-constraints.mjs`.
2. Создать отдельный сервисный ключ для тестового/стейджинг-проекта Supabase.
3. Использовать этот ключ в CI вместо прод-ключа.

**DoD:**

- [ ] Прод-сервисный ключ Supabase не используется в CI.
- [ ] Все проверки схемы/constraints (`scripts/verify-constraints.mjs` и Supabase CLI) проходят на тестовой базе.
- [ ] В workflow прописаны отдельные переменные вроде `SUPABASE_URL_CI` / `SUPABASE_SERVICE_ROLE_CI`.

---

### L1.4. Unit-тесты – ключевые флоу

**Цель:** защитить отображение статусов, валидацию форм и расчёт депозита.

#### Задача L1.4.1 – Тесты для `components/puppy-card.tsx`

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** TODO

**Шаги:**

1. Создать файл `components/puppy-card.test.tsx`.
2. Написать тесты (React Testing Library), используя `data-testid="puppy-card"`:
   - `available` → зелёный бейдж, CTA “View details” виден.
   - `reserved` → янтарный бейдж с текстом `reserved`.
   - `sold` → серый бейдж, CTA остаётся, но статус отражает `sold`.

**DoD:**

- [ ] Файл `puppy-card.test.tsx` присутствует.
- [ ] Описанные сценарии покрыты тестами.
- [ ] `npm test` проходит локально и в CI.

---

#### Задача L1.4.2 – Валидация формы контакта/резервации

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** TODO

**Шаги:**

1. В `components/contact-form.test.tsx` добавить сценарии:
   - Пустые или невалидные `name/email` + отсутствие капчи → кнопка `Share my inquiry` дизейблится, показываются ошибки ARIA.
   - Валидные данные (phone можно оставить пустым) + клик по виджету bypass → кнопка разблокирована и вызывается `submitContactInquiry`.

**DoD:**

- [ ] Есть тесты, которые ломаются при отключении required-полей или капчи.
- [ ] Все тесты проходят при текущей логике формы (включая bypass токен).

---

#### Задача L1.4.3 – Выделить и протестировать расчёт депозита

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** TODO

**Шаги:**

1. Вынести логику расчёта из:
   - `app/puppies/[slug]/page.tsx`,
   - `app/api/paypal/create-order/route.ts`
     в модуль `lib/payments/deposit.ts`.
2. Реализовать функцию, например:
   ```ts
   export function calculateDeposit(options: {
     price: number;
     mode: 'fixed' | 'percent';
     cap?: number;
     fixedAmount?: number;
     percent?: number;
   }) {
     // ...
   }
   ```
3. Написать Vitest-тесты:
   - фиксированный депозит;
   - процент от цены с потолком;
   - граничные значения.

**DoD:**

- [ ] Весь расчёт депозита живёт в одном модуле.
- [ ] Основные сценарии покрыты тестами.
- [ ] Изменение формулы ломает хотя бы один тест.

---

### L1.5. E2E – клиентский сценарий бронирования

**Цель:** проверить полный путь пользователя от главной до успешной резервации.

#### Задача L1.5.1 – E2E сценарий бронирования щенка

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** TODO

**Шаги:**

1. Создать `tests/e2e/reservation.spec.ts`.
2. Реализовать сценарий:
   - открыть главную страницу;
   - выбрать щенка → перейти на `/puppies/[slug]`;
   - нажать “Reserve” / “Start reservation`;
   - заполнить форму (имя, email, телефон и т.п.);
   - отправить (мок Stripe/PayPal, bypass hCaptcha через `NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN`);
   - проверить сообщение об успехе или страницу “Thank you”.

> Примечание: этот тест должен запускаться в CI в режиме, описанном в задаче L1.3.2 (Playwright против прод-билда).

**DoD:**

- [ ] Тест падает при поломке флоу бронирования.
- [ ] Для теста задокументированы переменные (`NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN`, заглушки Stripe/PayPal) и они инжектятся через CI.
- [ ] Тест стабильно проходит в CI.

---

## L2 – Желательно

Усиление миграций, админки, DX и интеграционных тестов,
когда задачи уровня L1 закрыты.

### L2.1. Supabase в CI (локальный Postgres + миграции)

#### Задача L2.1.1 – Проверка миграций на чистой БД

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** TODO

**Шаги:**

0. Убедиться, что в репозитории есть `supabase/config.toml` с DSN для локальной БД (если нет — создать).
1. Добавить сервис Postgres в одну из CI job:
   ```yaml
   services:
     postgres:
       image: postgres:16
       ports: ['5432:5432']
       env:
         POSTGRES_PASSWORD: password
   ```
2. Установить Supabase CLI в CI (`supabase/setup-cli`).
3. Выполнить:
   ```yaml
   - name: Supabase DB reset
     run: npx supabase db reset --force --env ci
   ```

**DoD:**

- [ ] Любая поломанная миграция ломает CI.
- [ ] `supabase db reset --force` успешно проходит в CI.

---

#### Задача L2.1.2 – Интеграционные тесты против локальной БД

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** TODO

**Зона:** `lib/reservations/queries` и другие ключевые запросы к БД.

**DoD:**

- [ ] Есть тесты, которые:
  - создают тестовые записи;
  - проверяют корректность выборок, сортировок, фильтров.
- [ ] Тесты выполняются после `db reset` и проходят в CI.

---

### L2.2. E2E админка → публичный сайт

#### Задача L2.2.1 – E2E сценарий изменения статуса щенка

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** TODO

**Шаги:**

1. В `tests/e2e/admin.spec.ts` добавить сценарий:
   - логин под админом;
   - открытие списка щенков;
   - изменение статуса (`Available → Reserved` и т.п.);
   - переход на публичный сайт;
   - проверка, что статус/отображение щенка обновились.

**DoD:**

- [ ] Тест падает, если флоу обновления статуса сломан.
- [ ] Тест стабильно проходит в CI.

---

### L2.3. Pre-commit хуки (DX)

#### Задача L2.3.1 – Husky + lint-staged

_Примечание: CI уже блокирует невалидный код; хуки не обязательны, но повышают комфорт локальной разработки._

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** TODO

**Шаги:**

1. Установить:
   ```bash
   npm install -D husky lint-staged
   npx husky install
   ```
2. В `package.json` добавить:
   ```jsonc
   "lint-staged": {
     "*.{ts,tsx,js,jsx}": [
       "eslint --fix",
       "prettier --write"
     ],
     "*.{json,md,css,scss}": [
       "prettier --write"
     ]
   }
   ```
3. Создать `.husky/pre-commit`:

   ```bash
   #!/bin/sh
   . "$(dirname "$0")/_/husky.sh"

   npx lint-staged
   ```

**DoD:**

- [ ] Pre-commit хук установлен и запускается при `git commit`.
- [ ] Нельзя закоммитить неотформатированный/поломанный код.

---

### L2.4. Интеграционные тесты для платежных API

#### Задача L2.4.1 – Тесты для PayPal/Stripe route’ов

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** TODO

**Зона:**

- `app/api/paypal/create-order/route.ts`
- `app/api/stripe/webhook/route.ts`
- сервисные слои `lib/stripe/webhook-handler.ts` и `lib/reservations/create.ts`.

**DoD:**

- [ ] Есть тесты на валидный запрос (корректный JSON-ответ).
- [ ] Есть тесты на невалидный запрос (корректные ошибки).
- [ ] Формирование сумм/валюты согласовано с `calculateDeposit`.

---

## L3 – Продвинуто

Для долгосрочного развития и «enterprise»-стандарта.

### L3.1. Quality Gate (SonarCloud или аналог)

#### Задача L3.1.1 – Подключить SonarCloud и настроить quality gate

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** TODO

**DoD:**

- [ ] Репозиторий подключён к SonarCloud.
- [ ] В Sonar видны отчёты coverage от Vitest и Playwright.
- [ ] Настроен quality gate (например, по новому коду: coverage ≥ 80%, нет новых critical/major issues).
- [ ] PR считается зелёным только при успешном CI и прошедшем quality gate.

---

### L3.2. Security и секреты

#### Задача L3.2.1 – Gitleaks в CI

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** TODO

**DoD:**

- [ ] В CI есть job с Gitleaks.
- [ ] Любая утечка секретов ломает CI.

---

#### Задача L3.2.2 – Проверка зависимостей

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** TODO

**DoD:**

- [ ] В CI есть шаг `npm audit` (или Snyk / Dependabot).
- [ ] Нет незакрытых critical уязвимостей в зависимостях.

---

#### Задача L3.2.3 – Развести сервисные ключи Supabase

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** TODO

**DoD:**

- [ ] Есть отдельные ключи для prod / staging / CI.
- [ ] В CI используются только тестовые/минимальные по правам ключи.

---

### L3.3. RLS и бизнес-правила (интеграционные проверки)

#### Задача L3.3.1 – Тесты, проверяющие RLS

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** TODO

**DoD:**

- [ ] Есть тесты, подтверждающие, что:
  - анонимный пользователь не видит архивных/скрытых щенков;
  - админ видит полный список;
  - операции создания/редактирования резерваций недоступны извне, если так задумано политиками.

---

### L3.4. Наблюдаемость и синтетика

#### Задача L3.4.1 – Подключить Sentry (или аналог)

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** TODO

**DoD:**

- [ ] Sentry подключён к Next.js фронту.
- [ ] Sentry получает ошибки из API routes / edge functions.
- [ ] Есть базовые алерты (например, по росту ошибки 5xx).

---

#### Задача L3.4.2 – Синтетический мониторинг ключевых флоу

- **Owner:** _TBD_
- **Target date:** _TBD_
- **Status:** TODO

**DoD:**

- [ ] Есть простой Playwright-скрипт, который регулярно проверяет:
  - доступность главной страницы;
  - рендер списка щенков;
  - открытие формы резервации.
- [ ] Настроены уведомления (Slack/Telegram/email) при падении проверки.

---

## Порядок внедрения (рекомендация)

1. **L1 – Обязательно**  
   Supabase types → уборка `any` в платежах/админке → Prettier → `npm ci` → unit-тесты `puppy-card`/формы/депозита → E2E флоу бронирования.

2. **L2 – Желательно**  
   Supabase в CI с локальной БД → E2E админки → pre-commit хуки → интеграционные тесты для платежей.

3. **L3 – Продвинуто**  
   SonarCloud/quality gate → Gitleaks + проверки зависимостей → RLS-тесты → наблюдаемость и синтетика.

После закрытия L1 проект уже будет значительно более устойчивым
к регрессиям и «тихим» багам, особенно в денежных и админских сценариях.
