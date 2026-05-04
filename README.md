# Midea Chillers — лендинг

Лендинг про модульные чиллеры Midea со встроенным гидромодулем для дистрибьютора «Даичи».

**Стек:** Astro 5 + Tailwind CSS + IntersectionObserver (для reveal-анимаций) + GSAP (зарезервирован для сложных скролл-сцен в будущем).

**Цель:** статический сайт без тормозов. На текущей итерации — `0 KB JS` baseline, скрипты для видео-лайтбокса и параллакса подключаются inline только на тех страницах, где они нужны.

## Запуск локально

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # preview сборки
```

## Структура

```
src/
├── layouts/
│   └── Layout.astro              ← корневой шаблон, meta, шрифты
├── components/
│   ├── Header.astro              ← шапка
│   ├── Button.astro              ← CTA-кнопка
│   ├── Pill.astro                ← pill-бейдж "Эксклюзив" / "Уже на складе"
│   ├── FeatureCard.astro         ← карточка фичи 190×190
│   ├── VideoCard.astro           ← видео-карточка с лайтбоксом
│   ├── DetailItem.astro          ← карточка детали (01, 02, 03, 04)
│   ├── ProductCard.astro         ← карточка модельного ряда
│   └── sections/
│       ├── Banner.astro          ← заголовок + CTA-карточка дистрибьютора
│       ├── Hero.astro            ← большой city-фон с pin-плашками
│       ├── Details.astro         ← "Готовое решение от производителя…" + 4 детали
│       └── Products.astro        ← 3 серии чиллеров + Custom Solutions
├── pages/
│   └── index.astro               ← главная: собирает все секции
├── styles/
│   └── global.css                ← дизайн-токены как CSS-переменные, base
└── lib/
    └── reveal.ts                 ← IntersectionObserver для reveal-on-scroll
```

## Дизайн-токены

Все живут в двух местах одновременно (для удобства):
- `src/styles/global.css` — как CSS-переменные (для произвольного CSS)
- `tailwind.config.mjs` — как Tailwind-токены (для классов)

| Токен | Значение | Что это |
| --- | --- | --- |
| `--brand` | `#32a3fd` | основной голубой |
| `--brand-light` | `#81c7ff` | светлый акцент (начало градиента) |
| `--brand-dark` | `#1e8fe9` | тёмный акцент (конец градиента) |
| `--ink-900` | `#0a0d12` | главный фон страницы |
| `--ink-surface` | `#16191d` | фон Product Section |
| `--ink-base` | `#0f1115` | фон карточки продукта |
| `--text-primary` | `#ebf0f4` | основной текст |
| `--border-strong` | `rgba(255,255,255,0.16)` | бордер карточек |

Типографика — `Gotham Pro` (см. ниже про шрифты), шкала: H1 48px / H2 32px / H3 24px / H4 18px / body 14px.

## Что нужно положить тебе

### 1. Шрифты Gotham Pro

Положи 3 файла в `public/fonts/`:
- `GothamPro-Bold.woff2`
- `GothamPro-Medium.woff2`
- `GothamPro-Regular.woff2`

В `Layout.astro` раскомментируй блок `<link rel="preload" href="/fonts/...">`.

Пока шрифта нет — сайт автоматически использует Manrope с Google Fonts (визуально близкий, бесплатный).

### 2. Ассеты из Figma

В коде они лежат как плейсхолдеры в `public/images/`. Заменишь на реальные с теми же именами:

