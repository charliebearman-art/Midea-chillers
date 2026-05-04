/**
 * Лёгкий reveal-on-scroll через IntersectionObserver.
 * Никакого GSAP, никаких listener'ов на scroll.
 * Срабатывает один раз — после анимации observer отключается от элемента.
 *
 * Использование: <element data-reveal data-reveal-delay="100"> ... </element>
 */
const init = () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
  );

  targets.forEach((el) => io.observe(el));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
