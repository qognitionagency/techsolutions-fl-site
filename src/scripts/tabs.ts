/**
 * ARIA tabs (APG "tabs with automatic activation"). Progressive: panels ship without `hidden`
 * and the tablist ships `hidden` (data-js-only); this script shows the tablist and hides the
 * inactive panels. Arrow keys / Home / End move and activate; roving tabindex keeps one tab stop.
 *
 * Markup: [data-tabs] > [role=tablist] > [role=tab][aria-controls][data-tab-id] ; [role=tabpanel]
 * Emits `tabs:change` on the root with { id, index, from }.
 */
import { track } from './analytics';

export interface TabsController {
  select(index: number, opts?: { focus?: boolean; user?: boolean }): void;
  indexOfPanel(panelId: string): number;
  readonly current: number;
}

export function initTabs(root: HTMLElement): TabsController | null {
  const tabs = [...root.querySelectorAll<HTMLElement>('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls') ?? ''));
  if (!tabs.length || panels.some((p) => !p)) return null;
  const vertical = root.querySelector('[role="tablist"]')?.getAttribute('aria-orientation') === 'vertical';
  let current = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));

  const select = (i: number, { focus = false, user = false } = {}) => {
    const from = current;
    current = (i + tabs.length) % tabs.length;
    tabs.forEach((t, k) => {
      const on = k === current;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[k]!.hidden = !on;
    });
    if (focus) tabs[current]!.focus();
    const id = tabs[current]!.dataset.tabId ?? String(current);
    root.dataset.active = id;
    root.dispatchEvent(new CustomEvent('tabs:change', { detail: { id, index: current, from } }));
    if (user && from !== current) track('tab_select', { tab_group: root.dataset.tabs || 'tabs', tab_id: id });
  };

  root.classList.add('is-tabs');
  root.querySelectorAll<HTMLElement>('[data-js-only]').forEach((el) => (el.hidden = false));
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i, { user: true }));
    t.addEventListener('keydown', (e) => {
      const next = vertical ? 'ArrowDown' : 'ArrowRight';
      const prev = vertical ? 'ArrowUp' : 'ArrowLeft';
      const to = e.key === next ? current + 1 : e.key === prev ? current - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (to === null) return;
      e.preventDefault();
      select(to, { focus: true, user: true });
    });
  });
  select(current);

  return {
    select,
    indexOfPanel: (panelId) => panels.findIndex((p) => p!.id === panelId),
    get current() {
      return current;
    },
  };
}
