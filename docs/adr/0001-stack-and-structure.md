# ADR 0001: Stack, structure and media pipeline for the pitch sites

- **Status:** Accepted (operator approved the plan on 2026-10-07). This ADR applies to both `iron-sound-solutions` and `techsolutions-fl`. Both repos hold an identical copy.
- **Deciders:** Kyle (architect), under MARS. **Reviewers:** Owen (code gate) and Anton (key handling, form).
- **Context:** Two separate one-page static pitch sites are due Thu 8 Oct for discovery calls on Fri 9 Oct. Two frontend devs will build them in parallel and the results must stay consistent. Each site gets its own repo and deploys to GitHub Pages (whether the repos are public is still undecided). Local tooling is Node 25.2.1 and npm 11.6.2, with no ffmpeg. Versions were checked with `npm view` on 2026-10-07.
- **Tenancy:** Not applicable. There is no server, database, cache or session. Each prospect has its own repo and build. The only data that leaves the browser is a form POST to a third-party endpoint (see §6). Anton reviews it.

## Decision
Build each site as an Astro 5 static site with Tailwind v4 tokens, vanilla-TS interaction scripts, and GSAP + Lenis motion. Media is fetched once from Pexels and committed. Deployment runs through `withastro/action` to GitHub Pages, with `site` and `base` set from the environment.

## 1. Stack (install with `--save-exact` and commit `package-lock.json`)
| Package | Pin | Note |
|---|---|---|
| `astro` | 5.18.2 | Last 5.x release. Latest is 7.3.6. See Options |
| `tailwindcss`, `@tailwindcss/vite` | 4.3.3 | Plugin peer is `vite ^5…^8`. Astro 5 ships Vite 6 |
| `gsap` | 3.15.0 | Use `gsap`, `gsap/ScrollTrigger` and `gsap/SplitText`. Standard no-charge licence |
| `lenis` | 1.3.26 | `import Lenis from 'lenis'` and `import 'lenis/dist/lenis.css'` |
| `@fontsource-variable/archivo` | 5.3.0 | Iron Sound. Import **`/wdth.css`**: family `Archivo Variable`, wght 100–900, stretch 62–125% |
| `@fontsource-variable/space-grotesk` | 5.3.0 | Iron Sound body. Family `Space Grotesk Variable` |
| `@fontsource-variable/geist`, `-geist-mono` | 5.3.0 | TechSolutions. Families `Geist Variable` and `Geist Mono Variable`. Do **not** use the `geist` npm package, which is Next-oriented |
| `typescript` / `@astrojs/check` (dev) | 5.9.3 / 0.9.10 | `@astrojs/check` peers `typescript ^5 ‖ ^6`. TS 7 is out of range |

Image processing uses `sharp`, an optional dependency of Astro 5. If `astro build` reports it missing, run `npm i -E sharp`. Use no UI framework integration (no React, Vue or Svelte). Write every interaction (lighting toggle, environment switcher, picker, before/after slider, multi-step form) as a `<script>` in its own section component. Astro bundles and dedupes those scripts. Node `engines: ">=22.12"`. CI runs Node 24, the action default.

