import type { APIRoute } from 'astro';
import { absolute } from '../lib/url';
import { indexable } from '../lib/indexing';

/**
 * Operator ruling (2026-10-07): no `Disallow: /`. Search crawlers must be able to
 * fetch the page to see its noindex meta. AI-training crawlers are kept out in
 * concept mode so sample prices/phone/reviews are not attached to the real
 * business name (seo-spec §1). Rollback: drop the AI block below.
 * The sitemap is only advertised once the site is indexable (seo-spec §1).
 */
const AI_TRAINING = ['GPTBot', 'ClaudeBot', 'CCBot', 'Google-Extended', 'Applebot-Extended', 'PerplexityBot'];

export const GET: APIRoute = ({ site }) => {
  const lines = ['User-agent: *', 'Allow: /', ''];
  if (!indexable) for (const ua of AI_TRAINING) lines.push(`User-agent: ${ua}`, 'Disallow: /', '');
  if (indexable) lines.push(`Sitemap: ${absolute('sitemap.xml', site)}`);
  return new Response(lines.join('\n').trim() + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
