import type { APIRoute } from 'astro';
import { anchors, contact, faq, footer, meta, ribbon, serviceArea, services } from '../data/content';
import { absolute } from '../lib/url';

/**
 * llms.txt (seo-spec §6). Observed facts and service descriptions only: no sample prices,
 * phone or reviews. Every string comes from content.ts so it matches the page.
 */
export const GET: APIRoute = ({ site }) => {
  const url = (hash: string) => absolute(`/#${hash}`, site);
  const body = [
    `# ${meta.ogSiteName}`,
    '',
    `> ${footer.tagline} ${contact.instagramHandle}.`,
    '',
    ribbon.disclosure,
    '',
    '## Services',
    ...services.tiles.map((t) => `- [${t.heading}](${url(anchors.services)}): ${t.lede}`),
    '',
    '## Answers',
    ...faq.items.map((q) => `- [${q.question}](${url(anchors.faq)})`),
    '',
    '## Contact',
    `- [Instagram ${contact.instagramHandle}](${contact.instagramUrl})`,
    `- [${serviceArea.heading}](${url(anchors.area)})`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
