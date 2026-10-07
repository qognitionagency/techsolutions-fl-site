// CSP for vercel.json, derived from the FINAL dist/index.html. Run after `npm run build`.
//   node scripts/csp-hashes.mjs          print the sha256 of every inline executable <script>
//   node scripts/csp-hashes.mjs --write  rewrite script-src (and the form origin, below) in vercel.json
//   node scripts/csp-hashes.mjs --check  exit 1 unless vercel.json matches dist (runs in postbuild)
//
// - JSON-LD (<script type="application/ld+json">) is data, not script: CSP never applies to it,
//   and its text changes with SITE_URL, so it is deliberately not hashed.
// - Any edit to an inline script (Nav.astro, MobileBar.astro, or a component script small
//   enough for Astro to inline) changes its hash: --write, commit vercel.json, redeploy.
//   vercel.json is read from the repo, not from the build, so the committed file is what ships;
//   the postbuild --check fails the Vercel build instead of deploying a CSP that blocks the menu.
// - Form endpoint: when PUBLIC_FORM_ENDPOINT is https://, the form gets an `action` and form.ts
//   fetch()es it. Its origin must then be in connect-src AND form-action, or the CSP silently
//   blocks every lead. --check enforces that; --write adds it. Build locally with the same
//   PUBLIC_FORM_ENDPOINT as Vercel before --write.
// Ported from iron-sound-solutions (same file; keep both in step). Anton, 2026-10-07.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

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

// Origin of the booking form's action, if the build set one (https only, see lib/url.ts httpsOnly).
const action = html.match(/<form\b[^>]*\bdata-consult\b[^>]*>/i)?.[0].match(/\baction="([^"]+)"/i)?.[1];
const formOrigin = action ? new URL(action).origin : null;

const mode = process.argv.includes('--check') ? 'check' : process.argv.includes('--write') ? 'write' : 'print';
if (mode === 'print') {
  console.log(unique.join(' '));
  if (formOrigin) console.log(`form origin (connect-src, form-action): ${formOrigin}`);
  process.exit(0);
}

const file = new URL('vercel.json', root);
const vercel = JSON.parse(readFileSync(file, 'utf8'));
const header = vercel.headers?.flatMap((h) => h.headers).find((h) => h.key.toLowerCase() === 'content-security-policy');
if (!header) {
  console.error('csp-hashes: vercel.json has no Content-Security-Policy header.');
  process.exit(1);
}
const directives = header.value.split(';').map((d) => d.trim()).filter(Boolean);
const get = (name) => directives.find((d) => d.split(/\s+/)[0] === name) ?? '';

if (mode === 'write') {
  const set = (name, value) => {
    const i = directives.findIndex((d) => d.split(/\s+/)[0] === name);
    i >= 0 ? (directives[i] = value) : directives.push(value);
  };
  set('script-src', ["script-src 'self'", ...unique].join(' '));
  set('connect-src', ["connect-src 'self'", formOrigin].filter(Boolean).join(' '));
  set('form-action', ["form-action 'self'", formOrigin].filter(Boolean).join(' '));
  header.value = directives.join('; ');
  writeFileSync(file, JSON.stringify(vercel, null, 2) + '\n');
  console.log(`csp-hashes: wrote ${unique.length} script hash(es)${formOrigin ? ` and form origin ${formOrigin}` : ''} to vercel.json`);
  process.exit(0);
}

const problems = [];
const listed = get('script-src').match(/'sha256-[^']+'/g) ?? [];
const missing = unique.filter((h) => !listed.includes(h));
const stale = listed.filter((h) => !unique.includes(h));
if (missing.length) problems.push(`script-src missing (these scripts would be blocked): ${missing.join(' ')}`);
if (stale.length) problems.push(`script-src stale (remove): ${stale.join(' ')}`);
if (formOrigin) {
  for (const d of ['connect-src', 'form-action']) {
    if (!get(d).split(/\s+/).includes(formOrigin)) problems.push(`${d} lacks the form endpoint origin ${formOrigin}: every lead would be blocked`);
  }
}
if (problems.length) {
  console.error('csp-hashes: vercel.json does not match dist/index.html.');
  for (const p of problems) console.error(`  ${p}`);
  console.error('  Fix: node scripts/csp-hashes.mjs --write, then commit vercel.json.');
  process.exit(1);
}
console.log(`csp-hashes: vercel.json covers all ${unique.length} inline scripts${formOrigin ? ` and form origin ${formOrigin}` : ''}`);
