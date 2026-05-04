/**
 * Ленивая загрузка фоновых <video> через IntersectionObserver.
 * Hero-видео не трогаем (там preload="auto" и src напрямую).
 *
 * Разметка: <video preload="none" autoplay muted loop playsinline>
 *             <source data-src="/videos/foo.mp4" type="video/mp4" />
 *           </video>
 *
 * При входе в viewport (rootMargin 200px — подгружаем чуть заранее)
 * data-src копируется в src на каждом <source>, video.load() триггерит
 * fetch, autoplay автоматически стартует play. После одного срабатывания
 * observer отключается — повторно догружать не нужно.
 */
const init = () => {
  const videos = document.querySelectorAll<HTMLVideoElement>(
    "video:has(source[data-src])"
  );
  if (!videos.length) return;

  const load = (video: HTMLVideoElement) => {
    video.querySelectorAll<HTMLSourceElement>("source[data-src]").forEach((s) => {
      const src = s.dataset.src;
      if (src) {
        s.src = src;
        delete s.dataset.src;
      }
    });
    video.load();
  };

  if (!("IntersectionObserver" in window)) {
    // Старый браузер — просто грузим всё сразу, лучше чем не показать видео.
    videos.forEach(load);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          load(entry.target as HTMLVideoElement);
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "200px 0px", threshold: 0 },
  );

  videos.forEach((v) => io.observe(v));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
