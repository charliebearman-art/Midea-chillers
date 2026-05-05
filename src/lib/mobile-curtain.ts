/**
 * Mobile-only curtain (vw < 640): card 04 (последняя в Details) залипает у
 * top:5rem; блок Products поднимается снизу и накрывает её, как и на десктопе.
 *
 * Десктоп достигает curtain-эффекта чисто через CSS — карточки фиксированной
 * высоты h-22.375rem, поэтому `details-spacer: 25.875rem` и
 * `products-curtain margin-top: -22.375rem` дают pixel-perfect стек.
 *
 * На мобиле карточки content-fit (variable height), card 04 — самая длинная
 * (4-item dash-list). Поэтому замеряем её высоту в JS и проставляем:
 *   • details-spacer.height = cardH + 4rem (даёт ~5rem pre-curtain sticky-time
 *     до того, как Products начнёт накрывать; равно desktop-овским 5rem).
 *   • #products.marginTop = -cardH → top Products точно совпадает с natural
 *     top card 04, поэтому curtain на её bottom начинается, когда Products
 *     viewport-top = 80 + cardH, и завершается ровно к моменту unstick.
 *
 * При vw≥640 — сбрасываем inline-стили, CSS-правила (.details-spacer 25.875rem,
 * .products-curtain mt -22.375rem) берут управление.
 */
const MOBILE_BREAKPOINT = 640;
const PRE_CURTAIN_REM = 4; // дополнительные 4rem спейсера → 5rem pre-curtain

const init = () => {
  const cards = document.querySelectorAll<HTMLElement>(".detail-stack-item");
  const lastCard = cards[cards.length - 1];
  const spacer = document.querySelector<HTMLElement>(".details-spacer");
  const products = document.querySelector<HTMLElement>("#products");
  if (!lastCard || !spacer || !products) return;

  const update = () => {
    if (window.innerWidth >= MOBILE_BREAKPOINT) {
      spacer.style.height = "";
      products.style.marginTop = "";
      return;
    }
    const h = lastCard.offsetHeight;
    if (h <= 0) return;
    const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    spacer.style.height = `${h + remPx * PRE_CURTAIN_REM}px`;
    products.style.marginTop = `${-h}px`;
  };

  update();
  window.addEventListener("resize", update, { passive: true });

  // Card 04 содержит lazy <img> — высота меняется после загрузки картинки
  // и при font-swap'е. ResizeObserver ловит оба случая.
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(update).observe(lastCard);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
