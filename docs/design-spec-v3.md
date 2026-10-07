# TechSolutions FL concept site — design spec v3 ("product-grade")

**Author:** Elena (`creative`) · **For:** Mira (`frontend-dev`) · **Date:** 2026-10-07 · **Status:** DRAFT. Ruth (`brand-guard`) has not reviewed it yet. Copy marked **NEW** needs her review before ship.
**Tokens:** `src/styles/tokens.css` (rewritten for v3, remapped to red/silver/ink for **v3.1**; every v2 variable name still exists). **Read §00 first.**
**Copy source of truth:** `src/data/content.ts`. Copy marked **EXISTING** is already in it, so reuse it verbatim. Copy marked **NEW** goes into `content.ts` exactly as written here.

> **Operator direction (2026-10-07, after two rejections).** The site should feel like a top-tier tech brand (Stripe / Linear / Apple marketing) for a Miami installer. The visuals are custom diagrams, phone-app mockups and an interactive quote builder, on clean white. *(v3.1: the accent is the client's red, with silver and ink, not blue. See §00.)*
> **Photo ruling (operator correction):** stock photos are allowed **only inside designed components**: a framed hero photo with the phone overlapping it, photo + diagram pairs in the service explorer, and photo thumbnails in the Condo / House / Office cards. **No section is ever just a big image.** No full-width image bands, no photo backgrounds, no galleries.

---

## 00. v3.1 palette and logo (2026-10-07; supersedes every "blue", "cyan/bay" and "sunset" below)

**Operator direction:** "TechSolutions uses red, silver, black with white bg." Source: the client's own logo, Instagram avatar of https://www.instagram.com/tech_solutionsfl/ (observed 2026-10-07). The layout, type, spacing, radius and motion of v3 are unchanged. Only colour and logo change. **Token names are unchanged.** `tokens.css` remaps the values, so components compile as they are. The deltas in §00.5 are the places where the old name now gives the wrong meaning.

### 00.1 Palette (values in `src/styles/tokens.css`)

| Role | Token(s) | Value | Use |
|---|---|---|---|
| Ink | `--color-slate` = `--color-ink` | `#0E0F11` | Text, headings, price, phone bezel, any dark band |
| Primary action | `--color-accent`, `--color-book`, `--color-link`, `--color-eyebrow`, `--color-focus` | red-600 `#C51A1F` | Buttons (white text 5.9:1), links, eyebrows, focus ring. Hover red-700 `#A3151A`, active red-800 `#7E1015` |
| Logo red | `--color-signal-500` = `--color-red-500` | `#E1251B` | Logo, diagram accent (`--illo-accent`), live/rec dot. **Never body-size text** (4.6:1, thin margin) |
| Graphite | `--color-steel-ink` / `--color-steel` / `--color-steel-300` | `#575C63` / `#7D838A` / `#BFC4CA` | Secondary text 6.7:1 / input borders 3.8:1 / muted text on ink 10.9:1 |
| Silver surfaces | `--color-cloud` (band), `--color-silver-50` = `--color-signal-50` = `--color-surface-tint`, `--color-mist`, `--color-mist-strong`, `--color-line` | `#F4F5F6`, `#F1F2F4`, `#E8EAED`, `#D5D8DC`, `#E6E8EB` | Alternate bands, selected chip/badge fill, segmented track, strong hairline, hairline |
| Chrome (metallic) | `--color-chrome-hi/lo/edge`, `--gradient-chrome`, `--gradient-chrome-hairline` | `#E4E6E9` → `#9BA1A8`, edge `#6E747B` | **Only** in: the logo, a 1px `--gradient-chrome-hairline` top rule on the footer, and the phone rim (built into `--shadow-device`). Never text, never a button, never a card fill |
| Wi-Fi | `--color-bay` = `--color-signal`, `--color-bay-100` | `#575C63`, `#ECEEF0` | Signal meters and the Wi-Fi status card. Graphite, not cyan |
| White | `--color-bg`, `--color-surface` | `#FFFFFF` | Page and cards |

- **Wherever this spec says "slate", read ink** (`--color-slate` now resolves to `#0E0F11`). On the light footer, the `--color-slate-line` rule in §2.10 becomes `--color-border`.
- **There is no pink in the system.** The legacy tint steps `--color-signal-50/100/200` and `--color-sunset-100` are silver, because the build uses them for the #book band, ribbon, map fill, badge rings, `::selection` and the dot grid. Red appears only as a solid colour (button, link, eyebrow, logo, accent strokes, live dot). Red tints `--color-red-50..200` exist but nothing on the page uses them yet. Ask Elena before introducing one.
- **Ratio of use on any screen:** white/silver ≥ 85%, ink for text, red ≤ 8%, chrome ≤ 2% (logo + hairlines). If a screenshot of a section has more red than that, it fails.
- **Error vs brand red:** `--color-error` `#B42318` sits close to the brand red, so errors are **never colour-only**. Each one carries the 16px error icon and text (§2.9 already requires this).
- Every text pair is listed with its ratio in the `tokens.css` header. Pairs not on that list are decorative.

### 00.2 Illustration colour (replaces §3.2 colour meanings)

- **Red = what we install, and its route:** TV mount, recessed box, raceway, cable route, camera body and cone edge, router, mesh/access points, wired backhaul. `--illo-accent` `#E1251B`, fill `--illo-accent-fill` (red at 8%).
- **Graphite and silver = everything else:** structure `--illo-structure` `#BFC4CA`, outlines `--illo-ink` `#0E0F11`, fills `--illo-fill` / `--illo-fill-2`, concrete hatch `--illo-hatch`.
- **Wi-Fi coverage is a neutral graphite ramp, with red only on the access points.** Strong = `--illo-signal-fill` (graphite at 20%). Weak = the same at 45% opacity (already in `DiagramWifiPlan.astro`). Dead zone = `--illo-alert-fill`, which is **white, no fill**, with a 1px dashed `--illo-alert` (graphite `#7D838A`) outline. Rings and coverage edges are `--illo-signal` `#6E747B`.
  - *Why:* coverage is a quantity, not an alarm. A red or orange heatmap in a red-branded site would make the client's own colour mean "danger", and it would compete with the access-point markers. With a single-hue ramp, density reads as density: more grey means more signal, blank means none. The only red in the drawing is the hardware we install, so the eye goes straight from the red node to the grey it fills. The "Router only → With mesh" story still reads, because blank rooms become grey rooms.
  - The "Dead zone" label is **ink text on a plain `.status` pill** (mist background). It is not `status--bad`, and it is not red.
- **Live/recording** (camera live pill, REC dot) stays red: `--color-live` dot + `--color-live-text` on `--color-sunset-100` (now silver). That is the camera-app convention, and it is the one place red means "state".

### 00.3 Logo (client's mark, redrawn; files in `public/brand/`)

The logo is **theirs**: a house roofline (left red, right chrome), a "TS" monogram inside (T red, S chrome), three red Wi-Fi arcs rising off the right roof slope, a 4-pane window under the apex, and the wordmark **TECH** (red) **SOLUTIONS** (chrome) in bold extended italic, with the tagline SMART HOME INSTALLATIONS between thin red rules. It has been redrawn as clean vector paths with no font dependency, on a strict grid. It was refined, not reinvented. Construction notes are inside each SVG.

| File | Background | Content | Use |
|---|---|---|---|
| `logo-horizontal.svg` (438×58) | White / light | Mark + wordmark, chrome with a 0.6 bevel edge so it holds on white | **Nav** (h 22 mobile / 28 desktop, as built) and any light footer |
| `logo-horizontal-light.svg` (438×58) | Ink / dark | Same, light chrome, no edge | Dark contexts off the page (decks, social, a dark band if one is ever added). Not used on the page today |
| `logo-stacked.svg` (320×320) | White | Full lockup with tagline and red rules | `logo-512.png` (schema.org logo). Use only at ≥ 160px wide |
| `logo-stacked-light.svg` (320×320) | Ink | Full lockup, as on Instagram | `og.png` |
| `logo-mark.svg` (120×120) | White | Mark only | Avatars, small square slots ≥ 32px |
| `favicon.svg` / `apple-touch-icon.svg` | Ink tile | Small-size cut (no window, 2 arcs, heavier strokes) / full mark | Browser tab / iOS home screen |

- The tagline is **not** in the horizontal lockups: at nav height it would render under 4px. Do not add it back with HTML text next to the logo.
- **Clear space:** half the wordmark cap height on every side (12 units in the 438×58 box). **Minimum size:** horizontal 22px tall; stacked 160px wide; mark 24px.
- **Never:** recolour the logo, put it on red or on a photo, set the wordmark in Geist, drop the chrome to flat grey, or add a drop shadow or glow.
- The box stays 438×58, so the `<img width="438" height="58">` in `Nav.astro` and `Footer.astro` stays correct.

### 00.4 Rasters

`node scripts/brand-raster.mjs` writes `public/apple-touch-icon.png` (180, ink), `public/favicon-32.png`, `public/brand/logo-512.png` (stacked on white) and `public/brand/og.png` (1200×630: stacked-light logo on ink, plus the label "Concept site by Qognition — sample content" in `#BFC4CA`). **The PNGs in the repo are still the old blue ones until someone runs that script.**

### 00.5 Component deltas for Mira (values already flow from tokens; these fix meaning)

| Where (as found 2026-10-07) | Now | Change to |
|---|---|---|
| `DiagramWifiPlan.astro` `.wfp__node` stroke and `.wfp__node-core` fill: `--illo-signal` | Graphite nodes | `--illo-accent` (access points are red, per §00.2). Rings stay `--illo-signal` |
| Wi-Fi dead-zone label and `.dg__pin--bad` on Wi-Fi pins | Red | Plain `.status` (mist + ink) and a default pin. Keep `--bad` styling for nothing on the Wi-Fi tab |
| `global.css` `.status--weak` (`signal-50` bg + `signal-700` text) | Red text on silver | `background: var(--color-mist); color: var(--color-text-muted)` |
| `Footer.astro` `border-top: 2px solid var(--color-bay)` | Graphite rule | `border-top: 0` + a 1px `--gradient-chrome-hairline` (e.g. `background-image` on a `::before`, 1px high) |
| `Footer.astro` logo | `logo-horizontal.svg` | No change. The footer stays light (`--color-mist`), and `logo-horizontal.svg` is the right file for it. `logo-horizontal-light.svg` is for dark contexts outside the page (decks, social) |
| `Consult.astro` `.consult__h2::before` and `border-top: 3px` in `--color-bay` | Graphite accents | `--color-accent` for the 32×2 bar. Keep the 3px top rule graphite or remove it. Red there would double the CTA red |
| Hard-coded colours | None found (grep for the old hexes and rgb() values returned nothing outside `tokens.css`) | Keep it that way |

---

## 0. What changes from v2 (read first)

| v2 thing | v3 decision |
|---|---|
| Page background cloud `#F5F8FC` | Page is **white**. Cloud is used only on alternate bands (`--color-bg-alt`) |
| Sunset "Book" button, sunset prices | **All CTAs are brand red `--color-accent`** (v3.1; was blue in v3). Prices are **mono ink**. The red dot is used only as a live/rec status. Dead zones have no colour (§00.2) |
| Photo bands, gallery, hero video, before/after slider, brand-logo strip | **Deleted.** Remove `Band.astro`, `Gallery.astro`, `Signature.astro`, `Partners.astro` and `scripts/video.ts` from the page. Remove `public/media/hero-tv-wall.mp4` from the build |
| Bento services grid | Replaced by the **Service explorer** (tabs + animated diagrams) |
| Radii 10/16/24/32 | Tightened to 8/12/16/24. Cards use 16, stage panels 24 |
| Borders `#D5DEEA` | Hairline `#E6EBF2` (`--color-border`). Inputs keep a 3:1 border (`--color-border-strong`) |

**Section order and background** (alternate, never two cloud bands in a row):

| # | Section | id | Background |
|---|---|---|---|
| — | Concept ribbon + Nav | `top` | white |
| 1 | Hero | — | white |
| 2 | Service explorer | `services` | `--color-bg-alt` |
| 3 | Instant quote builder | `quote` **(new anchor)** | white |
| 4 | How it works | `how-it-works` | `--color-bg-alt` |
| 5 | Built for: Condo / House / Office | `spaces` | white |
| 6 | Reviews (sample) | `reviews` | white, with a 1px `--color-border` rule between 5 and 6 |
| 7 | Service area | `service-area` | `--color-bg-alt` |
| 8 | FAQ | `faq` | white |
| 9 | Booking form | `book` | `--color-bg-alt` |
| 10 | Footer | — | **`--color-mist`, light, as built (v3.1).** There are no dark bands on the page. 1px chrome hairline on top (§00.5) |
| — | Sticky mobile bar | — | white 92% + blur |

Anchor changes in `content.ts`: add `quote: "quote"`. Delete `lighting` ("before-after"), `work`, `brands` ("gear") and every CTA that targets them. FAQ `hide-wires` link → label "See the concrete wall diagram", href `#services`, plus `data-explorer-tab="tv" data-explorer-wall="concrete"`. The explorer script reads those attributes on click and opens that state.

---

## 1. Tokens and primitives

### 1.1 Token summary (values live in `tokens.css`)

- **Colour roles (v3.1):** `--color-bg` white · `--color-bg-alt` silver `#F4F5F6` · `--color-surface` white · `--color-surface-sunken` silver (diagram stages, wells) · `--color-border` hairline `#E6E8EB` · `--color-border-strong` graphite `#7D838A` (inputs) · `--color-accent` red `#C51A1F` · text red `--color-link`/`--color-eyebrow` `#C51A1F` · `--color-price` ink · `--color-signal` graphite (Wi-Fi meters only) · `--color-live` logo red `#E1251B` (status dot only).
- **Ratio of use on any screen:** white/silver ≥ 85%, ink text, red ≤ 8%, chrome ≤ 2%. A screenshot of any section with more red than that fails.
- **Type:** Geist for everything except data. **Geist Mono** for prices, quantities, times, codes, step numbers, eyebrow labels, SVG labels and the receipt. Set `font-feature-settings: var(--font-feature-data)` on mono.
  - H1 hero display `--text-4xl` / 600 / `--tracking-display` (-0.042em) / `--leading-display`
  - H2 display line `--text-3xl` / 600 / -0.028em / 1.12
  - H3 card title `--text-xl` / 600 / -0.014em
  - Lead `--text-lg` / 400 / `--color-text-muted` / max `--measure-lead`
  - Body `--text-base` / 1.6 / max `--measure`
  - Eyebrow (short labels only): mono `--text-xs` / 500 / uppercase / `--tracking-eyebrow` / `--color-eyebrow`
- **Grid:** 12 columns, gap `--grid-gap` (16 → 24), container `--container-max` 1200px, side padding `--space-gutter` (20 → 36). Explorer and quote stage use `--container-wide` (1280). FAQ and form use `--container-narrow` (760). Below 768px everything is 4 columns, full width inside the gutter.
- **Breakpoints:** `sm` 480 · `md` 768 · `lg` 1024 · `xl` 1280. Mobile reference width is **390**.
- **Section rhythm:** padding-block `--space-section` (72 → 128). Head to content `--space-head` (32 → 48). Card padding `--space-card` (20 → 28). Between cards `--grid-gap`.
- **Radius roles:** button/input `--radius-md` 8 · inner well/photo/SMS bubble `--radius-lg` 12 · card `--radius-xl` 16 · stage panel/hero photo frame `--radius-2xl` 24 · chip/tab track/status `--radius-pill` · phone `--radius-device` 46 / `--radius-screen` 36. **Nested rule:** inner radius = outer radius − padding, with a minimum of 4.
- **Elevation:** cards rest at `--shadow-sm`; hover goes to `--shadow-md` plus `--color-line-strong` border, translateY -2px. Stage panels use `--shadow-md`. Floating annotation cards use `--shadow-lg`. The phone uses `--shadow-device`. Nothing else gets a shadow.

### 1.2 Section head (one component, `ui/SectionHead.astro`, restyle)

```
[EYEBROW · mono caps]                      ← optional, 1–3 words
H2 (the SEO heading from content.ts)       ← rendered small: --text-sm, 500, --color-eyebrow, sentence case
Display line                               ← <p class="display">, --text-3xl, slate
Lead (optional)                            ← --text-lg muted, max 46ch
```
Left-aligned on every section except Reviews and FAQ (centred). On desktop the display line spans at most 8 columns.

### 1.3 Primitives

| Primitive | Spec |
|---|---|
| **Button primary** | Height 44 (40 in nav). Padding-inline 18. `--radius-md`. Bg `--color-accent`, text white, 15px/500. `--shadow-cta`. Hover bg `--color-accent-hover`. Active translateY 1px. Focus `--shadow-focus` |
| **Button secondary** | Same size. White bg, 1px `--color-border-strong`, slate text. Hover bg cloud |
| **Text link CTA** | `--color-link`, 500, trailing arrow "→" that moves 2px on hover |
| **Chip (choice)** | Height 36. Padding-inline 14. `--radius-pill`. 1px `--color-border-strong`, slate 14px/500. Selected: bg `--color-signal-50`, border `--color-accent` 1.5px, text `--color-signal-700`, and a 14px check icon slides in from the left (`--ease-spring`, 180ms). Disabled: dashed border `--color-line-strong`, text muted, `aria-disabled`, and a helper line below explains why |
| **Segmented control** (tabs, toggles) | Track `--color-mist`, `--radius-pill`, padding 4. Items 36 high. The selected item is a white pill with `--shadow-xs` that slides between items (`--duration-base`, `--ease-standard`). Tabs use `role="tablist"`; diagram toggles use `role="radiogroup"` |
| **Stepper** | `[–] 1 [+]`: 36px square buttons, `--radius-md`, mono value 16px, min 0/1 and max per spec |
| **Sample tag** | Mono 11px caps, `--tracking-eyebrow`, text `--color-steel-ink`, 1px dashed `--color-line-strong`, `--radius-xs`, padding 2×6. Text is always `SAMPLE`, or what the spec says. Every dummy price, review, phone and quote carries one (guardrails) |
| **Stock tag** | Same style on a white 85% background, bottom-right inside the photo frame, inset 12: `STOCK PHOTO` |
| **Card** | White, 1px `--color-border`, `--radius-xl`, `--shadow-sm`, padding `--space-card` |
| **Icon** | Custom 24×24 grid, 1.5px stroke, round caps and joins, `currentColor`. Shown at 20px in UI and 24px in cards. Files in `src/components/icons/` (§6). **No icon fonts, no emoji, no filled glyph sets** |

---

## 2. Sections — wireframes, copy on frame, behaviour

Notation: `[ ]` is a control, `( )` an image or illustration, `▢` the phone mockup, and `c1–c12` grid columns.

### 2.0 Concept ribbon + Nav

**Ribbon (EXISTING copy, `content.ts` ribbon):** 32px bar above the nav, bg `--color-signal-50` (silver `#F1F2F4` in v3.1), 1px bottom `--color-signal-100`, text `--color-text` 13px (v3.1: ink, not red), centred, not dismissible. Keep it light. It must never be ink, because there are no dark bands.

**Nav** (sticky, `--nav-height` 64):
```
DESKTOP ≥1024
| (logo-horizontal.svg h28) | Services  Prices  How it works  FAQ |  Text us   [Book an install] |
   c1–c3                       centred, 14px/500 slate, gap 28         text link   primary 40h
MOBILE 390
| (logo h24)                                   [Book] [≡] |
```
- Links: Services → `#services`, Prices → `#quote`, How it works → `#how-it-works`, FAQ → `#faq` (**NEW** set; replaces the v2 list). "Text us" = EXISTING `text()` CTA. Primary = EXISTING `nav.primary` ("Book an install"). On mobile the label is "Book", with an `aria-label` of the full label.
- At scroll 0: transparent background, no border. After 8px of scroll: `rgb(255 255 255 / 0.82)` + `backdrop-filter: blur(12px) saturate(1.4)` + 1px bottom `--color-border`. 180ms transition.
- Mobile menu: a full-height white sheet that slides down 280ms. Links at 24px/600 stacked with 56px rows and hairline separators, then Call / Text / Book buttons full width at the bottom. Focus is trapped, Esc closes.
- The active section link turns `--color-link`, with a 2px underline 6px below.

### 2.1 Hero

**Concept:** what you see on the wall, and what ends up on your phone. One framed TV-wall photo, with the phone overlapping it and cycling through three app states.

```
DESKTOP (container-max, 12 col, padding-top 72, padding-bottom --space-section)
c1 ─────────────── c6 │ c7 ────────────────────────── c12
EYEBROW               │ ┌──────────────────────────────┐ ← photo frame, radius 24, aspect 5:4
H1 (small, red)       │ │ (signature-tv-wall-after)    │   1px --color-border, overflow hidden
Display 3 lines       │ │              ┌───────────┐   │ ← annotation card A (top-right, inset 20)
Lead (subhead)        │ │              │SAMPLE·TV  │   │
[Book an install]     │ │              │from $129  │   │
[Build a sample quote]│ │              └───────────┘   │
                      │ ▢─────┐                        │
spec strip (3 items)  │ ▢phone│                [STOCK] │
                      └─▢─────┘────────────────────────┘
                        ↑ phone: left edge 48px OUTSIDE the frame's left edge,
                          bottom 40px below the frame's bottom; width --device-width (300)
                      [Camera · Lock · Wi-Fi] ← state switcher under the phone, 12px gap

MOBILE 390
EYEBROW / H1 / Display / Lead
[Book an install]  (full width)
[Build a sample quote] (full width)
spec strip (stacked, 3 rows)
┌ photo frame, full width, radius 16, aspect 4:3 ┐
│ annotation card A top-right inset 12 (scale .9) │
│        ▢ phone centred, top at 42% of the frame │
└────────▢──────────────────────────────────────┘
         ▢  (phone 248 wide, extends below the frame)
[Camera · Lock · Wi-Fi]
```
- Vertical alignment (desktop): the text column is vertically centred against the photo frame, not against the frame plus phone.
- **Photo:** `src/assets/media/signature-tv-wall-after.jpg` (2560×1707). `object-fit: cover`, `object-position: 50% 38%` (keeps the TV and soundbar, crops the floor). Render through `ui/Img.astro` with widths 480/720/960/1280, `sizes="(min-width:1024px) 50vw, 100vw"`, `loading="eager"`, `fetchpriority="high"`. Alt text: "Wall-mounted TV above a wooden bench with a soundbar (stock photo)". STOCK tag bottom-right.
- **Safe zones on the photo:** annotation card A must not cover the TV screen's centre 60%. The phone must not cover the soundbar. On mobile the phone covers the bench, which is acceptable.

**Copy on frame**
- Eyebrow (**NEW**): `MIAMI · TV · WI-FI · CAMERAS · SMART HOME`
- H1 (**EXISTING** `hero.heading`, rendered small per §1.2): "TV mounting, Wi-Fi, cameras and smart home installs for Miami condos, homes and offices"
- Display (**NEW**, `<p>`, a forced break after each sentence on ≥768): "Mounted level. / Wired neat. / Working on your phone."
- Lead (**EXISTING** `hero.subhead`): "TVs mounted on drywall or concrete, with the cables inside the wall on drywall and in a paint-matched raceway on concrete. Wi-Fi that reaches the back bedroom. Cameras, doorbells and smart locks working on your phone before we leave."
- Primary: **EXISTING** `hero.primary` "Book an install" → `#book`. Secondary (**NEW**): "Build a sample quote" → `#quote`, `data-track-id="hero_quote"`.
- Spec strip (**NEW**; mono 13px, `--color-text-muted`, separated by 1px vertical hairlines, each with a 16px icon):
  1. `icon-price` "Sample prices on the page" + Sample tag
  2. `icon-sms` "Price confirmed by text before the visit"
  3. `icon-wall` "Concrete and drywall"
- Annotation card A (**NEW**): white, `--radius-lg`, `--shadow-lg`, padding 12×14. Line 1: mono 11px caps muted `SAMPLE · TV MOUNT`. Line 2: mono 24px/500 slate `from $129`. Line 3: 12px muted "per TV".
- Under the switcher, 12px muted (**NEW**): "Illustration. Shows the device apps we set up on your phone, not a TechSolutions app." **This line is required.** Without it the mockup implies a proprietary app.

**Phone mockup** (`ui/PhoneMock.astro`, pure HTML/CSS, no image):
- Outer: width `--device-width`, aspect `--device-aspect`, bg `--device-bezel-color`, padding `--device-bezel`, `--radius-device`, `--shadow-device`. Inner screen: white, `--radius-screen`, overflow hidden. Dynamic-island pill 84×24 slate, top 10, centred. Status bar: mono 12px slate, left `2:14`, right signal/battery glyphs drawn as 3 tiny bars and a rounded rect (CSS, no emoji).
- Screen padding 16, app header 44 high. All screen text uses Geist, at 13px minimum at 300px device width.
- **State A — Camera** (header: "‹ Front door", right: live pill)
  - Live pill: bg `--color-sunset-100`, 8px dot `--color-live` pulsing (opacity 1 → .35, 1.6s), text `--color-live-text` 12px/600 "Live".
  - Feed: 16:10 well, `--radius-lg`. It is an **illustrated** porch view, not a photo: bg `#E9EEF5`, door outline 1.5px `--illo-structure`, wall lamp, doormat, two walkway perspective lines, all in the §3 style. Overlay bottom-left in mono 11px white on `rgb(30 42 59/.55)` pill: `THU 10/09 · 2:14:07 PM`. The seconds tick live.
  - Control row (3 round 44px buttons in mist, icon + 11px label): "Talk", "Snapshot", "Clips".
  - Event list (2 rows, hairline separated; title 13px/500, time mono 12px muted): "Doorbell pressed" `1:52 PM` · "Motion · Walkway" `11:08 AM`.
- **State B — Lock** (header: "‹ Front door")
  - Centre: a 96px circle, 2px `--color-accent` ring, lock icon 32px, below it "Locked" 20px/600 and mono 12px muted `Auto-lock on`.
  - Highlight card (bg `--color-signal-50`, `--radius-lg`, padding 12): 13px/600 "Guest code 4821 active", 12px muted "Valid until Sun 11:00 AM".
  - Codes list (3 rows: name 13px, detail mono 12px muted): "Owner" `Always` · "Cleaner" `Tue 9–1` · "Guest" `Fri–Sun`.
  - Bottom: segmented `[Lock | Unlock]` with Lock selected.
- **State C — Wi-Fi** (header: "Home Wi-Fi")
  - Status card: bg `--color-bay-100`, `--radius-lg`, 20px check-in-circle icon in `--color-success`, 15px/600 "All rooms: strong", 12px muted "3 access points online".
  - Room list (5 rows; room 13px, 4-bar meter in `--color-signal` (graphite in v3.1), label 12px muted): "Living room" ▮▮▮▮ Strong · "Kitchen" ▮▮▮▮ Strong · "Primary bedroom" ▮▮▮▮ Strong · "Back bedroom" ▮▮▮▮ Strong · "Balcony" ▮▮▮▯ Good. Draw the bars as 4 CSS rects 3×(6/9/12/15)px; never text glyphs.
- **Cycling:** A → B → C → A, each for `--duration-cycle` (4.2 s). Screens crossfade and move 8px up (`--duration-slow`, `--ease-out-expo`). The switcher under the phone is a segmented control labelled `Camera · Lock · Wi-Fi`. The selected item shows a 2px progress bar filling over 4.2 s along its bottom edge.
  - Clicking an item jumps to that state and **stops auto-cycling** for the session. Auto-cycling also pauses on hover or focus within the hero, and when the hero is out of view (IntersectionObserver).
  - `prefers-reduced-motion`: no auto-cycle, state A static, switcher still works, swap is instant.
  - Screen reader: the phone is `role="img"` with `aria-label` "Illustration of phone apps: front door camera live view, smart lock with guest code 4821, Wi-Fi strong in all rooms". The cycling content is `aria-hidden`. The switcher buttons are real buttons, `aria-pressed`.

### 2.2 Service explorer (`#services`, bg-alt)

**Section head**
- Eyebrow (**NEW**): `SERVICES`
- H2: **EXISTING** `services.heading` (rendered small)
- Display (**NEW**): "See how the job is done before anyone drills."
- Lead (**NEW**): "Pick a service. The drawing shows where the wires, the access points and the cameras go."

```
DESKTOP (container-wide)
           [ ▭ TV | ⌔ Wi-Fi | ◎ Cameras | ⌂ Smart home ]   ← segmented tablist, centred, icon 20 + label
┌──────────────────────── stage panel: white, radius 24, --shadow-md, padding 32 ───────────────────────┐
│ c1 ─────── c4 (copy)            │ c5 ───────────────────────────── c12 (diagram stage)               │
│ H3 title                        │ ┌ well: --color-surface-sunken, radius 12, aspect 16:10 ──────────┐ │
│ one-liner (muted)               │ │ [Drywall | Concrete]  ← toggle, top-left inset 16               │ │
│ ─ hairline ─                    │ │                                                                 │ │
│ ✓ spec row 1                    │ │             (animated SVG diagram)                (1)(2)(3)     │ │
│ ✓ spec row 2                    │ │                                                    callouts     │ │
│ ✓ spec row 3                    │ │                                                                 │ │
│ ─ hairline ─                    │ └───────────────────────────────────────────────────┬────────────┘ │
│ SAMPLE  from $129  per TV       │  legend row (mono 12)                                │photo card │ │
│ [Add to quote]  Book this job → │                                                      │4:5, w 168 │ │
│                                 │                                                      └───────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
  photo card: overlaps the well's bottom-right corner by 32px both ways; white 6px padding, radius 16,
  --shadow-lg; 4:5 photo inside, radius 10; caption under photo 12px muted. TV + Wi-Fi tabs only.

MOBILE 390
[TV | Wi-Fi | Cameras | Smart home]   ← full-width segmented, text only (icons hidden < 480), 13px
┌ stage panel radius 16, padding 16 ┐
│ [Drywall | Concrete] full width    │
│ ( diagram, mobile viewBox, 4:5 )   │
│ legend: ① ② ③ numbered list        │  ← callouts collapse to numbered markers (§3.5)
│ H3 / one-liner / 3 spec rows        │
│ ( photo card 16:9 full width + cap )│
│ price row                           │
│ [Add to quote] full width           │
│ Book this job →                     │
└─────────────────────────────────────┘
```
- Tab change: the copy column crossfades (200ms), and the diagram crossfades with a 12px x-shift in the direction of travel (`--duration-slow`). The new diagram's "draw" animation (§3.6) then starts. Tabs are keyboard operable with arrow keys (WAI-ARIA tabs pattern). The URL is not changed.
- **Add to quote** (secondary button) selects that service in the quote builder with the current toggle state (TV wall type, camera count), scrolls to `#quote`, and focuses the builder's step 2 legend. `data-track-id="explorer_add_<tab>"`.
- **Book this job →** (text link) = EXISTING `book()` with `data-prefill-services="<key>"`. `data-track-id="explorer_book_<tab>"`.

#### Tab 1 — TV (`tv`)
- Title (**NEW**): "TV mounting" · One-liner (**NEW**): "On drywall or concrete. You know how the wires go before we drill."
- Spec rows (**NEW**):
  - Drywall state: "Mount fixed into the studs" · "HDMI and power run inside the wall" · "In-wall power kit, never a plug-in cord in the wall"
  - Concrete state: "Concrete anchors rated for the TV's weight" · "Slim raceway on the wall surface" · "Raceway painted to match the wall"
- Price row: Sample tag + mono `from $129` + muted "per TV". In the drywall state a second line reads mono 13px `In-wall wires from $249` (EXISTING sample values).
- Toggle: `[Drywall | Concrete]`, default Drywall.
- Diagram: §3.7-A. Photo card: `band-detail-mount.jpg`, `object-position: 55% 45%` (TV and mount), caption (**NEW**) "Stock photo. Your wall decides the method." Alt: "TV on an articulating wall mount (stock photo)".

#### Tab 2 — Wi-Fi (`wifi`)
- Title: "Wi-Fi and mesh" · One-liner (**NEW**): "Wi-Fi that reaches the back bedroom, not just the room with the router."
- Spec rows (**NEW**): "We find the dead zones room by room" · "Mesh points or wired access points where the signal drops" · "One network name across the whole unit"
- Price row: Sample `from $179` (EXISTING value).
- Toggle: `[Router only | With mesh]`, default **Router only**. Show the problem first. After 1.2 s in view, auto-switch once to "With mesh" unless the user has touched the toggle; skip this under reduced motion.
- Diagram: §3.7-B. Photo card: `svc-wifi.jpg`, `object-position: 40% 55%` (ports and LEDs), caption (**NEW**) "Stock photo. Wired where it counts." Alt: "Ethernet cables plugged into a network router (stock photo)".

#### Tab 3 — Cameras (`cameras`)
- Title: "Security cameras and doorbells" · One-liner (**NEW**): "Front door, driveway, side gate, back patio. Running on your phone before we leave."
- Spec rows (**NEW**): "Placement planned on a drawing of your property" · "Cameras aimed at your property, not next door" · "App set up on your phone, with audio recording off unless you choose it"
- Price row: Sample `from $349` + muted "for 2 cameras" (EXISTING).
- Toggle: `[2 cameras | 3 | 4]` (segmented, default 2).
- Diagram: §3.7-C. **No photo card.** None of the available stock photos shows a neat install: `outdoor-camera-eave.jpg` shows loose hanging cables. **Never use that file.** Instead, a mini phone-feed card overlaps the well's bottom-right in the photo card's position: a white card 200 wide, `--radius-xl`, `--shadow-lg`, containing a 16:10 illustrated feed (driveway view, §3 style) with a live pill reading "Driveway", plus mono 11px `2:14:07 PM`.

#### Tab 4 — Smart home (`smart`)
- Title: "Smart locks and smart home" · One-liner (**NEW**): "Locks, thermostat and lights on one app, with guest codes you can change from anywhere."
- Spec rows (**NEW**): "Smart locks with guest codes" · "Thermostat and light switches set up on your phone" · "Scenes like Leaving and Goodnight, set up before we go"
- Price row: Sample `from $89` + muted "per device" (EXISTING).
- No toggle. The **diagram is an interactive phone** (§3.7-D), centred in the well, with `--device-width` at 260 max. No photo card.

### 2.3 Instant quote builder (`#quote`, white)

**Concept:** the price appears while you choose. It is a receipt, not a form.

**Section head**
- Eyebrow (**NEW**): `SAMPLE QUOTE`
- H2 (**NEW**, rendered small): "Instant sample price for TV mounting, Wi-Fi, cameras and smart home"
- Display (**NEW**): "Pick the job. Watch the price."
- Lead (**NEW**): "Sample prices for this concept. Tap your options, then book it or text it to us."

```
DESKTOP (container-wide; one stage panel, white, radius 24, 1px border, --shadow-md, padding 40)
c1 ───────────────────────── c7  (steps)          │ c8 ─────────────── c12 (receipt, position: sticky top 96)
① Service                                         │ ┌ receipt card: bg cloud, radius 16, padding 24 ┐
  [TV] [Wi-Fi] [Cameras] [Smart home]             │ │ SAMPLE QUOTE                 [SAMPLE]         │
② Details  (depends on ①)                         │ │ ───────────────────────────── dashed hairline │
  label 14/500                                    │ │ TV mount, 56–75"   ×1           $159          │
  [chip] [chip] [chip]                            │ │ Concrete wall                    $49          │
  label                                           │ │ Raceway, painted to match        $69          │
  [chip] [chip]                                   │ │ ───────────────────────────────────────────── │
  helper text for disabled chips                  │ │ Sample total                                  │
③ Extras                                          │ │ $277                ← --text-data-xl mono     │
  [ ] Soundbar mounted under the TV     +$49      │ │ Final price confirmed by text before the visit│
  TVs  [–] 1 [+]                                  │ │ [Book this] full width primary                │
                                                  │ │ Text us this quote →                          │
                                                  │ └────────────────────────────────────────────────┘
MOBILE 390
① ② ③ stacked, chips wrap; receipt card after ③ (full width)
In-section sticky pill: bottom = calc(--mobile-bar-height + 12px), visible only while the steps are
in view and the receipt card is not: white, radius pill, --shadow-lg, height 52:
"Sample total  $277   [Book this]"
```
- Step headers: a mono 12px number in a 24px circle (1px `--color-border-strong`; turns `--color-accent` fill with white number once the step has a selection) + 16px/600 label. A 1px vertical hairline connects the circles (desktop).
- Receipt behaviour: when a line is added it slides in 8px from the top with a fade (`--duration-base`). When a line is removed it collapses its height. The total ticks digit by digit to the new value over 520ms (`--ease-out-expo`, tabular nums, so the width never jumps). A total of 0 or "by text" shows mono 20px muted "Pick a service to see a price."
- **Book this** (primary): dispatches `form:prefill` with `services=<key>` and any matching detail fields, writes the receipt text to a new hidden input `quote_summary` in `#consult`, scrolls to `#book`, and focuses the current step heading. `data-track-id="quote_book"`. Add `quote_total` (integer) and `quote_service` (enum) to the `form_submit` params (both allowed by `track()`).
- **Text us this quote →** = EXISTING `text()` helper, with body `"Hi, I'd like this quote: <receipt lines joined by ', '>. Sample total $<n>."`. `data-track-id="quote_text"`.
- Footnote under the panel (**EXISTING** `services.footnote`): "Sample prices for this concept. The final price is confirmed by text before the visit."
- No JS: render the section with a static table of starting prices (the EXISTING values) and a "Book an install" button. The builder is progressive enhancement.

**Options and sample prices.** All dummy values sit inside the context.md market bands, and every one is `// NEEDS DATA` in code. Put them in `content.ts` as `export const quote = {...}`.

| Service | Control | Options → sample price |
|---|---|---|
| **TV** | Size (chips, required) | `Up to 55"` $129 · `56–75"` $159 · `76" and up` $199 |
| | Wall (chips, required) | `Drywall` +$0 · `Concrete` +$49 · `Brick, stone or fireplace` → total becomes **"Price by text"** (helper: "We'll look at a photo first.") |
| | Wires (chips, required) | Drywall: `Leave as is` $0 · `Cord cover on the wall` +$29 · `Inside the wall (power kit)` +$120. Concrete: `Leave as is` $0 · `Raceway, painted to match` +$69. On concrete, "Inside the wall" stays visible but disabled, with the helper: "Solid concrete has no cavity for cables. The raceway is the clean option." |
| | Extras | Checkbox `Soundbar mounted under the TV` +$49 · Stepper `TVs` 1–5 (multiplies size + wall + wires) |
| **Wi-Fi** | Place | `Condo or apartment` · `House or townhouse` · `Office` → **"Quoted per office"** (EXISTING note) |
| | Size | `Up to 1,200 sq ft` · `1,200–2,500 sq ft` · `2,500+ sq ft` (preselects the recommended mesh option and shows a `Recommended` tag) |
| | Setup | `Mesh, 2 points` $179 · `Mesh, 3 points` $229 · `Mesh, 4 points` $279 |
| | Extras | Stepper `Wired runs to access points` 0–4 × $99 |
| **Cameras** | Count | `2` $349 · `3` $469 · `4` $589 |
| | Extras | Checkbox `Video doorbell` +$99 · Checkbox `Recorder (NVR) setup` +$149 |
| **Smart home** | Steppers (0–6 each) | `Smart locks` · `Thermostats` · `Video doorbells` · `Light switches`, each × $89 |

Receipt line labels follow the pattern `<thing>, <option>` and are written out in full. Never abbreviate.

### 2.4 How it works (`#how-it-works`, bg-alt)

**Section head:** H2 **EXISTING** `processSteps.heading` · Display **EXISTING** "Price first. Drill second."

```
DESKTOP: 4 cards, c1–3 / c4–6 / c7–9 / c10–12, equal height
┌ card ───────────────┐  each card: white, radius 16, --shadow-sm, padding 20
│ ┌ vignette well ──┐ │  well: --color-surface-sunken, radius 12, height 168, overflow hidden
│ │  micro-UI       │ │
│ └─────────────────┘ │
│ 01  (mono 12 red)   │
│ Title (EXISTING)    │
│ Body (EXISTING)     │
└─────────────────────┘
a 1px dashed --illo-accent line joins the four "01–04" numbers across the cards (desktop only)

MOBILE: one column; the vignette sits on top of each card; a vertical dashed line on the left
joins the numbers (cards indented 28px)
```
Titles and bodies: **EXISTING** `processSteps.steps[0–3]` (short labels: Pick & price · Confirm by text · Install & test · Walkthrough).

Vignettes (**NEW** copy, all inside the well, Geist 13px unless stated):
1. **Pick & price.** Two chips (`TV` selected, `56–75"` selected), then mono 28px `$159` with a Sample tag. On reveal, the chips select one after another (300ms apart) and the price ticks up from $129.
2. **Confirm by text.** A sender line in mono 11px muted, `TechSolutions FL · Text`. Incoming bubble (bg `--color-mist`, `--radius-lg` with a 4px bottom-left corner, max 85% width): "Confirmed: Thu 2–4 pm. 65" TV on concrete, raceway painted to match. Sample price $277." Outgoing bubble (bg `--color-accent`, white text, 4px bottom-right corner): "Perfect, see you Thursday". Timestamps mono 11px muted, `2:14 PM`. On reveal, a typing indicator shows for 600ms, then bubble 1, then bubble 2.
3. **Install & test.** A checklist of 4 rows, each with a 16px circle that fills `--color-success` with a white check drawn by stroke-dashoffset, 250ms apart: "Mount level" · "Cables run" · "Inputs tested" · "Remote paired".
4. **Walkthrough.** A mini card titled "Your setup" (13px/600), then 3 rows with a check on the right: "Camera app on your phone" · "Guest code shared" · "Wi-Fi checked room by room". Mono 11px muted footer: `Walkthrough done · 4:02 PM`.

The vignettes animate once, in sequence, when the section is 30% in view. Under reduced motion they render in their end state.

### 2.5 Built for: Condo / House / Office (`#spaces`, white)

**Section head:** H2 **EXISTING** `sectors.heading` · Display **EXISTING** "High-rise, house or office. Different walls, same clean finish."

```
DESKTOP: 3 cards c1–4 / c5–8 / c9–12
┌ card (radius 16, padding 0, overflow hidden) ┐
│ ( photo 16:10, full card width )             │
│ ⓘ icon chip 44px white circle, --shadow-sm,  │ ← overlaps the photo's bottom edge, left 20, -22px
│ Title H3                                     │   (padding 20 from here down)
│ Body (2–3 lines)                             │
│ MONO TAG · MONO TAG · MONO TAG               │
│ See condo installs →                         │
└──────────────────────────────────────────────┘
MOBILE: stacked cards, photo 16:9
```
| Card | Photo (object-position) | Icon | Title (NEW) | Body (NEW) | Tags (mono caps) | Link (NEW, prefill `property_type`) |
|---|---|---|---|---|---|---|
| Condo | `env-condo.jpg` (20% 50%: TV wall and desk) | `icon-building` | Condos and high-rises | Concrete or drywall, drilling hours, the service elevator. We plan the install around your building's rules. | CONCRETE · DRYWALL · BUILDING RULES | See condo installs → |
| House | `env-townhouse.jpg` (30% 45%: TV and console) | `icon-house` | Houses and townhouses | Cameras on the eaves, mesh that reaches the back bedroom and the patio, TVs on any wall. | CAMERAS · MESH · OUTDOOR | See house installs → |
| Office | `env-office.jpg` (72% 45%: meeting-room TV) | `icon-office` | Small offices | Office Wi-Fi plus wired runs to desks and printers, and the TV in the meeting room. | WI-FI · ETHERNET · MEETING ROOM | See office installs → |

- Each photo gets a STOCK tag (top-right, inset 10) and alt text "<room> (stock photo)". **Do not use `env-house.jpg`**: a loose cable hangs below the TV.
- Hover: photo scale 1.03 over 520ms, card `--shadow-md`. The link arrow moves 2px.
- Links go to `#book` with `data-prefill-property_type="condo|house|office"`. Confirm the value names against `content.form` and use whatever the form already defines.
- The v2 multi-unit/trade block (`#multi-unit`) is dropped from the page. Keep its data in `content.ts`.

### 2.6 Reviews, sample (`#reviews`, white)

Centred head: H2 **EXISTING** `testimonials.heading` · Display **EXISTING** "Sample reviews for this concept".
- 3 cards (c1–4 / c5–8 / c9–12; stacked on mobile). Card: white, 1px border, radius 16, padding 28, no shadow.
  - Top row: 32px circle in `--color-mist` holding the initial (14px/600 slate), author (**EXISTING**, 14px/600), and a Sample tag right-aligned.
  - Quote (**EXISTING** verbatim): `--text-lg`, 1.5 leading, slate, no italic, no quote-mark graphic larger than 24px.
  - Footer: mono 12px muted service (**EXISTING**).
- **No stars, no photos of people, no counts, no logos, no review schema.**
- CTA under the cards, centred: **EXISTING** `testimonials.cta`.

### 2.7 Service area (`#service-area`, bg-alt)

The map is a real Google Maps embed (operator request, 2026-10-07). It replaces the SVG approach.
- Layout desktop: c1–5 head + body + neighborhood chips (**EXISTING** list, chips non-interactive, mono 12px) + **EXISTING** out-of-area note + CTAs (**EXISTING** `ask` primary, `secondary` text link). c6–12: the map in a white stage panel, radius 24, with no padding, sticky under the nav.
- Map card: a header bar with a pin icon, "Miami-Dade + Broward" and a mono neighborhood count, then a keyless `/maps/embed?pb=…` iframe centred at 25.93, −80.22, zoom 10 (Kendall to Fort Lauderdale in view). The iframe is 4:5, its height capped to the viewport (minimum 20rem), and `loading="lazy"`; its `title` is `serviceArea.mapLabel`. Draw no pins or radius over the embed: the radius is NEEDS DATA, and the full neighborhood list is the chips.
- Mobile: map first (4:5, max 70svh), then copy.
- Sample tag next to the H2 (EXISTING `sample: true`).

### 2.8 FAQ (`#faq`, white, container-narrow)

Centred head: H2 **EXISTING** · Display **EXISTING** "Straight answers before anyone drills."
- Accordion using `<details>`/`<summary>`. Rows have a 1px `--color-border` top border, the list has a bottom border, and there are no cards. Question 18px/500 slate with 20px vertical padding. The icon is a 20px plus that rotates 45° (`--duration-base`). The answer is `--text-base` muted, max 62ch, padding-bottom 20, and opens with a height transition.
- Content: **EXISTING** Q1–Q8 verbatim (schema-bound, do not edit). The `hide-wires` link is retargeted per §0.
- Under the list: **EXISTING** `faq.primary` (Text) as primary button and `faq.secondary` (Call) as secondary.

### 2.9 Booking form (`#book`, bg-alt)

```
DESKTOP
c1 ───────── c5                          │ c6 ─────────────────────── c12
H2 (EXISTING form.heading, small)        │ ┌ form card: white, radius 24, --shadow-md, padding 32 ┐
Display (EXISTING) "Tell us the wall.    │ │ Step 2 of 5  ▬▬▬▬▬▬▬▬▭▭▭▭▭  (2px progress, accent)     │
  We'll text the price."                 │ │ legend 20/600                                         │
Intro (EXISTING)                         │ │ chips / inputs                                        │
3 reassurance rows (icon 20 + 15px):     │ │ [Back]                              [Next: …] primary │
  · No address, no payment               │ └───────────────────────────────────────────────────────┘
  · We text back to confirm price + time │
  · Concrete or drywall, tell us which   │
mini SMS bubble (vignette 2 style)       │
MOBILE: head, intro, form card full width (padding 20, radius 16); reassurance rows go below the card
```
- Reassurance rows (**NEW**, derived from EXISTING intro copy): "No address, no payment" · "We text back to confirm the price and a time" · "Concrete or drywall? Tell us which".
- The form module contract is unchanged (`docs/form-module.md`). Restyle only: inputs 48 high, `--radius-md`, 1px `--color-border-strong`, focus `--shadow-focus`, labels 14px/500 above the field, helper text 13px muted, errors 13px `--color-error` with a 16px icon. Choice groups use the §1.3 chip. Add the hidden input `quote_summary` (§2.3). Success panel: a 48px `--color-success` check circle draws in, then the EXISTING success copy and demo notice.
- When the form card is ≥ 40% in view, hide the sticky mobile bar (no duplicate CTAs).

### 2.10 Footer (v3.1: light `--color-mist` as built, `logo-horizontal.svg`, chrome hairline on top. The ASCII below still describes the layout; ignore "slate")

```
DESKTOP padding-block 64/32
c1–4: logo-horizontal-light.svg h28 · tagline (EXISTING, 14px --color-text-inverse-muted, max 34ch)
c5–6: "Services" col: TV mounting · Wi-Fi and mesh · Cameras · Smart home  (→ #services + tab attr)
c7–8: "Site" col: Prices · How it works · FAQ · Book
c9–12: "Book or ask" (EXISTING contactHeading): Text / Call / Email (EXISTING nap) + area line (EXISTING)
──── 1px --color-slate-line ────
Concept line (EXISTING ribbon text, 13px inverse-muted) · Photo credits line (below)
MOBILE: single column, same order, 32px between groups
```
- Text (v3.1, light footer): links `--color-text` 14px, hover `--color-link`, column heads mono 11px caps `--color-text-muted`. On a dark band only: links white, hover `--color-signal-300` (`#EE8A84`, 7.8:1 on ink), heads `--color-text-inverse-muted`.
- **Photo credits (required by guardrails):** "Photos: Pexels. " followed by author names linked to `authorUrl` for **only the slots used on the page**, generated from `src/data/media-credits.json` filtered to: `signature-tv-wall-after`, `band-detail-mount`, `svc-wifi`, `env-condo`, `env-townhouse`, `env-office`.

### 2.11 Sticky mobile bar (< 768 only)

- Height `--mobile-bar-height` + `env(safe-area-inset-bottom)`. Bg `rgb(255 255 255 / 0.92)` + blur 12, 1px top `--color-border`. 3 equal buttons, gap 8, padding 8 12: `Call` (secondary, phone icon) · `Text` (secondary, sms icon) · `Book` (primary). EXISTING CTAs and track ids.
- Hidden while the hero CTAs are in view (it slides up 280ms once they leave) and while the booking card is in view. Page bottom padding = bar height.

---

## 3. Illustration system

**Style decision: flat technical drawing.** Elevations, sections and top-down plans, in the manner of an architect's drawing set or a good assembly manual. **No isometric, no 3D, no perspective** (the only perspective is the two walkway lines inside camera feeds). One accent colour carries the meaning: **red = what we install / the route** (v3.1; was blue). Graphite = Wi-Fi signal (was cyan). A red dot = live. A problem (dead zone, blind spot) = **absence**: no fill and a dashed graphite outline (was sunset). The full rule set is in §00.2.

### 3.1 Line weights (all strokes use `vector-effect: non-scaling-stroke`)
| Weight | Token | Use |
|---|---|---|
| 2px | `--illo-stroke-bold` | The subject: TV outline, cable route, raceway, coverage-cone edge, mesh node |
| 1.5px | `--illo-stroke` | Primary structure: walls in elevation, door, mount, device outlines |
| 1px | `--illo-stroke-fine` | Secondary: studs, furniture, hatching, dimension lines, leader lines, grid |
Caps and joins are round. Corner radius on drawn objects: 2px for devices, 0 for building structure.

### 3.2 Colour usage
- Ink `--illo-ink` (slate) for primary outlines only. Structure `--illo-structure` for secondary lines.
- Fills: `--illo-fill` (cloud) and `--illo-fill-2` only. Concrete = 45° hatch, 1px `--illo-hatch`, 6px spacing (an SVG `<pattern>`). Drywall board = `--illo-fill-2` with a 1.5px outline.
- Accent `--illo-accent` (2px stroke) + `--illo-accent-fill` (10%) for the installed thing. Hidden routes (inside the wall) are **dashed** `--illo-dash`. Visible routes are solid.
- Wi-Fi: `--illo-signal` (graphite) strokes, `--illo-signal-fill` (graphite 20%) for coverage. Access points and router: `--illo-accent` (red). Problem: `--illo-alert-fill` (white, i.e. no fill) + 1px `--illo-alert` (graphite) dashed outline. No red or orange room fills.
- **Never** use gradients in diagrams, with one exception: the Wi-Fi node glow, a radial gradient from `--illo-signal-fill` to transparent. No drop shadows inside the SVG. No pure `#000` (ink is `#0E0F11`). No chrome gradients in diagrams.

### 3.3 Labels and callouts
- Callout = a number marker (20px circle, white fill, 1.5px `--illo-accent` ring, mono 11px/600 `--color-signal-700` number) + a 1px leader line in `--illo-structure` + a label.
- **Labels are HTML, not SVG text.** Absolutely position them over the SVG using % coordinates from the same viewBox, at Geist 13px/500 slate with a 12px muted sub-line if needed. They never scale below 12px rendered.
- Room and zone names in plans: mono 11px caps `--illo-label`, letter-spacing 0.06em. These can be SVG `<text>`, but only in the mobile viewBox at a size that renders ≥ 11px. Otherwise use HTML.
- Dimension lines (optional, TV tab only): 1px with 45° ticks, value in mono 11px, e.g. `≈ 42 in to centre`. **Decoration only. Do not imply it is a measured spec.** If in doubt, leave it out.

### 3.4 Composition
- Every diagram has two artboards: **desktop viewBox `0 0 800 500`** (16:10) and **mobile viewBox `0 0 360 450`** (4:5). Mobile is a **re-composition, not a scaled copy**: crop to the subject, enlarge it, drop secondary furniture. Swap with a container query (`@container (max-width: 560px)`).
- Keep 24 units of empty margin inside every viewBox. The subject takes 55–70% of the width. Nothing touches the well edge.
- At most 4 callouts per state.

### 3.5 At 390px (must pass)
- Stage width ≈ 326px. Strokes stay at their pixel weights (non-scaling). Bold lines are still 2px.
- Callouts collapse to **numbered markers only**, and the label text moves to an ordered list under the diagram (`<ol>` 14px, number marker reused as the bullet).
- Toggles sit above the diagram at full width. The diagram never scrolls horizontally. Tap targets ≥ 44px.
- Test at 390 and 360. If a label or marker overlaps another, move the marker. Never shrink the text.

### 3.6 Motion (subtle, purposeful: every animation explains the job)
- **Draw-on:** when a diagram enters view or its tab is opened, the routes (cable, raceway, backhaul) draw with stroke-dashoffset over `--duration-scene` (900ms, `--ease-in-out`). Callout markers then pop in 80ms apart (scale .8 → 1, opacity, `--ease-out-expo` 280ms).
- **State toggles:** structure crossfades (300ms). The subject morphs or redraws (900ms). Nothing slides more than 12px.
- **Ambient loops** (only these 3): Wi-Fi node rings (3 concentric rings expanding and fading, 2.4s, staggered); the live dot pulse; the camera-feed seconds tick. All three pause when out of view and are off under reduced motion.
- Banned: parallax, scroll-jacking, continuous rotation, bounce on scroll, anything over 900ms except the loops above.
- Scroll reveals site-wide: opacity 0 → 1 and translateY `--reveal-distance` (12px), 520ms, `--ease-out-expo`, once, at 15% visible. No staggered letter or word animations on headings.

### 3.7 The four diagrams

**A. TV wall (`DiagramTvWall.astro`), front elevation with an inset section**
- *Drywall:* the wall face in `--illo-fill-2`. TV 2px ink rectangle, 16:9, centred, top third. A **cutaway window** (a rectangle with a torn-free straight edge, 1.5px) from just under the TV to the outlet zone reveals 2 studs (1px structure, 16-unit wide) and the cavity in `--illo-fill`. Inside it: the cable route, **dashed** 2px accent, from a recessed box behind the TV (accent outline square) down to a power-kit inlet plate near the floor, next to a drawn outlet. Callouts: ① "Recessed box behind the TV" ② "HDMI and power inside the wall" ③ "In-wall power kit inlet" ④ "Mount fixed into the studs". Inset (bottom-left, 120×150, 1px border): a plan section through the wall showing drywall board | cavity with cable dot | drywall board, labelled mono `DRYWALL`.
- *Concrete:* the wall face changes to a 45° hatch (hatch lines draw in left to right over 600ms). The cutaway closes. The dashed route fades out. A **raceway** (solid 2px accent outline, fill white, 10 units wide, rounded 2) grows down from the TV's bottom edge to the outlet (scaleY from top, 900ms). Anchors: 4 small accent crosses at the mount points. Callouts: ① "Concrete anchors rated for the TV's weight" ② "Slim raceway on the surface" ③ "Painted to match the wall" ④ "No cutting into the concrete". Inset: solid hatched section with the raceway on its face, labelled `SOLID CONCRETE`.
- Mobile artboard: TV and route only, with the inset moved under the TV.

**B. Wi-Fi floorplan (`DiagramWifiPlan.astro`), top-down condo plan**
- A two-bedroom condo: entry + closet, kitchen, living room, balcony, primary bedroom + bath, back bedroom. Walls are solid 4-unit bands in `--illo-ink` at 85% (plan convention: walls read heaviest here, the only exception to §3.1). Door swings are 1px arcs. Room names in mono caps.
- *Router only:* the router (accent square, 10 units) in the entry closet. Rooms fill by coverage: entry, kitchen and living room `--illo-signal-fill`; primary bedroom half strength (`--illo-signal-fill` at 45–50%); **back bedroom and balcony** `--illo-alert-fill` (white, no fill), with a dashed graphite `--illo-alert` outline and an HTML label "Dead zone" as a plain ink `.status` pill (not red). Rings pulse from the router only. The router is a red `--illo-accent` square.
- *With mesh:* 2 mesh nodes appear (living room near the hall, and the hall outside the back bedroom) as red `--illo-accent` circles, 2px, with a white fill and a red core. A wired backhaul **dashed accent** line draws router → node 1 → node 2 along the walls. All rooms crossfade to `--illo-signal-fill` and the dead-zone labels fade out. A status chip top-right: 16px check + "All rooms: strong" (matches hero state C).
- Legend row under the well (mono 12px, 12px swatches): `■ Strong  ▧ Weak  ▨ Dead zone  ● Access point  ┄ Wired run`.

**C. Camera plan (`DiagramCameraPlan.astro`), top-down single-family lot**
- Property line: 1px dashed structure. House footprint: 1.5px ink with room-less fill `--illo-fill`. Driveway, front walk, side gate and back patio are drawn as 1px outlines with mono labels. The neighbour's lot is shown only as a strip beyond the property line, labelled `NEIGHBOR`.
- Cameras: 8-unit accent circles on the eaves, with a short 2px stub showing direction. Each **cone** is a sector path (70–90°) in `--illo-accent-fill` with a 2px accent edge. Cones are **clipped at the property line** (a `clipPath` of the lot). This is the visual proof of "aimed at your property, not next door".
- `2 cameras`: front door + driveway. `3`: + side gate. `4`: + back patio. Cones grow from the camera point (scale 0 → 1, 600ms, origin at the camera).
- Areas not covered in the current state show a faint 1px hatch. Callouts name only the covered zones.

**D. Smart home phone (`PhoneSmartHome.astro`), the interactive diagram**
- `PhoneMock` (§2.1) with a home screen titled "Home" plus a mono 12px muted date `Thu 10/09`.
- Tiles (2-column grid, `--radius-lg`, bg cloud, padding 12):
  - "Front door": lock icon, state "Unlocked", toggle.
  - "Thermostat": mono 28px `76°`, buttons "–" and "+", sub "Cooling".
  - "Living room lights": state "On", toggle.
  - "Guest code": mono `4821`, sub "Fri–Sun".
- Scenes row (chips): `Leaving` · `Movie` · `Goodnight`.
  - **Leaving:** door → Locked, thermostat ticks to `80°`, lights → Off.
  - **Movie:** lights → "Dim 20%", the others unchanged.
  - **Goodnight:** door → Locked, `74°`, lights → Off.
  - Each tile changes with a 280ms crossfade, and a 1.5px accent ring flashes on the changed tile (600ms). A toast at the bottom of the screen reads `Scene "Leaving" ran · 3 changes`.
- Every control is a real button inside the mock, labelled for screen readers ("Run Leaving scene"). Keyboard reachable.

---

## 4. Photo rules (operator correction)

1. A photo appears **only inside a designed component**, every time with at least one of: a device overlap, an annotation card, a diagram pairing, or a card body. **The allowed placements are hero frame, explorer photo card (TV, Wi-Fi), and Condo/House/Office card thumbnails. Nowhere else.**
2. A photo never spans more than 6 of 12 columns on desktop, and is never full-bleed on any breakpoint.
3. A photo never sits behind text. Annotation cards sit **on** photos as white cards.
4. Every photo carries the `STOCK PHOTO` tag, alt text ending "(stock photo)", and a footer credit (§2.10).
5. No people in photos (the available ones with people are off-brand, and stock faces read as fake customers).
6. **Approved files:** `signature-tv-wall-after.jpg` (hero) · `band-detail-mount.jpg` (TV photo card) · `svc-wifi.jpg` (Wi-Fi photo card) · `env-condo.jpg` · `env-townhouse.jpg` · `env-office.jpg`.
   **Banned files:** `outdoor-camera-eave.jpg` (messy cables) · `env-house.jpg` (visible hanging cable) · `smart-lock-door.jpg` and `band-detail-doorbell.jpg` (not smart devices, weathered) · `svc-cameras.jpg` · `tv-concrete-raceway.jpg` (shows switches, not a raceway) · `mesh-wifi-node-shelf.jpg` (a smart speaker; labelling it a mesh node would be false) · `band-skyline.jpg` / `band-biscayne.jpg` (bands are gone) · the hero video.
7. Treatment: no filters, no duotone, no overlays. Only `object-position` crops as specified.

---

## 5. References (take the named thing, copy nothing)

| Reference | URL | Take exactly this |
|---|---|---|
| Stripe homepage | https://stripe.com | Product UI mockups composed as illustration: real-looking UI states, not screenshots, layered with hairline cards. The type scale's jump from a small coloured eyebrow (ours is red) to a big tight display line |
| Linear homepage | https://linear.app | Restraint: hairline borders, a single accent, mono for data, generous section spacing. **Not** the dark theme |
| Apple Home app page | https://www.apple.com/home-app/ | Phone-as-hero with scenes and tiles that change state. One idea per section |
| eero product pages | https://eero.com | The floorplan coverage idea (router alone vs mesh). Ours is flatter and more technical: discrete room fills, not blurry heat |
| Architectural drawing conventions (any wall-section detail sheet) | — | Line-weight hierarchy, hatching for concrete, cutaways, numbered callouts with leaders |

---

## 6. Build map and file naming

| Piece | File |
|---|---|
| Tokens | `src/styles/tokens.css` (done) |
| Phone mockup + 3 hero states | `src/components/ui/PhoneMock.astro` (props: `state: 'camera'\|'lock'\|'wifi'\|'home'`, `width`) · `src/scripts/phone-cycle.ts` |
| Hero | `src/components/sections/Hero.astro` (rewrite) |
| Explorer | `src/components/sections/ServiceExplorer.astro` (replaces `Services.astro` on the page) · `src/scripts/explorer.ts` |
| Diagrams | `src/components/diagrams/DiagramTvWall.astro` · `DiagramWifiPlan.astro` · `DiagramCameraPlan.astro` · `PhoneSmartHome.astro` · `CameraFeed.astro` (illustrated porch/driveway feed, prop `view: 'porch'\|'driveway'`) |
| Quote builder | `src/components/sections/QuoteBuilder.astro` · `src/scripts/quote.ts` · data `quote` export in `src/data/content.ts` |
| How it works | `src/components/sections/Process.astro` (rewrite) + `src/components/vignettes/{PickPrice,SmsConfirm,Checklist,Walkthrough}.astro` |
| Built for | `src/components/sections/Sectors.astro` (rewrite to 3 cards) |
| Reviews / Area / FAQ / Form / Footer / MobileBar / Nav | the existing files, restyled |
| Icons | `src/components/icons/icon-<name>.svg`, 24 grid, 1.5 stroke. Needed: `tv wifi camera home lock thermostat light price sms wall building house office check plus minus phone arrow-right talk snapshot clips` |
| Remove from `index.astro` | `Band`, `Gallery`, `Signature`, `Partners`, and the hero video |

Class and naming conventions: BEM-lite `.explorer__stage`, state attributes rather than classes for JS state (`data-state="concrete"`, `aria-selected`). SVG ids are prefixed per diagram (`tvw-`, `wfp-`, `cmp-`) to avoid collisions.

---

## 7. Never do

- **No section that is just a big image.** No full-width photo bands, photo backgrounds, galleries, carousels or hero video. Photos only inside the components in §4.
- No people photos, no stock faces, no fake avatars.
- No gradients as decoration: no gradient text, no gradient buttons, no mesh-gradient backgrounds, no "aurora" glows. The only gradients allowed are the Wi-Fi node glow and the chrome uses listed in §00.1 (logo, footer hairline, phone rim).
- No dark sections (v3.1: the footer is light too). No dark-mode hero.
- No emoji anywhere (UI, copy, alt text, SMS mock).
- No generic 3D blobs, glassmorphism cards, isometric houses, floating spheres, or AI-generated imagery.
- No icon fonts or filled icon packs. No brand logos of device makers (dealer claims, guardrails).
- No "TechSolutions app" implication. The phone shows the device apps, and the disclaimer line stays.
- No stars, ratings, counts, "trusted by", "licensed", "insured", "certified" or years in business (guardrails).
- No red fill larger than a button, a selected step circle or the live dot. No pink (red-tint) surfaces. No red or orange heat fills in diagrams. No chrome on text, buttons or cards. No recoloured or re-typeset logo.
- No arbitrary values: every colour, space, radius, shadow, duration and font size comes from `tokens.css`. If something is missing, add a token and tell Elena.
- No animation that runs without explaining something. No parallax. Nothing ignores `prefers-reduced-motion`.
- No centred body paragraphs longer than 2 lines.

---

## 8. Acceptance checklist (Mira self-checks before Owen and Ruth)

- [ ] 390px and 1440px screenshots of every section. No horizontal scroll at 360. No text under 12px rendered (diagram labels included).
- [ ] Count the photos: exactly 6 photo instances, all from the approved list, all tagged STOCK, all credited in the footer.
- [ ] Ink appears only in text and the phone bezel. Red is ≤ 8% of any section screenshot. No pink anywhere. The Wi-Fi diagram's only red is the router, the nodes and the wired run.
- [ ] Nav shows the new `logo-horizontal.svg` (red/chrome house + TECHSOLUTIONS). `node scripts/brand-raster.mjs` has been run, and the favicon, apple-touch-icon, `logo-512.png` and `og.png` are the red/silver versions.
- [ ] Every price on the page has a Sample tag, and every dummy value has `// NEEDS DATA` in code.
- [ ] Quote builder: every option combination produces a total or "Price by text". "Book this" prefills `services` and `quote_summary`, and fires `quote_book`.
- [ ] Explorer: tabs work by keyboard. The FAQ link opens TV → Concrete. Diagrams pass §3.5 at 390.
- [ ] Hero phone: stops cycling on interaction and when out of view. Reduced motion means no auto-cycle.
- [ ] Lighthouse mobile: LCP element is the hero photo, ≤ 2.5 s on Slow 4G. CLS < 0.05 (reserve the phone and photo aspect ratios). Total JS for the explorer, quote and phone ≤ 25 KB gzip.
- [ ] Contrast: only the pairs in the `tokens.css` header are used for text.
- [ ] All **NEW** copy in this spec is in `content.ts` and has been sent to Ruth.
