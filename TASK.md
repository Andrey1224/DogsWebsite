
---

## 1. Фича

**Название:**
`Auto-expiring reservations & safe archiving`

**Цель:**
Сделать так, чтобы:

1. **pending-бронь автоматически отменялась через 15 минут**, если платёж не завершён;
2. Пока есть **активная бронь**,

   * покупатель **не может** создать новую бронь / депозит;
   * админ **не может архивировать** щенка;
3. После истечения 15 минут (или manual cancel)

   * щенок снова полностью доступен: кнопки депозита работают, архивирование разрешено.

---

## 2. Текущее состояние (контекст для ИИ)

* Таблица `reservations` уже содержит: `status`, `expires_at`, `updated_at` и частичный уникальный индекс `idx_one_active_reservation_per_puppy`, который гарантирует **одну активную бронь на щенка**.
* Есть функции:

  * `create_reservation_transaction()` — атомарно создаёт бронь, учитывая доступность щенка;
  * `check_puppy_availability()` — guard на уровне БД;
  * `expire_pending_reservations()` — helper для чистки зависших pending.
* Payment flow уже отлажен: Stripe/PayPal вебхуки, idempotency, `puppy.status='reserved'` на успешный депозит.

**Проблема сейчас по пользователю:**

* pending-резервации **висят бесконечно**, если платёж не завершён;
* админ видит ошибку **"Cannot archive puppy with active reservations"**, даже если реально никто не заплатил;
* на публичной странице кнопки депозита остаются активны, хотя в БД уже есть pending для этого щенка.

---

## 3. Бизнес-правила (истина для всей реализации)

Определения:

* **Активная бронь (active reservation)** — любая запись в `reservations`, у которой:

  * `status in ('pending','paid')`
  * **и** (для `pending`) `expires_at > now()`
  * **и** не помечена как `canceled`/`refunded`.
    Это согласуется с идеей `idx_one_active_reservation_per_puppy` — в индексе как раз участвуют “живые” записи.

Правила:

1. **Создание новой брони**

   * Разрешено **только если нет активной брони** для `puppy_id`.
2. **Время жизни pending**

   * При создании `status='pending'` → `expires_at = now() + interval '15 minutes'`.
   * Через 15 минут, если платёж не завершён, бронь считается просроченной.
3. **Авто-очистка**

   * Периодический job вызывает `expire_pending_reservations()`
     → переводит `pending` с `expires_at < now()` в `status='canceled'`.
4. **Кнопки депозита на сайте**

   * Если `puppy.status != 'available'` → кнопки скрыты (как сейчас).
   * Если `puppy.status = 'available'`, но **есть активная бронь** →
     кнопки депозита заблокированы / заменены текстом “Reservation in progress, please check back in 15 minutes”.
5. **Архивирование щенка (is_archived=true)**

   * Запрещено, если есть **любая активная бронь** (pending/paid).
   * Разрешено, если:

     * либо **нет записей** в `reservations` для этого щенка,
     * либо все записи в статусах `canceled` или `refunded` **или** `pending` уже авто-отменены.
6. **Paid бронь**

   * `status='paid'` **никогда не истекает по TTL**.
   * Админ должен вручную решить: перевести в `sold`, завершить сделку, потом архивировать.

---

## 4. План изменений для ИИ (по слоям)

### 4.1. База данных

**Цель:** доопределить поведение уже существующих сущностей, не ломая схему.

1. **Убедиться, что `expires_at` заполняется**

   * Внутри `create_reservation_transaction()`:

     * если `NEW.status = 'pending'` и `NEW.expires_at IS NULL` → ставим `now() + interval '15 minutes'`;
     * если статус сразу `paid` (например, в случае синхронного capture) → `expires_at` можно оставить `NULL` или любым значением — TTL к `paid` не применяется.

2. **Определение “активной” брони в БД**

   * Либо через условие частичного уникального индекса `idx_one_active_reservation_per_puppy`,
   * Либо через helper-view/функцию `is_reservation_active(reservations)` — можно использовать внутри `check_puppy_availability()` и в запросах.

3. **Функция `expire_pending_reservations()`**

   * Должна делать примерно так (псевдо-SQL):

     ```sql
     update reservations
        set status = 'canceled',
            updated_at = now()
      where status = 'pending'
        and expires_at is not null
        and expires_at < now();
     ```

   * Эта функция уже описана в MIGRATIONS, задача — **подключить её к CRON-джобу**.

4. **CRON / scheduler**

   * Вариант A: Supabase scheduled function.
   * Вариант B: Vercel Cron → `api/cron/expire-reservations`, внутри которой вызывается SQL `select expire_pending_reservations();`.
   * Частота: раз в 1–5 минут (15-минутное окно, так что latency до нескольких минут допустима).

> Для ИИ: не создавать новую таблицу/колонки. Использовать уже существующие `expires_at`, `idx_one_active_reservation_per_puppy`, `expire_pending_reservations()`.

---

### 4.2. Сервисный слой / серверные экшены

Файлы вида:

* `lib/reservations/create.ts`
* `lib/reservations/queries.ts`
* `app/puppies/[slug]/actions.ts`
* `app/admin/(dashboard)/puppies/actions.ts`

