# EBL Admin Panel PRD (TL;DR Version)

tl;dr

Встроенная админка /admin в существующий Next.js-сайте для владельца (non-tech). Управление только разделом Puppies: список, добавление, изменение статуса/цены, удаление с подтверждением. Все CRUD через Server Actions, безопасная cookie-сессия, мгновенная инвалидация витрины (ISR ≤ 60s).

1) Problem Statement

Сейчас изменения карточек щенков требуют участия разработчика или прямого доступа к базе. Это медленно, дорого и рискованно. Нужен простой и безопасный интерфейс, где владелец сам обновляет данные о щенках.

2) Goals
Business Goals

Сократить зависимость от разработчика при обновлении карточек.

Ускорить отражение актуального статуса щенков на витрине.

Снизить операционные риски (удаления/опечатки/утечки).

User Goals

Владелец заходит, быстро меняет статус/цену, добавляет или удаляет карточку — без знаний SQL.

Мобильный сценарий на Samsung Galaxy S25 Ultra.

Non-Goals (MVP)

Фото/галереи, CSV импорт/экспорт.

Управление reservations/inquiries из UI.

Тонкие роли/доступы на RLS (будет позже).

3) Users & Roles

Admin (Owner) — единственный пользователь админки.

Developer — техподдержка/развитие.

4) Scope (MVP)

Auth (временный пароль)

/admin/login — форма, проверка против .env (ADMIN_LOGIN, ADMIN_PASSWORD).

Сессионная cookie httpOnly, secure, sameSite=lax, TTL 8ч.

