/**
 * Lazy video (ADR §7), ported from the Iron Sound build.
 * - Hero: src assigned after `load` + idle + a settle delay; fades in over the poster
 *   (the LCP). Paused while off-screen. A pause/play control satisfies WCAG 2.2.2.
 * - Reduced motion or Save-Data: poster only; the control offers Play.
 * - [data-lazy-video]: src set 200px before the viewport, paused off-screen.
 */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

function attach(video: HTMLVideoElement) {
  if (!video.src && video.dataset.src) {
    video.src = video.dataset.src;
    video.load();
  }
}

function play(video: HTMLVideoElement) {
  attach(video);
  video.play().catch(() => {
    /* Autoplay refused (power saving, policy): the poster stays, which is the designed fallback. */
  });
}

function initHero() {
  const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-video-toggle]');
  if (!video || !toggle) return;
  const label = toggle.querySelector<HTMLElement>('[data-video-toggle-label]');
  let userPaused = reduce.matches || saveData;
  let inView = true;

  video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
  const sync = () => {
    toggle.setAttribute('aria-pressed', String(userPaused));
    if (label) label.textContent = (userPaused ? toggle.dataset.labelPlay : toggle.dataset.labelPause) ?? '';
  };
  toggle.hidden = false;
  sync();

  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    sync();
    if (userPaused) video.pause();
    else play(video);
  });

  new IntersectionObserver(([e]) => {
    inView = e!.isIntersecting;
    if (!inView) video.pause();
    else if (!userPaused && video.src) play(video);
  }).observe(video);

  const start = () => {
    if (!userPaused && inView) play(video);
  };
  // Load, then idle, then a settle delay: the poster owns the first seconds so the clip
  // never competes with the LCP image or the font on a slow connection.
  const SETTLE_MS = 1800;
  const idle = () => {
    const later = () => setTimeout(start, SETTLE_MS);
    if ('requestIdleCallback' in window) window.requestIdleCallback(later, { timeout: 2500 });
    else later();
  };
  if (document.readyState === 'complete') idle();
  else window.addEventListener('load', idle, { once: true });
}

function initLazy() {
  const vids = document.querySelectorAll<HTMLVideoElement>('[data-lazy-video]');
  if (!vids.length || reduce.matches || saveData) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) play(v);
        else v.pause();
      }
    },
    { rootMargin: '200px' },
  );
  vids.forEach((v) => io.observe(v));
}

initHero();
initLazy();