| Файл | Что | Откуда из Figma (node-id) |
| --- | --- | --- |
| `hero-city.jpg` + `hero-city.webp` | Фоновая картинка-город под hero | внутри `183:743` (Features Background) |
| `feature-warehouse.jpg` | Фича "Всегда в наличии на складе" | `183:775` |
| `feature-midea.jpg` | "Решение без аналогов в РФ" | `183:777` |
| `feature-plugplay.jpg` | "Технология Plug&Play" | `183:776` |
| `feature-energy.jpg` | "На 30% ниже расход электроэнергии" | `183:778` |
| `icon-star.svg` | Иконка для бейджа "Эксклюзив" | `684:1258` |
| `icon-bolt.svg` | Иконка для бейджа "Уже на складе" | `683:1253` |
| `logo-daichi.svg` | Лого Daichi в Banner-карточке | `204:803` |
| `detail-01.jpg` … `detail-04.jpg` | Иллюстрации к деталям 01-04 | `486:6227`, `486:5838`, `486:5840`, `486:5842` |
| `product-aqua.jpg` | Картинка чиллера AQUA THERMAL GM | внутри `486:4878` |
| `product-arctic.jpg` | Картинка чиллера Arctic | внутри `486:4879` |
| `product-eco.jpg` | Картинка чиллера ECO mini | внутри `486:4880` |
| `custom-solutions.jpg` | Фото для блока "−40°C доработка" | `486:4881` |
| `og.jpg` | OG-картинка для соцсетей | сделай 1200×630 |

**Важно про Hero:** для лучшей производительности сделай 2 версии — `.jpg` и `.webp`. WebP подгрузится автоматически через `<picture>`. Целевой вес — до 200 KB для каждой.

### 3. Видео

Положи в `public/videos/`:
- `product.mp4` — основной файл (H.264, разрешение 1080p, ~5–10 МБ)
- `product.webm` — альтернативный (VP9 / AV1, ещё меньше)
- `video-poster.jpg` — постер 1280×720

Видео грузится **только** после клика — `preload="none"`. Никакого автоплея, никаких фоновых загрузок до того, как пользователь сам захочет.

## Что готово

- [x] Header (sticky, glassmorphism, навигация, бургер на мобилке)
- [x] Banner (бейджи, заголовок с градиентом, CTA-карточка дистрибьютора)
- [x] Hero (большой фон с городом, 4 pin-плашки фич + видео-карточка)
- [x] Details Section (заголовок + 4 карточки: 01, 02, 03, 04)
- [x] Products Section (3 серии + табличка спецификаций "Показать все")
- [x] Custom Solutions блок (-40°C доработка)
- [x] Reveal-on-scroll анимации (IntersectionObserver, без GSAP)
- [x] Параллакс на hero-картинке
- [x] Видео-лайтбокс с ленивой загрузкой
- [x] `prefers-reduced-motion` поддерживается
- [x] OG-метатеги, theme-color, viewport
- [x] Базовый адаптив для основных секций

## Что осталось

- [ ] Contact Section
- [ ] USP Footer Grid (6 блоков преимуществ)
- [ ] Related Projects (слайдер)
- [ ] Business Solutions (нумерованные 01-03)
- [ ] FAQ (аккордеон)
- [ ] Final CTA + Footer
- [ ] Полный мобильный адаптив (sub-1024)
- [ ] Реальные изображения и шрифты (см. выше)
- [ ] Подключение GSAP ScrollTrigger для сложных скролл-сцен (если потребуется)
- [ ] Форма заявки (бэк-эндпоинт)

## Деплой

Любой статический хостинг подойдёт. Простейший вариант:

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Cloudflare Pages:**
- Подключи репозиторий
- Build command: `npm run build`
- Build output: `dist`

**Netlify:**
- Build command: `npm run build`
- Publish directory: `dist`

## Перформанс

Текущие показатели baseline (без реальных ассетов, на плейсхолдерах):
- HTML: ~17 KB
- CSS: ~22 KB
- **JS: 0 KB** на baseline. Скрипты подгружаются inline для интерактивных компонентов (видео, параллакс, reveal).
- Никаких HTTP-запросов к третьим сторонам, кроме Google Fonts (легко убрать когда положишь Gotham Pro).

Под Lighthouse целимся в 95+ по Performance после замены плейсхолдеров на оптимизированные WebP/AVIF.

## Скрипты-помощники

- `scripts/gen-placeholders.py` — генерирует плейсхолдеры для hero/features
- `scripts/gen-placeholders-2.py` — для details/products

После замены реальными ассетами эти скрипты можно удалить (или оставить как docs).