**Задача 1. Создание брони с TTL**

* В точке, где вызывается `create_reservation_transaction()`:

  * Не пытаться самим искать активные брони — полагаться на:

    * `check_puppy_availability()` в БД;
    * `idx_one_active_reservation_per_puppy`.
  * Обрабатывать ошибку от транзакции как “кто-то уже резервирует этого щенка”.

Пример pseudocode:

```ts
const result = await createReservationTransaction({
  puppyId,
  // ...
});

if (result.error?.code === "PUPPY_ALREADY_RESERVED") {
  // вернуть дружелюбную ошибку для UI
}
```

**Задача 2. Функция “есть ли активная бронь”**

* В `lib/reservations/queries.ts` добавить helper:

```ts
export async function hasActiveReservation(puppyId: string) {
  // активная = status in ('pending','paid') и (для pending) не просрочена
  const { data, error } = await client
    .from("reservations")
    .select("id, status, expires_at")
    .eq("puppy_id", puppyId)
    .in("status", ["pending", "paid"]);

  if (error) throw error;

  const now = new Date();
  return data.some((r) => {
    if (r.status === "paid") return true;
    if (!r.expires_at) return true; // safety
    return new Date(r.expires_at) > now;
  });
}
```

* Этот helper используется:

  * в публичном UI (для кнопок депозита),
  * в админке (для проверки перед архивацией),
  * но **не заменяет** защиту на уровне БД.

---

### 4.3. Публичный UI (`/puppies/[slug]`)

Файлы:
`app/puppies/[slug]/reserve-button.tsx`, `app/puppies/[slug]/page.tsx`.

**Задача 1. Признак резервируемости**

* Добавить серверный helper:

```ts
export async function getPuppyReservationState(slug: string) {
  const puppy = await getPuppyBySlug(slug);
  if (!puppy) return null;

  const hasActive = await hasActiveReservation(puppy.id);

  return {
    puppy,
    canReserve:
      puppy.status === "available" &&
      !puppy.is_archived &&
      !hasActive,
    reservationBlocked: hasActive,
  };
}
```

**Задача 2. UI-логика кнопок**

* Если `!canReserve` и `reservationBlocked === true`:

  * вместо Stripe/PayPal кнопок показывать текст:

    * “Reservation in progress — please try again in ~15 minutes”
* Если `!canReserve` из-за статуса (`reserved`/`sold`/архив) — показывать текущий текст (“Reserved”/“Sold” или убрать кнопки).

**Важно:** при клике на “Pay deposit” всё равно делать проверку на сервере (через `create_reservation_transaction()`), даже если UI думает, что всё ок. Если БД ответила конфликтом → показываем тост “Someone just reserved this puppy, please refresh.”

---

### 4.4. Админка (архивирование щенков)

Файлы:
`app/admin/(dashboard)/puppies/page.tsx`, `app/admin/(dashboard)/puppies/actions.ts`.

**Задача 1. Проверка перед архивацией**

* В server action `archivePuppy` (или эквивалент):

```ts
export async function archivePuppy(puppyId: string) {
  const hasActive = await hasActiveReservation(puppyId);

  if (hasActive) {
    throw new Error(
      "Cannot archive puppy with active reservations. Cancel or finish the reservation first."
    );
  }

  // update puppies set is_archived = true ...
}
```

**Задача 2. UI-подсказка администратору**

* В таблице щенков:

  * Если `hasActiveReservation === true`, показывать badge типа “Reservation active” + disable кнопки “Archive”.
  * В tooltip коротко объяснить:

    * “This puppy has a pending or paid reservation. You must cancel or complete it before archiving.”

**Опционально (future):**

* Кнопка “Force cancel pending & archive”:

  * server action, который:

    * находит pending-резервации для `puppy_id`,
    * переводит их в `canceled`,
    * затем архивирует щенка.

---

### 4.5. План тестирования (для ИИ)

1. **Unit / integration**

   * `expire_pending_reservations()`:

     * создаём pending с `expires_at < now()` → после вызова статус `canceled`;
     * pending с `expires_at > now()` остаются неизменными.
   * `hasActiveReservation()`:

     * `pending` + `expires_at > now()` → `true`;
     * `pending` + `expires_at < now()` → `false`;
     * `paid` → `true`;
     * `canceled` / `refunded` → `false`.
2. **API / server actions**

   * Попытка создать вторую бронь для того же `puppy_id`:

     * Ожидаем ошибку из-за `idx_one_active_reservation_per_puppy`.
   * Попытка архивировать щенка с активной бронью:

     * Ожидаем ошибку и корректное сообщение.
3. **E2E (Playwright)**

   * Сценарий “pending hold”:

     1. Открыть страницу щенка, нажать “Pay deposit” (но не завершать оплату → остаётся pending).
     2. Проверить, что:

        * на публичной странице кнопки депозита заблокированы/скрыты;
        * в админке кнопка “Archive” disabled, есть badge.
   * Сценарий “TTL 15 минут”:

     * В тесте можно принудительно выставить `expires_at = now() - interval '20 minutes'`, вызвать `expire_pending_reservations()`, затем:

       * проверить, что:

         * статус стал `canceled`;
         * публичные кнопки снова активны;
         * архивация снова разрешена.

---
