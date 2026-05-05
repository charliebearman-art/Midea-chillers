import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  // Production. Используется в canonical link, Astro.url, sitemap, OG-тегах.
  site: "https://air-midea.com",
  // Лендинг живёт в подпапке существующего сайта. base должен совпадать
  // с реальным URL-префиксом на проде. Если меняется — также обновить:
  //  • src/styles/global.css (@font-face url пути)
  //  • public/robots.txt (Sitemap)
  //  • public/sitemap.xml (loc)
  base: "/gmchillerspromo",
  integrations: [
    tailwind({
      applyBaseStyles: false, // используем свой global.css
    }),
  ],
  output: "static",
  build: {
    inlineStylesheets: "auto",
  },
});
