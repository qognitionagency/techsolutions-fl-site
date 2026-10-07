// Rasterises Elena's v3.1 brand SVGs (red / silver / ink, redrawn from the client's IG logo) into the
// PNGs the <head> and JSON-LD reference. Run: node scripts/brand-raster.mjs
//   public/apple-touch-icon.png  180x180  ink tile, full mark
//   public/favicon-32.png        32x32    favicon.svg small-size cut
//   public/brand/logo-512.png    512x512  logo-stacked.svg on white (schema.org Organization.logo)
//   public/brand/og.png          1200x630 logo-stacked-light.svg on ink + concept label
import sharp from 'sharp';

const pub = new URL('../public/', import.meta.url).pathname;
const INK = '#0E0F11';        // tokens.css --color-slate (ink)
const INK_MUTED = '#BFC4CA';  // tokens.css --color-steel-300 (text-inverse-muted), 10.9:1 on ink
const WHITE = '#FFFFFF';

await sharp(`${pub}brand/apple-touch-icon.svg`, { density: 300 })
  .resize(180, 180).flatten({ background: INK }).png().toFile(`${pub}apple-touch-icon.png`);

await sharp(`${pub}brand/favicon.svg`, { density: 300 })
  .resize(32, 32).png().toFile(`${pub}favicon-32.png`);

await sharp(`${pub}brand/logo-stacked.svg`, { density: 600 })
  .resize(512, 512).flatten({ background: WHITE }).png().toFile(`${pub}brand/logo-512.png`);

// OG: the client's logo as they show it (on black), centred, with the concept disclosure.
// Logo box 520x520 -> visible lockup ~385 x 366 (box y 77-442). Block (lockup + 36 gap + label) centred.
const LOGO = 520;
const logo = await sharp(`${pub}brand/logo-stacked-light.svg`, { density: 600 }).resize(LOGO, LOGO).png().toBuffer();
// Text from content.ts ribbon.text, per Elena: the OG image travels without the page ribbon.
const label = Buffer.from(
  `<svg width="1200" height="60" xmlns="http://www.w3.org/2000/svg"><text x="600" y="38" text-anchor="middle" font-family="Menlo, monospace" font-size="20" letter-spacing="1" fill="${INK_MUTED}">Concept site by Qognition — sample content</text></svg>`
);
await sharp({ create: { width: 1200, height: 630, channels: 3, background: INK } })
  .composite([
    { input: logo, left: Math.round((1200 - LOGO) / 2), top: 25 },
    { input: label, left: 0, top: 500 },
  ])
  .png()
  .toFile(`${pub}brand/og.png`);

console.log('brand rasters written');
