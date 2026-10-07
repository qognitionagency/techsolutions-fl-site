# TechSolutions FL — concept site

A one-page concept site Qognition built for **TechSolutions FL** (Jay, Miami: TV mounting, Wi-Fi, cameras, smart home) ahead of the 9 Oct 2026 discovery call. It is a pitch, not the client's live site. The phone, email, prices, promises and reviews are **sample content**. A ribbon on the page says so, and the page is `noindex`.

**Theme:** "Miami Signal". Cool white, signal blue, Biscayne cyan and a sunset accent. Geist and Geist Mono. Light only.

## What's on the page

- **Hero "What do you need?" picker.** TV, Wi-Fi, cameras or smart home. Shows a starting price and prefills the booking form.
- **Promises strip.** Sample promises, no invented stats.
- **Services.** Each card carries a starting price.
- **Before/after slider.** Drag, or use the keyboard.
- **How it works.**
- **Recent work.** Links to [@tech_solutionsfl](https://www.instagram.com/tech_solutionsfl/).
- **Reviews.** Labelled sample.
- **Service area.**
- **FAQ.** Includes FAQPage JSON-LD.
- **Booking form.** Four steps, with unchecked SMS and email consent boxes.
- **Sticky Call / Text / Book bar** on mobile.
- **Motion.** GSAP ScrollTrigger and Lenis. All of it is off under `prefers-reduced-motion`.

## Stack

Astro 5 (static), Tailwind v4, GSAP and Lenis, and Fontsource. Photos and video come from Pexels, downloaded and committed by `npm run media`. The key lives only in a local `.env`, which is gitignored. See [`docs/adr/0001-stack-and-structure.md`](docs/adr/0001-stack-and-structure.md).

```bash
npm install
npm run dev        # local
npm test           # form module tests (also run on prebuild)
npm run build      # postbuild checks: no Pexels key in dist, CSP hashes current
```

All copy lives in `src/data/content.ts`. Every sample value there is tagged `// NEEDS DATA` and listed in the exported `needsData` array.

## Deploy

**Hosting is Vercel.** The repo is private, and GitHub Pages isn't on the plan. Build env: `BASE_PATH=/`, `SITE_URL=https://<vercel domain>`. Security headers and CSP are in `vercel.json`. After changing an inline script, recompute its hashes with `node scripts/csp-hashes.mjs`.

- **Pages fallback.** `.github/workflows/deploy.yml` is manual-only (`workflow_dispatch`). Re-add the push trigger only if the repo goes public.
- **Form endpoint.** `PUBLIC_FORM_ENDPOINT` (and optionally `PUBLIC_FORM_ACCESS_KEY`). Leave both unset and the form runs in labelled demo mode. Going live also means adding the endpoint origin to the CSP's `connect-src` and `form-action`.
- **Runbook.** Rollback, re-fetching media and making the site indexable are in [`docs/runbook.md`](docs/runbook.md).

## Before this becomes Jay's real site

Swap in these from Jay:
- real phone, email and prices
- the promises he'll stand behind
- real reviews
- his own install photos, with permission
- service radius and ZIPs
- legal name

Confirm his insurance and certificate-of-insurance (COI) status, and his Florida licence for camera work. Until those are confirmed, the page must not say "licensed", "insured" or "certified". Then set `PUBLIC_INDEXABLE=true`.

Photos and video: [Pexels](https://www.pexels.com). Credits are in `src/data/media-credits.json` and the footer.

Concept and build by Qognition Agency.
