/**
 * Indexing switch and promotion gate (ADR §5, seo-spec §1).
 * Concept mode (default): noindex,nofollow meta. robots.txt still lets search
 * crawlers in so they can read that meta (operator ruling, 2026-10-07).
 * PUBLIC_INDEXABLE=true fails the build while any NEEDS DATA item remains.
 */
import { needsData } from '../data/content';

export const indexable = import.meta.env.PUBLIC_INDEXABLE === 'true';

if (indexable && needsData.length > 0) {
  throw new Error(
    `PUBLIC_INDEXABLE=true but content.ts still lists ${needsData.length} NEEDS DATA items ` +
      `(${needsData.map((n) => n.key).join(', ')}). Replace the sample content before indexing.`,
  );
}
