/**
 * Service explorer behaviour (design-spec-v3 §2.2, §3.6). Everything visual that can be CSS is
 * CSS ([data-modes] + :has()); this adds what cannot:
 * - tabs (tabs.ts) + hash → tab: landing on #service-tv, or clicking any link to it (FAQ),
 *   selects that tab before the browser scrolls to it.
 * - draw-on: a diagram's routes/cones/pins draw when its panel opens or first enters view.
 * - one polite live region per panel announces the caption when the visitor changes the toggle.
 * - Wi-Fi shows the problem first, then switches once to "with mesh" after 1.2 s in view,
 *   unless the visitor has touched the toggle. Never under reduced motion.
 * - smart home: a changed tile flashes its ring (spec §3.7-D).
 * - .is-live on the visible panel gates the ambient loops (rings, live dot).
 */
import { track } from './analytics';
import { initTabs } from './tabs';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const AUTO_MS = 1200;
const root = document.querySelector<HTMLElement>('[data-explorer]');

if (root) {
  const panels = [...root.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
  const touched = new Set<HTMLElement>();
  let inView = false;

  const draw = (panel: HTMLElement) => {
    const ws = [...panel.querySelectorAll<HTMLElement>('.dgw')];
    ws.forEach((w) => w.classList.add('is-pending'));
    // Two frames: the pending state must paint before the transition back can run.
    requestAnimationFrame(() => requestAnimationFrame(() => ws.forEach((w) => w.classList.remove('is-pending'))));
  };
  const visible = () => panels.find((p) => !p.hidden) ?? panels[0]!;
  const setLive = () => panels.forEach((p) => p.classList.toggle('is-live', inView && p === visible()));

  // Wi-Fi: problem first, then the fix, once.
  let autoTimer = 0;
  const armAuto = () => {
    window.clearTimeout(autoTimer);
    const p = visible();
    if (reduce || !inView || p.dataset.panel !== 'wifi' || touched.has(p) || p.dataset.autoDone) return;
    autoTimer = window.setTimeout(() => {
      const radios = [...p.querySelectorAll<HTMLInputElement>('input[type=radio][data-mode-i]')];
      const target = radios.find((r) => r.dataset.mode === 'mesh');
      if (!target || target.checked || touched.has(p)) return;
      target.checked = true;
      p.dataset.autoDone = '1';
    }, AUTO_MS);
  };

  const tabs = initTabs(root);

  // Pending until seen.
  panels.forEach((p) => p.querySelectorAll('.dgw').forEach((w) => w.classList.add('is-pending')));
  new IntersectionObserver(
    ([e]) => {
      inView = !!e?.isIntersecting;
      if (inView) {
        const p = visible();
        if (p.querySelector('.dgw.is-pending')) draw(p);
      }
      setLive();
      armAuto();
    },
    { threshold: 0.3 },
  ).observe(root);

  root.addEventListener('tabs:change', (e) => {
    const { index, from } = (e as CustomEvent<{ index: number; from: number }>).detail;
    root.style.setProperty('--xp-dir', index >= from ? '1' : '-1');
    const p = panels[index];
    if (p && inView) draw(p);
    setLive();
    armAuto();
  });

  // Toggle changes: live caption, analytics, smart-home tile flash.
  for (const p of panels) {
    const live = p.querySelector<HTMLElement>('[data-caption-live]');
    const tileText = () => [...p.querySelectorAll<HTMLElement>('[data-tile]')].map((t) => t.innerText);
    let before = tileText();
    p.addEventListener('change', (e) => {
      const r = e.target as HTMLInputElement;
      if (r.type !== 'radio' || r.dataset.modeI == null) return;
      touched.add(p);
      window.clearTimeout(autoTimer);
      const cap = p.querySelector<HTMLElement>(`.xp__caption[data-in-mode="${r.dataset.modeI}"]`);
      if (live && cap) live.textContent = cap.textContent ?? '';
      track('diagram_toggle', { service: p.dataset.panel, mode: r.value });
      const after = tileText();
      p.querySelectorAll<HTMLElement>('[data-tile]').forEach((t, i) => {
        if (after[i] === before[i]) return;
        t.classList.remove('is-flash');
        void t.offsetWidth;
        t.classList.add('is-flash');
        window.setTimeout(() => t.classList.remove('is-flash'), 600);
      });
      before = after;
    });
  }

  // Hash → tab, on load and for any in-page link to a panel (capture: before the scroll).
  const openFor = (hash: string) => {
    if (!tabs || hash.length < 2) return;
    const i = tabs.indexOfPanel(decodeURIComponent(hash.slice(1)));
    if (i >= 0 && i !== tabs.current) tabs.select(i, { user: true });
  };
  openFor(location.hash);
  if (location.hash && tabs && tabs.indexOfPanel(location.hash.slice(1)) >= 0) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  document.addEventListener(
    'click',
    (e) => {
      const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
      if (a) openFor(a.hash);
    },
    true,
  );
  window.addEventListener('hashchange', () => openFor(location.hash));
}
