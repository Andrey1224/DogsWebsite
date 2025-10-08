Sprint: Recolor & Theming
Цели спринта

Ввести цветовые токены (design tokens) и маршрутизировать через CSS variables + Tailwind.

Реализовать две темы: Light (по умолчанию) и Dark (переключатель/авто).

Перекрасить ключевые компоненты (Hero, Buttons, Cards, Typography, Footer).

Гарантировать контраст AA/AAA для текста и кнопок.

Никаких регрессий: все страницы выглядят корректно.

Бэклог задач (тикеты)
1) Подготовка дизайн-токенов (0.5д)

Задачи

Завести токены --bg, --bg-card, --text, --text-muted, --accent, --accent-2-start, --accent-2-end, --accent-aux, --footer-bg.

Добавить токены производные: --btn-bg, --btn-text, --link, --border, --hover, чтобы меньше хардкода в компонентах.

Определить таблицу соответствий из вашей палитры.

Таблица токенов → HEX (Light)

--bg: #F9FAFB

--bg-card: #FFFFFF

--text: #111111

--text-muted: #555555

--accent: #FFB84D

--accent-2-start: #FF4D79

--accent-2-end: #FF7FA5

--accent-aux: #0D1A44

--footer-bg: #E5E7EB

Токены → HEX (Dark)

--bg: #0D1A44

--bg-card: #1C1C1C

--text: #FFFFFF

--text-muted: #D1D5DB

--accent: #FFB84D

--accent-2-start: #FF4D79

--accent-2-end: #FF7FA5

--accent-aux: #FFD166

--footer-bg: #0A0F24

2) Базовая инфраструктура тем (0.5д)

Задачи

В globals.css объявить переменные для :root (light) и для [data-theme="dark"].

Tailwind: настроить цвета через CSS variables (без жёстких HEX в классах).

Внедрить переключатель темы (toggle) + авто-режим по prefers-color-scheme.

Пример: CSS variables

/* light by default */
:root {
  --bg:#F9FAFB; --bg-card:#FFFFFF;
  --text:#111111; --text-muted:#555555;
  --accent:#FFB84D;
  --accent-2-start:#FF4D79; --accent-2-end:#FF7FA5;
  --accent-aux:#0D1A44; --footer-bg:#E5E7EB;
  --border: rgba(0,0,0,.08);
  --btn-bg: var(--accent); --btn-text: #111111;
  --link: var(--accent-aux); --hover: rgba(0,0,0,.04);
}

[data-theme="dark"] {
  --bg:#0D1A44; --bg-card:#1C1C1C;
  --text:#FFFFFF; --text-muted:#D1D5DB;
  --accent:#FFB84D;
  --accent-2-start:#FF4D79; --accent-2-end:#FF7FA5;
  --accent-aux:#FFD166; --footer-bg:#0A0F24;
  --border: rgba(255,255,255,.12);
  --btn-bg: var(--accent); --btn-text: #0D1A44;
  --link: var(--accent);
  --hover: rgba(255,255,255,.06);
}


Tailwind пример конфигурации (фрагмент)

// tailwind.config.ts
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        card: "var(--bg-card)",
        text: "var(--text)",
        muted: "var(--text-muted)",
        accent: "var(--accent)",
        accent2s: "var(--accent-2-start)",
        accent2e: "var(--accent-2-end)",
        aux: "var(--accent-aux)",
        footer: "var(--footer-bg)",
        border: "var(--border)",
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(90deg,var(--accent-2-start),var(--accent-2-end))",
      },
    },
  },
};

3) Перекраска базовых слоёв (1д)

Задачи

Применить токены на layout уровнях:

body→ bg-bg text-text

карточки → bg-card border-border

футер → bg-footer

Глобальные ссылки/ховеры: text-aux hover:opacity-90, либо bg-accent-gradient для особых ссылок/иконок.

Проверка

Все страницы унаследовали фон/текст. Нет «голых» HEX в глобальных стилях.

4) Компоненты UI (1–2д)

Порядок: Buttons → Inputs → Cards → Navbar/Footer → Badges/Chips → Banners/Alerts → Hero/CTA.

Примеры

// Button (solid)
<button className="inline-flex items-center rounded-2xl px-5 py-2.5
 bg-[color:var(--btn-bg)] text-[color:var(--btn-text)]
 shadow hover:brightness-105 active:brightness-95 transition">
  Reserve
</button>

// Button (gradient)
<button className="rounded-2xl px-5 py-2.5 text-white
 bg-accent-gradient shadow hover:opacity-95">Contact</button>

// Card
<div className="rounded-2xl bg-card border border-border p-4 shadow-sm">
  <h3 className="text-xl text-text">French Bulldog</h3>
  <p className="text-sm text-muted">Born: 2025-08-12</p>
</div>


Checklist компонента

Не осталось «жёстких» HEX.

Темизация из токенов; hover/active используют --hover или яркость.

Контраст: основной текст ≥ 4.5:1 на фоне, кнопки ≥ 3:1 (WCAG AA).

5) Специальные элементы (0.5д)

Задачи

Градиенты для «Акцент 2»: добавить утилиту bg-accent-gradient.

Иконки: использовать fill-[color:var(--aux)] или text-aux.

Бейджи статуса (available/reserved/sold):

available → border-aux text-aux (или лёгкий градиент)

reserved → фон #FFE8CC (из accent, прозрачность) / dark: подберите на глаз с токенов

sold → низкая насыщенность muted + зачёркнутая цена (если нужно)

6) Доступность и контраст (0.5д)

Задачи

Прогнать контрасты (например, через плагин в браузере или axe).

Проверить фокус-стили (outline, цвет) для клавиатуры.

Проверить тёмную тему для карточек/форм/баннеров.

7) Финализация и регресс-тест (0.5д)

Задачи

Снимки скриншотов до/после ключевых страниц.

Лайт/дарк переключение, кэш темы в localStorage (если нужно).

Просмотреть на 3 ширинах: 375, 768, 1280.

Definition of Done

Все цвета заведены как токены, нет «случайных» HEX в коде.

Light/Dark работает на всех страницах, переключатель сохраняет выбор.

Контраст WCAG AA выдержан (текст/кнопки/формы).

Основные компоненты перекрашены и визуально единообразны.

Нет визуальных регрессий на мобильном и десктопе.

Риски и как избежать

Жёсткие HEX в сторонних либах → оборачивать в контейнеры/override через CSS vars.

Градиенты слишком агрессивны → использовать только для hover/CTA, не на текстовых блоках.

Тёмная тема «проваливается» → проверить карточки/инпуты с контуром border-border.
