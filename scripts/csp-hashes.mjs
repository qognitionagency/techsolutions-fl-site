// CSP script hashes for vercel.json (Anton, 2026-10-07).
//   node scripts/csp-hashes.mjs          print the sha256 of every inline executable <script> in dist/index.html
//   node scripts/csp-hashes.mjs --check  exit 1 unless vercel.json's script-src lists exactly those hashes
// Run after `npm run build`. JSON-LD (<script type="application/ld+json">) is data, not script: CSP ignores it.
// Any edit to an inline script (Base.astro motion-pending, Nav.astro, StickyBar.astro) changes its hash:
// recompute, paste into vercel.json, redeploy. `npm run build` runs --check in postbuild.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('dist/index.html', root), 'utf8');
const hashes = [];
for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (/\bsrc\s*=/i.test(attrs)) continue;
  const type = attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1]?.toLowerCase();
  if (type && type !== 'module' && type !== 'text/javascript') continue; // data blocks (ld+json)
  hashes.push(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
}
const unique = [...new Set(hashes)];

if (!process.argv.includes('--check')) {
  console.log(unique.join(' '));
  process.exit(0);
}

const vercel = JSON.parse(readFileSync(new URL('vercel.json', root), 'utf8'));
const csp = vercel.headers
  ?.flatMap((h) => h.headers)
  .find((h) => h.key.toLowerCase() === 'content-security-policy')?.value;
const scriptSrc = csp?.split(';').map((d) => d.trim()).find((d) => d.startsWith('script-src')) ?? '';
const listed = scriptSrc.match(/'sha256-[^']+'/g) ?? [];
const missing = unique.filter((h) => !listed.includes(h));
const stale = listed.filter((h) => !unique.includes(h));
if (!csp || missing.length || stale.length) {
  console.error('csp-hashes: vercel.json script-src does not match dist/index.html inline scripts.');
  if (missing.length) console.error('  missing (these scripts would be blocked): ' + missing.join(' '));
  if (stale.length) console.error('  stale (remove): ' + stale.join(' '));
  console.error('  Fix: node scripts/csp-hashes.mjs, paste the output into script-src in vercel.json.');
  process.exit(1);
}
console.log(`csp-hashes: vercel.json covers all ${unique.length} inline scripts`);
