#!/usr/bin/env node
// Pexels media fetcher (ADR 0001 §4). Node built-ins + global fetch only.
// Never imported by src/. Never prints the API key.
//
//   npm run media                      fetch every manifest entry that is missing on disk
//   npm run media -- --force           re-download everything
//   npm run media -- --only=<slot>     limit to one slot
//   npm run media -- --force-posters   also replace video posters with Pexels' 1200x630 `image`
//   npm run media -- --search=<slot> [--page=N]
//        list candidates for a slot's query and save small previews to media-raw/preview/<slot>/
//        so a human can look at them before pinning an id.
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = join(ROOT, 'media-manifest.json');
const PHOTO_DIR = join(ROOT, 'src/assets/media');
const VIDEO_DIR = join(ROOT, 'public/media');
const CREDITS = join(ROOT, 'src/data/media-credits.json');
const PREVIEW_DIR = join(ROOT, 'media-raw/preview');

const MAX_VIDEO_EDGE = 1920;
const MAX_VIDEO_BYTES = 6 * 1024 * 1024;

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);

const KEY = process.env.PEXELS_API_KEY;
if (!KEY) {
  console.error('fetch-media: PEXELS_API_KEY is not set. Put it in .env (gitignored) and run `npm run media`.');
  process.exit(1);
}

const exists = (p) => access(p).then(() => true, () => false);

async function api(path) {
  const res = await fetch(`https://api.pexels.com${path}`, { headers: { Authorization: KEY } });
  if (!res.ok) throw new Error(`Pexels ${res.status} on ${path.split('?')[0]}`);
  const left = res.headers.get('x-ratelimit-remaining');
  if (left && Number(left) < 20) console.warn(`  rate limit: ${left} requests left this hour`);
  return res.json();
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status} for ${dest}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  return buf.length;
}

function searchPath(entry, page = 1) {
  const q = encodeURIComponent(entry.query);
  const o = entry.orientation ? `&orientation=${entry.orientation}` : '';
  const c = entry.color ? `&color=${entry.color}` : '';
  return entry.type === 'video'
    ? `/videos/search?query=${q}${o}&size=large&per_page=24&page=${page}`
    : `/v1/search?query=${q}${o}${c}&size=large&per_page=24&page=${page}`;
}

async function resolve(entry) {
  if (entry.id) {
    return entry.type === 'video' ? api(`/videos/videos/${entry.id}`) : api(`/v1/photos/${entry.id}`);
  }
  if (!entry.query) throw new Error(`slot "${entry.slot}" has neither id nor query`);
  const data = await api(searchPath(entry));
  const list = entry.type === 'video' ? data.videos : data.photos;
  if (!list?.length) throw new Error(`no results for slot "${entry.slot}" (query "${entry.query}")`);
  console.log(`  resolved "${entry.slot}" by search -> id ${list[0].id}. Pin it in media-manifest.json.`);
  return list[0];
}

async function contentLength(url) {
  const res = await fetch(url, { method: 'HEAD' });
  return Number(res.headers.get('content-length') ?? 0);
}

async function pickVideoFile(video, slot) {
  const mp4 = video.video_files.filter((f) => f.file_type === 'video/mp4' && f.width && f.height);
  mp4.sort((a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height));
  for (const f of mp4) {
    if (Math.max(f.width, f.height) > MAX_VIDEO_EDGE) continue;
    const size = f.size ?? (await contentLength(f.link));
    if (size && size <= MAX_VIDEO_BYTES) return { ...f, size };
  }
  throw new Error(`slot "${slot}": no MP4 rendition <= ${MAX_VIDEO_EDGE}px and <= 6 MB (video ${video.id})`);
}

