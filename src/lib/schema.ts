/**
 * JSON-LD graph (seo-spec §5), built from content.ts so every string matches the visible
 * page (Ruth, 2026-10-07). FAQPage mainEntity = faq.items verbatim. No Review /
 * AggregateRating: the reviews are samples. Video doorbells sit under the Cameras
 * service (MARS ruling; the tile heading names them).
 */
import { contact, faq, footer, meta, serviceArea, services, type QuoteServiceKey } from '../data/content';
import { absolute } from './url';

/** Structured-data facts, not page copy: schema.org serviceType per tile. */
const SERVICE_TYPE: Record<QuoteServiceKey, string> = {
  tv: 'TV mounting',
  wifi: 'Home network installation',
  cameras: 'Security camera installation',
  smart: 'Smart home installation',
};

const PLACE: Record<string, { type: string; sameAs: string }> = {
  'Downtown Miami': { type: 'Place', sameAs: 'https://en.wikipedia.org/wiki/Downtown_Miami' },
  Brickell: { type: 'Place', sameAs: 'https://en.wikipedia.org/wiki/Brickell' },
  Edgewater: { type: 'Place', sameAs: 'https://en.wikipedia.org/wiki/Edgewater,_Miami' },
  Wynwood: { type: 'Place', sameAs: 'https://en.wikipedia.org/wiki/Wynwood' },
  'Coconut Grove': { type: 'Place', sameAs: 'https://en.wikipedia.org/wiki/Coconut_Grove' },
  'Coral Gables': { type: 'City', sameAs: 'https://en.wikipedia.org/wiki/Coral_Gables,_Florida' },
  Doral: { type: 'City', sameAs: 'https://en.wikipedia.org/wiki/Doral,_Florida' },
  Kendall: { type: 'Place', sameAs: 'https://en.wikipedia.org/wiki/Kendall,_Florida' },
  'Miami Beach': { type: 'City', sameAs: 'https://en.wikipedia.org/wiki/Miami_Beach,_Florida' },
  Aventura: { type: 'City', sameAs: 'https://en.wikipedia.org/wiki/Aventura,_Florida' },
  Hollywood: { type: 'City', sameAs: 'https://en.wikipedia.org/wiki/Hollywood,_Florida' },
  'Fort Lauderdale': { type: 'City', sameAs: 'https://en.wikipedia.org/wiki/Fort_Lauderdale,_Florida' },
};
const COUNTY: Record<string, string> = {
  'Miami-Dade County': 'https://en.wikipedia.org/wiki/Miami-Dade_County,_Florida',
  'Broward County': 'https://en.wikipedia.org/wiki/Broward_County,_Florida',
};

/** Observed names for the same business (seo-spec §5 alternateName). */
const ALTERNATE_NAMES = ['TechSolutions Smart Home Installations', 'tech_solutionsfl'];

export function buildSchema(site: URL | undefined) {
  const SITE = absolute('/', site);
  const id = (frag: string) => `${SITE}#${frag}`;
  const offer = (name: string, amount: number) => ({
    '@type': 'Offer',
    name,
    priceSpecification: { '@type': 'PriceSpecification', minPrice: amount, priceCurrency: 'USD' },
    description: services.footnote,
  });

  // v3: the explorer tabs are the services (content.ts services.tabs).
  const serviceNodes = services.tabs.map((t) => {
    const offers = [offer(t.title, t.price.amount)];
    if ('alsoFrom' in t && t.alsoFrom) offers.push(offer(t.alsoFrom.label, t.alsoFrom.price.amount));
    return {
      '@type': 'Service',
      '@id': id(`service-${t.key}`),
      name: t.title,
      serviceType: SERVICE_TYPE[t.key],
      description: t.pitch.join(' '),
      provider: { '@id': id('business') },
      ...(offers.length ? { offers: offers.length === 1 ? offers[0] : offers } : {}),
    };
  });

  const areaServed = [
    ...serviceArea.counties.map((c) => ({ '@type': 'AdministrativeArea', name: c, ...(COUNTY[c] ? { sameAs: COUNTY[c] } : {}) })),
    { '@type': 'City', name: 'Miami', sameAs: 'https://en.wikipedia.org/wiki/Miami' },
    ...serviceArea.cities.map((n) => ({ '@type': PLACE[n]?.type ?? 'Place', name: n, ...(PLACE[n] ? { sameAs: PLACE[n].sameAs } : {}) })),
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HomeAndConstructionBusiness',
        '@id': id('business'),
        name: contact.businessName,
        alternateName: ALTERNATE_NAMES,
        description: footer.tagline,
        url: SITE,
        logo: absolute('brand/logo-512.png', site),
        image: absolute(meta.ogImage, site),
        telephone: contact.phoneE164, // NEEDS DATA: fictional 555-01XX until Jay supplies his number
        address: { '@type': 'PostalAddress', addressLocality: 'Miami', addressRegion: 'FL', addressCountry: 'US' },
        areaServed,
        sameAs: [contact.instagramUrl],
        knowsAbout: services.tabs.map((t) => t.title),
      },
      { '@type': 'WebSite', '@id': id('website'), url: SITE, name: meta.ogSiteName, inLanguage: meta.lang, publisher: { '@id': id('business') } },
      {
        '@type': 'WebPage',
        '@id': id('webpage'),
        url: SITE,
        name: meta.title,
        description: meta.description,
        isPartOf: { '@id': id('website') },
        about: { '@id': id('business') },
        primaryImageOfPage: absolute(meta.ogImage, site),
        inLanguage: meta.lang,
      },
      ...serviceNodes,
      {
        '@type': 'FAQPage',
        '@id': id('faq'),
        isPartOf: { '@id': id('webpage') },
        mainEntity: faq.items.map((q) => ({ '@type': 'Question', name: q.question, acceptedAnswer: { '@type': 'Answer', text: q.answer } })),
      },
    ],
  };
}
