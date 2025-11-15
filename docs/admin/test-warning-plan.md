# Test Warning Remediation Plan

## Контекст проблемы
- Запуск `npm run test` выводил предупреждение Node.js `--localstorage-file was provided without a valid path`.
- Трассировка с `NODE_OPTIONS=--trace-warnings` показала источник: `@supabase/auth-js/src/lib/helpers.ts` вызывает `globalThis.localStorage`, что дергает встроенную реализацию Node (`node:internal/webstorage`), ожидающую путь для файла локального хранилища.
- В Vitest среде мы используем jsdom, поэтому достаточно прокинуть собственный `localStorage` и `sessionStorage`, чтобы Supabase не трогал системную реализацию.

## Первоначальные попытки решения
1. ❌ Была попытка использовать `scripts/run-vitest.mjs` для передачи флага `--localstorage-file` через NODE_OPTIONS.
   - Флаг `--localstorage-file` был введен только в **Node.js 22.4.0** (июль 2024).
   - Попытка использовать этот флаг на Node 18/20 приводила к ошибке: `bad option: --localstorage-file`.

2. ❌ Попытка добавить полифиллы для webidl-conversions (ArrayBuffer.prototype.resizable).
   - Полифиллы не запускались достаточно рано - модули загружались при парсинге Vitest.

## Обнаруженная коренная причина

**Несовместимость версий Node.js и зависимостей:**

### Текущее состояние
- **Локально**: Node.js v18.20.8
- **CI**: Node.js v20.x

### Проблемные зависимости
При `npm install` выводятся критичные предупреждения о несовместимости движка:

```
EBADENGINE Unsupported engine {
  package: 'jsdom@27.0.0',
  required: { node: '>=20' },
  current: { node: 'v18.20.8', npm: '10.8.2' }
}
EBADENGINE Unsupported engine {
  package: 'webidl-conversions@8.0.0',
  required: { node: '>=20' },
  current: { node: 'v18.20.8', npm: '10.8.2' }
}
EBADENGINE Unsupported engine {
  package: '@vitejs/plugin-react@5.0.4',
  required: { node: '^20.19.0 || >=22.12.0' },
  current: { node: 'v18.20.8', npm: '10.8.2' }
}
```

**Критические пакеты требуют Node 20+:**
- jsdom@27.0.0 (`node: '>=20'`)
- webidl-conversions@8.0.0 (`node: '>=20'`)
- @vitejs/plugin-react@5.0.4 (`node: '^20.19.0 || >=22.12.0'`)
- И ещё ~10 транзитивных зависимостей

### Проявление проблемы
```
TypeError: Cannot read properties of undefined (reading 'get')
 ❯ Object.<anonymous> node_modules/webidl-conversions/lib/index.js:325:94
```

Это происходит потому, что `webidl-conversions@8.0.0` пытается получить доступ к `ArrayBuffer.prototype.resizable` и `SharedArrayBuffer.prototype.growable`, которые были добавлены только в Node 20+.

## Финальное решение

### Шаг 1: Упрощение конфигурации (COMPLETED)
1. ✅ Удален файл `scripts/run-vitest.mjs`.
2. ✅ Обновлены скрипты в `package.json`:
   - `"test": "vitest run"` (вместо `"node scripts/run-vitest.mjs run"`)
   - `"test:watch": "vitest watch"` (вместо `"node scripts/run-vitest.mjs"`)
3. ✅ Обновлен `.gitignore`:
   - Изменено `.vitest-localstorage` на `.vitest-localstorage*` для игнорирования SQLite WAL/SHM файлов.
4. ✅ Удалены экспериментальные полифиллы (tests/setup/dom-storage.ts, tests/setup/webidl-polyfill.ts).
5. ✅ Очищен vitest.config.mts (удалены `pool: "forks"` и `globalSetup`).

### Шаг 2: Обновление Node.js (REQUIRED)
**Обновите локальную версию Node.js с 18.20.8 до 20.x LTS:**

#### Для разработчиков, использующих nvm:
```bash
# Установить Node 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Переустановить зависимости
rm -rf node_modules package-lock.json
npm install
```

#### Альтернатива (если обновление Node не подходит):
Downgrade jsdom до версии, совместимой с Node 18:
```bash
npm install --save-dev jsdom@25.0.1 canvas@2.11.2
```
**НО:** Это потребует компиляции нативных зависимостей canvas (pixman-1, cairo и др.), что может быть проблематично на macOS.

## Рекомендация
**Обновитесь до Node 20 LTS.** Это:
- Решает все проблемы совместимости
- Соответствует CI окружению (уже использует Node 20)
- Избегает сложностей с компиляцией нативных модулей
- Обеспечивает поддержку современных Next.js/Vite/Vitest версий

## После обновления Node 20
- ✅ Все тесты должны проходить успешно.
- ✅ Нет предупреждений о webidl-conversions.
- ✅ Нет предупреждений об unsupported engines.
- ✅ Решение работает идентично в CI и локально.
