// withBase()/absolute() under both deploy bases (ADR 0001 §5). Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';

const OUT = new URL('./.out/', import.meta.url);
const root = await import(new URL('url-root.mjs', OUT).href);
const pages = await import(new URL('url-pages.mjs', OUT).href);

test('public/ paths carry the base: / on Vercel, /techsolutions-fl-site/ on Pages', () => {
  assert.equal(root.withBase('brand/favicon.svg'), '/brand/favicon.svg');
  assert.equal(root.withBase('/brand/favicon.svg'), '/brand/favicon.svg');
  assert.equal(pages.withBase('brand/favicon.svg'), '/techsolutions-fl-site/brand/favicon.svg');
  assert.equal(pages.withBase('/brand/favicon.svg'), '/techsolutions-fl-site/brand/favicon.svg');
  assert.equal(root.withBase('/'), '/');
  assert.equal(pages.withBase('/'), '/techsolutions-fl-site/');
});

test('external, tel:, sms: and mailto: URLs pass through untouched', () => {
  for (const u of ['https://www.pexels.com', '//cdn.example/x', 'tel:+13055550142', 'sms:+13055550142?&body=hi', 'mailto:a@b.example']) {
    assert.equal(root.withBase(u), u);
    assert.equal(pages.withBase(u), u);
  }
});

// A path in front of the fragment ("/#book") makes the link a cross-document navigation
// whenever the page URL carries a query (?utm_source=ig, ?service=tv): the browser reloads
// "/" and drops the query, the URL prefill and any CTA prefill. A bare fragment is
// base-independent and always a same-document scroll.
test('in-page anchors stay bare fragments under both bases', () => {
  assert.equal(root.withBase('#book'), '#book');
  assert.equal(pages.withBase('#book'), '#book');
});

test('a bare-fragment link stays same-document when the page URL has a query', () => {
  for (const [mod, page] of [[root, 'https://x.vercel.app/?utm_source=ig'], [pages, 'https://o.github.io/techsolutions-fl-site/?service=tv']]) {
    const target = new URL(mod.withBase('#book'), page);
    const here = new URL(page);
    assert.equal(target.pathname + target.search, here.pathname + here.search);
  }
});

test('absolute() builds base-qualified URLs for canonical, OG, JSON-LD, sitemap, llms.txt', () => {
  const vercel = new URL('https://x.vercel.app');
  const gh = new URL('https://o.github.io');
  assert.equal(root.absolute('/', vercel), 'https://x.vercel.app/');
  assert.equal(pages.absolute('/', gh), 'https://o.github.io/techsolutions-fl-site/');
  assert.equal(pages.absolute('brand/og.png', gh), 'https://o.github.io/techsolutions-fl-site/brand/og.png');
  assert.equal(pages.absolute('/#faq', gh), 'https://o.github.io/techsolutions-fl-site/#faq');
  assert.equal(root.absolute('/#faq', vercel), 'https://x.vercel.app/#faq');
});
