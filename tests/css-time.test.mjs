// src/lib/css-time.ts. Regression (Owen, 2026-10-07): the production CSS minifier rewrites
// `--duration-cycle: 4200ms` to `4.2s`; parseFloat read 4.2 and the hero phone advanced every
// 4.2 ms (constant flicker). Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';

const { cssMs } = await import(new URL('./.out/css-time.mjs', import.meta.url).href);

test('cssMs reads both ms and s, as the minifier may emit either', () => {
  assert.equal(cssMs('4200ms', 1), 4200);
  assert.equal(cssMs('4.2s', 1), 4200);
  assert.equal(cssMs(' .52s', 1), 520);
  assert.equal(cssMs('.01ms', 1), 0.01);
});

test('cssMs falls back on empty, unitless or junk values', () => {
  assert.equal(cssMs('', 4200), 4200);
  assert.equal(cssMs('fast', 4200), 4200);
  assert.equal(cssMs('0s', 4200), 4200);
});
