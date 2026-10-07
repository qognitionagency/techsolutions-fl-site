/**
 * dataLayer helper (ADR 0001 §6). No tag is loaded: pushes sit in
 * window.dataLayer, ready for GTM once there is a consent mechanism.
 *
 * PII is stripped here, in code, not by convention (CRO spec §5):
 * - keys on the denylist are dropped;
 * - string values with an `@` or a phone-like digit run are dropped
 *   (a whole-value UUID is exempt, so lead_id / submission_id survive);
 * - numbers of 7+ digits, objects and arrays are dropped.
 *
 * Identical file in iron-sound-solutions and techsolutions-fl. Change both.
 */
export type Params = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const DENY = new Set(
  'name first_name last_name full_name email phone tel mobile address street zip postal_code location notes message website date other_desc'.split(' '),
);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PHONEISH = /\d(?:[\s().+-]*\d){6,}/;

/** Returns only the params that are safe to send. Exported for tests. */
export function clean(params: Params = {}): Params {
  const out: Params = {};
  for (const [k, v] of Object.entries(params)) {
    if (DENY.has(k.toLowerCase())) continue;
    if (typeof v === 'string') {
      if (!UUID.test(v) && (v.includes('@') || PHONEISH.test(v))) continue;
      out[k] = v.slice(0, 100);
    } else if (typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v) && Math.abs(v) < 1e6)) {
      out[k] = v;
    }
  }
  return out;
}

export function track(event: string, params: Params = {}): void {
  (window.dataLayer ||= []).push({ event, ...clean(params) });
}

const CTA: Record<string, string> = { id: 'cta_id', location: 'cta_location', type: 'cta_type' };
const snake = (s: string) => s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase()).replace(/^_/, '');

/**
 * One delegated listener (ADR §6). `data-track="<event>"` names the event;
 * `data-track-id|location|type` become `cta_id|cta_location|cta_type`; any
 * other `data-track-foo-bar` becomes `foo_bar`. tel:/sms:/mailto: links fire
 * call_click / text_click / email_click with no `data-track` needed.
 * One element, one event.
 */
export function initTracking(): void {
  if (document.documentElement.hasAttribute('data-tracking')) return;
  document.documentElement.setAttribute('data-tracking', '');
  document.addEventListener(
    'click',
    (e) => {
      const el = (e.target as Element | null)?.closest?.<HTMLElement>('[data-track],a[href^="tel:"],a[href^="sms:"],a[href^="mailto:"]');
      if (!el) return;
      const ds = el.dataset;
      const href = el.getAttribute('href') ?? '';
      const event = ds.track || (href.startsWith('tel:') ? 'call_click' : href.startsWith('sms:') ? 'text_click' : 'email_click');
      const p: Params = {};
      for (const [k, v] of Object.entries(ds)) {
        if (!k.startsWith('track') || k === 'track') continue;
        const key = snake(k.slice(5));
        p[CTA[key] ?? key] = v;
      }
      const section = el.closest('section[id]')?.id;
      if (section) p.section = section;
      if (ds.service) p.service = ds.service;
      if (ds.prefillType) p.prefill_type = ds.prefillType;
      track(event, p);
    },
    true,
  );
}

if (typeof document !== 'undefined') initTracking();
