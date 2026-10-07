// Rasterises Elena's SVGs into the PNGs the <head> and JSON-LD reference, and builds a
// PROVISIONAL og.png to art-direction §5.6 (Elena to replace). Run: node scripts/brand-raster.mjs
import sharp from 'sharp';

const pub = new URL('../public/', import.meta.url).pathname;
const media = new URL('../src/assets/media/', import.meta.url).pathname;
const CLOUD = '#F5F8FC'; // tokens.css --color-cloud
const SLATE = '#1E2A3B'; // tokens.css --color-slate

await sharp(`${pub}brand/apple-touch-icon.svg`, { density: 300 }).resize(180, 180).flatten({ background: '#1A6BFF' }).png().toFile(`${pub}apple-touch-icon.png`);
await sharp(`${pub}brand/favicon.svg`, { density: 300 }).resize(32, 32).png().toFile(`${pub}favicon-32.png`);
await sharp(`${pub}brand/logo-mark.svg`, { density: 600 }).resize(448, 448).extend({ top: 32, bottom: 32, left: 32, right: 32, background: '#FFFFFF' }).flatten({ background: '#FFFFFF' }).png().toFile(`${pub}brand/logo-512.png`);

const logo = await sharp(`${pub}brand/logo-horizontal.svg`, { density: 400 }).resize({ width: 520 }).png().toBuffer();
const lm = await sharp(logo).metadata();
const strip = await sharp(`${media}hero-tv-wall-poster.jpg`).resize(1200, 280, { fit: 'cover', position: 'centre' }).toBuffer();
// Text from content.ts ribbon.text, per Elena: the OG image travels without the page ribbon.
const label = Buffer.from(`<svg width="1200" height="60" xmlns="http://www.w3.org/2000/svg"><text x="600" y="38" text-anchor="middle" font-family="Menlo, monospace" font-size="20" letter-spacing="1" fill="${SLATE}">Concept site by Qognition — sample content</text></svg>`);
await sharp({ create: { width: 1200, height: 630, channels: 3, background: CLOUD } })
  .composite([
    { input: logo, left: Math.round((1200 - lm.width) / 2), top: Math.round(630 * 0.38 - lm.height / 2) - 60 },
    { input: label, left: 0, top: 230 },
    { input: strip, left: 0, top: 350 },
  ])
  .png()
  .toFile(`${pub}brand/og.png`);
console.log('brand rasters written');
