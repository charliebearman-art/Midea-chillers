/**
 * Helper для абсолютных путей к public-ассетам с учётом base-prefix.
 *
 * Astro НЕ переписывает захардкоженные URL в коде (`/images/foo.jpg` остаётся
 * `/images/foo.jpg`), даже если в astro.config.mjs задан base. Этот helper
 * добавляет base-prefix вручную через `import.meta.env.BASE_URL`.
 *
 * Пример при `base: "/gmchillerspromo"`:
 *   asset("/images/foo.jpg") → "/gmchillerspromo/images/foo.jpg"
 *   asset("images/foo.jpg")  → "/gmchillerspromo/images/foo.jpg"
 */
const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export const asset = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
};
