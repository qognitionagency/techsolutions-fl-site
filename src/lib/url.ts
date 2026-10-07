/**
 * The only way to build a URL to something in public/ or to an in-page anchor
 * (ADR 0001 §5). Joins BASE_URL and path without doubling slashes, so the same
 * build works at / and at /techsolutions-fl-site/.
 */
export function withBase(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  if (/^(?:[a-z]+:)?\/\//i.test(path) || /^(mailto|tel|sms):/i.test(path)) return path;
  // In-page anchors stay bare: "/#book" would reload the page (and drop ?utm_*/?service=)
  // whenever the current URL has a query. A bare fragment is base-independent.
  if (path.startsWith('#')) return path;
  const clean = path.replace(/^\/+/, '');
  return `${base}/${clean}`;
}

/** Absolute URL (for canonical, OG, JSON-LD, sitemap, llms.txt). */
export function absolute(path = '/', site?: URL): string {
  const origin = site ?? new URL('http://localhost:4321');
  return new URL(withBase(path), origin).href;
}