## 2. Directory layout (identical in both repos)
```
astro.config.mjs            site/base from env (§5), vite.plugins=[tailwindcss()]
media-manifest.json         media inventory, the input to the fetch script (§4)
scripts/fetch-media.mjs     Pexels fetcher. Node built-ins + global fetch only. Never imported by src/
public/brand/               logo SVG lockups, favicon set, og.png (from Elena)
public/media/               <slot>.mp4 only (served as-is, not processed)
src/pages/index.astro       composes sections only. No copy, no logic
src/pages/{robots.txt,sitemap.xml,llms.txt}.ts   endpoints, so base/site are always correct
src/layouts/Base.astro      <head>, meta/OG, JSON-LD, font preload, ribbon
src/components/sections/*.astro   one file per plan section (Nav.astro … Footer.astro)
src/components/ui/*.astro   Button, Img (wraps <Picture>), VideoBand, Field
src/data/content.ts         ALL copy, typed and exported per section. Dummy values marked `// NEEDS DATA:`
src/data/media-credits.json generated. Never hand-edited
src/lib/url.ts              withBase(path). The only way to build a public/ or internal URL
src/lib/media.ts            import.meta.glob('/src/assets/media/*') → getImage(slot) / poster(slot)
src/scripts/motion.ts       the only GSAP/Lenis entry (§7)
src/scripts/{video,analytics,form}.ts   lazy video (§7), dataLayer (§6), form module (Luke)
src/styles/global.css       @import "tailwindcss"; font CSS imports; @theme tokens
src/assets/media/           <slot>.jpg and <slot>-poster.jpg (processed by astro:assets)
.github/workflows/deploy.yml
```
Rules:
- **Copy lives only in `content.ts`.** Theo's copy swaps in without touching components.
- **Tokens only.** `global.css` starts `@theme` with `--color-*: initial;`, which removes Tailwind's default palette. It then defines the plan's tokens under the `--color-` namespace (`--color-iron-blue`, `--color-stone-50`, …) plus `--font-display`, `--font-body` and `--font-mono`. Elena owns the values. No arbitrary values (`bg-[#…]`).
- **Light only.** `:root { color-scheme: light }` and no `dark:` variants. This is a deliberate exception to the "dark mode checked" line in definition-of-done, by plan.
- **Ship visible by default.** Content must render without JS. Never hide anything with CSS `opacity:0`. Initial animation states are set only by JS.

## 3. Images
Place each one with `<Picture formats={['avif','webp']} widths=[…] sizes=…>` from `astro:assets`. Only the hero takes `loading="eager" fetchpriority="high"`. Every other image is lazy. Always set width and height so CLS stays below 0.05.

## 4. Media pipeline: `npm run media` = `node --env-file=.env scripts/fetch-media.mjs`
- **Manifest entry.** `{ "slot": "hero", "type": "photo"|"video", "id"?: number, "query"?: string, "orientation"?: "landscape"|"portrait"|"square" }`. Client-owned photos are listed as `{ "slot", "type":"photo", "source":"client", "file" }` and are copied in by hand.
- **Resolving an entry.** If `id` is set, fetch `GET /v1/photos/:id` or `GET /videos/videos/:id`. Otherwise run search (`/v1/search` or `/videos/search`), take the first hit, and **print the resolved id**. The dev pins that `id` into the manifest before committing, so every rerun is deterministic. Send the header `Authorization: <key>`. The rate limit is 200 req/h.
- **Photo.** Download `src.original` + `?auto=compress&cs=tinysrgb&w=2560`, giving roughly 0.5–1 MB, and save it as `src/assets/media/<slot>.jpg`. astro:assets produces the AVIF/WebP and srcset. Full 4K originals may go to `media-raw/`, which is already gitignored, but are never committed.
- **Video.** From the `video_files` where `file_type==='video/mp4'`, pick the one with the largest long edge that is **≤ 1920 px** and **≤ 6 MB**. Use `size`: the live API returns it, although the docs omit it. If it is absent, fall back to a `HEAD` request and read `content-length`. If no file qualifies, take the next rendition down (≈1280). If none qualifies at all, exit non-zero and name the slot. Write the video to `public/media/<slot>.mp4` and write the video's `image` to `src/assets/media/<slot>-poster.jpg`.
- **Credits.** Write `src/data/media-credits.json` as an array of `{slot,type,pexelsId,pageUrl,author,authorUrl,file}`. Photos take `photographer` and `photographer_url`. Videos take `user.name` and `user.url`. The footer must show a visible "Photos and video from Pexels" link (an API term) and credit authors from this file.
- **Script behaviour.** Skip files that already exist unless `--force` is passed. Exit with a clear message if `PEXELS_API_KEY` is missing. **Never** print the key.
- **Key safety.**
  - The key is not `PUBLIC_`-prefixed, and nothing under `src/` or `astro.config.mjs` reads it, so Vite cannot inline it.
  - Downloaded media is **committed**. CI gets **no** key, which means the deployed bundle cannot contain it.
  - A `postbuild` script fails if `grep -r "PEXELS" dist` matches.
- **Repo-size budget.** Committed media must stay at or below 60 MB per repo, with at most about 8 videos.

## 5. Base path and deploy
- `astro.config.mjs`: `site: process.env.SITE_URL ?? 'http://localhost:4321'` and `base: process.env.BASE_PATH ?? '/'`.
- Asset imports handle `base` automatically. Everything else (`public/` paths, anchors, `poster`/`src` on video, OG URL) must go through `withBase()`, which joins `import.meta.env.BASE_URL` with the path while avoiding a double slash. **A hard-coded leading `/` is a bug.**
- To test locally: `BASE_PATH=/<repo> npm run build && npm run preview`.
- Workflow `deploy.yml`:
  - Triggers are `push` to `main` and `workflow_dispatch`.
  - `permissions: {contents: read, pages: write, id-token: write}` and `concurrency: {group: pages, cancel-in-progress: false}`.
  - The **build** job sets `env: SITE_URL: https://${{ github.repository_owner }}.github.io`, `BASE_PATH: /${{ github.event.repository.name }}` and `PUBLIC_FORM_ENDPOINT: ${{ vars.PUBLIC_FORM_ENDPOINT }}`. Its steps are `actions/checkout@v7` and then `withastro/action@v6`.
  - The **deploy** job `needs: build`, uses `environment: github-pages` and runs `actions/deploy-pages@v5`.
  - (These tags were the latest releases on 2026-10-07.)
- Repo names come from the plan: `iron-sound-solutions-site` and `techsolutions-fl-site`. Base is derived from the repo name, so a rename needs no code change.
- **Indexing.** These are concept sites built on a real business's name, and TechSolutions carries dummy data. `Base.astro` emits `<meta name="robots" content="noindex,nofollow">` **unless `PUBLIC_INDEXABLE=true`**. `robots.txt` does NOT `Disallow: /` — crawlers must be able to read the noindex (and Pages project-site robots.txt is never read at the host root anyway); it blocks AI training crawlers only. _Amended 2026-10-07 by MARS ruling after Nadia flagged it._ Sitemap, schema and llms.txt are still generated, so the SEO craft stays visible.

## 6. Form and analytics
- **Endpoint.** The form posts to `import.meta.env.PUBLIC_FORM_ENDPOINT`, which is inlined at build time and public by nature. It may take an optional `PUBLIC_FORM_ACCESS_KEY`, appended as `access_key` (Web3Forms-style, public by design). The request is `fetch` POST of `FormData` with `Accept: application/json`. A 2xx response counts as success.
- **States.** The form has five states: idle, invalid (inline, per field, `aria-describedby`), submitting (button disabled), success, and error (with a `mailto:` fallback).
- **Honeypot.** A field named `website` is visually hidden, with `tabindex="-1"` and `autocomplete="off"`. If it is filled, the form shows fake success and does not POST.
- **Endpoint unset (demo mode).** The form validates and then shows success with a visible line: "Concept site: this form is not connected yet." It never pretends a lead was sent.
- **Analytics.**
  - `analytics.ts` exports `track(event, params)`, which runs `(window.dataLayer ||= []).push({event, ...params})`.
  - Elements carry `data-track="<event>"` plus `data-track-id`, and a single delegated listener handles them.
  - The minimum event set comes from the plan: `cta_click`, `form_start`, `form_submit` (with `mode: 'live'|'demo'`) and `call_click`. Marcus's spec may add more, e.g. `form_step` and `form_error`.
  - **No PII in event params** (no names, emails, phones or free text).
  - No GTM/GA tag is loaded.

## 7. Motion rules (`motion.ts`)
- **Plugins and preferences.** Register `ScrollTrigger` and `SplitText` once. Wrap all of it in `gsap.matchMedia()`.
- **Reduced motion.** Under `(prefers-reduced-motion: reduce)` there is **no Lenis, no parallax, no pin, no split-text and no autoplay video**. Interaction still works and state changes are instant.
- **Desktop** `(min-width: 768px) and (prefers-reduced-motion: no-preference)` gets:
  - parallax up to ±15 % `yPercent`;
  - one pinned section;
  - split-text reveals.
- **Mobile** (<768px) gets parallax of at most ±5 %, **no pin**, and no SplitText on body copy.
- **Pointer effects.** Magnetic CTAs and the cursor glow run only under `(hover: hover) and (pointer: fine)`.
- **Lenis wiring.** `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))` and `gsap.ticker.lagSmoothing(0)`. Destroy Lenis in the matchMedia cleanup.
- **Lazy video.**
  - Markup is `<video muted playsinline loop preload="none" poster=… data-src=…>`.
  - An IntersectionObserver with `rootMargin: '200px'` sets `src` and calls `play()`. Videos pause once they leave the viewport.
  - Reduced motion or `navigator.connection?.saveData` means poster only, plus a play button.
- **The hero video is never the LCP element.** The LCP is the poster `<Picture>`. The video's `src` is assigned after `load` + `requestIdleCallback`, and the video fades in over the poster.
- **No `currentTime` scrubbing.** Pexels MP4s have sparse keyframes and we have no ffmpeg to re-encode them. The plan's "video scrub" moments (room lighting up, cable reveal) are built instead as a scroll-driven crossfade or clip-path reveal between 2–3 stills.

## 8. Performance budget (mobile Lighthouse, `astro preview` build; Owen checks)
- **JS shipped at or below 90 KB gzip in total.** Measured on 2026-10-07: gsap core 28.4 KB, ScrollTrigger 18.0 KB, SplitText 3.7 KB and Lenis 8.3 KB, for about 58 KB of vendor code. That leaves about 30 KB for app code. If the budget is exceeded, drop SplitText first, then Lenis.
- **LCP < 2.0 s, CLS < 0.05, Lighthouse ≥ 95 in all four categories.** CSS is at or below 30 KB gzip. Preload at most 2 font files (the latin display face and the latin body face), for example `archivo-latin-wdth-normal.woff2` via `?url` import. Hero poster is at or below 200 KB at mobile width.

## Options considered
- **Astro 7.3.6 (current) instead of 5.18.2: rejected for this build.**
  - The plan approved Astro 5.
  - The Astro 5 APIs relied on here (`astro:assets`, `BASE_URL`, `site`/`base`, script bundling) are known and documented. The changes across the 6.x and 7.x majors (Vite 8) are `[UNVERIFIED]` against this design, and there is no slack in a 36-hour window.
  - **Unpleasant consequence:** 5.x has had no release since 2026-05-26, so it gets no further security patches. The exposure is build-time only, because the output is static with no server runtime.
- **Next.js / React islands: rejected.** It adds a framework runtime to a JS budget already ~65 % spent on motion libraries.
- **Plain Vite + HTML: rejected.** It has no image pipeline. AVIF/srcset would have to be hand-built.
- **Shared monorepo / common package for both sites: rejected.** The plan specifies two repos, the sites share no copy or tokens, and coupling them buys nothing over a 2-day lifespan. Consistency comes from this ADR instead.
- **Hot-linking Pexels CDN or fetching media in CI: rejected.** Hot-linking adds a third-party origin to LCP. Fetching in CI would put the key into CI.
- **Shipping 4K video or WebM: rejected.** 4K would wreck LCP, and WebM needs ffmpeg.

## Consequences
- Builds are reproducible offline with no key. The repo carries up to 60 MB of binary media.
- Per the plan, videos are MP4-only and posters are JPG-sourced. The plan's "WebM + AVIF poster, ≤ 4 MB" becomes "MP4 + astro:assets poster, ≤ 6 MB".
- Two copies of near-identical plumbing (`url.ts`, `media.ts`, `analytics.ts`, `motion.ts`) will drift. That is acceptable for throwaway sites.
- noindex means the live URLs never rank. That is intended.

## What would make this wrong later
- **A prospect signs and the site becomes their production site.** Upgrade to the current Astro major, and set `PUBLIC_INDEXABLE=true` only after every `NEEDS DATA` is real. Add a consent mechanism before any live analytics tag, and replace dummy content.
- **The JS budget is breached even after dropping SplitText and Lenis.** Revisit GSAP versus CSS scroll-driven animations.
- **Committed media exceeds 100 MB, or a site needs true video scrub.** Move to Git LFS or an external CDN, and add an ffmpeg re-encode step.
- **Pages refuses private repos.** See Rollback. The stack is unaffected.

## Rollback
- **Deploy.** Pages serves the last successful deploy. To go back, revert the commit, or re-run `deploy.yml` on an earlier SHA. To pull the site entirely, disable Pages in repo settings.
- **Host.** For Vercel instead of Pages, set `BASE_PATH=/` and `SITE_URL=<vercel url>`. No code changes are needed.
- **Stack.** If Astro 5 fails to install or build on Node 24/25, bump the `astro` pin to 7.x. Layout, `content.ts`, tokens, media pipeline and workflow are framework-version-independent. Expect fixes only in `astro.config.mjs` and `<Picture>` call sites `[UNVERIFIED]`.
- **Media.** Everything is reproducible from `media-manifest.json` plus a key, and deleting `src/assets/media/*` and `public/media/*` fully reverts it.
