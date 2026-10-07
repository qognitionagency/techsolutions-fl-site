# TechSolutions FL — concept site

A one-page concept site Qognition built for **TechSolutions FL** (Jay, Miami: TV mounting, Wi-Fi, cameras, smart home) ahead of the 9 Oct 2026 discovery call. It is a pitch, not the client's live site. The phone, email, prices, promises and reviews are **sample content**. A ribbon on the page says so, and the page is `noindex`.

**Theme (v3.1):** product-grade, red / silver / ink on white, from the client's own logo. Geist and Geist Mono. Light only. Spec: [`docs/design-spec-v3.md`](docs/design-spec-v3.md) (§00 is the v3.1 palette and logo).

## What's on the page

Section order follows `src/pages/index.astro` (spec §0).

- **Hero.** Product headline, a framed stock photo with a sample-price card, and an HTML/CSS phone cycling three app screens (camera, lock, Wi-Fi). The cycle pauses on hover and focus, and stops for the session on a pick or Pause. It never auto-plays under reduced motion.
- **Service explorer.** Four ARIA tabs, each with a flat technical drawing: TV wall (drywall vs concrete, never in-wall on concrete), condo Wi-Fi plan (router only vs mesh), camera plan (2 vs 3 + doorbell), and an interactive smart-home phone. Each drawing has a desktop and a mobile artboard. Callouts are HTML and the numbered list is the text alternative. Toggles are native radios driven by CSS `:has()`.
- **Instant quote builder.** Pick services and options, and a receipt prices them live. All prices are samples from `content.ts`, and the arithmetic in `src/lib/quote.ts` is unit-tested. "Book this install" prefills the booking form through `form:prefill`.
- **How it works.** Four steps with micro-UI vignettes (quote card, SMS thread, checklists).
- **Built for.** Condo, house and office cards with stock thumbnails.
- **Reviews.** Labelled sample.
- **Service area.** Map and the sample neighborhood list.
- **FAQ.** Includes FAQPage JSON-LD.
- **Booking form.** Luke's five-step module, with icon cards and unchecked SMS and email consent boxes.
- **Sticky Call / Text / Get a quote bar** under 768px.
- **Motion.** CSS plus small IntersectionObserver scripts. No GSAP or Lenis on the page (the spec bans parallax, pins and scroll-jacking). All of it is off under `prefers-reduced-motion`.

## Stack

Astro 5 (static), Tailwind v4 and Fontsource. Page JS is about 10 KB gzip, form included. Stock photos come from Pexels and are used only inside designed components (spec §4). The six slots on the page are listed in `src/lib/media.ts` `USED_SLOTS`, and the footer credits exactly those. `gsap` and `lenis` were removed from `package.json` (nothing imported them). See [`docs/adr/0001-stack-and-structure.md`](docs/adr/0001-stack-and-structure.md).

```bash
npm install
npm run dev        # local
npm test           # form, url and quote tests (also run on prebuild)
npm run build      # postbuild checks: no Pexels key in dist, CSP hashes current
```

All copy lives in `src/data/content.ts`. Every sample value there is tagged `// NEEDS DATA` and listed in the exported `needsData` array. UI-only control labels (pause/play, stepper names, "Stock photo") are in `src/data/ui-labels.ts`, pending a move into content.ts.

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

Photos: [Pexels](https://www.pexels.com). Credits are in `src/data/media-credits.json`, and the footer lists the authors of the slots in use.

Concept and build by Qognition Agency.
