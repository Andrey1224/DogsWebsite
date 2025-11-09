# Отчёт: Переход на прямой выбор родителей

**Дата:** 2025-11-08
**Автор:** Claude Code
**Коммит:** `1787362`
**Ветка:** main

---

## Оглавление

1. [Краткое резюме](#краткое-резюме)
2. [Проблема](#проблема)
3. [Решение](#решение)
4. [Изменения в базе данных](#изменения-в-базе-данных)
5. [Изменения в коде](#изменения-в-коде)
6. [Тестирование](#тестирование)
7. [Преимущества](#преимущества)
8. [Обратная совместимость](#обратная-совместимость)
9. [Будущие улучшения](#будущие-улучшения)
10. [Инструкция по использованию](#инструкция-по-использованию)

---

## Краткое резюме

Заменили выбор помёта (litter) на **прямой выбор родителей** (sire/dam) в админ-панели создания щенка. Теперь вместо одного dropdown "Litter" есть два отдельных dropdown:
- **Sire / Father** (отец) - показывает только самцов
- **Dam / Mother** (мать) - показывает только самок

Это упрощает рабочий процесс и подготавливает систему для будущей загрузки фотографий родителей.

---

## Проблема

### Старый подход (через litter):

```
Щенок → Litter → Родители (Sire/Dam)
```

**Недостатки:**
1. ❌ Нужно создавать litter для каждого помёта
2. ❌ Сложно указать родителей без помёта
3. ❌ Непонятно, как добавить фото для родителей конкретного щенка
4. ❌ Лишняя таблица-посредник для простых случаев

**Пример проблемы:**
- Щенок "Plusha" создан без litter → показывает "Sire: TBD", "Dam: TBD", "Litter: Private"
- Щенок "Regal" создан с litter "Royal Heritage" → показывает "Sire: Sir Winston", "Dam: Lady Clementine", "Litter: Royal Heritage Litter"

Пользователю приходилось вручную копировать UUID помёта или создавать новый litter для каждого случая.

---

## Решение

### Новый подход (прямые ссылки):

```
Щенок → Родители (Sire/Dam)
```

**Преимущества:**
1. ✅ Прямой выбор родителей из dropdown
2. ✅ Не нужно создавать litter
3. ✅ Родители уже имеют поле `photo_urls[]` - готово для загрузки фото
4. ✅ Фильтрация по полу: Sire = male, Dam = female
5. ✅ Показывает породу рядом с именем: "Sir Winston (English Bulldog)"

**Архитектура:**
- Добавлены поля `sire_id` и `dam_id` в таблицу `puppies`
- Прямые foreign key ссылки на таблицу `parents`
- Backward compatibility: старые щенки с `litter_id` продолжают работать

---

## Изменения в базе данных

### Миграция: `20250811T120000Z_add_parent_fields_to_puppies.sql`

```sql
-- Добавляем прямые ссылки на родителей
ALTER TABLE puppies
  ADD COLUMN sire_id UUID REFERENCES parents(id) ON DELETE SET NULL,
  ADD COLUMN dam_id UUID REFERENCES parents(id) ON DELETE SET NULL;

-- Индексы для производительности
CREATE INDEX idx_puppies_sire_id ON puppies(sire_id);
CREATE INDEX idx_puppies_dam_id ON puppies(dam_id);

-- Мигрируем существующие данные из litters
UPDATE puppies p
SET
  sire_id = l.sire_id,
  dam_id = l.dam_id
FROM litters l
WHERE p.litter_id = l.id AND p.litter_id IS NOT NULL;

-- Комментарии для документации
COMMENT ON COLUMN puppies.sire_id IS 'Direct reference to male parent (father)';
COMMENT ON COLUMN puppies.dam_id IS 'Direct reference to female parent (mother)';
```

**Статус:** ✅ Применена через Supabase MCP

### Схема до изменений:

```
puppies:
  - id (UUID)
  - litter_id (UUID, nullable) → ссылка на litters
  - name, slug, sex, color, etc.
```

### Схема после изменений:

```
puppies:
  - id (UUID)
  - litter_id (UUID, nullable) → сохранено для backward compatibility
  - sire_id (UUID, nullable) → прямая ссылка на parents (male)
  - dam_id (UUID, nullable) → прямая ссылка на parents (female)
  - name, slug, sex, color, etc.
```

---

## Изменения в коде

### 1. TypeScript типы

**Файл:** `lib/supabase/types.ts`

```typescript
export type Puppy = {
  id: string;
  litter_id: string | null;
  sire_id: string | null;  // ← НОВОЕ
  dam_id: string | null;   // ← НОВОЕ
  name: string | null;
  slug: string | null;
  // ... остальные поля
};
```

---

### 2. Query функции

**Файл:** `lib/admin/puppies/queries.ts`

#### Добавлены новые функции:

```typescript
export type AdminParent = {
  id: string;
  name: string;
  breed: "french_bulldog" | "english_bulldog" | null;
  photo_urls: string[] | null;
};

// Получить всех самцов (отцов)
export async function fetchAdminSires(): Promise<AdminParent[]> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("parents")
    .select("id,name,breed,photo_urls")
    .eq("sex", "male")  // ← фильтр
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AdminParent[];
}

// Получить всех самок (матерей)
export async function fetchAdminDams(): Promise<AdminParent[]> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("parents")
    .select("id,name,breed,photo_urls")
    .eq("sex", "female")  // ← фильтр
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AdminParent[];
}
```

#### Обновлена функция `mapCreatePayload`:

```diff
function mapCreatePayload(input: CreatePuppyPayload) {
  return {
    name: input.name,
    slug: input.slug,
    status: input.status,
    price_usd: input.priceUsd ?? null,
    birth_date: input.birthDate ?? null,
-   litter_id: input.litterId ?? null,
+   sire_id: input.sireId ?? null,   // ← ИЗМЕНЕНО
+   dam_id: input.damId ?? null,     // ← ИЗМЕНЕНО
    sex: input.sex ?? null,
    color: input.color ?? null,
    weight_oz: input.weightOz ?? null,
    description: input.description ?? null,
  };
}
```

---

### 3. Validation схема

**Файл:** `lib/admin/puppies/schema.ts`

```diff
- const litterIdSchema = z.preprocess(...)
-   .string().uuid("Invalid litter identifier").optional();

+ const parentIdSchema = z.preprocess(...)
+   .string().uuid("Invalid parent identifier").optional();

export const createPuppySchema = z.object({
  name: nameSchema,
  status: adminPuppyStatusSchema.default("available"),
  priceUsd: priceUsdSchema,
  birthDate: birthDateSchema,
  slug: slugSchema.optional(),
- litterId: litterIdSchema,
+ sireId: parentIdSchema,  // ← НОВОЕ
+ damId: parentIdSchema,   // ← НОВОЕ
  sex: sexSchema,
  color: colorSchema,
  weightOz: weightOzSchema,
  description: descriptionSchema,
});
```

---

### 4. Admin страница

**Файл:** `app/admin/(dashboard)/puppies/page.tsx`

```diff
export default async function AdminPuppiesPage() {
  const puppies = await fetchAdminPuppies();
- const litters = await fetchAdminLittersWithParents();
+ const sires = await fetchAdminSires();
+ const dams = await fetchAdminDams();

- const litterOptions = litters.map((litter) => ({
-   value: litter.id,
-   label: `${litter.name} (${litter.sire.name} × ${litter.dam.name})`
- }));

+ const sireOptions = sires.map((sire) => ({
+   value: sire.id,
+   label: `${sire.name}${sire.breed ? ` (${sire.breed === "english_bulldog" ? "English" : "French"} Bulldog)` : ""}`
+ }));

+ const damOptions = dams.map((dam) => ({
+   value: dam.id,
+   label: `${dam.name}${dam.breed ? ` (${dam.breed === "english_bulldog" ? "English" : "French"} Bulldog)` : ""}`
+ }));

  return (
    <CreatePuppyPanel
      statusOptions={statusOptions}
-     litterOptions={litterOptions}
+     sireOptions={sireOptions}
+     damOptions={damOptions}
    />
  );
}
```

---

### 5. Форма создания щенка

**Файл:** `app/admin/(dashboard)/puppies/create-puppy-panel.tsx`

#### Интерфейс обновлён:

```diff
interface CreatePuppyPanelProps {
  statusOptions: StatusOption[];
- litterOptions: LitterOption[];
+ sireOptions: ParentOption[];
+ damOptions: ParentOption[];
}

export function CreatePuppyPanel({
  statusOptions,
- litterOptions
+ sireOptions,
+ damOptions
}: CreatePuppyPanelProps) {
```

#### Старый UI (один dropdown):

```jsx
<div className="space-y-2">
  <label htmlFor="litterId">Litter (optional)</label>
  <select id="litterId" name="litterId">
    <option value="">No litter (private breeding)</option>
    {litterOptions.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
</div>
```

#### Новый UI (два dropdown):

```jsx
{/* Sire (Father) */}
<div className="space-y-2">
  <label htmlFor="sireId">Sire / Father (optional)</label>
  <select id="sireId" name="sireId" disabled={pending}>
    <option value="">No sire specified</option>
    {sireOptions.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
  {fieldError("sireId") ? <p className="text-xs text-red-500">{fieldError("sireId")}</p> : null}
</div>

{/* Dam (Mother) */}
<div className="space-y-2">
  <label htmlFor="damId">Dam / Mother (optional)</label>
  <select id="damId" name="damId" disabled={pending}>
    <option value="">No dam specified</option>
    {damOptions.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
  {fieldError("damId") ? <p className="text-xs text-red-500">{fieldError("damId")}</p> : null}
</div>
```

**Пример dropdown options:**
- Sire: `"Sir Winston (English Bulldog)"`, `"Pierre (French Bulldog)"`
- Dam: `"Lady Clementine (English Bulldog)"`, `"Colette (French Bulldog)"`

---

### 6. Server Action

**Файл:** `app/admin/(dashboard)/puppies/actions.ts`

```diff
const submission = {
  name: formData.get("name"),
  status: formData.get("status") ?? "available",
  priceUsd: formData.get("priceUsd"),
  birthDate: formData.get("birthDate"),
- litterId: formData.get("litterId"),
  slug: formData.get("slug"),
+ sireId: formData.get("sireId"),
+ damId: formData.get("damId"),
  sex: formData.get("sex"),
  color: formData.get("color"),
  weightOz: formData.get("weightOz"),
  description: formData.get("description"),
};
```

---

### 7. Публичные страницы

**Файл:** `lib/supabase/queries.ts`

#### `getPuppyBySlug` - приоритет прямым ID:

```typescript
export const getPuppyBySlug = cache(async (slug: string) => {
  const { data, error } = await getSupabaseClient()
    .from("puppies")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return null;

  const litters = await getLitters();
  const litter = data.litter_id ? litters.find((l) => l.id === data.litter_id) ?? null : null;
  const parentsList = await getParents();

  // Приоритет: прямые sire_id/dam_id → litter parents → null
  const parents = {
    sire: data.sire_id
      ? parentsList.find((p) => p.id === data.sire_id) ?? null
      : litter?.sire_id
        ? parentsList.find((p) => p.id === litter.sire_id) ?? null
        : null,
    dam: data.dam_id
      ? parentsList.find((p) => p.id === data.dam_id) ?? null
      : litter?.dam_id
        ? parentsList.find((p) => p.id === litter.dam_id) ?? null
        : null,
  };

  return { ...data as Puppy, litter, parents } as PuppyWithRelations;
});
```

**Логика:**
1. Сначала проверяем `puppy.sire_id` и `puppy.dam_id` (новый подход)
2. Если не найдено → проверяем `litter.sire_id` и `litter.dam_id` (старый подход)
3. Если и там пусто → `null` (показывается "TBD")

#### `getPuppiesWithRelations` - обновлена аналогично:

```typescript
const sire = puppy.sire_id
  ? parentById.get(puppy.sire_id) ?? null
  : litter?.sire_id
    ? parentById.get(litter.sire_id) ?? null
    : null;

const dam = puppy.dam_id
  ? parentById.get(puppy.dam_id) ?? null
  : litter?.dam_id
    ? parentById.get(litter.dam_id) ?? null
    : null;
```

---

## Тестирование

### Обновлены тесты:

**Файл:** `app/puppies/page.test.tsx`

```diff
const mockPuppies = [
  {
    id: 'puppy-1',
    litter_id: null,
+   sire_id: null,
+   dam_id: null,
    name: 'Buddy',
    // ... остальные поля
  }
];
```

**Файл:** `lib/supabase/queries.test.ts`

```diff
const basePuppy: Omit<PuppyWithRelations, "parents" | "litter"> = {
  id: "id-1",
  litter_id: "litter-1",
+ sire_id: null,
+ dam_id: null,
  name: "Duke",
  // ... остальные поля
};
```

### Валидация:

```bash
✅ npm run typecheck    # TypeScript compilation passed
✅ npm run lint         # ESLint validation passed (max-warnings=0)
✅ npm run build        # Production build succeeded
```

**Результат:** Все проверки пройдены успешно.

---

## Преимущества

### 1. Упрощение рабочего процесса

**Раньше:**
1. Создать родителей (sire, dam)
2. Создать litter и указать sire_id, dam_id
3. Создать щенка и указать litter_id

**Теперь:**
1. Создать родителей (если ещё нет)
2. Создать щенка и выбрать родителей из dropdown

**Экономия:** 1 шаг убран, меньше копирования UUID.

---

### 2. Гибкость

- Можно создать щенка **без родителей** (показывается "Sire: TBD", "Dam: TBD")
- Можно указать **только отца** или **только мать**
- Можно указать **обоих родителей**
- Не обязательно создавать litter для каждого помёта

---

### 3. Подготовка к Phase 2: Фотографии родителей

**Инфраструктура уже готова:**

```typescript
export type Parent = {
  id: string;
  name: string;
  photo_urls: string[] | null;  // ← Уже есть!
  video_urls: string[] | null;  // ← Уже есть!
  // ...
};
```

**Будущие шаги (Phase 2):**
1. Добавить UI загрузки фото в админ-панель (Supabase Storage)
2. Показать фото родителей на карточке щенка (маленькие thumbnails рядом с именами)
3. Создать страницу родителя с полной галереей

**Пример:** На карточке Regal рядом с "Sire: Sir Winston" появится миниатюра фото Sir Winston.

---

### 4. Лучшая структура данных

**Старая структура:**
```
Puppy --litter_id--> Litter --sire_id--> Parent (Sire)
                           --dam_id--> Parent (Dam)
```
**Проблемы:**
- Промежуточная таблица (litter) нужна всегда
- Нельзя указать родителей без litter

**Новая структура:**
```
Puppy --sire_id--> Parent (Sire)
      --dam_id--> Parent (Dam)
```
**Преимущества:**
- Прямая связь
- Опциональный litter (для дополнительной информации)
- Проще для понимания

---

## Обратная совместимость

### Гарантии:

1. ✅ **Существующие щенки с `litter_id` продолжают работать**
   - Код проверяет сначала `sire_id/dam_id`, потом fallback на `litter.sire_id/dam_id`

2. ✅ **Миграция данных выполнена автоматически**
   - Все существующие щенки с litter теперь также имеют `sire_id` и `dam_id`
   - SQL UPDATE скопировал данные из litters в puppies

3. ✅ **Поле `litter_id` сохранено**
   - Не удалено из базы
   - Можно использовать для группировки щенков по помёту
   - Публичные страницы всё ещё показывают `"Litter: Royal Heritage Litter"`

### Тестирование на реальных данных:

**Щенок "Regal" (создан со старым подходом):**
- До миграции: `litter_id = "aaaaa..."`, `sire_id = null`, `dam_id = null`
- После миграции: `litter_id = "aaaaa..."`, `sire_id = "11111..."` (Sir Winston), `dam_id = "22222..."` (Lady Clementine)
- Результат: Показывает "Sire: Sir Winston", "Dam: Lady Clementine" ✅

**Щенок "Plusha" (создан без litter):**
- До изменений: `litter_id = null`, показывало "Sire: TBD", "Dam: TBD"
- После изменений: можно выбрать родителей напрямую через новые dropdown
- Результат: Гибкость повысилась ✅

---

## Будущие улучшения

### Phase 2: Управление родителями

#### 1. Фотографии родителей

**Админ-панель:**
- Страница `/admin/parents` с CRUD для родителей
- Загрузка фото через Supabase Storage
- Обновление поля `photo_urls[]` для каждого родителя

**Публичные страницы:**
```jsx
<div className="flex items-center gap-2">
  {puppy.parents?.sire?.photo_urls?.[0] && (
    <img
      src={puppy.parents.sire.photo_urls[0]}
      alt={puppy.parents.sire.name}
      className="w-10 h-10 rounded-full object-cover"
    />
  )}
  <span>Sire: {sireName ?? "TBD"}</span>
</div>
```

**Пример:** Карточка Regal показывает:
- Маленькое фото Sir Winston рядом с "Sire: Sir Winston"
- Маленькое фото Lady Clementine рядом с "Dam: Lady Clementine"

---

#### 2. Страницы родителей

**URL:** `/parents/[slug]`

**Содержание:**
- Фотогалерея родителя
- Информация о породе
- Список всех детей (щенки от этого родителя)
- Health clearances (сертификаты)
- Вес, окрас, дата рождения

**Пример:** `/parents/sir-winston` показывает:
- Фото Sir Winston
- "English Bulldog"
- "Health Clearances: OFA Hips Excellent, CERF Clear"
- "Children: Regal, Duke, Pearl" (с ссылками)

---

#### 3. Inline добавление родителей

**Текущее состояние:**
- Dropdown показывает только **существующих** родителей из базы
- Если нужного родителя нет → нужно создать вручную через отдельную админку

**Улучшение:**
```jsx
<select id="sireId" name="sireId">
  <option value="">No sire specified</option>
  {sireOptions.map(...)}
  <option value="__new__">+ Add new sire...</option>
</select>

{showNewSireForm && (
  <input
    type="text"
    placeholder="Enter sire name"
    onBlur={(e) => createParent({ name: e.target.value, sex: 'male' })}
  />
)}
```

**Преимущество:** Можно создать родителя "на лету" прямо при создании щенка.

---

## Инструкция по использованию

### Как создать щенка с родителями:

1. **Открыть админ-панель:** `/admin/puppies`
2. **Нажать "Add puppy"**
3. **Заполнить основные поля:**
   - Name: `"Buddy"`
   - Slug: `"buddy"` (автогенерация)
   - Status: `"Available"`
   - Price: `$4200`
   - Birth Date: `2024-11-08`
   - Sex: `"Male"`
   - Color: `"Fawn"`
   - Weight: `38 oz`

4. **Выбрать родителей:**
   - **Sire / Father:** `"Sir Winston (English Bulldog)"` ← dropdown
   - **Dam / Mother:** `"Lady Clementine (English Bulldog)"` ← dropdown

5. **Добавить описание (optional):**
   ```
   Calm demeanor, excels with children, AKC paperwork included.
   ```

6. **Нажать "Create puppy"**

7. **Результат:**
   - Щенок создан в базе с `sire_id` и `dam_id`
   - Публичная страница `/puppies/buddy` показывает:
     - "Sire: Sir Winston"
     - "Dam: Lady Clementine"
     - "Litter: Private" (если litter не указан)

---

### Как создать щенка БЕЗ родителей:

1. Пропустить шаги 4 (оставить dropdown на "No sire specified" и "No dam specified")
2. Результат: карточка показывает "Sire: TBD", "Dam: TBD"

---

### Как добавить фото родителям (Phase 2):

**Пока недоступно.** Планируется в следующей фазе:

1. Админ-панель: `/admin/parents`
2. Найти родителя: "Sir Winston"
3. Загрузить фото через Supabase Storage
4. Обновить `photo_urls[]` в таблице `parents`
5. Фото автоматически появится на всех карточках щенков, где Sir Winston — отец

---

## Заключение

### Что сделано:

✅ **Миграция базы данных** - добавлены поля `sire_id` и `dam_id` в таблицу `puppies`
✅ **Обновлены TypeScript типы** - тип `Puppy` теперь включает новые поля
✅ **Добавлены query функции** - `fetchAdminSires()` и `fetchAdminDams()` для фильтрации по полу
✅ **Обновлена валидация** - schema теперь проверяет `sireId` и `damId`
✅ **Обновлена админ-панель** - два отдельных dropdown вместо одного
✅ **Обновлены server actions** - извлечение и сохранение новых полей
✅ **Обновлены публичные страницы** - приоритет прямым ID, fallback на litter
✅ **Обратная совместимость** - старые данные мигрированы, litter сохранён
✅ **Тесты обновлены** - все моки включают новые поля
✅ **Валидация пройдена** - TypeScript, ESLint, Production Build успешны

### Что НЕ сделано (Phase 2):

⏳ **Загрузка фото родителей** - UI для Supabase Storage
⏳ **Отображение фото на карточках** - thumbnails рядом с именами
⏳ **Страницы родителей** - `/parents/[slug]` с галереей и детьми
⏳ **Управление родителями** - CRUD админка для parents
⏳ **Inline создание родителей** - "Add new sire..." в dropdown

### Статус:

**🟢 PRODUCTION READY**

Система полностью функциональна и готова к использованию. Все изменения backward-compatible. Инфраструктура для фото уже готова (`photo_urls` field exists).

### Коммит:

```
feat(admin): replace litter dropdown with direct parent selection

Commit: 1787362
Date: 2025-11-08
Files Changed: 10
Lines Added: 154
Lines Removed: 31
```

---

**Готово к развёртыванию на production!** 🚀
