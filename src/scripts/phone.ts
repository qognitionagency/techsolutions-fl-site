/**
 * Hero phone (design-spec-v3 §2.1) + the device clocks.
 *
 * Phone: [data-screen] siblings inside [data-phone]; the first shows without JS.
 * - Auto-advance every --duration-cycle, only with motion allowed and the phone in view.
 * - Holds while the pointer or focus is inside; picking a screen stops it for the session;
 *   the pause button toggles it (WCAG 2.2.2). Under reduced motion it never auto-advances.
 * - .is-cycling drives the progress bar on the selected switcher item.
 *
 * Clocks: [data-clock="short|full"] get the visitor's local time (data, not copy). Seconds tick
 * only while a clock is on screen and motion is allowed (spec §3.6 ambient loop).
 */
import { cssMs } from '../lib/css-time';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const cycleMs = (el: Element) => cssMs(getComputedStyle(el).getPropertyValue('--duration-cycle'), 4200);

export function initPhone(root: HTMLElement): void {
  const screens = [...root.querySelectorAll<HTMLElement>('[data-screen]')];
  const picks = [...root.querySelectorAll<HTMLButtonElement>('[data-screen-pick]')];
  const pause = root.querySelector<HTMLButtonElement>('[data-phone-pause]');
  if (screens.length < 2) return;

  let i = 0;
  let timer = 0;
  let stopped = reduce.matches;
  let hold = false;
  let inView = false;

  const running = () => !stopped && !hold && inView;

  const show = (n: number) => {
    i = (n + screens.length) % screens.length;
    screens.forEach((s, k) => s.classList.toggle('is-on', k === i));
    picks.forEach((p, k) => p.setAttribute('aria-pressed', String(k === i)));
    root.dataset.screen = screens[i]!.dataset.screen ?? String(i);
  };

  const restartProgress = () => {
    // Re-trigger the CSS progress animation on the selected item.
    root.classList.remove('is-cycling');
    if (!running()) return;
    void root.offsetWidth;
    root.classList.add('is-cycling');
  };

  const schedule = () => {
    window.clearTimeout(timer);
    restartProgress();
    if (!running()) return;
    timer = window.setTimeout(() => {
      show(i + 1);
      schedule();
    }, cycleMs(root));
  };

  const syncPause = () => {
    if (!pause) return;
    pause.setAttribute('aria-pressed', String(stopped));
    pause.setAttribute('aria-label', (stopped ? pause.dataset.labelPlay : pause.dataset.labelPause) ?? '');
    root.classList.toggle('is-paused', stopped);
  };

  picks.forEach((p, k) =>
    p.addEventListener('click', () => {
      stopped = true;
      syncPause();
      show(k);
      schedule();
    }),
  );
  pause?.addEventListener('click', () => {
    stopped = !stopped;
    if (!stopped) show(i + 1);
    syncPause();
    schedule();
  });
  // Hold while the visitor is looking at the device itself. The switcher is excluded, or
  // pressing Play would never resume while the pointer or focus sits on it.
  const device = root.querySelector<HTMLElement>('[data-phone-device]') ?? root;
  device.addEventListener('pointerenter', () => ((hold = true), schedule()));
  device.addEventListener('pointerleave', () => ((hold = false), schedule()));
  device.addEventListener('focusin', () => ((hold = true), schedule()));
  device.addEventListener('focusout', (e) => {
    if (device.contains(e.relatedTarget as Node | null)) return;
    hold = false;
    schedule();
  });
  new IntersectionObserver(([e]) => ((inView = !!e?.isIntersecting), schedule())).observe(root);
  reduce.addEventListener('change', (e) => {
    if (e.matches) stopped = true;
    syncPause();
    schedule();
  });

  root.querySelectorAll<HTMLElement>('[data-js-only]').forEach((el) => (el.hidden = false));
  show(0);
  syncPause();
}

function initClocks(): void {
  const clocks = [...document.querySelectorAll<HTMLElement>('[data-clock]')];
  if (!clocks.length) return;
  const short = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const day = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: '2-digit', day: '2-digit' });
  const full = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  const visible = new Set<Element>();
  const paint = () => {
    const now = new Date();
    const s = short.format(now).replace(/\s?[AP]M$/, '');
    const f = `${day.format(now).replace(',', '').toUpperCase()} · ${full.format(now)}`;
    for (const c of clocks) c.textContent = c.dataset.clock === 'full' ? f : s;
  };
  paint();
  if (reduce.matches) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))));
  clocks.forEach((c) => io.observe(c));
  window.setInterval(() => visible.size && paint(), 1000);
}

for (const el of document.querySelectorAll<HTMLElement>('[data-phone]')) initPhone(el);
initClocks();