middleware пускает на /admin/* только при наличии валидной сессии.

Доп. проверка в app/admin/layout.tsx (Server Component).

Puppies

/admin/puppies — таблица: name, status, price_usd, birth_date, публичная ссылка.

Inline-смена статуса (available | reserved | sold | upcoming) + toast.

Редактирование price_usd (мин. 0.01).

Добавление щенка: name (required), birth_date (≤ today), price_usd, status, litter_id?.

Удаление с confirm-диалогом и явным указанием имени.

Кнопка “Open public page” (по slug).

Revalidation

После любых мутаций — revalidatePath('/puppies') и страницы карточки. Общий ISR уже настроен (60s).

5) Out of Scope (MVP)

Фото/Storage-операции.

Поиск/фильтры/пагинация.

Ролевая Supabase Auth/RLS (Phase 2).

UI для reservations/inquiries.

6) Functional Requirements
6.1 Auth & Access

FR-A1: /admin/login принимает login/email + пароль, сверяет с .env.

FR-A2: При успехе ставится cookie; редирект на /admin/puppies.

FR-A3: middleware блокирует анонимов на /admin/*.

FR-A4: app/admin/layout.tsx валидирует сессию; при отсутствии — редирект на /admin/login.

FR-A5: Логаут — кнопка “Sign out” (удаление cookie, редирект на /admin/login).

6.2 Puppies

FR-P1: Список щенков, сортировка по created_at DESC.

FR-P2: Inline-обновление status из фиксированного enum.

FR-P3: Редактирование price_usd (>= 0.01), формат USD.

FR-P4: Создание: name (required), birth_date (<= today), price_usd, status, litter_id?.

FR-P5: Delete с модальным подтверждением: “Are you sure to delete {name}?”.

FR-P6: “Open public page” — переход по slug.

6.3 Feedback & Errors

FR-F1: Toast: “Saved successfully” / “Deleted” / “Error”.

FR-F2: Полевая валидация + подсветка ошибок.

FR-F3: При сетевых сбоях — toast “Network error, please retry”, данные формы не теряются.

7) Non-Functional Requirements

NFR-1: Время рендера списка ≤ 1с при 100 строках.

NFR-2: Accessibility: контраст, aria-* у интерактивных элементов.

NFR-3: Mobile-первый, таргет Galaxy S25 Ultra: tap-targets ≥ 44px, корректные клавиатуры (numeric для цены).

NFR-4: Надёжность: все мутации — только в Server Actions (сервер), без клиентских ключей.

NFR-5: Логирование: только ошибки/исключения (без аудита действий).

NFR-6 (технические KPI):

Mean latency Server Actions ≤ 300ms (p50), ≤ 800ms (p95).

Успешная инвалидация (revalidatePath) ≥ 99% мутаций.

8) Data Model (минимум для MVP)

puppies:
id, litter_id?, name, slug, sex, color, birth_date, price_usd,
status ('available'|'reserved'|'sold'|'upcoming'), description,
photo_urls[], video_urls[], paypal_enabled, stripe_payment_link, created_at.

Примечания

Поля is_visible пока нет; публикация по бизнес-правилу (например, available), либо добавим флаг в Phase 2.

litters существует; привязка опциональна в MVP.

9) Security & Privacy (MVP)

Временный логин/пароль из .env (Vercel env + локально), не коммитить.

Cookie: httpOnly, secure, sameSite=lax, TTL 8ч, продление по активности не требуется в MVP.

Все CRUD — через Server Actions; Supabase service-role клиент только на сервере.

RLS включён глобально; до Phase 2 используем бэкенд-клиент с системными правами внутри Server Actions + защищаем доступом по сессии/маршрутам.

CSRF: формы используют встроенные токены Server Actions (скрытое поле + проверка на сервере).

Brute-force: простая задержка ответа при 3+ неудачных логинах (например, +1–2с), сообщение об ошибке без уточнения, что неверно (логин/пароль).

10) UX & Flows

Login

/admin → редирект на /admin/login.

Ввод логина/пароля → cookie → редирект /admin/puppies.

Ошибка — toast “Invalid credentials”.

Puppies: Status Update

Открывает /admin/puppies.

Меняет статус в Select → Save.

Toast “Saved successfully” → revalidatePath('/puppies') + карточка.

Puppies: Create

Кнопка “Add puppy” → форма.

Валидация (name, price_usd, birth_date) → Create.

Toast → редирект на список.

Puppies: Delete

Нажимает “Delete” в строке.

Модал: “Are you sure to delete {name}?”.

Подтверждение → удаление → toast “Deleted” → revalidate.

UI Notes

Mobile-first: одна колонка, sticky header с “Add”.

Кнопки “Save/Cancel” фиксируются внизу экрана на мобайле.

Стиль — по токенам темы; цвета не хардкодить.

11) Technical Considerations

Next.js 15 App Router: Server Components; все мутации через Server Actions.

Supabase: использовать серверный клиент (service-role) только в Server Actions; на клиенте — публичный анонимный ключ не подключать в админке.

Валидация: zod схемы на сервере + дублирование в форме для мгновенной обратной связи.

Revalidation: если revalidatePath неуспешен, кэш живёт ≤ 60с; повторная фонова инвалидация при следующем запросе.

Форматы: price_usd хранится как numeric(10,2); форматирование в UI с локалью en-US.

Time: birth_date — date (UTC-agnostic). На клиенте — маска/календарь.

Observability: отправка ошибок в консоль/лог (Sentry — опционально).

Accessibility: aria-label для всех inline-контролов (select/inputs), фокус-контуры не убирать.

12) Success Metrics (KPIs)

Владелец проходит “логин → изменить статус” без помощи разработчика.

Изменение статуса видно на публичной карточке ≤ 1 мин.

0 инцидентов утечки привилегий/ключей.

Server Actions p50 ≤ 300ms, p95 ≤ 800ms.

Успешная инвалидация после мутаций ≥ 99%.

13) Milestones & Sequencing (без дат)

Auth (2 недели)
Login page, cookie, middleware, layout-guard, логаут, базовая защита от brute-force.

Puppies List & Inline Edit (3 недели)
Таблица, inline-status, price edit, тоасты, revalidate.

Create/Delete + Validation (2 недели)
Формы, модалки, пустые/ошибочные состояния.

Mobile Polish & Desktop (1 неделя)
S25 Ultra полировка, адаптация desktop.

Errors & Deploy (1 неделя)
Логи ошибок, финальные правки, прод-деплой.

Примечание: если сроки жёсткие, этапы 4–5 можно частично совмещать.

14) Risks & Mitigations
Риск	Митигация
Потеря сессии	Явный редирект на /admin/login, стабильная конфигурация cookie
Ошибки при мутациях	Тоаст с подробным сообщением, retry, логирование
Случайное удаление	Confirm-диалог с именем щенка
Утечка ключей	Только Server Actions; проверка, что ключи не попадают в client bundle
Несоответствие витрины	revalidatePath списка/карточки; ISR ≤ 60s; fallback если рефреш не удался
Брутфорс логина	Задержка ответа, единое сообщение об ошибке

15) Acceptance Criteria (DoD)

Гость не видит /admin/*; редирект на /admin/login.

Успешный логин владельца через .env-пароль; корректный логаут.

На /admin/puppies виден список; доступны: смена статуса, правка цены, добавление и удаление (с confirm).

Тоасты: успех/ошибка/удаление; сетевой сбой — информативный тоаст, данные формы не теряются.

Публичные страницы отражают изменения ≤ 1 мин после сохранения.

Базовые Lighthouse/AXE проверки пройдены (контраст, aria).

Стиль следует токенам темы (без жёстких hex).

16) Future Scope (Phase 2 — Prioritized)

P1

Supabase Auth с ролями (admin/user) + RLS-политики.

Флаг is_visible и чекбокс “Show on site”.

Фото/галереи через Supabase Storage (подписи URL, очистка EXIF).

P2

/admin/reservations и /admin/inquiries (UI к существующим таблицам).

Поиск/фильтры/пагинация, bulk-действия.

P3

Черновики (draft) и предпросмотр.

Логи аудита (кто/когда что изменил).

17) Open Questions
Вопрос	Предложение	Decision Owner	Статус
Автогенерация slug?	Да: slugify(name) в Server Action; коллизии — добавлять -N. Поле редактируемое при создании.	Dev	☐
litter_id обязателен?	Опционально в MVP, NULL допустим.	PM	☐
Нужен draft?	Нет в MVP; публикация сразу. Вернёмся в Phase 2.	PM	☐
Кнопка “View on site” после создания?	Да: toast с CTA “View on site” (новая вкладка).	PM	☐

18) Implementation Notes (кратко, с примерами)

Server Action (пример обновления статуса):

```ts
// app/admin/puppies/actions.ts
'use server'

import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(['available','reserved','sold','upcoming'])
})

export async function updateStatus(formData: FormData) {
  const parsed = schema.safeParse({
    id: formData.get('id'),
    status: formData.get('status'),
  })
  if (!parsed.success) throw new Error('Validation error')

  // server-only client (service role) via env
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false }
  })

  const { error } = await supabase
    .from('puppies')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id)

  if (error) throw error

  // revalidate list + public pages
  revalidatePath('/puppies')
  revalidatePath(`/puppies/${parsed.data.id}`) // или по slug, если есть
}
```

Middleware (доступ к /admin):

```ts
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const session = req.cookies.get('ebl_admin_session')?.value
    if (!session && !req.nextUrl.pathname.startsWith('/admin/login')) {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}
```

UI (фрагмент строки таблицы):

```tsx
// app/admin/puppies/Row.tsx
'use client'
import { useTransition } from 'react'
import { updateStatus } from './actions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export function PuppyRow({ puppy }) {
  const [pending, start] = useTransition()
  return (
    <div className="grid grid-cols-[1fr,160px,120px,140px,auto] items-center gap-2 py-2">
      <span className="truncate">{puppy.name}</span>
      <Select
        defaultValue={puppy.status}
        onValueChange={(v) => start(async () => {
          try {
            const fd = new FormData()
            fd.append('id', puppy.id)
            fd.append('status', v)
            await updateStatus(fd)
            toast.success('Saved successfully')
          } catch (e) {
            toast.error('Error')
          }
        })}
        disabled={pending}
      >
        <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {['available','reserved','sold','upcoming'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>
      {/* ... price input, birth_date, link ... */}
    </div>
  )
}
```

19) Dependencies

Next.js 15 (App Router), Tailwind v4, shadcn/ui (темing по токенам).

Supabase (Postgres + RLS + Storage — Storage пока не используется).

Vercel (preview/prod), env variables.

20) Appendix A — References

Статусы: status in ('available','reserved','sold','upcoming').

RLS включён ранее в проекте.

Таблицы reservations/inquiries существуют (Phase 2).
