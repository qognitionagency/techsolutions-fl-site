/**
 * Media lookup by slot (ADR §2). Photos and video posters live in src/assets/media
 * as <slot>.jpg / <slot>-poster.jpg and go through astro:assets; videos live in
 * public/media/<slot>.mp4 and are served as-is.
 */
import type { ImageMetadata } from 'astro';
import credits from '../data/media-credits.json';
import { withBase } from './url';

// Only the slots the page renders (USED_SLOTS below). An eager '*.jpg' glob made Astro emit the
// original of every stock photo in src/assets/media into dist (~13 MB, 16 never shown). Globs
// must be literals: add the file here AND to USED_SLOTS when a component starts using a slot.
const files = import.meta.glob<{ default: ImageMetadata }>(
  [
    '/src/assets/media/signature-tv-wall-after.jpg',
    '/src/assets/media/band-detail-mount.jpg',
    '/src/assets/media/svc-wifi.jpg',
    '/src/assets/media/env-condo.jpg',
    '/src/assets/media/env-townhouse.jpg',
    '/src/assets/media/env-office.jpg',
  ],
  { eager: true },
);
const bySlot = new Map<string, ImageMetadata>(
  Object.entries(files).map(([path, mod]) => [path.split('/').pop()!.replace(/\.jpg$/, ''), mod.default]),
);

export function getMedia(slot: string): ImageMetadata {
  const img = bySlot.get(slot);
  if (!img) throw new Error(`media: no file for slot "${slot}". Run \`npm run media\` or check media-manifest.json.`);
  return img;
}

export const poster = (slot: string): ImageMetadata => getMedia(`${slot}-poster`);
export const videoSrc = (slot: string): string => withBase(`media/${slot}.mp4`);

export interface Credit {
  slot: string;
  type: 'photo' | 'video';
  pexelsId: number;
  pageUrl: string;
  author: string;
  authorUrl: string;
  file: string;
}

/**
 * Every stock slot the v3 page renders (design-spec-v3 §4.6 approved list). The footer credits
 * exactly these. Add a slot here when a component starts using it.
 */
export const USED_SLOTS = ['signature-tv-wall-after', 'band-detail-mount', 'svc-wifi', 'env-condo', 'env-townhouse', 'env-office'] as const;

/** Pexels authors of the given slots, one entry each, in manifest order (footer credit, Pexels terms). */
export function stockAuthors(slots: readonly string[] = USED_SLOTS): { author: string; authorUrl: string }[] {
  const seen = new Map<string, string>();
  for (const c of credits as Credit[]) if (slots.includes(c.slot) && c.author && c.authorUrl && !seen.has(c.author)) seen.set(c.author, c.authorUrl);
  return [...seen].map(([author, authorUrl]) => ({ author, authorUrl }));
}
