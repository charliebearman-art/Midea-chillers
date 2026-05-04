/**
 * Curtain-эффект для блока «Модельный ряд» (Products) над «Готовое решение» (Details).
 *
 * Поведение (lg+ только):
 *  - Карточки 01-04 sticky cascade в Details.
 *  - Пока card 04 в pure sticky (case 2): Products висит на 80px ниже её низа.
 *  - Когда card 04 начинает выталкиваться вверх (case 3): Products плавно
 *    подъезжает покрывая стек, синхронно с тем как карточка идёт в зону
 *    заголовка — никакой видимой "полоски card 04, проскакивающей под heading".
 *
 * Реализация: transform: translateY() на Products. Без layout reflow.
 */

const LG_BREAKPOINT = 1280;

// Геометрия (rem):
const HEADING_STICKY_TOP = 9; // h2 sticky lg:top-36
const HEADING_HEIGHT = 6.9; // text-h1 × 1.15 × 2 строки
const HEADING_BOTTOM = HEADING_STICKY_TOP + HEADING_HEIGHT; // 15.9rem
const CARD_GAP_FROM_HEADING = 4; // 64px gap heading→cards
const CARD_LAST_STICKY_TOP = HEADING_BOTTOM + CARD_GAP_FROM_HEADING; // 19.9 (но cascade +3 для card 04)
const CARD_HEIGHT = 22.375;
const CARD_LAST_STICKY_TOP_VAL = 22.9; // 19.9 + 3 (4-я карточка cascade)
const PRODUCT_GAP = 5; // 80px желаемый зазор card 04 → Products

const detailsSection = document.querySelector<HTMLElement>("#advantages");
const productsSection = document.querySelector<HTMLElement>("#products");
// :last-of-type матчит последний DIV — а в .flex после карточек идёт спейсер
// (тоже DIV), поэтому селектор не находит card 04. Берём по полному списку.
const allCards = detailsSection?.querySelectorAll<HTMLElement>(
  ".detail-stack-item"
);
const lastCardEl =
  allCards && allCards.length > 0 ? allCards[allCards.length - 1] : null;

if (detailsSection && productsSection && lastCardEl) {
  let productsDocTop: number | null = null;
  let lastTransform = 0;

  const getRem = () =>
    parseFloat(getComputedStyle(document.documentElement).fontSize);

  const ensureProductsDocTop = () => {
    if (productsDocTop !== null) return productsDocTop;
    // Замеряем без transform чтобы получить natural позицию в документе.
    const saved = productsSection.style.transform;
    productsSection.style.transform = "";
    productsDocTop =
      productsSection.getBoundingClientRect().top + window.scrollY;
    productsSection.style.transform = saved;
    return productsDocTop;
  };

  const update = () => {
    if (window.innerWidth < LG_BREAKPOINT) {
      productsSection.style.transform = "";
      lastTransform = 0;
      return;
    }

    const rem = getRem();
    const cardStickyTopPx = CARD_LAST_STICKY_TOP_VAL * rem;
    const gapPx = PRODUCT_GAP * rem;

    const lastCardRect = lastCardEl.getBoundingClientRect();
    const cardTop = lastCardRect.top;
    const cardBottom = lastCardRect.bottom;

    // Цель в зависимости от состояния sticky:
    //   case 1 (cardTop > cardSticky): card ещё в natural flow, не вмешиваемся
    //   case 2 (cardTop ≈ cardSticky): show 80px gap → target = cardBottom + 80
    //   case 3 (cardTop < cardSticky): card pushes up → smooth transition
    //                                  от gap к cover (cover = cardTop)
    let targetTop: number;

    if (cardTop > cardStickyTopPx + 1) {
      // case 1 — Products в natural flow
      productsSection.style.transform = "";
      lastTransform = 0;
      return;
    } else if (cardTop >= cardStickyTopPx - 1) {
      // case 2 — full gap
      targetTop = cardBottom + gapPx;
    } else {
      // case 3 — card 04 толкается вверх. blend от 80px gap к full cover
      // (Products поднимается до header bottom = 5rem, накрывая ВСЁ
      // включая heading — иначе card 04 контент просвечивает через
      // прозрачный heading).
      // Полный cover к моменту когда card 04 top достигнет heading bottom
      // (cardTop=15.9, pushedUp = 22.9-15.9 = 7rem).
      const HEADER_HEIGHT = 5; // rem
      const FULL_COVER_DISTANCE = 7; // rem
      const pushedUp = cardStickyTopPx - cardTop;
      const blend = Math.min(1, pushedUp / (FULL_COVER_DISTANCE * rem));
      const gapTop = cardBottom + gapPx;
      const coverTop = HEADER_HEIGHT * rem;
      targetTop = gapTop * (1 - blend) + coverTop * blend;
    }

    targetTop = Math.max(0, targetTop);

    // Вычисляем offset через natural doc-позицию Products.
    const naturalViewportTop = ensureProductsDocTop()! - window.scrollY;
    const offset = targetTop - naturalViewportTop;

    // Применяем только если pulling Products вверх (offset <= 0).
    // Если natural ниже target — не трогаем, Products идёт по потоку.
    if (offset < 0) {
      if (Math.abs(offset - lastTransform) > 0.5) {
        productsSection.style.transform = `translateY(${offset}px)`;
        lastTransform = offset;
      }
    } else {
      if (lastTransform !== 0) {
        productsSection.style.transform = "";
        lastTransform = 0;
      }
    }
  };

  let raf: number | null = null;
  const scheduleUpdate = () => {
    if (raf !== null) return;
    raf = requestAnimationFrame(() => {
      update();
      raf = null;
    });
  };

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", () => {
    productsDocTop = null;
    scheduleUpdate();
  });
  update();
}
