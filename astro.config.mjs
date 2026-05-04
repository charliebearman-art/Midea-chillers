import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
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
