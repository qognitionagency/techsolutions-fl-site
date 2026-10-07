import type { APIRoute } from 'astro';
import { contact, faq, footer, meta, serviceArea, services } from '../data/content';
import { absolute } from '../lib/url';

/**
 * llms.txt (seo-spec §6). Observed facts only: no sample prices, phone or
 * reviews. Every string comes from content.ts so it matches the page.
 */
export const GET: APIRoute = ({ site }) => {
  const url = (hash: string) => absolute(`/#${hash}`, site);
  // First sentence, or first two when the first is too short to stand alone.
  const firstSentence = (s: string) => {
    const parts = s.match(/[^.]+\./g) ?? [s];
    return (parts[0].length < 40 && parts[1] ? parts[0] + parts[1] : parts[0]).trim();
  };
  const body = [
    `# ${meta.siteName}`,
    '',
    `> ${footer.tagline} Instagram: ${contact.instagramHandle}.`,
    '',
    footer.sampleNotice,
    '',
    '## Services',
    ...services.items.map((s) => `- [${s.h3}](${url(services.id)}): ${firstSentence(s.body)}`),
    '',
    '## Answers',
    ...faq.items.map((f) => `- [${f.q}](${url(faq.id)})`),
    '',
    '## Contact',
    `- [Instagram ${contact.instagramHandle}](${contact.instagramUrl})`,
    `- [${serviceArea.h2}](${url(serviceArea.id)})`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
