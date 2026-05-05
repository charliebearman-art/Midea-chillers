import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  // TODO: заменить на production-домен когда будет известен.
  // Используется в canonical link, Astro.url, sitemap, OG-тегах.
  site: "https://midea-chillers.vercel.app",
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
