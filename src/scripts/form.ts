/**
 * Multi-step form (ADR 0001 §6; CRO spec §3 Iron Sound, §4 TechSolutions).
 * Framework-free. The HTML contract is in docs/form-module.md.
 *
 * - Without JS every step renders and the form posts natively (ADR §2).
 * - POSTs FormData to PUBLIC_FORM_ENDPOINT with Accept: application/json and
 *   optional access_key. 2xx = success. A network failure is retried once.
 *   A timeout or HTTP error is not retried automatically (the request may have
 *   landed), so the error panel's Try again handles those instead.
 * - Endpoint unset or not https → demo mode: success panel plus the
 *   [data-demo-notice], and form_submit carries mode: 'demo'.
 * - Honeypot `website` (or the optional time trap) → fake success, no POST,
 *   no event.
 * - Nothing is written to storage. Contact fields leave the page only on submit.
 *
 * Identical file in iron-sound-solutions and techsolutions-fl. Change both.
 */
import { track, type Params } from './analytics';

export type FormState = 'idle' | 'submitting' | 'success' | 'error';
export type FormEvent = 'form_view' | 'form_start' | 'form_step' | 'form_submit';
export type PrefillValue = string | string[] | boolean;

export interface FormOptions {
  /** Defaults to import.meta.env.PUBLIC_FORM_ENDPOINT. */
  endpoint?: string;
  /** Defaults to import.meta.env.PUBLIC_FORM_ACCESS_KEY. Public by design (ADR §6). */
  accessKey?: string;
  /** Per-attempt timeout. Default 15000 (CRO specs). */
  timeoutMs?: number;
  retryDelayMs?: number;
  /** Time trap: a submit sooner than this after form_start is treated as a bot. 0 = off. */
  minFillMs?: number;
  /** A CTA prefill counts as form_start and opens on the first step it did not complete (TechSolutions). */
  skipPrefilledSteps?: boolean;
  /** URL query key → field name, e.g. { service: 'services' }. */
  urlParams?: Record<string, string>;
  /** Param and event names that differ between the two specs. */
  names?: { id?: string; entry?: string; field?: string; submitFail?: string };
  /** Site-specific enum params added to an event (never raw field values). */
  params?: (event: FormEvent, data: FormData) => Params;
  onState?: (state: FormState, data: FormData) => void;
}

export interface FormController {
  prefill(fields: Record<string, PrefillValue>): void;
  goTo(step: number): void;
}

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type ErrType = 'required' | 'format' | 'length' | 'range';

const HONEYPOT = 'website';
const isCheck = (c: Control): c is HTMLInputElement => c.type === 'radio' || c.type === 'checkbox';
const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ''));
const snake = (s: string) => s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase()).replace(/^_/, '');
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const uuid = (): string =>
  crypto.randomUUID?.() ??
  // Non-secure contexts (http LAN preview) have no randomUUID.
  '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
    (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0]! & (15 >> (+c / 4)))).toString(16),
  );

