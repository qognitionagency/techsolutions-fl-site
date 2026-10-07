// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// ADR 0001 §5: site and base come from the environment so the same build
// works on GitHub Pages (/<repo>/) and on a root host.
export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  base: process.env.BASE_PATH ?? '/',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'always' },
  vite: {
    // @tailwindcss/vite is typed against the hoisted Vite while Astro 5 nests Vite 6;
    // the plugin is runtime-compatible (peer range vite ^5-^8), only the .d.ts differ.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
