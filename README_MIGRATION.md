# 🚀 Применить миграцию - Исправленная версия

## ❌ Что было не так

**Проблема:** Циклическая зависимость между таблицами
- `webhook_events` → ссылается на `reservations`
- `reservations` → ссылается на `webhook_events`

Нельзя создать одну таблицу до другой! 🔄

## ✅ Решение

Создаём таблицы **БЕЗ** внешних ключей, а потом добавляем FK отдельным шагом.

## 📋 Что делать (3 минуты)

### Шаг 1: Открыть Supabase
1. Зайти на https://app.supabase.com
2. Выбрать свой проект
3. Открыть **SQL Editor** (боковое меню)

### Шаг 2: Скопировать SQL
Открыть файл **`complete_migration_fixed.sql`** и скопировать **ВСЁ** содержимое.

### Шаг 3: Вставить и запустить
1. Вставить в SQL Editor
2. Нажать **RUN** (или `Cmd+Enter`)
3. Подождать 3-5 секунд

### Шаг 4: Проверить
В терминале:
```bash
node scripts/verify-constraints.mjs
```

Должно быть:
```
✅ All required columns exist!
✅ Function exists and validation works
```

## 📊 Что создаётся

### Новая таблица: `webhook_events`
Для отслеживания всех webhook событий от Stripe и PayPal.

Колонки:
- `id` - уникальный ID
- `provider` - stripe или paypal
- `event_id` - ID события от провайдера
- `event_type` - тип события
- `processed` - обработано ли
- `reservation_id` - связь с резервацией
- `payload` - полные данные webhook
- и другие...

### Обновление таблицы: `reservations`
Добавляются 6 новых колонок:
- `payment_provider` - stripe/paypal
- `external_payment_id` - ID платежа
- `webhook_event_id` - связь с webhook событием
- `expires_at` - когда истекает резервация
- `amount` - сумма резервации
- `updated_at` - время последнего обновления

### Новые функции
- `create_reservation_transaction()` - атомарное создание резервации
- `check_puppy_availability()` - проверка доступности щенка
- `expire_pending_reservations()` - истечение старых резерваций
- `get_reservation_summary()` - статистика по резервациям

## 🎯 Порядок создания (важно!)

```
1. Создать webhook_events (без FK)
2. Добавить колонки в reservations (без FK)
3. Добавить индексы
4. ⭐ Добавить FK (теперь обе таблицы существуют!)
5. Добавить constraints
6. Создать функции
7. Добавить триггеры
8. Выдать права
9. Добавить комментарии
```

## ⚠️ Если получишь ошибку

### "table already exists"
✅ Это нормально! Миграция использует `IF NOT EXISTS` - просто продолжит.

### "constraint already exists"
✅ Это нормально! Миграция проверяет существование перед созданием.

### "column already exists"
✅ Это нормально! Миграция проверяет перед добавлением.

### Любая другая ошибка
1. Скопируй **полный текст ошибки**
2. Посмотри в каком STEP ошибка (в тексте будет "STEP X:")
3. Напиши мне - разберёмся!

## ✅ После успешного применения

```bash
# 1. Проверить
node scripts/verify-constraints.mjs

# 2. Задеплоить код
git add .
git commit -m "feat: apply complete migration with webhook_events"
git push origin main

# 3. Готово! 🎉
```

## 🧪 Тест

После миграции можно проверить таблицы:

```sql
-- Проверить webhook_events
SELECT * FROM webhook_events LIMIT 1;

-- Проверить новые колонки в reservations
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'reservations'
ORDER BY ordinal_position;

-- Проверить функцию
SELECT proname FROM pg_proc
WHERE proname = 'create_reservation_transaction';
```

---

## 📝 Краткая инструкция

1. Открой Supabase Dashboard → SQL Editor
2. Скопируй **весь** файл `complete_migration_fixed.sql`
3. Вставь и нажми RUN
4. Проверь: `node scripts/verify-constraints.mjs`
5. Задеплой: `git push origin main`

**Готово!** 🚀
