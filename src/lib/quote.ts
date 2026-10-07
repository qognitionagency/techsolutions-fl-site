/**
 * Instant-quote arithmetic for content.ts `quoteBuilder`. Pure: no DOM, no copy, no prices of
 * its own. Every dollar comes from content.ts (serialised into the page at build time), so the
 * numbers on screen and the numbers in content.ts cannot drift. All of them are SAMPLES.
 *
 * Per service (Theo's `formula` strings, implemented generically):
 *   per-TV part = base + Σ single/checkbox deltas whose scope is "per_tv"
 *   total       = per-TV part × tv_count            (tv_count = 1 when the service has none)
 *               + Σ deltas with scope "once"
 *               + Σ stepper unitDelta × max(0, n − freeUnits)
 *   A `multi` field with priced choices (smart devices) prices the units itself: when at least
 *   one is ticked the base is replaced by the sum of the ticked deltas ("89 × devices, min 1").
 *   A choice whose `disabledWhen` holds (in-wall cabling on concrete) is never priced; it is
 *   returned in `blocked` so the UI can say why.
 */
import type { QuoteChoice, QuoteField, QuoteService } from '../data/content';

export type QuoteValue = string | string[] | number | boolean;
export type QuoteValues = Record<string, QuoteValue | undefined>;

export interface Blocked {
  field: string;
  choice: string;
  reason: string;
}

export interface ServiceQuote {
  key: string;
  total: number;
  /** Unit count for the line label ("TV mounting × 2"); 1 = no count shown. */
  count: number;
  blocked: Blocked[];
}

export interface Estimate {
  total: number;
  lines: ServiceQuote[];
  blocked: Blocked[];
}

const MULTIPLIER_FIELD = 'tv_count';
/** Steppers whose value labels the line ("Cameras & doorbells × 4"). */
const COUNT_FIELDS = new Set(['tv_count', 'camera_units']);

const asList = (v: QuoteValue | undefined): string[] =>
  v == null || v === false ? [] : Array.isArray(v) ? v.map(String) : [String(v)];

const clampInt = (v: QuoteValue | undefined, f: QuoteField): number => {
  const n = Math.floor(Number(v ?? f.initial ?? f.min ?? 0));
  const lo = f.min ?? 0;
  const hi = f.max ?? Number.MAX_SAFE_INTEGER;
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo;
};

/** True when `choice` must render disabled given the current values. */
export function isDisabled(choice: QuoteChoice, values: QuoteValues): boolean {
  const d = choice.disabledWhen;
  return !!d && asList(values[d.field]).includes(d.equals);
}

/** Initial values for one service, from each field's `initial`. */
export function initialValues(svc: QuoteService): QuoteValues {
  const out: QuoteValues = {};
  for (const f of svc.fields) {
    if (f.kind === 'stepper') out[f.name] = clampInt(f.initial, f);
    else if (f.kind === 'checkbox') out[f.name] = false;
    else if (f.kind === 'multi') out[f.name] = f.initial != null ? [String(f.initial)] : [];
    else out[f.name] = f.initial != null ? String(f.initial) : undefined;
  }
  return out;
}

export function priceService(svc: QuoteService, values: QuoteValues): ServiceQuote {
  const blocked: Blocked[] = [];
  const multField = svc.fields.find((f) => f.name === MULTIPLIER_FIELD && f.kind === 'stepper');
  const mult = multField ? clampInt(values[multField.name], multField) : 1;
  let base = svc.base.amount;
  let perUnit = 0;
  let once = 0;
  let count = 1;

  for (const f of svc.fields) {
    const v = values[f.name];
    const scoped = (n: number) => (f.scope === 'per_tv' ? (perUnit += n) : (once += n));

    if (f.kind === 'stepper') {
      const n = clampInt(v, f);
      if (COUNT_FIELDS.has(f.name)) count = n;
      if (f.name !== MULTIPLIER_FIELD && f.unitDelta) once += f.unitDelta * Math.max(0, n - (f.freeUnits ?? 0));
      continue;
    }
    if (f.kind === 'checkbox') {
      if (v === true && f.unitDelta) scoped(f.unitDelta);
      continue;
    }
    const picked = asList(v);
    let multiSum = 0;
    for (const c of f.choices ?? []) {
      if (!picked.includes(c.key)) continue;
      if (isDisabled(c, values)) {
        blocked.push({ field: f.name, choice: c.key, reason: c.disabledWhen!.reason });
        continue;
      }
      if (f.kind === 'multi') multiSum += c.delta;
      else scoped(c.delta);
    }
    if (f.kind === 'multi' && multiSum > 0) {
      base = multiSum;
      count = picked.length;
    }
  }

  return { key: svc.key, total: (base + perUnit) * mult + once, count, blocked };
}

export function estimate(services: readonly QuoteService[], selected: readonly string[], values: QuoteValues): Estimate {
  const lines = services.filter((s) => selected.includes(s.key)).map((s) => priceService(s, values));
  return { total: lines.reduce((a, l) => a + l.total, 0), lines, blocked: lines.flatMap((l) => l.blocked) };
}

/** Whole-dollar US format with grouping: 1234567 → "$1,234,567". */
export const usd = (n: number): string => '$' + Math.round(n).toLocaleString('en-US');

/** "{a} {b}" template fill used for every content.ts template string. */
export const fillTemplate = (s: string, v: Record<string, string | number>): string =>
  s.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m));

/** Booking-form camera_count bucket for a camera_units value (content.ts quoteBuilder handoff note). */
export function cameraBucket(n: number): string {
  if (n <= 2) return '1_2';
  if (n <= 4) return '3_4';
  if (n <= 8) return '5_8';
  return '9_plus';
}

/**
 * Booking-form notes after "Book this install": the visitor's own text is kept and the quote
 * line is appended on its own line. `prev` is the quote line this page wrote last time, removed
 * first so repeated Books do not stack. When `max` (the textarea maxlength) would be exceeded the
 * quote line is cut, never the visitor's text; quote_summary carries the full line anyway.
 */
export function mergeNotes(existing: string, prev: string, line: string, max = Infinity): string {
  let own = existing;
  if (prev) {
    const at = own.lastIndexOf(prev);
    if (at >= 0) own = own.slice(0, at) + own.slice(at + prev.length);
  }
  own = own.replace(/\s+$/, '');
  const out = own ? `${own}\n${line}` : line;
  return out.length > max ? out.slice(0, Math.max(max, own.length)) : out;
}
