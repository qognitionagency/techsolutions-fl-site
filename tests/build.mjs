// Bundles src/scripts/{analytics,form}.ts and src/lib/url.ts into tests/.out/ for the
// node:test suites, and reports form+analytics minified+gzip size.
// Run through `npm test`. Ported from Luke's scratch harness (docs/form-module.md, Tests).
import { build } from 'esbuild';
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = `${ROOT}src/scripts`;
const OUT = `${ROOT}tests/.out`;
const define = { 'import.meta.env.PUBLIC_FORM_ENDPOINT': 'undefined', 'import.meta.env.PUBLIC_FORM_ACCESS_KEY': 'undefined' };

for (const f of ['analytics', 'form']) {
  await build({ entryPoints: [`${SRC}/${f}.ts`], bundle: true, format: 'esm', outfile: `${OUT}/${f}.mjs`, define, logLevel: 'error' });
}
// url.ts under both deploy bases: Vercel (/) and GitHub Pages project site (/techsolutions-fl-site/).
for (const [name, base] of [['url-root', '/'], ['url-pages', '/techsolutions-fl-site/']]) {
  await build({
    entryPoints: [`${ROOT}src/lib/url.ts`],
    bundle: true,
    format: 'esm',
    outfile: `${OUT}/${name}.mjs`,
    define: { 'import.meta.env.BASE_URL': JSON.stringify(base) },
    logLevel: 'error',
  });
}
await build({ entryPoints: [`${SRC}/form.ts`], bundle: true, minify: true, format: 'esm', outfile: `${OUT}/form.min.mjs`, define, logLevel: 'error' });
const min = readFileSync(`${OUT}/form.min.mjs`);
console.log(`form+analytics minified: ${min.length} B, gzip: ${gzipSync(min, { level: 9 }).length} B`);
