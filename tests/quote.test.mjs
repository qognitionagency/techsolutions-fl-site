// Instant-quote arithmetic against the real content.ts sample model. Run: npm test
// Every figure asserted here is a SAMPLE from content.ts quoteBuilder; if Theo changes a
// delta, these expectations move with it (they are computed from the model, not typed in).
import { test } from 'node:test';
import assert from 'node:assert/strict';

const OUT = new URL('./.out/', import.meta.url);
const q = await import(new URL('quote.mjs', OUT).href);
const { quoteBuilder } = await import(new URL('content.mjs', OUT).href);

const svc = (k) => quoteBuilder.services.find((s) => s.key === k);
const tv = svc('tv');
const wifi = svc('wifi');
const cams = svc('cameras');
const smart = svc('smart');
const field = (s, name) => s.fields.find((f) => f.name === name);
const delta = (s, name, key) => field(s, name).choices.find((c) => c.key === key).delta;

test('initial values price at each service base', () => {
  for (const s of quoteBuilder.services) {
    const r = q.priceService(s, q.initialValues(s));
    assert.equal(r.total, s.base.amount, `${s.key} initial`);
    assert.deepEqual(r.blocked, []);
  }
});

test('TV: per-TV options multiply by tv_count', () => {
  const v = { ...q.initialValues(tv), tv_count: 2, tv_size: '56_65', wires: 'in_wall', has_mount: 'no', soundbar: true };
  const per = tv.base.amount + delta(tv, 'tv_size', '56_65') + delta(tv, 'wires', 'in_wall') + delta(tv, 'has_mount', 'no') + field(tv, 'soundbar').unitDelta;
  const r = q.priceService(tv, v);
  assert.equal(r.total, per * 2);
  assert.equal(r.count, 2);
});

test('TV: base + in-wall equals the gated "from $249" alsoFrom figure', () => {
  const r = q.priceService(tv, { ...q.initialValues(tv), wires: 'in_wall' });
  assert.equal(r.total, tv.base.amount + delta(tv, 'wires', 'in_wall'));
  assert.equal(r.total, 249);
});

test('TV: in-wall on concrete is blocked, reported and never priced', () => {
  const v = { ...q.initialValues(tv), wall_type: 'concrete', wires: 'in_wall' };
  const choice = field(tv, 'wires').choices.find((c) => c.key === 'in_wall');
  assert.equal(q.isDisabled(choice, v), true);
  assert.equal(q.isDisabled(choice, { ...v, wall_type: 'drywall' }), false);
  const r = q.priceService(tv, v);
  assert.equal(r.total, tv.base.amount);
  assert.equal(r.blocked.length, 1);
  assert.equal(r.blocked[0].choice, 'in_wall');
  assert.equal(r.blocked[0].reason, choice.disabledWhen.reason);
});

test('TV count is clamped to the stepper range', () => {
  const f = field(tv, 'tv_count');
  assert.equal(q.priceService(tv, { ...q.initialValues(tv), tv_count: 99 }).count, f.max);
  assert.equal(q.priceService(tv, { ...q.initialValues(tv), tv_count: -3 }).count, f.min);
  assert.equal(q.priceService(tv, { ...q.initialValues(tv), tv_count: 'abc' }).count, f.min);
});

test('Wi-Fi: home size + access points stepper', () => {
  const r = q.priceService(wifi, { home_size: '2_3', access_points: 2 });
  assert.equal(r.total, wifi.base.amount + delta(wifi, 'home_size', '2_3') + 2 * field(wifi, 'access_points').unitDelta);
});

test('Cameras: the first freeUnits are in the base; doorbell adds once', () => {
  const f = field(cams, 'camera_units');
  assert.equal(q.priceService(cams, { camera_units: f.freeUnits }).total, cams.base.amount);
  const r = q.priceService(cams, { camera_units: 5, doorbell: true });
  assert.equal(r.total, cams.base.amount + (5 - f.freeUnits) * f.unitDelta + field(cams, 'doorbell').unitDelta);
  assert.equal(r.count, 5);
});

test('Smart: ticked devices replace the base; none ticked falls back to the base', () => {
  assert.equal(q.priceService(smart, { smart_devices: ['lock', 'thermostat'] }).total, delta(smart, 'smart_devices', 'lock') + delta(smart, 'smart_devices', 'thermostat'));
  assert.equal(q.priceService(smart, { smart_devices: [] }).total, smart.base.amount);
  assert.equal(q.priceService(smart, { smart_devices: ['lock', 'thermostat'] }).count, 2);
});

test('estimate sums only the selected services', () => {
  const values = { ...q.initialValues(tv), ...q.initialValues(cams), camera_units: 4 };
  const e = q.estimate(quoteBuilder.services, ['tv', 'cameras'], values);
  assert.equal(e.lines.length, 2);
  assert.equal(e.total, e.lines[0].total + e.lines[1].total);
  assert.equal(q.estimate(quoteBuilder.services, [], values).total, 0);
});

test('overflow: every service at its maximum stays a finite whole number and formats', () => {
  const max = {
    tv_count: field(tv, 'tv_count').max, tv_size: '76_plus', wall_type: 'drywall', wires: 'in_wall', has_mount: 'no', soundbar: true,
    home_size: '4_plus', access_points: field(wifi, 'access_points').max,
    camera_units: field(cams, 'camera_units').max, doorbell: true,
    smart_devices: field(smart, 'smart_devices').choices.map((c) => c.key), rental: true,
  };
  const e = q.estimate(quoteBuilder.services, quoteBuilder.services.map((s) => s.key), max);
  assert.ok(Number.isInteger(e.total) && e.total > 0);
  assert.match(q.usd(e.total), /^\$\d{1,3}(,\d{3})*$/);
  assert.equal(q.usd(123456789), '$123,456,789');
});

test('handoff helpers: camera buckets and template fill', () => {
  assert.deepEqual([2, 3, 4, 5, 8, 9].map(q.cameraBucket), ['1_2', '3_4', '3_4', '5_8', '5_8', '9_plus']);
  assert.equal(q.fillTemplate(quoteBuilder.notesLine, { summary: 'TV mounting', total: '$129' }), 'Quote: TV mounting, from $129');
  assert.equal(q.fillTemplate('{a} {missing}', { a: 1 }), '1 {missing}');
});

// Owen, 2026-10-07: "Book this install" must append the quote to what the visitor already
// wrote in notes, never overwrite it; a second Book replaces the earlier quote line only.
test('mergeNotes appends the quote line to existing notes and replaces only its own earlier line', () => {
  assert.equal(q.mergeNotes('', '', 'Quote: TV, from $129'), 'Quote: TV, from $129');
  assert.equal(q.mergeNotes('Gate code 4411', '', 'Quote: TV, from $129'), 'Gate code 4411\nQuote: TV, from $129');
  const once = q.mergeNotes('Gate code 4411', '', 'Quote: TV, from $129');
  assert.equal(q.mergeNotes(once, 'Quote: TV, from $129', 'Quote: TV × 2, from $258'), 'Gate code 4411\nQuote: TV × 2, from $258');
  assert.equal(q.mergeNotes('Quote: TV, from $129', 'Quote: TV, from $129', 'Quote: TV, from $129'), 'Quote: TV, from $129');
  assert.ok(q.mergeNotes('x'.repeat(490), '', 'Quote: TV, from $129', 500).length <= 500, 'respects maxlength');
  assert.ok(q.mergeNotes('x'.repeat(490), '', 'Quote: TV, from $129', 500).startsWith('x'.repeat(490)), 'never drops what the visitor wrote');
});
