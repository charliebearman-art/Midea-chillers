/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    // Один брейкпоинт. Логика: 1440 — мастер-макет, 640-1440 = пропорциональный
    // зум (см. html font-size в global.css). На 640 включается «десктопный»
    // layout (lg:*), ниже — мобильный (без префикса). Мобильный дизайн пока
    // TBD — ниже 640 layout временно живёт на frozen 7.11px (см. global.css).
    screens: {
      lg: "640px",
    },
    extend: {
      colors: {
        // Дизайн-токены из Figma
        brand: {
          DEFAULT: "#32a3fd",
          light: "#81c7ff",
          dark: "#1e8fe9",
        },
        ink: {
          // фоны
          900: "#0a0d12", // основной фон страницы
          800: "#10141b",
          700: "#171c25",
          surface: "#16191d", // background/surface
          base: "#0f1115",   // background/base (Product card)
          // background/surface-2 (#1d2025, УТП-карточки) используется
          // через arbitrary `bg-[#1d2025]` — ключ с дефисом ломает парсинг.
        },
        text: {
          primary: "#ebf0f4",
          inverse: "#0f1115",
          muted: "rgba(235,240,244,0.64)",
          subtle: "rgba(235,240,244,0.4)",
        },
        glass: {
          card: "rgba(0,0,0,0.2)",
          deep: "rgba(0,0,0,0.4)",
          surface: "rgba(255,255,255,0.1)",
          subtle: "rgba(0,0,0,0.3)",
        },
      },
      borderColor: {
        strong: "rgba(255,255,255,0.16)",
        soft: "rgba(255,255,255,0.08)",
        pill: "rgba(255,255,255,0.3)",
      },
      borderRadius: {
        pill: "2rem",
      },
      fontFamily: {
        // Gotham Pro локально через @font-face, Manrope как fallback
        sans: ['"Gotham Pro"', "Manrope", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Типографическая шкала из Figma — в rem, чтобы тянулись вместе с html font-size
        // 1rem = 16px на 1440+ → 12px на 360 (см. global.css html font-size clamp)
        "h1": ["3rem", { lineHeight: "1.15", letterSpacing: "0" }],          // 48
        "h2": ["2rem", { lineHeight: "1.15", letterSpacing: "0" }],          // 32
        "h3": ["1.5rem", { lineHeight: "1.3", letterSpacing: "0" }],          // 24
        "h4": ["1.125rem", { lineHeight: "1.4" }],                            // 18
        "t16": ["1rem", { lineHeight: "1.6" }],                               // 16
        "body": ["0.875rem", { lineHeight: "1.6" }],                          // 14
        "t12": ["0.75rem", { lineHeight: "1.6" }],                            // 12
        "display-xl": ["3rem", { lineHeight: "1.1", letterSpacing: "0" }],   // 48
      },
      maxWidth: {
        container: "1440px",
      },
      backdropBlur: {
        glass: "8px",
      },
      animation: {
        "fade-up": "fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
        "float-slow": "float 18s ease-in-out infinite",
        "breathe": "breathe 24s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-20px, 30px) scale(1.05)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.6" },
          "50%": { transform: "scale(1.25)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
