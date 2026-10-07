/**
 * Media lookup by slot (ADR §2). Photos and posters live in src/assets/media and
 * go through astro:assets; videos live in public/media and are served as-is.
 */
import type { ImageMetadata } from 'astro';
import credits from '../data/media-credits.json';
import { withBase } from './url';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/media/*.jpg', { eager: true });

const bySlot = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(files)) {
  const slot = path.split('/').pop()!.replace(/\.jpg$/, '');
  bySlot.set(slot, mod.default);
}

export function getImage(slot: string): ImageMetadata {
  const img = bySlot.get(slot);
  if (!img) throw new Error(`media: no image for slot "${slot}". Run \`npm run media\` or add it to media-manifest.json.`);
  return img;
}

export function poster(slot: string): ImageMetadata {
  return getImage(`${slot}-poster`);
}

export function videoSrc(slot: string): string {
  return withBase(`media/${slot}.mp4`);
}

export interface Credit {
  slot: string;
  type: 'photo' | 'video';
  pexelsId: number;
  pageUrl: string;
  author: string;
  authorUrl: string;
  file: string;
}

/** Unique authors, in manifest order, for the footer credit line. */
export function creditAuthors(): { author: string; authorUrl: string }[] {
  const seen = new Set<string>();
  return (credits as Credit[]).filter((c) => !seen.has(c.author) && !!seen.add(c.author));
}
