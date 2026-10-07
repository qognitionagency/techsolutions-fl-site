// postbuild guard (ADR 0001 §4): the Pexels key name must never reach dist/.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname;
const hits = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(html|js|mjs|css|json|txt|xml|map|svg)$/.test(name) && readFileSync(p, 'utf8').includes('PEXELS')) hits.push(p);
  }
};
walk(root);
if (hits.length) {
  console.error('postbuild: "PEXELS" found in dist:\n  ' + hits.join('\n  '));
  process.exit(1);
}
console.log('postbuild: no PEXELS string in dist/');
