/**
 * Mobile-only reveal-эффекты (vw < 640).
 *
 * 1. data-mobile-slide-up на секции — section стартует с translateY(60px) и
 *    плавно подъезжает к 0 по мере входа в viewport. Создаёт эффект «занавеса»:
 *    секция словно поднимается из-под нижнего края экрана и накрывает
 *    предыдущую (тот же паттерн, что Order делает на десктопе).
 *
 * 2. data-reveal-mobile-scale на любом [data-reveal]-элементе — добавляет
 *    scale(0.96)→1 к стандартному fade+up. Используем для Detail-карточек,
 *    которые на мобиле — простая колонка без sticky-стека: scale-on-enter
 *    добавляет «вес» каждому появлению. CSS-стили заданы в global.css —
 *    JS только переключает .reveal-in (это делает lib/reveal.ts).
 *
 * Оба эффекта отключены при prefers-reduced-motion.
 * При vw≥640 (десктоп) — ничего не делаем, секции в natural flow.
 */
const MOBILE_BREAKPOINT = 640;

const init = () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const slideTargets = Array.from(
    document.querySelectorAll<HTMLElement>("[data-mobile-slide-up]"),
  );
  if (!slideTargets.length) return;

  const SLIDE_DISTANCE = 60; // px

  // На каждый элемент держим ссылку на natural docTop (без transform),
  // чтобы вычислять progress независимо от текущего scrollY/transform.
  const docTops = new WeakMap<HTMLElement, number>();
  const measure = (el: HTMLElement) => {
    const saved = el.style.transform;
    el.style.transform = "";
    const top = el.getBoundingClientRect().top + window.scrollY;
    el.style.transform = saved;
    docTops.set(el, top);
  };

  const applyInitial = () => {
    if (window.innerWidth >= MOBILE_BREAKPOINT) {
      slideTargets.forEach((el) => (el.style.transform = ""));
      return;
    }
    slideTargets.forEach((el) => {
      el.style.willChange = "transform";
      el.style.transform = `translateY(${SLIDE_DISTANCE}px)`;
      measure(el);
    });
  };

  const update = () => {
    if (window.innerWidth >= MOBILE_BREAKPOINT) return;

    const vh = window.innerHeight;
    // Section считаем «вошедшей» когда её natural top достигает 40% высоты
    // viewport — там transform=0 (settled). Старт — когда top на уровне
    // нижнего края (vh, transform=60). Линейная интерполяция между точками.
    const start = vh;
    const end = vh * 0.4;
    slideTargets.forEach((el) => {
      const docTop = docTops.get(el);
      if (docTop === undefined) return;
      const visualTop = docTop - window.scrollY;
      let progress = (start - visualTop) / (start - end);
      progress = Math.max(0, Math.min(1, progress));
      const translateY = SLIDE_DISTANCE * (1 - progress);
      if (translateY === 0) {
        if (el.style.transform) el.style.transform = "";
      } else {
        el.style.transform = `translateY(${translateY.toFixed(2)}px)`;
      }
    });
  };

  applyInitial();
  let raf: number | null = null;
  const schedule = () => {
    if (raf !== null) return;
    raf = requestAnimationFrame(() => {
      update();
      raf = null;
    });
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", () => {
    applyInitial();
    schedule();
  });
  update();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