async function searchMode(slot) {
  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
  const entry = manifest.find((e) => e.slot === slot);
  if (!entry) throw new Error(`no slot "${slot}" in manifest`);
  const query = typeof args.query === 'string' ? args.query : entry.query;
  const data = await api(searchPath({ ...entry, query }, Number(args.page ?? 1)));
  const list = entry.type === 'video' ? data.videos : data.photos;
  const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const dir = join(PREVIEW_DIR, slot, `${slug}-p${args.page ?? 1}`);
  console.log(`${list.length} candidates for "${query}" -> ${dir}`);
  for (const item of list) {
    const thumb = entry.type === 'video' ? item.image : `${item.src.original}?auto=compress&cs=tinysrgb&w=900`;
    const name = `${item.id}.jpg`;
    await download(thumb, join(dir, name));
    const meta =
      entry.type === 'video'
        ? `${item.width}x${item.height} ${item.duration}s by ${item.user?.name}`
        : `${item.width}x${item.height} by ${item.photographer} — ${item.alt ?? ''}`;
    console.log(`  ${item.id}  ${meta}`);
  }
}

async function main() {
  if (typeof args.search === 'string') return searchMode(args.search);

  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
  const credits = (await exists(CREDITS)) ? JSON.parse(await readFile(CREDITS, 'utf8')) : [];
  const bySlot = new Map(credits.map((c) => [c.slot, c]));
  const force = Boolean(args.force);
  let failed = false;

  for (const entry of manifest) {
    if (typeof args.only === 'string' && entry.slot !== args.only) continue;
    if (entry.source === 'client') {
      console.log(`- ${entry.slot}: client-owned (${entry.file}), copied by hand. Skipping.`);
      continue;
    }
    const isVideo = entry.type === 'video';
    const target = isVideo ? join(VIDEO_DIR, `${entry.slot}.mp4`) : join(PHOTO_DIR, `${entry.slot}.jpg`);
    const poster = join(PHOTO_DIR, `${entry.slot}-poster.jpg`);
    if (!force && (await exists(target)) && (!isVideo || (await exists(poster))) && bySlot.get(entry.slot)?.pexelsId === entry.id) {
      console.log(`- ${entry.slot}: present, skipping (use --force to refetch)`);
      continue;
    }
    try {
      console.log(`- ${entry.slot}: fetching`);
      const item = await resolve(entry);
      if (isVideo) {
        const file = await pickVideoFile(item, entry.slot);
        const bytes = await download(file.link, target);
        // Pexels' `image` is a 1200x630 crop. The committed posters are full-res first frames
        // grabbed in a browser (no ffmpeg), so only fall back to `image` when no poster exists.
        if (!(await exists(poster)) || args['force-posters']) await download(`${item.image}`, poster);
        console.log(`  video ${item.id}: ${file.width}x${file.height}, ${(bytes / 1048576).toFixed(2)} MB`);
        bySlot.set(entry.slot, {
          slot: entry.slot,
          type: 'video',
          pexelsId: item.id,
          pageUrl: item.url,
          author: item.user?.name ?? 'Pexels contributor',
          authorUrl: item.user?.url ?? 'https://www.pexels.com',
          file: `public/media/${entry.slot}.mp4`,
        });
      } else {
        const bytes = await download(`${item.src.original}?auto=compress&cs=tinysrgb&w=2560`, target);
        console.log(`  photo ${item.id}: ${item.width}x${item.height} source, ${(bytes / 1048576).toFixed(2)} MB saved`);
        if (args.raw) await download(item.src.original, join(ROOT, 'media-raw', `${entry.slot}-original.jpg`));
        bySlot.set(entry.slot, {
          slot: entry.slot,
          type: 'photo',
          pexelsId: item.id,
          pageUrl: item.url,
          author: item.photographer,
          authorUrl: item.photographer_url,
          file: `src/assets/media/${entry.slot}.jpg`,
        });
      }
    } catch (err) {
      failed = true;
      console.error(`  FAILED ${entry.slot}: ${err.message}`);
    }
  }

  const order = manifest.map((e) => e.slot);
  const out = [...bySlot.values()]
    .filter((c) => order.includes(c.slot))
    .sort((a, b) => order.indexOf(a.slot) - order.indexOf(b.slot));
  await mkdir(dirname(CREDITS), { recursive: true });
  await writeFile(CREDITS, JSON.stringify(out, null, 2) + '\n');
  console.log(`credits: ${out.length} entries -> src/data/media-credits.json`);
  if (failed) process.exit(1);
}

main().catch((err) => {
  console.error(`fetch-media: ${err.message}`);
  process.exit(1);
});
