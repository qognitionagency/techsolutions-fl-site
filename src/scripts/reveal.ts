/**
 * Scroll reveals (design-spec-v3 §3.6): opacity 0 → 1 and translateY --reveal-distance, once,
 * at 15% visible. Replaces GSAP/Lenis (v3 bans parallax, pinning and scroll-jacking).
 *
 * Content ships visible, and hiding is brief and off screen only (Owen, 2026-10-07 gate):
 * - a block is hidden only when it comes within one viewport below the fold, never when it is on
 *   screen or far down the page (print, full-page captures and jumps see real content);
 * - once its top has been scrolled past (instant jump to #faq, find-in-page, End key) it shows on
 *   the next scroll event, since IntersectionObserver reports no change for a block it skipped;
 * - each hidden block shows after SAFETY_MS whatever IntersectionObserver does;
 * - beforeprint shows everything (global.css also forces it under @media print).
 * Off under reduced motion: nothing is hidden.
 */
const SAFETY_MS = 2500;
const els = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];

if (els.length && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const hidden = new Map<Element, number>(); // element → safety timer

  // instant: shown while off screen (scrolled past, safety timer, print): no fade to catch mid-way.
  const show = (el: Element, instant = false) => {
    if (instant) (el as HTMLElement).style.transition = 'none';
    el.classList.add('is-in');
    window.clearTimeout(hidden.get(el));
    hidden.delete(el);
    view.unobserve(el);
    if (!hidden.size) window.removeEventListener('scroll', sweep);
  };

  const view = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting || e.boundingClientRect.top < 0) show(e.target);
    },
    { threshold: 0.15 },
  );

  const sweep = () => {
    for (const el of [...hidden.keys()]) if (el.getBoundingClientRect().top < 0) show(el, true);
  };

  // Hide only what is about to enter: within one viewport below the fold and still off screen.
  const near = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        near.unobserve(e.target);
        if (e.boundingClientRect.top < window.innerHeight) continue; // on screen or above: leave it
        if (!hidden.size) window.addEventListener('scroll', sweep, { passive: true });
        e.target.classList.add('reveal');
        hidden.set(e.target, window.setTimeout(() => show(e.target, true), SAFETY_MS));
        view.observe(e.target);
      }
    },
    { rootMargin: '0px 0px 100% 0px' },
  );

  window.addEventListener('beforeprint', () => [...hidden.keys()].forEach((el) => show(el, true)));
  for (const el of els) near.observe(el);
}
