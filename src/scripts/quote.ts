/**
 * Instant quote builder (QuoteBuilder.astro). Reads the builder form, prices it with
 * lib/quote.ts against the content.ts model serialised in #qb-model, renders the receipt, and
 * hands the selections to the booking form.
 *
 * Handoff ("Book this install", an <a href="#book">): dispatches `form:prefill` with every
 * selection by its booking-form field name (content.ts quoteBuilder note), camera_units →
 * camera_count bucket, the receipt summary → appended to notes (mergeNotes) + quote_summary, the total → quote_total,
 * the service keys → quote_service. form.ts's own click handler then skips the prefilled steps,
 * scrolls and focuses. Nothing is written to storage.
 *
 * "Price this" links in the explorer (data-quote-services) select that service here and carry
 * the explorer's toggle (TV wall type; cameras "3 + doorbell").
 */
import { track } from './analytics';
import { cssMs } from '../lib/css-time';
import {
  cameraBucket,
  estimate,
  fillTemplate,
  isDisabled,
  mergeNotes,
  usd,
  type QuoteValues,
} from '../lib/quote';
import type { QuoteService } from '../data/content';

interface Model {
  services: QuoteService[];
  estimate: { lineItem: string; lineQty: string; live: string; empty: string };
  notesLine: string;
  smsBase: string;
  smsTemplate: string;
  smsDefault: string;
}

const root = document.querySelector<HTMLElement>('[data-qb]');
const modelEl = document.getElementById('qb-model');

