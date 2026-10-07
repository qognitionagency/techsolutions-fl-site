/**
 * Media lookup by slot (ADR §2). Photos and video posters live in src/assets/media
 * as <slot>.jpg / <slot>-poster.jpg and go through astro:assets; videos live in
 * public/media/<slot>.mp4 and are served as-is.
 */
import type { ImageMetadata } from 'astro';
import credits from '../data/media-credits.json';
import { withBase } from './url';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/media/*.jpg', { eager: true });
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

/** Pexels authors, one entry each, in manifest order (footer credit line, Pexels API terms). */
export function stockAuthors(): { author: string; authorUrl: string }[] {
  const seen = new Map<string, string>();
  for (const c of credits as Credit[]) if (c.author && c.authorUrl && !seen.has(c.author)) seen.set(c.author, c.authorUrl);
  return [...seen].map(([author, authorUrl]) => ({ author, authorUrl }));
}
