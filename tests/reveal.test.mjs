// src/scripts/reveal.ts: a scroll reveal may hide content only briefly and only off screen.
// Regression for the v3 gate (Owen, 2026-10-07): an instant jump to #faq left 13 of 14 reveal
// blocks above the viewport at opacity 0 for good, and print / full-page captures showed none
// of the below-the-fold blocks. Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';

const OUT = new URL('./.out/', import.meta.url);
let n = 0;
const VH = 800;

/** Page of reveal blocks at the given document tops (px); IO is a stub the test drives. */
async function setup(tops, { reduce = false } = {}) {
  const w = new Window({ url: 'https://site.test/', width: 1280, height: VH });
  globalThis.window = w;
  globalThis.document = w.document;
  w.matchMedia = (q) => ({ matches: reduce && q.includes('reduce'), media: q, addEventListener() {} });
  const observers = [];
  w.IntersectionObserver = class {
    constructor(cb, opts) { this.cb = cb; this.opts = opts; this.els = new Set(); observers.push(this); }
    observe(el) { this.els.add(el); }
    unobserve(el) { this.els.delete(el); }
    disconnect() { this.els.clear(); }
  };
  globalThis.IntersectionObserver = w.IntersectionObserver;
  w.document.body.innerHTML = tops.map((t, i) => `<div data-reveal id="r${i}"></div>`).join('');
  let scrollY = 0;
  const els = [...w.document.querySelectorAll('[data-reveal]')];
  els.forEach((el, i) => (el.getBoundingClientRect = () => ({ top: tops[i] - scrollY, bottom: tops[i] - scrollY + 200, height: 200, left: 0, right: 100, width: 100 })));
  /** Deliver an entry per observed element to every observer, as a real IO would after layout. */
  const flush = () => {
    for (const o of observers) {
      const rootBottom = VH * (o.opts?.rootMargin?.includes('100%') ? 2 : 1);
      const entries = [...o.els].map((el) => {
        const r = el.getBoundingClientRect();
        return { target: el, boundingClientRect: r, isIntersecting: r.bottom > 0 && r.top < rootBottom, intersectionRatio: r.bottom > 0 && r.top < VH ? 1 : 0 };
      });
      if (entries.length) o.cb(entries, o);
    }
  };
  const scrollTo = (y) => { scrollY = y; w.dispatchEvent(new w.Event('scroll')); };
  await import(new URL(`reveal.mjs?v=${++n}`, OUT).href);
  flush();
  const hidden = () => els.filter((el) => el.classList.contains('reveal') && !el.classList.contains('is-in')).map((el) => el.id);
  return { w, els, flush, scrollTo, hidden, observers };
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test('on screen at load: never hidden; just below the fold: hidden; far below: left visible', async () => {
  const { hidden } = await setup([100, 900, 5000]);
  assert.deepEqual(hidden(), ['r1']);
});

test('an instant jump past a hidden block reveals it on the next scroll event', async () => {
  const { hidden, scrollTo } = await setup([100, 900, 1300]);
  assert.deepEqual(hidden(), ['r1', 'r2']);
  scrollTo(4000); // both now far above the viewport; IO reports no change for them
  assert.deepEqual(hidden(), []);
});

test('a hidden block is shown after the safety timeout even if IntersectionObserver never reports', async () => {
  const { hidden, els } = await setup([100, 900]);
  assert.deepEqual(hidden(), ['r1']);
  await wait(2700);
  assert.deepEqual(hidden(), []);
  assert.equal(els[1].style.transition, 'none', 'shown off screen: no fade for audits/captures to catch mid-way');
});

test('beforeprint reveals everything still hidden', async () => {
  const { w, hidden } = await setup([100, 900, 1200]);
  assert.ok(hidden().length > 0);
  w.dispatchEvent(new w.Event('beforeprint'));
  assert.deepEqual(hidden(), []);
});

test('reduced motion: nothing is ever hidden', async () => {
  const { hidden } = await setup([100, 900, 1200], { reduce: true });
  assert.deepEqual(hidden(), []);
});