if (root && modelEl) {
  const model = JSON.parse(modelEl.textContent ?? '{}') as Model;
  const form = root.querySelector<HTMLFormElement>('[data-qb-form]')!;
  const $ = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s);
  const $$ = <T extends Element = HTMLElement>(s: string) => [...root.querySelectorAll<T>(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const totalEl = $('[data-qb-total]')!;
  const pillTotal = $('[data-qb-pill-total]');
  const live = $('[data-qb-live]');
  const errorEl = $('[data-qb-error]')!;
  const book = $<HTMLAnchorElement>('[data-qb-book]')!;
  const text = $<HTMLAnchorElement>('[data-qb-text]');
  let shownTotal = 0;
  let anim = 0;
  let liveTimer = 0;
  let trackTimer = 0;
  let lastNotesLine = '';

  document.querySelector('[data-qb-fallback]')?.setAttribute('hidden', '');
  root.hidden = false;

  const selected = () => $$<HTMLInputElement>('input[name="qb_services"]:checked').map((i) => i.value);

  function read(): QuoteValues {
    const v: QuoteValues = {};
    for (const s of model.services) {
      for (const f of s.fields) {
        const inputs = [...form.querySelectorAll<HTMLInputElement>(`[name="${f.name}"]`)];
        if (f.kind === 'stepper') v[f.name] = Number(inputs[0]?.value ?? f.initial ?? 0);
        else if (f.kind === 'checkbox') v[f.name] = !!inputs[0]?.checked;
        else if (f.kind === 'multi') v[f.name] = inputs.filter((i) => i.checked).map((i) => i.value);
        else v[f.name] = inputs.find((i) => i.checked)?.value;
      }
    }
    return v;
  }

  /** Disable choices whose condition holds; move a selection off a newly disabled choice. */
  function applyRules(v: QuoteValues): QuoteValues {
    let changed = false;
    for (const s of model.services) {
      for (const f of s.fields) {
        for (const c of f.choices ?? []) {
          if (!c.disabledWhen) continue;
          const input = form.querySelector<HTMLInputElement>(`[name="${f.name}"][value="${c.key}"]`);
          if (!input) continue;
          const off = isDisabled(c, v);
          input.disabled = off;
          if (off && input.checked) {
            input.checked = false;
            // The concrete alternative to in-wall is the raceway; otherwise the first enabled choice.
            const alt =
              form.querySelector<HTMLInputElement>(`[name="${f.name}"][value="raceway"]:not(:disabled)`) ??
              form.querySelector<HTMLInputElement>(`[name="${f.name}"]:not(:disabled)`);
            if (alt) alt.checked = true;
            changed = true;
          }
        }
        const reason = form.querySelector<HTMLElement>(`[data-qb-reason="${f.name}"]`);
        if (reason) reason.hidden = !(f.choices ?? []).some((c) => isDisabled(c, v));
      }
    }
    return changed ? read() : v;
  }

  function clampSteppers(): void {
    for (const i of form.querySelectorAll<HTMLInputElement>('input[type="number"]')) {
      const min = Number(i.min || 0);
      const max = Number(i.max || 99);
      const n = Math.min(max, Math.max(min, Math.floor(Number(i.value) || min)));
      if (String(n) !== i.value) i.value = String(n);
      form.querySelectorAll<HTMLButtonElement>(`[data-for="${i.name}"]`).forEach((b) => {
        b.disabled = Number(b.dataset.stepBy) < 0 ? n <= min : n >= max;
      });
    }
  }

  function tick(to: number): void {
    cancelAnimationFrame(anim);
    const from = shownTotal;
    shownTotal = to;
    if (reduce || from === to) {
      totalEl.textContent = usd(to);
      if (pillTotal) pillTotal.textContent = usd(to);
      return;
    }
    const t0 = performance.now();
    const dur = cssMs(getComputedStyle(root!).getPropertyValue('--duration-slow'), 520);
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k); // ease-out-expo
      const val = usd(from + (to - from) * e);
      totalEl.textContent = val;
      if (pillTotal) pillTotal.textContent = val;
      if (k < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }

  function summary(keys: string[], v: QuoteValues): { text: string; total: number } {
    const est = estimate(model.services, keys, v);
    const parts = est.lines.map((l) => {
      const svc = model.services.find((s) => s.key === l.key)!;
      let t = l.count > 1 ? fillTemplate(model.estimate.lineQty, { service: svc.label, count: l.count }) : fillTemplate(model.estimate.lineItem, { service: svc.label });
      // Access points are priced but not in the line label: name them (content: they go into notes).
      const ap = svc.fields.find((f) => f.name === 'access_points');
      if (ap && Number(v[ap.name]) > 0) t += ` (${ap.label}: ${v[ap.name]})`;
      return t;
    });
    return { text: parts.join(', '), total: est.total };
  }

  function render(user = false): void {
    clampSteppers();
    const v = applyRules(read());
    const keys = selected();
    const est = estimate(model.services, keys, v);

    for (const g of $$('[data-qb-group]')) g.hidden = !keys.includes(g.dataset.qbGroup ?? '');
    $('[data-qb-details-empty]')!.hidden = keys.length > 0;
    $('[data-qb-step="1"]')!.classList.toggle('is-done', keys.length > 0);
    $('[data-qb-step="2"]')!.classList.toggle('is-done', keys.length > 0);
    $('[data-qb-receipt]')!.classList.toggle('is-done', keys.length > 0);
    if (keys.length) errorEl.hidden = true;

    $('[data-qb-empty]')!.hidden = keys.length > 0;
    $('[data-qb-total-row]')!.hidden = keys.length === 0;
    $('[data-qb-body]')!.hidden = keys.length === 0;
    const list = $('[data-qb-lines]')!;
    const prev = new Map([...list.children].map((li) => [(li as HTMLElement).dataset.key, li as HTMLElement]));
    const next: HTMLElement[] = [];
    for (const l of est.lines) {
      const svc = model.services.find((s) => s.key === l.key)!;
      const label = l.count > 1 ? fillTemplate(model.estimate.lineQty, { service: svc.label, count: l.count }) : fillTemplate(model.estimate.lineItem, { service: svc.label });
      const li = prev.get(l.key) ?? document.createElement('li');
      li.dataset.key = l.key;
      li.replaceChildren(Object.assign(document.createElement('span'), { textContent: label }), Object.assign(document.createElement('span'), { textContent: usd(l.total) }));
      next.push(li);
    }
    list.replaceChildren(...next);
    const blocked = $('[data-qb-blocked]')!;
    blocked.hidden = est.blocked.length === 0;
    blocked.textContent = est.blocked.map((b) => b.reason).join(' ');
    $('[data-qb-mixed]')!.hidden = !(keys.includes('tv') && Number(v.tv_count) > 1);

    tick(est.total);
    const sum = summary(keys, v);
    if (text) text.href = model.smsBase + encodeURIComponent(keys.length ? fillTemplate(model.smsTemplate, { summary: sum.text, total: usd(sum.total) }) : model.smsDefault);

    if (user) {
      window.clearTimeout(liveTimer);
      liveTimer = window.setTimeout(() => {
        if (live) live.textContent = keys.length ? fillTemplate(live.dataset.template ?? '', { total: usd(est.total) }) : model.estimate.empty;
      }, 700);
      window.clearTimeout(trackTimer);
      trackTimer = window.setTimeout(() => track('quote_update', { quote_service: keys.sort().join(','), quote_total: est.total }), 1200);
    }
  }

  // Wall rule needs a note when it moved the selection: the reason paragraph is visible then.
  form.addEventListener('change', () => render(true));
  form.addEventListener('input', (e) => {
    if ((e.target as HTMLInputElement).type === 'number') render(true);
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('[data-step-by]');
    if (!b) return;
    const i = form.querySelector<HTMLInputElement>(`[name="${b.dataset.for}"]`);
    if (!i) return;
    i.value = String(Number(i.value || 0) + Number(b.dataset.stepBy));
    render(true);
  });

  $('[data-qb-reset]')?.addEventListener('click', () => {
    form.reset();
    errorEl.hidden = true;
    render(true);
    $('[data-qb-legend="1"]')?.focus();
    track('quote_reset');
  });

  // Book this install → booking form.
  book.addEventListener('click', (e) => {
    const keys = selected();
    if (!keys.length) {
      e.preventDefault();
      e.stopPropagation();
      errorEl.hidden = false;
      form.querySelector<HTMLInputElement>('input[name="qb_services"]')?.focus();
      track('quote_error', { error_type: 'no_service' });
      return;
    }
    const v = read();
    const sum = summary(keys, v);
    const f: Record<string, string | string[]> = { services: keys };
    const put = (name: string, val: unknown) => {
      if (val == null || val === false || val === '' || (Array.isArray(val) && !val.length)) return;
      f[name] = val === true ? 'yes' : Array.isArray(val) ? val.map(String) : String(val);
    };
    if (keys.includes('tv')) ['tv_count', 'tv_size', 'wall_type', 'wires', 'has_mount', 'soundbar'].forEach((n) => put(n, v[n]));
    if (keys.includes('wifi')) put('home_size', v.home_size);
    if (keys.includes('cameras')) {
      put('camera_count', cameraBucket(Number(v.camera_units)));
      put('doorbell', v.doorbell);
    }
    if (keys.includes('smart')) {
      put('smart_devices', v.smart_devices);
      put('rental', v.rental);
    }
    const line = fillTemplate(model.notesLine, { summary: sum.text, total: usd(sum.total) });
    // Append to what the visitor already wrote in notes; replace only our own earlier line.
    const notes = document.querySelector<HTMLTextAreaElement>('form[data-consult] textarea[name="notes"]');
    f.notes = mergeNotes(notes?.value ?? '', lastNotesLine, line, notes && notes.maxLength > 0 ? notes.maxLength : Infinity);
    lastNotesLine = line;
    f.quote_summary = line;
    f.quote_total = String(Math.round(sum.total));
    f.quote_service = keys.join(',');
    document.dispatchEvent(new CustomEvent('form:prefill', { detail: f }));
    track('quote_book', { quote_service: f.quote_service, quote_total: Math.round(sum.total) });
  });
  $('[data-qb-pill-book]')?.addEventListener('click', () => book.click());

  // Explorer "Price this" → preselect that service (+ the explorer's current toggle).
  document.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest?.<HTMLElement>('[data-quote-services]');
    if (!a) return;
    const keys = (a.dataset.quoteServices ?? '').split(',').filter(Boolean);
    for (const k of keys) {
      const box = form.querySelector<HTMLInputElement>(`input[name="qb_services"][value="${k}"]`);
      if (box) box.checked = true;
    }
    const wall = document.querySelector<HTMLInputElement>('#service-tv input[data-mode]:checked')?.value;
    if (keys.includes('tv') && wall) {
      const r = form.querySelector<HTMLInputElement>(`[name="wall_type"][value="${wall}"]`);
      if (r) r.checked = true;
    }
    const cams = document.querySelector<HTMLInputElement>('#service-cameras input[data-mode]:checked')?.value;
    if (keys.includes('cameras') && cams === 'three') {
      const n = form.querySelector<HTMLInputElement>('[name="camera_units"]');
      const d = form.querySelector<HTMLInputElement>('[name="doorbell"]');
      if (n) n.value = '3';
      if (d) d.checked = true;
    }
    render(true);
    // The anchor scrolls natively; move focus to the details step without fighting it.
    requestAnimationFrame(() => $('[data-qb-legend="2"]')?.focus({ preventScroll: true }));
  });

  // Mobile sticky total: steps on screen, receipt not.
  const pill = $('[data-qb-pill]');
  if (pill && 'IntersectionObserver' in window) {
    let stepsIn = false;
    let receiptIn = false;
    const sync = () => pill.classList.toggle('is-shown', stepsIn && !receiptIn && selected().length > 0);
    new IntersectionObserver(([en]) => ((stepsIn = !!en?.isIntersecting), sync()), { rootMargin: '-20% 0px -20% 0px' }).observe(form);
    new IntersectionObserver(([en]) => ((receiptIn = !!en?.isIntersecting), sync())).observe($('[data-qb-receipt]')!);
    form.addEventListener('change', sync);
  }

  render(false);
}
