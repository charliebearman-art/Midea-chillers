# JIRA-таск для backend: размещение лендинга `/gmchillerspromo/` и интеграция формы

> **Тип**: Story
> **Epic**: Промо-лендинг модульных чиллеров Midea
> **Estimate**: 4–8 ч (deploy + form integration без spam-protection)
> **Зависимости**: репозиторий и доступ к `air-midea.com` инфраструктуре

---

## Summary

Разместить статический лендинг **«Модульные чиллеры Midea»** в подпапке существующего сайта по адресу `https://air-midea.com/gmchillerspromo/` и подключить форму обратной связи к бэкенду `air-midea.com`.

Лендинг — чисто фронтовый Astro SSG (output: static). Сборка `npm run build` даёт папку `dist/` с готовыми HTML/CSS/JS/изображениями, которые нужно положить на сервер.

Документация в репозитории:
- [`README.md`](README.md) — обзор проекта, dev/build
- [`HANDOFF.md`](HANDOFF.md) — детальные инструкции по деплою и API-контракту

---

## Описание

### Контекст
- Лендинг — отдельный проект на Astro, не связанный с CMS существующего сайта `air-midea.com`.
- Маркетинг попросил разместить его как подпапку, чтобы был **общий домен** (для SEO и брендинга), а не поддомен.
- Все ассеты лежат в репозитории, никакая база данных или серверный рендер не нужны.

### Что должен сделать backend
1. **Принять артефакт** `dist/` после `npm run build` (либо склонировать репо и собрать сам).
2. **Задеплоить статику** на сервер по пути `/gmchillerspromo/` существующего сайта.
3. **Настроить nginx/CDN** на отдачу статики с правильными cache headers.
4. **Создать API-endpoint** `POST /api/contact` для приёма формы.
5. **Скоординировать robots.txt** существующего сайта с правилами лендинга.

---

## Acceptance Criteria

### Деплой статики

- [ ] `https://air-midea.com/gmchillerspromo/` открывается без 404
- [ ] Все ассеты (`/gmchillerspromo/_astro/...`, `/gmchillerspromo/images/...`, `/gmchillerspromo/videos/...`, `/gmchillerspromo/fonts/...`) отдаются корректно
- [ ] Cache headers:
  - `_astro/*` (хешированные имена): `Cache-Control: public, max-age=31536000, immutable`
  - `index.html`: `Cache-Control: no-cache`
- [ ] `robots.txt` существующего сайта обновлён правилами для `/gmchillerspromo/` (или настроен редирект `/gmchillerspromo/robots.txt → /robots.txt`)

### Форма обратной связи

- [ ] Создан endpoint `POST /api/contact` (точный путь согласовать)
- [ ] Endpoint принимает `multipart/form-data` со полями:
  - `name` (text, required)
  - `phone` (text, required)
  - `comment` (text, optional)
  - `files` (file[], optional, .jpg/.jpeg/.png ≤ 5 MB)
- [ ] При успехе возвращает `2xx`
- [ ] При ошибке возвращает `4xx`/`5xx`
- [ ] Форма на лендинге отправляется на этот endpoint и корректно реагирует:
  - Зелёный toast «Заявка отправлена» при `2xx`
  - Красный toast «Что-то пошло не так» при ошибке
- [ ] Уведомление менеджеру приходит (email/CRM/Telegram — какой канал используется на air-midea.com)
- [ ] Прикреплённые файлы сохраняются (опционально, согласовать с менеджером — нужно ли)

### SEO / Lighthouse

- [ ] Google Rich Results Test (https://search.google.com/test/rich-results) показывает schemas: `Organization`, `WebSite`, `Product`, `FAQPage` (без ошибок)
- [ ] Lighthouse Mobile (после деплоя):
  - Performance ≥ 80
  - Accessibility ≥ 95
  - SEO = 100
  - Best Practices ≥ 95
- [ ] `https://air-midea.com/privacy` существует (ссылка есть в форме)

---

## Технические детали

### Стек лендинга
- Astro 5 (SSG), Tailwind CSS, TypeScript
- Без бэкенда / БД / серверного рендера
- Сборка: `npm install && npm run build` → `dist/`

### Конфиг
В `astro.config.mjs` зашиты:
- `site: "https://air-midea.com"` (production-домен)
- `base: "/gmchillerspromo"` (URL-префикс)

Все ассеты в HTML уже идут с префиксом `/gmchillerspromo/...`.

### Структура `dist/`
```
dist/
├── index.html       # точка входа
├── _astro/          # хешированные CSS/JS/optimized images
├── images/          # static изображения (logos, products, projects)
├── videos/          # MP4 фоновые видео
├── fonts/           # Gotham Pro woff2
├── favicon.svg
├── robots.txt
└── sitemap.xml
```

### Form payload пример

```http
POST /api/contact HTTP/1.1
Host: air-midea.com
Content-Type: multipart/form-data; boundary=---WebKitFormBoundary...

-----WebKitFormBoundary...
Content-Disposition: form-data; name="name"

Иван Иванов
-----WebKitFormBoundary...
Content-Disposition: form-data; name="phone"

+79991234567
-----WebKitFormBoundary...
Content-Disposition: form-data; name="comment"

Нужны чиллеры на 200 кВт
-----WebKitFormBoundary...
Content-Disposition: form-data; name="files"; filename="tz.pdf"
Content-Type: application/pdf

[binary]
-----WebKitFormBoundary...--
```

### Где править на фронте
Файл `src/components/sections/Contact.astro`, функция `submitForm` (~строка 351). Mock заменить на:
```ts
const res = await fetch('/api/contact', {
  method: 'POST',
  body: new FormData(form),
});
return { ok: res.ok };
```

После правки → `npm run build` → задеплоить новый `dist/`.

---

## Risks

- **CORS** — если API на другом домене, нужны правильные `Access-Control-*` headers
- **Spam** — без защиты бот-формы могут флудить. Минимум: rate limiting на endpoint. Опционально: reCAPTCHA v3 (требует доп. правок на фронте, скоординировать)
- **Конфликт URL** — если `air-midea.com/gmchillerspromo` уже используется в существующем роутинге, нужно зарезервировать
- **Robots.txt** — существующий robots.txt на корне нужно обновить, иначе индексация лендинга может не работать

---

## Definition of Done

- [ ] Лендинг доступен на `https://air-midea.com/gmchillerspromo/`
- [ ] Форма работает end-to-end: отправка → менеджер получает заявку
- [ ] PR с правкой `submitForm` в Contact.astro смерджен (или handoff-фронту)
- [ ] Lighthouse-чеки пройдены
- [ ] HANDOFF.md выполнен полностью (все чек-листы)
- [ ] Документация обновлена (если в endpoint что-то изменилось)
