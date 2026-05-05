# Handoff документация для backend-разработчика

Документ описывает что нужно сделать, чтобы лендинг заработал в production по адресу `https://air-midea.com/gmchillerspromo/`.

## Доступ к проекту

**Git-репозиторий**: https://github.com/charliebearman-art/Midea-chillers

Если репо **приватный** — попросите владельца (Кирилл Погорелов) добавить вас как collaborator с правами `read` (или `write`, если планируете править код напрямую).

После добавления:
```bash
git clone https://github.com/charliebearman-art/Midea-chillers.git
cd Midea-chillers
npm install
npm run build       # → dist/
```

Текущая ветка для production: `main`. Тег handoff-релиза: см. `git tag` (если задан).

---

## 1. Деплой статики

Лендинг — **чистая статика** (Astro `output: "static"`). Билд `npm run build` создаёт папку `dist/` с готовыми HTML/CSS/JS/изображениями.

### Что нужно сделать

1. **Получить артефакт сборки**:
   ```bash
   npm install
   npm run build
   ```
   Результат: папка `dist/`.

2. **Разместить содержимое `dist/` по пути** `/gmchillerspromo/` существующего сайта. Например, если сайт на nginx и корень `/var/www/air-midea.com/`, тогда:
   ```
   /var/www/air-midea.com/gmchillerspromo/
   ├── index.html
   ├── _astro/
   ├── images/
   ├── videos/
   ├── fonts/
   ├── favicon.svg
   ├── robots.txt
   └── sitemap.xml
   ```

3. **Настроить nginx (или CDN/reverse proxy)**:
   - При запросе `air-midea.com/gmchillerspromo/` — отдать `index.html`
   - При запросе `air-midea.com/gmchillerspromo/_astro/...` и любых ассетов — отдать как статику с правильным MIME
   - **Headers для перформанса**:
     - `_astro/*` (хешированные имена) → `Cache-Control: public, max-age=31536000, immutable`
     - `index.html` → `Cache-Control: no-cache` (чтобы менялись пути после редеплоев)
     - `*.woff2`, `*.webp`, `*.jpg`, `*.mp4` → `Cache-Control: public, max-age=2592000`

   Пример nginx-блока:
   ```nginx
   location /gmchillerspromo/ {
     alias /var/www/air-midea.com/gmchillerspromo/;
     try_files $uri $uri/ /gmchillerspromo/index.html;

     location ~* /_astro/ {
       expires 1y;
       add_header Cache-Control "public, immutable";
     }
     location = /gmchillerspromo/index.html {
       add_header Cache-Control "no-cache";
     }
   }
   ```

4. **Robots.txt и sitemap.xml**:
   - `dist/robots.txt` лежит по адресу `/gmchillerspromo/robots.txt`, но поисковики читают robots.txt **только из корня** домена (`/robots.txt`).
   - Нужно либо смержить правила в существующий корневой `air-midea.com/robots.txt`, либо настроить редирект `/gmchillerspromo/robots.txt → /robots.txt`.
   - В корневой robots.txt добавить:
     ```
     Allow: /gmchillerspromo/
     Disallow: /gmchillerspromo/_astro/
     Disallow: /gmchillerspromo/fonts/
     Sitemap: https://air-midea.com/gmchillerspromo/sitemap.xml
     ```

---

## 2. API-контракт формы

Форма «Поможем с выбором» в секции Contact сейчас работает в **mock-режиме** (1.2s имитация). Нужно подключить к реальному API.

### Где править на фронте

Файл [`src/components/sections/Contact.astro`](src/components/sections/Contact.astro), функция `submitForm` (~строка 351):

**Сейчас (mock):**
```ts
const submitForm = async (): Promise<{ ok: boolean }> => {
  await new Promise((r) => setTimeout(r, 1200));
  return { ok: true };
};
```

**Нужно заменить на:**
```ts
const submitForm = async (): Promise<{ ok: boolean }> => {
  const res = await fetch('/api/contact', {
    method: 'POST',
    body: new FormData(form),
  });
  return { ok: res.ok };
};
```

### Endpoint

- **URL**: `POST /api/contact` (точный URL согласовать; relative-path работает на любом домене)
- **Content-Type**: `multipart/form-data` (FormData c файлами)

### FormData fields

| Поле       | Тип       | Required | Валидация на фронте             | Описание                                |
|------------|-----------|----------|----------------------------------|-----------------------------------------|
| `name`     | text      | ✓        | непустое                         | ФИО клиента                             |
| `phone`    | text      | ✓        | минимум 10 цифр (без форматирования) | Номер телефона                       |
| `comment`  | text      | —        | без проверки                     | Произвольный комментарий                |
| `files`    | file[]    | —        | `.jpg/.jpeg/.png`, ≤ 5 MB каждый, multiple | Прикреплённые документы (опционально) |

### Что нужно от бэкенда

1. **Принять FormData**, провалидировать поля (имя/телефон обязательны).
2. **Сохранить файлы** в облако/диск (опционально).
3. **Отправить уведомление** менеджеру (email / CRM / Telegram / Bitrix — что используется в air-midea.com).
4. **Вернуть HTTP-статус**:
   - **`200`** или любой `2xx` → фронт показывает зелёный toast «Заявка отправлена. Спасибо! Наш менеджер скоро свяжется с вами.»
   - **`4xx`/`5xx`** или сетевая ошибка → красный toast «Что-то пошло не так. Попробуйте отправить ещё раз.»

5. **CORS** — endpoint должен либо быть на том же домене (`air-midea.com/api/contact`), либо разрешить запросы с `https://air-midea.com`.