export function initMultiStepForm(root: HTMLFormElement, opts: FormOptions = {}): FormController {
  const endpoint = (opts.endpoint ?? import.meta.env.PUBLIC_FORM_ENDPOINT ?? '').trim();
  const live = /^https:\/\//i.test(endpoint);
  const accessKey = opts.accessKey ?? import.meta.env.PUBLIC_FORM_ACCESS_KEY;
  const ID = opts.names?.id ?? 'lead_id';
  const ENTRY = opts.names?.entry ?? 'entry_cta';
  const FIELD = opts.names?.field ?? 'field_name';
  const FAIL = opts.names?.submitFail ?? 'form_submit_error';

  const q = <T extends Element = HTMLElement>(s: string, el: ParentNode = root) => el.querySelector<T>(s);
  const qa = <T extends Element = HTMLElement>(s: string, el: ParentNode = root) => Array.from(el.querySelectorAll<T>(s));
  const all = (scope: ParentNode = root) => qa<Control>('input,select,textarea', scope);
  const controls = (scope: ParentNode) =>
    all(scope).filter((c) => !c.disabled && c.name && c.name !== HONEYPOT && !/^(hidden|submit|button|reset|image|file)$/.test(c.type));
  const named = (name: string) => all().filter((c) => c.name === name);
  const picked = (name: string) => named(name).filter((c) => !c.disabled && (!isCheck(c) || c.checked));
  const holds = (expr: string) => {
    const [name = '', want = ''] = expr.split('=');
    return picked(name.trim()).some((c) => want.split('|').includes(c.value));
  };
  const setHidden = (name: string, v: string) => named(name).forEach((c) => c.type === 'hidden' && (c.value = v));
  const extra = (e: FormEvent) => opts.params?.(e, new FormData(root)) ?? {};
  // URL prefill allowlist: only fields a urlParams key maps to (choices/selects), plus utm_* hidden fields.
  const urlTargets = new Set(Object.values(opts.urlParams ?? {}));
  const urlMay = (c: Control, name: string) =>
    (urlTargets.has(name) && (isCheck(c) || c.tagName === 'SELECT')) || (c.type === 'hidden' && name.startsWith('utm_'));

  const found = qa('[data-step]');
  const steps = found.length ? found : [root as HTMLElement];
  const liveRegion = q('[data-live]');
  const touched = new Set<Control>();
  const prefilledNames = new Set<string>();
  const sent = new Set<string>();
  let current = 0;
  let state: FormState = 'idle';
  let id = '';
  let entry = 'direct';
  let prefilled = false;
  let startedAt = 0;
  let quiet = false;
  let viewed = false;

  const say = (msg: string) => liveRegion && (liveRegion.textContent = msg);
  const heading = (scope: HTMLElement) => {
    const h = q('[data-step-heading],[data-success-heading]', scope) ?? q('legend,h1,h2,h3,h4', scope) ?? scope;
    if (!h.hasAttribute('tabindex')) h.tabIndex = -1;
    return h;
  };

  // ---- conditional fields ----------------------------------------------
  function refresh(): void {
    for (const w of qa('[data-show-if]')) {
      const on = holds(w.dataset.showIf ?? '') && !w.parentElement?.closest('[data-show-if][hidden]');
      w.hidden = !on;
      all(w).forEach((c) => (c.disabled = !on));
    }
    for (const c of qa<Control>('[data-required-if]')) c.required = holds(c.dataset.requiredIf ?? '');
  }

  // ---- validation --------------------------------------------------------
  function check(c: Control, fix: boolean): ErrType | null {
    if (c.type === 'checkbox') {
      const g = c.closest<HTMLElement>('[data-required-group]');
      if (g) return picked(c.name).filter((x) => g.contains(x)).length >= +(g.dataset.requiredGroup || 1) ? null : 'required';
    }
    const v = isCheck(c) ? '' : c.value.trim();
    if (fix && !isCheck(c) && c.value !== v) c.value = v;
    if (!isCheck(c) && c.required && !v) return 'required';
    if (v) {
      if (c.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'format';
      // 10 digits after stripping formatting, optional leading 1, NANP area code (not 0/1).
      if (c.dataset.validate === 'phone' && !/^1?[2-9]\d{9}$/.test(v.replace(/\D/g, ''))) return 'format';
      if ((c as HTMLInputElement).minLength > 0 && v.length < (c as HTMLInputElement).minLength) return 'length';
    }
    const s = c.validity;
    if (s.valueMissing) return 'required';
    if (s.typeMismatch || s.patternMismatch || s.badInput) return 'format';
    if (s.tooShort || s.tooLong) return 'length';
    if (s.rangeUnderflow || s.rangeOverflow || s.stepMismatch) return 'range';
    return null;
  }

  /** One result per field (radio/checkbox groups collapse to their first control). */
  function results(scope: HTMLElement, fix: boolean): [Control, ErrType | null][] {
    const seen = new Set<string>();
    return controls(scope)
      .filter((c) => !isCheck(c) || (!seen.has(c.name) && !!seen.add(c.name)))
      .map((c) => [c, check(c, fix)]);
  }

  function message(c: Control, t: ErrType): string {
    const w = c.closest<HTMLElement>('[data-field]');
    const k = 'error' + t[0]!.toUpperCase() + t.slice(1);
    return c.dataset[k] || w?.dataset[k] || c.dataset.error || w?.dataset.error || c.validationMessage || t;
  }

  function render(c: Control, t: ErrType | null): void {
    let p = qa('[data-error-for]').find((e) => e.dataset.errorFor === c.name);
    if (!p && !t) return;
    if (!p) {
      p = document.createElement('p');
      p.dataset.errorFor = c.name;
      const w = c.closest('[data-field]');
      w ? w.append(p) : c.after(p);
    }
    p.id ||= `${root.id || 'form'}-${c.name}-error`;
    p.textContent = t ? message(c, t) : '';
    p.hidden = !t;
    for (const x of isCheck(c) ? named(c.name) : [c]) {
      const ids = (x.getAttribute('aria-describedby') ?? '').split(' ').filter((i) => i && i !== p.id);
      if (t) ids.push(p.id);
      t ? x.setAttribute('aria-invalid', 'true') : x.removeAttribute('aria-invalid');
      ids.length ? x.setAttribute('aria-describedby', ids.join(' ')) : x.removeAttribute('aria-describedby');
    }
  }

  /** Renders a step's results; on failure fires form_error per field, focuses the first, announces. */
  function validateStep(i: number): boolean {
    const step = steps[i]!;
    const res = results(step, true);
    res.forEach(([c, t]) => render(c, t));
    const bad = res.filter((r): r is [Control, ErrType] => !!r[1]);
    const summary = q('[data-error-summary]', step);
    if (summary) {
      summary.hidden = bad.length < 2;
      summary.replaceChildren(
        ...(bad.length < 2 ? [] : bad).map(([c, t]) => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = '#' + c.id;
          a.textContent = message(c, t);
          li.append(a);
          return li;
        }),
      );
    }
    if (!bad.length) return true;
    if (i !== current) goTo(i, false);
    for (const [c, t] of bad) track('form_error', { step_name: step.dataset.step, [FIELD]: c.name, error_type: t });
    bad[0]![0].focus();
    say(fill(liveRegion?.dataset.liveErrors || '{count} answers need attention.', { count: bad.length }));
    return false;
  }

  // ---- steps ---------------------------------------------------------------
  function goTo(i: number, focus = true, preventScroll = false): void {
    current = Math.max(0, Math.min(i, steps.length - 1));
    steps.forEach((s, k) => s !== root && (s.hidden = k !== current));
    const step = steps[current]!;
    const v = { n: current + 1, total: steps.length, title: heading(step).textContent?.trim() ?? '' };
    for (const p of qa('[data-progress]')) {
      p.setAttribute('aria-valuemin', '1');
      p.setAttribute('aria-valuemax', String(v.total));
      p.setAttribute('aria-valuenow', String(v.n));
      p.style.setProperty('--progress', String(v.n / v.total));
    }
    for (const t of qa('[data-progress-text]')) t.textContent = fill(t.dataset.template || 'Step {n} of {total}', v);
    if (focus) {
      say(fill(liveRegion?.dataset.liveStep || 'Step {n} of {total}: {title}', v));
      heading(step).focus({ preventScroll });
    }
  }

  function next(): void {
    if (!validateStep(current)) return;
    track('form_step', { step_number: current + 1, step_name: steps[current]!.dataset.step, ...extra('form_step') });
    goTo(current + 1);
  }

  function start(): void {
    if (startedAt) return;
    startedAt = Date.now();
    id = uuid();
    setHidden(ID, id);
    setHidden(ENTRY, entry);
    track('form_start', { [ENTRY]: entry, prefilled, [ID]: id, ...extra('form_start') });
  }

  // ---- prefill ---------------------------------------------------------------
  function apply(fields: Record<string, PrefillValue>, fromUrl = false): void {
    quiet = true;
    for (const [name, raw] of Object.entries(fields)) {
      if (name === HONEYPOT || name === ID || name === ENTRY) continue;
      const want = raw === true ? null : (Array.isArray(raw) ? raw : String(raw).split(',')).map((s) => s.trim());
      for (const c of named(name)) {
        // A link can never tick consent or set free text: only urlParams targets and utm_* (Anton, 2026-10-07).
        if (fromUrl && !urlMay(c, name)) continue;
        if (isCheck(c)) {
          if (want && !want.includes(c.value)) continue;
          c.checked = true;
        } else {
          c.value = String(raw);
        }
        prefilled = true;
        prefilledNames.add(name);
        c.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    quiet = false;
    refresh();
  }

  function setState(s: FormState, data: FormData, demo = false): void {
    state = s;
    root.dataset.state = s;
    const busy = s === 'submitting';
    busy ? root.setAttribute('aria-busy', 'true') : root.removeAttribute('aria-busy');
    for (const b of qa<HTMLButtonElement>('[type=submit]')) {
      b.disabled = busy;
      const label = q('[data-label]', b) ?? b;
      if (b.dataset.busyLabel) {
        if (busy) {
          b.dataset.idleLabel ??= label.textContent ?? '';
          label.textContent = b.dataset.busyLabel;
        } else if (b.dataset.idleLabel != null) label.textContent = b.dataset.idleLabel;
      }
    }
    qa('[data-error-panel]').forEach((p) => (p.hidden = s !== 'error'));
    const panel = q('[data-success]');
    if (s === 'success' && panel) {
      for (const el of Array.from(root.children) as HTMLElement[]) el.hidden = !el.contains(panel);
      panel.hidden = false;
      for (const f of qa('[data-fill]', panel)) {
        f.textContent = picked(f.dataset.fill ?? '')
          .map((c) =>
            isCheck(c)
              ? (c.labels?.[0]?.textContent ?? c.value).trim()
              : c.tagName === 'SELECT'
                ? ((c as HTMLSelectElement).options[(c as HTMLSelectElement).selectedIndex]?.text ?? '')
                : c.value,
          )
          .filter(Boolean)
          .join(', ');
      }
      qa('[data-demo-notice]').forEach((n) => (n.hidden = !demo));
      heading(panel).focus();
    }
    opts.onState?.(s, data);
  }

  // ---- submit ------------------------------------------------------------------
  async function send(body: FormData): Promise<string | null> {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), opts.timeoutMs ?? 15000);
    try {
      const res = await fetch(endpoint, { method: 'POST', body, headers: { Accept: 'application/json' }, signal: ctl.signal });
      return res.ok ? null : res.status >= 500 ? 'http_5xx' : 'http_4xx';
    } catch {
      return ctl.signal.aborted ? 'timeout' : 'network';
    } finally {
      clearTimeout(timer);
    }
  }

  function converted(mode: 'live' | 'demo'): void {
    if (sent.has(id)) return;
    sent.add(id);
    track('form_submit', { mode, [ID]: id, [ENTRY]: entry, ...extra('form_submit') });
  }

  async function submit(): Promise<void> {
    if (state === 'submitting' || state === 'success') return;
    for (let i = 0; i < steps.length; i++) if (!validateStep(i)) return;
    const retry = state === 'error';
    start();
    const data = new FormData(root);
    if (data.get(HONEYPOT) || Date.now() - startedAt < (opts.minFillMs ?? 0)) return setState('success', data);
    if (!retry) track('form_step', { step_number: current + 1, step_name: steps[current]!.dataset.step, ...extra('form_step') });
    data.delete(HONEYPOT);
    data.set(ID, id);
    data.set(ENTRY, entry);
    if (!live) {
      setState('success', data, true);
      return converted('demo');
    }
    if (accessKey) data.set('access_key', accessKey);
    setState('submitting', data);
    let err = await send(data);
    if (err === 'network') {
      await wait(opts.retryDelayMs ?? 800);
      err = await send(data);
    }
    if (err) {
      track(FAIL, { error_type: err, [ID]: id });
      return setState('error', data);
    }
    setState('success', data);
    converted('live');
  }

  // ---- wiring ------------------------------------------------------------------
  root.noValidate = true;
  root.dataset.state = state;
  if (liveRegion && !liveRegion.hasAttribute('aria-live')) liveRegion.setAttribute('aria-live', 'polite');
  qa('[data-js-only]').forEach((el) => (el.hidden = false));
  refresh();

  // URL prefill, read once and never written back. Query plus anything after `?` in the hash.
  const qs = new URLSearchParams(location.search);
  new URLSearchParams(location.hash.split('?')[1] ?? '').forEach((v, k) => qs.append(k, v));
  const fromUrl: Record<string, string> = {};
  qs.forEach((v, k) => {
    const f = opts.urlParams?.[k] ?? k;
    fromUrl[f] = fromUrl[f] ? `${fromUrl[f]},${v}` : v;
  });
  apply(fromUrl, true);
  goTo(0, false);

  const onInput = (e: Event) => {
    const c = e.target as Control;
    if (!quiet && c.name && c.name !== HONEYPOT) {
      touched.add(c);
      start();
    }
    refresh();
    if (c.getAttribute?.('aria-invalid') === 'true') render(c, check(c, false));
  };
  root.addEventListener('input', onInput);
  root.addEventListener('change', onInput);
  root.addEventListener('focusout', (e) => {
    const c = e.target as Control;
    if (touched.has(c) && !c.disabled) render(c, check(c, true));
  });
  root.addEventListener('click', (e) => {
    const t = e.target as Element;
    const act = t.closest('[data-next]') ? next : t.closest('[data-back]') ? () => goTo(current - 1) : t.closest('[data-retry]') ? submit : null;
    if (!act) return;
    e.preventDefault();
    void act();
  });
  root.addEventListener('submit', (e) => {
    e.preventDefault();
    void (current < steps.length - 1 ? next() : submit());
  });

  // CTAs elsewhere on the page: data-prefill-* and/or a link to the form (or a section containing it).
  document.addEventListener('click', (e) => {
    const el = (e.target as Element | null)?.closest?.<HTMLElement>('a,button');
    if (!el || root.contains(el)) return;
    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries(el.dataset)) if (k.startsWith('prefill') && k.length > 7 && v != null) fields[snake(k.slice(7))] = v;
    const hash = (el.getAttribute('href') ?? '').split('#')[1];
    const target = hash ? document.getElementById(hash) : null;
    if (!Object.keys(fields).length && !target?.contains(root)) return;
    if (!startedAt) entry = el.dataset.entry || el.dataset.trackId || 'direct';
    apply(fields);
    if (opts.skipPrefilledSteps && prefilledNames.size) {
      start();
      let i = 0;
      while (i < steps.length - 1 && controls(steps[i]!).some((c) => prefilledNames.has(c.name)) && results(steps[i]!, false).every((r) => !r[1])) i++;
      goTo(i, false);
    }
    if (!target) root.scrollIntoView?.({ block: 'start' });
    // The anchor (or scrollIntoView) does the scrolling; focus must not jump it.
    heading(steps[current]!).focus({ preventScroll: true });
  });

  document.addEventListener('form:prefill', (e) => {
    const d = (e as CustomEvent<unknown>).detail;
    if (d && typeof d === 'object') apply(d as Record<string, PrefillValue>);
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (es) => {
        if (viewed || !es.some((x) => x.isIntersecting)) return;
        viewed = true;
        io.disconnect();
        track('form_view', extra('form_view'));
      },
      { threshold: 0.5 },
    );
    io.observe(root);
  }

  return { prefill: (f) => apply(f), goTo: (i) => goTo(i) };
}
