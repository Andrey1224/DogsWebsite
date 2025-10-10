# 🎯 ФИНАЛЬНАЯ ИНСТРУКЦИЯ - Применить миграцию

## ✅ Все ошибки исправлены!

### Что было исправлено:

1. ❌ **Ошибка 1:** Синтаксис `ALTER TABLE ... WHERE`
   - ✅ Заменено на `CREATE UNIQUE INDEX ... WHERE`

2. ❌ **Ошибка 2:** Циклическая зависимость между таблицами
   - ✅ Таблицы создаются без FK, FK добавляются потом

3. ❌ **Ошибка 3:** Несовпадение типов данных
   - ✅ `webhook_events.reservation_id` изменён с **BIGINT** на **UUID**
   - Теперь совпадает с `reservations.id` (UUID)

---

## 📋 ЧТО ДЕЛАТЬ (2 минуты)

### Шаг 1: Скопировать SQL

Открой файл **`complete_migration_fixed.sql`** и скопируй **ВСЁ**:
```bash
# В VS Code:
Cmd+A (выделить всё)
Cmd+C (скопировать)
```

### Шаг 2: Применить в Supabase

1. Открой https://app.supabase.com
2. Выбери свой проект
3. Зайди в **SQL Editor** (боковое меню)
4. Вставь SQL (`Cmd+V`)
5. Нажми **RUN** или `Cmd+Enter`

### Шаг 3: Проверить

В терминале:
```bash
node scripts/verify-constraints.mjs
```

Должно быть:
```
✅ All required columns exist!
✅ Function exists and validation works
```

### Шаг 4: Задеплоить

```bash
git add .
git commit -m "feat: apply complete migration with fixed data types"
git push origin main
```

---

## 🔍 Что создаётся

### Таблица `webhook_events` (новая)

```sql
CREATE TABLE webhook_events (
  id BIGINT PRIMARY KEY,
  provider TEXT,              -- 'stripe' или 'paypal'
  event_id TEXT,              -- ID события от провайдера
  event_type TEXT,            -- тип события
  processed BOOLEAN,          -- обработано ли
  reservation_id UUID,        -- ✅ UUID! (было BIGINT - ошибка!)
  payload JSONB,              -- полные данные webhook
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Таблица `reservations` (обновление)

Добавляются колонки:
```sql
payment_provider TEXT           -- 'stripe' или 'paypal'
external_payment_id TEXT        -- ID платежа
webhook_event_id BIGINT         -- ссылка на webhook_events.id
expires_at TIMESTAMPTZ          -- когда истекает
amount DECIMAL(10,2)            -- сумма
updated_at TIMESTAMPTZ          -- последнее обновление
```

### Функция `create_reservation_transaction()`

Атомарное создание резервации:
- Блокирует запись щенка (`FOR UPDATE`)
- Проверяет доступность
- Обновляет статус щенка
- Создаёт резервацию
- Всё в одной транзакции (защита от race condition)

---

## ⚠️ Важные изменения типов

| Таблица | Колонка | Было | Стало |
|---------|---------|------|-------|
| `webhook_events` | `reservation_id` | BIGINT ❌ | UUID ✅ |
| `webhook_events` | `id` | BIGINT | BIGINT |
| `reservations` | `id` | UUID | UUID |
| `reservations` | `webhook_event_id` | - | BIGINT (новая) |

**Важно:** Foreign keys теперь работают, потому что типы совпадают:
```sql
-- ✅ Правильно: UUID → UUID
webhook_events.reservation_id (UUID) → reservations.id (UUID)

-- ✅ Правильно: BIGINT → BIGINT
reservations.webhook_event_id (BIGINT) → webhook_events.id (BIGINT)
```

---

## 🎉 После успешного применения

### 1. Проверь базу данных
```bash
node scripts/verify-constraints.mjs
```

### 2. Проверь TypeScript
```bash
npm run typecheck
```

### 3. Запусти тесты
```bash
npm run test
```

### 4. Задеплой
```bash
git push origin main
```

### 5. Протестируй платёж
1. Открой сайт
2. Выбери щенка
3. Попробуй создать резервацию
4. Проверь, что:
   - ✅ Резервация создалась
   - ✅ Статус щенка изменился на "reserved"
   - ✅ Webhook записался в `webhook_events`
   - ✅ В каталоге щенок больше не доступен

---

## 🐛 Если что-то пошло не так

### "table webhook_events already exists"
✅ **Нормально!** Миграция использует `IF NOT EXISTS`. Просто продолжится.

### "column already exists"
✅ **Нормально!** Миграция проверяет перед добавлением.

### "constraint already exists"
✅ **Нормально!** Миграция проверяет перед созданием.

### Любая другая ошибка
1. Скопируй **полный текст ошибки**
2. Проверь, в каком STEP ошибка (будет написано "STEP X:")
3. Напиши мне текст ошибки

---

## 📊 Структура миграции

```
STEP 1:  Создать webhook_events (без FK)
STEP 2:  Добавить колонки в reservations (без FK)
STEP 3:  Создать индексы
STEP 4:  ⭐ Добавить FK (теперь обе таблицы существуют!)
STEP 5:  Добавить constraints
STEP 6:  Создать helper функции
STEP 7:  Добавить триггеры
STEP 8:  Создать main функцию
STEP 9:  Выдать права
STEP 10: Добавить комментарии
```

---

## ✅ Чеклист успеха

После миграции проверь:

- [ ] `node scripts/verify-constraints.mjs` → все ✅
- [ ] Таблица `webhook_events` существует
- [ ] Колонка `webhook_events.reservation_id` имеет тип UUID
- [ ] Колонка `reservations.webhook_event_id` существует
- [ ] Функция `create_reservation_transaction` создана
- [ ] Foreign keys работают
- [ ] `npm run typecheck` → без ошибок
- [ ] `npm run build` → успешно
- [ ] Код задеплоен на Vercel

---

## 🚀 Быстрый старт

```bash
# 1. Скопируй complete_migration_fixed.sql
open complete_migration_fixed.sql  # откроется в редакторе
# Cmd+A, Cmd+C

# 2. Открой Supabase
open https://app.supabase.com
# SQL Editor → вставь → RUN

# 3. Проверь
node scripts/verify-constraints.mjs

# 4. Задеплой
git add . && git commit -m "feat: apply migration" && git push
```

---

## 💡 Подсказка

Если хочешь посмотреть, что создастся, можешь открыть `complete_migration_fixed.sql` и почитать комментарии - там всё расписано по шагам!

**Готово к применению!** 🎯