6. **Защита от спама — Yandex SmartCaptcha (invisible)**:

   Согласовано использование **Yandex SmartCaptcha в advanced (invisible) режиме**. Виджет показывает challenge только при низком confidence — для большинства пользователей форма работает как обычно.

   **Что нужно сделать (фронт + бэк, обе части на бэкендере):**

   **A. Регистрация (1 раз):**
   - Завести сайт в Yandex Cloud → SmartCaptcha → получить **client key** (для фронта) и **server key** (для бэка)
   - Добавить домены: `air-midea.com` (production) + `localhost` (для dev-тестов)
   - Mode: **Advanced challenge** (invisible)

   **B. Фронт — `src/components/sections/Contact.astro`:**

   1. В разметку формы добавить контейнер виджета (например, перед закрывающим `</form>`):
      ```html
      <div id="contact-captcha" class="hidden"></div>
      ```

   2. Подгрузить SDK Yandex (например, в самом конце `<script>` блока в Contact.astro или в `Layout.astro`):
      ```html
      <script
        src="https://smartcaptcha.yandexcloud.net/captcha.js?render=onload&onload=onSmartCaptchaLoad"
        async defer
      ></script>
      ```

   3. В `<script>` Contact.astro инициализировать invisible widget:
      ```ts
      const SMARTCAPTCHA_CLIENT_KEY = "<вставить client key>";
      let captchaWidgetId: number | null = null;
      let captchaResolve: ((token: string) => void) | null = null;

      (window as any).onSmartCaptchaLoad = () => {
        if (!(window as any).smartCaptcha) return;
        captchaWidgetId = (window as any).smartCaptcha.render("contact-captcha", {
          sitekey: SMARTCAPTCHA_CLIENT_KEY,
          invisible: true,
          hideShield: true,
          callback: (token: string) => {
            captchaResolve?.(token);
            captchaResolve = null;
          },
        });
      };

      const getCaptchaToken = (): Promise<string> =>
        new Promise((resolve, reject) => {
          if (captchaWidgetId === null) return reject(new Error("Captcha not ready"));
          captchaResolve = resolve;
          (window as any).smartCaptcha.execute(captchaWidgetId);
        });
      ```

   4. В submit-обработчике (`form.addEventListener('submit', …)`) — между `validate()` и `submitForm()`:
      ```ts
      const captchaToken = await getCaptchaToken();
      const formData = new FormData(form);
      formData.append("smart-token", captchaToken);
      const res = await fetch('/api/contact', { method: 'POST', body: formData });
      ```

      Текущий `submitForm()` принимает `form`-element, но удобнее передавать готовый `FormData` — переписать сигнатуру под это.

   **C. Бэк — endpoint `/api/contact`:**

   1. После приёма FormData взять поле `smart-token`.
   2. Сделать POST-запрос на `https://smartcaptcha.yandexcloud.net/validate` с параметрами:
      - `secret` = ваш server key
      - `token` = `smart-token` из FormData
      - `ip` = IP клиента (из `X-Forwarded-For`)
   3. Парсить ответ: `{ status: "ok" | "failed", message: "..." }`. Если `status !== "ok"` — вернуть `400` (или `403`) и НЕ обрабатывать заявку.
   4. Если `status === "ok"` — продолжить обработку (валидация, сохранение, уведомление менеджеру).

   **Документация Yandex SmartCaptcha:**
   - https://yandex.cloud/ru/docs/smartcaptcha/
   - https://yandex.cloud/ru/docs/smartcaptcha/concepts/validation

   **Дополнительно**: rate limiting на endpoint (5–10 запросов/минуту с IP) — на случай если token будет переиспользован.

### Текстовая политика конфиденциальности

В форме есть ссылка на политику: `https://air-midea.com/privacy` (строка ~180 в [Contact.astro](src/components/sections/Contact.astro)). Убедиться, что эта страница существует на основном домене.

---

## 3. Что НЕ нужно делать

- ❌ Не править HTML/CSS/JS в `dist/` напрямую — все правки только в `src/` через npm-сборку
- ❌ Не редактировать `_astro/*` файлы — они генерятся из `src/`
- ❌ Не добавлять серверный рендер (`output: "server"`) — текущая архитектура чисто статическая
- ❌ Не менять `astro.config.mjs base` без синхронного обновления `global.css`, `robots.txt`, `sitemap.xml`

---

## 4. Чек-лист перед деплоем

- [ ] `npm install` без ошибок
- [ ] `npm run build` без ошибок и предупреждений
- [ ] Содержимое `dist/` загружено в `/var/www/air-midea.com/gmchillerspromo/`
- [ ] Открывается `https://air-midea.com/gmchillerspromo/` без 404 на ассеты (проверить DevTools → Network)
- [ ] Шрифты Gotham Pro загружаются (без fallback на Manrope)
- [ ] Видео в Hero автоплеит после клика
- [ ] Картинки проектов/продуктов отображаются
- [ ] Форма отправляется на реальный endpoint (см. §2), показывает соответствующий toast
- [ ] Файлы (.jpg/.png) корректно прикладываются к запросу
- [ ] robots.txt доступен (через корневой или через редирект)
- [ ] Lighthouse Mobile: Performance ≥ 80, Accessibility ≥ 95, SEO 100
- [ ] Google Rich Results Test (https://search.google.com/test/rich-results) показывает FAQPage, Organization, Product schemas

---

## 5. Контакты

При вопросах по:
- **Фронту, версткой, конфигом** — Кирилл Погорелов
- **Дизайну** — см. Figma `r9URmH8sSH3dTbiMgwutkL`
- **Существующему сайту air-midea.com** — backend-команда air-midea.com
