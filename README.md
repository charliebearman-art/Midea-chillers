# Modular Midea Chillers — Daichi Promo Landing

Лендинг «Модульные чиллеры Midea со встроенным гидромодулем» для размещения по адресу **`https://air-midea.com/gmchillerspromo/`** (подпапка существующего сайта).

## Tech stack

- **Astro 5** (SSG, output: static) — генерирует чистый HTML/CSS/JS
- **Tailwind CSS** (через `@astrojs/tailwind`)
- **TypeScript** в script-блоках компонентов
- **Без бэкенда** — статика. Форма отправляется через `fetch()` на API существующего сайта (см. [HANDOFF.md](./HANDOFF.md))

## Установка и dev

```bash
npm install
npm run dev          # http://localhost:4321/gmchillerspromo/
npm run build        # сборка → dist/
npm run preview      # preview сборки
```

Содержимое `dist/` — готовые статические файлы для деплоя на сервер по пути `/gmchillerspromo/`.

## Структура

```
src/
├── assets/images/        # обрабатываемые Astro <Image> картинки (генерит webp + responsive variants)
├── components/           # переиспользуемые компоненты
│   ├── sections/         # блоки страницы (Hero, Banner, Details, Products, ...)
│   ├── PlayButton.astro
│   ├── Header.astro
│   └── ...
├── layouts/Layout.astro  # head, meta, JSON-LD, scripts
├── lib/                  # утилиты
│   ├── asset.ts          # helper для путей с base-prefix
│   ├── reveal.ts         # IntersectionObserver reveal-on-scroll
│   └── ...
├── pages/index.astro     # единственная страница
└── styles/global.css     # design tokens, font-face, общие стили

public/                   # static assets (отдаются как есть, БЕЗ оптимизации)
├── images/
│   ├── og.jpg            # OG-превью для соцсетей (1200×630)
│   ├── logo-*.svg        # логотипы
│   ├── icon-*.svg        # иконки
│   ├── product-*.jpg     # фото продуктов
│   ├── project-*.jpg     # фото объектов
│   ├── feature-*.jpg     # 118px карточки в Hero
│   ├── story-*.jpg       # картинки для модалок-сториз
│   ├── usp-*.jpg
│   ├── business-custom.jpg
│   └── custom-solutions.jpg
├── videos/
│   ├── hero-bg.mp4       # фоновое видео hero
│   ├── numberonesmall.mp4
│   └── backgroundsmall.mp4
├── fonts/                # Gotham Pro woff2
├── robots.txt
└── sitemap.xml
```

## Конфигурация subpath

**`astro.config.mjs`:**
- `site: "https://air-midea.com"` — production-домен (canonical/sitemap/OG)
- `base: "/gmchillerspromo"` — URL-префикс подпапки

⚠️ **При изменении `base`** синхронно обновить:
- `src/styles/global.css` — `@font-face url(...)` пути (Astro НЕ переписывает CSS)
- `public/robots.txt` — Sitemap, Allow/Disallow
- `public/sitemap.xml` — `<loc>`

Все остальные пути в коде используют helper `asset()` из `src/lib/asset.ts` — они автоматически подхватят новый base через `import.meta.env.BASE_URL`.

## Перформанс

Текущая baseline:
- **PageSpeed Mobile**: LCP ~2-2.5s после оптимизаций
- **JS bundle**: ~10 KB (только interactive: видео, parallax, reveal, форма)
- Hero poster: 200 KB webp (вместо 752 KB JPEG)
- Detail/Product картинки: responsive variants 24-175 KB на DPR
- Manrope (fallback) загружается асинхронно через `rel="preload" + onload`

## SEO

- Canonical, robots, OG, Twitter Card, всё в [`src/layouts/Layout.astro`](src/layouts/Layout.astro)
- JSON-LD: `Organization`, `WebSite`, `Product`, `FAQPage` (последний в [`src/components/sections/Faq.astro`](src/components/sections/Faq.astro))
- `public/sitemap.xml` (single-page)
- Тексты подзаголовков и заголовков следуют типографическим правилам русского языка (неразрывные пробелы перед короткими предлогами/частицами)

## Документы

- **[HANDOFF.md](./HANDOFF.md)** — деплой и API-контракт формы для backend-разработчика
- **[JIRA_TASK.md](./JIRA_TASK.md)** — готовое описание задачи в Jira

## Команда

- **Front-end**: Кирилл Погорелов
- **Дизайнер**: см. Figma — `r9URmH8sSH3dTbiMgwutkL`
