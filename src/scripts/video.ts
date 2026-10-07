/**
 * Lazy background video (ADR §7).
 * - Hero: src assigned after `load` + idle, fades in over the poster (poster stays the LCP).
 * - Bands: src assigned when within 200px of the viewport; paused when off screen.
 * - Reduced motion or Save-Data: poster only; the toggle offers Play.
 * - A user's Pause sticks: scrolling back never restarts that video.
 */
type Conn = { saveData?: boolean };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = Boolean((navigator as Navigator & { connection?: Conn }).connection?.saveData);
const autoplay = !reduce && !saveData;

const userPaused = new WeakSet<HTMLVideoElement>();
const visible = new WeakSet<HTMLVideoElement>();

function load(v: HTMLVideoElement): void {
  if (v.src || !v.dataset.src) return;
  v.src = v.dataset.src;
  v.addEventListener('playing', () => v.classList.add('is-playing'), { once: true });
}

function play(v: HTMLVideoElement): void {
  load(v);
  v.play().catch(() => setToggle(v, 'paused'));
}

function toggleFor(v: HTMLVideoElement): HTMLButtonElement | null {
  return v.closest('[data-video-band]')?.querySelector<HTMLButtonElement>('[data-video-toggle]') ?? null;
}

function setToggle(v: HTMLVideoElement, state: 'playing' | 'paused'): void {
  const b = toggleFor(v);
  if (!b) return;
  b.dataset.state = state;
  b.setAttribute('aria-label', (state === 'playing' ? b.dataset.labelPause : b.dataset.labelPlay) ?? '');
}

function init(): void {
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('video[data-video]'));
  if (!videos.length) return;

  for (const v of videos) {
    const b = toggleFor(v);
    if (!b) continue;
    b.hidden = false;
    setToggle(v, autoplay ? 'playing' : 'paused');
    b.addEventListener('click', () => {
      if (v.paused) {
        userPaused.delete(v);
        play(v);
        setToggle(v, 'playing');
      } else {
        userPaused.add(v);
        v.pause();
        setToggle(v, 'paused');
      }
    });
  }

  if (!autoplay) return;

  const hero = videos.filter((v) => v.dataset.video === 'hero');
  const lazy = videos.filter((v) => v.dataset.video !== 'hero');

  const startHero = () => hero.forEach((v) => !userPaused.has(v) && play(v));
  const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 200));
  if (document.readyState === 'complete') idle(startHero);
  else addEventListener('load', () => idle(startHero), { once: true });

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) {
          visible.add(v);
          if (!userPaused.has(v) && (v.dataset.video !== 'hero' || v.src)) play(v);
        } else {
          visible.delete(v);
          if (v.src) v.pause();
        }
      }
    },
    { rootMargin: '200px' },
  );
  lazy.forEach((v) => io.observe(v));
  hero.forEach((v) => io.observe(v));
}

init();
