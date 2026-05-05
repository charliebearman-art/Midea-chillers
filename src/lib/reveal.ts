/**
 * Reveal-on-scroll через IntersectionObserver. Никакого GSAP, никаких
 * scroll-listener'ов. Срабатывает один раз — после анимации observer
 * отключается от элемента.
 *
 * Базовый паттерн:
 *   <element data-reveal data-reveal-delay="100"> ... </element>
 *
 * Auto-stagger через контейнер (Emil-style для групп карт):
 *   <ul data-reveal-stagger="80">
 *     <li data-reveal>...</li>   ← delay 0
 *     <li data-reveal>...</li>   ← delay 80
 *     <li data-reveal>...</li>   ← delay 160
 *   </ul>
 * Шаг (мс) задаётся значением атрибута; по умолчанию 80 если без значения
 * или невалидное. Явный data-reveal-delay на ребёнке имеет приоритет
 * (auto-stagger его не перезаписывает) — оставляет место для тонкой ручной
 * настройки кастомных reveals.
 *
 * Варианты разметки (см. global.css [data-reveal][data-reveal-*]):
 *   data-reveal-fade            — только opacity, без translate
 *   data-reveal-slide-right     — въезд справа (translateX 32px → 0)
 *   data-reveal-image           — внутренние img/video scale(1.04)→1
 *   data-reveal-mobile-scale    — на мобиле добавляет scale 0.97→1
 */
const init = () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Auto-stagger: контейнеры назначают sequential delays своим
  // [data-reveal] потомкам (только если delay не задан вручную).
  document.querySelectorAll<HTMLElement>("[data-reveal-stagger]").forEach((container) => {
    const raw = container.dataset.revealStagger;
    const step = raw && !Number.isNaN(Number(raw)) ? Number(raw) : 80;
    const children = Array.from(container.querySelectorAll<HTMLElement>("[data-reveal]"));
    children.forEach((child, i) => {
      if (child.dataset.revealDelay === undefined) {
        child.dataset.revealDelay = String(i * step);
      }
    });
  });

  const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");

  if (reduce) {
    targets.forEach((el) => el.classList.add("reveal-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const delay = el.dataset.revealDelay ?? "0";
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add("reveal-in");
          io.unobserve(el);
        }
      });
    },
    // rootMargin: 0 (раньше было -10% bottom — на мобиле создавало
    // 80px-задержку перед reveal sticky-секций типа Projects).
    // threshold: 0.01 — fire как только малейшая часть элемента
    // попала в viewport, без ожидания «10% видимости».
    { rootMargin: "0px", threshold: 0.01 },
  );

  targets.forEach((el) => io.observe(el));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
