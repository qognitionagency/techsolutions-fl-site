/**
 * The only GSAP / Lenis entry (ADR §7). Every effect lives inside gsap.matchMedia,
 * so reduced motion gets none of it: no Lenis, no parallax, no split text.
 * Initial animation states are set here, never in CSS (content ships visible).
 *
 * What each motion communicates:
 * - headline reveal: a new section has started;
 * - staggered reveals: the order of items in a group (steps, promises, cards);
 * - parallax: depth between page and decorative footage;
 * - before/after intro: the wipe shows how to use the slider and the cords draw in,
 *   i.e. "this is the mess", before handing control to the visitor;
 * - magnetic CTA: the primary action is pressable.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const OK = '(prefers-reduced-motion: no-preference)';
const mm = gsap.matchMedia();
const EASE = 'expo.out';

function splitHeadings(selector: string): void {
  for (const el of gsap.utils.toArray<HTMLElement>(selector)) {
    const isHero = el.classList.contains('hero-h1');
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) => {
        if (isHero) document.documentElement.classList.remove('motion-pending');
        return gsap.from(self.lines, {
          yPercent: 105,
          duration: isHero ? 1.1 : 0.9,
          ease: EASE,
          stagger: 0.08,
          delay: isHero ? 0.1 : 0,
          scrollTrigger: isHero ? undefined : { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  }
}

function reveals(distance: number): void {
  for (const group of gsap.utils.toArray<HTMLElement>('[data-reveal-group]')) {
    const items = group.querySelectorAll<HTMLElement>('[data-reveal]');
    const targets = items.length ? items : [group];
    gsap.from(targets, {
      y: distance,
      autoAlpha: 0,
      duration: 0.8,
      ease: EASE,
      stagger: 0.07,
      scrollTrigger: { trigger: group, start: 'top 88%', once: true },
    });
  }
}

function parallax(scale: number): void {
  for (const el of gsap.utils.toArray<HTMLElement>('[data-parallax]')) {
    const amount = Math.min(15, Number(el.dataset.parallax) || 10) * scale;
    gsap.fromTo(
      el,
      { yPercent: -amount },
      { yPercent: amount, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  }
}

function beforeAfterIntro(): void {
  const frame = document.querySelector<HTMLElement>('[data-ba]');
  if (!frame) return;
  const cords = frame.querySelectorAll<SVGPathElement>('[data-cord]');
  const state = { pos: 90 };
  const emit = () => frame.dispatchEvent(new CustomEvent('ba:set', { detail: state.pos }));
  gsap.set(cords, { strokeDasharray: 1, strokeDashoffset: 1 });
  emit();
  gsap
    .timeline({
      scrollTrigger: { trigger: frame, start: 'top 80%', end: 'center 50%', scrub: 0.6 },
      defaults: { ease: 'none' },
    })
    .to(cords, { strokeDashoffset: 0, stagger: 0.08, duration: 0.5 }, 0)
    .to(state, { pos: 50, duration: 0.6, onUpdate: emit }, 0.35);
}

function magnetic(): () => void {
  const offs: (() => void)[] = [];
  for (const el of gsap.utils.toArray<HTMLElement>('[data-magnetic]')) {
    const inner = el.querySelector<HTMLElement>('[data-magnetic-inner]');
    const x = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
    const ix = inner ? gsap.quickTo(inner, 'x', { duration: 0.4, ease: 'power3.out' }) : null;
    const iy = inner ? gsap.quickTo(inner, 'y', { duration: 0.4, ease: 'power3.out' }) : null;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      x(dx * 0.22);
      y(dy * 0.3);
      ix?.(dx * 0.1);
      iy?.(dy * 0.12);
    };
    const leave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
      if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    offs.push(() => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      gsap.set([el, inner].filter(Boolean), { x: 0, y: 0 });
    });
  }
  return () => offs.forEach((f) => f());
}

function smoothScroll(): () => void {
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  const raf = (t: number) => lenis.raf(t * 1000);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  // In-page anchors (bare #fragments, see lib/url.ts) scroll through Lenis.
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href*="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    const nav = document.querySelector<HTMLElement>('[data-nav]')?.offsetHeight ?? 0;
    lenis.scrollTo(target, { offset: -nav - 16, duration: 1.1 });
    // preventDefault also cancels the browser's focus move to the fragment target, which breaks
    // the skip link and leaves keyboard users in the nav. Move focus ourselves, unless another
    // handler (form.ts on #book) already put it inside the target.
    if (!target.contains(document.activeElement)) {
      if (!target.matches('a[href],button,input,select,textarea,[tabindex]')) target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  };
  document.addEventListener('click', onClick);

  return () => {
    document.removeEventListener('click', onClick);
    gsap.ticker.remove(raf);
    lenis.destroy();
  };
}

// Late load (after `load`): never animate the hero H1 if the 2.5 s hold has already released it.
const heroHeld = document.documentElement.classList.contains('motion-pending');

mm.add(`(min-width: 768px) and ${OK}`, () => {
  const stopScroll = smoothScroll();
  splitHeadings(heroHeld ? '[data-split]' : '[data-split]:not(.hero-h1)');
  reveals(28);
  parallax(1);
  beforeAfterIntro();
  return stopScroll;
});

mm.add(`(max-width: 767px) and ${OK}`, () => {
  // Light on mobile: native scroll, ±5% parallax, no pin, headline split below the fold only
  // (the hero H1 stays put so it never competes with the LCP poster).
  splitHeadings('[data-split]:not(.hero-h1)');
  reveals(16);
  parallax(1 / 3);
  beforeAfterIntro();
});

mm.add(`(hover: hover) and (pointer: fine) and ${OK}`, () => magnetic());
