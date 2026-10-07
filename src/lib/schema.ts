/**
 * JSON-LD graph (seo-spec §5), built from content.ts so every string matches
 * the visible page (Ruth, 2026-10-07). No Review / AggregateRating: reviews are
 * samples. Video doorbells sit under the Cameras service (MARS ruling).
 */
import { contact, faq, footer, meta, nav, serviceArea, services, type ServiceCard } from '../data/content';
import { absolute } from './url';

/** Structured-data facts that are not page copy: schema.org types and Wikipedia entity links. */
const SERVICE_TYPE: Record<ServiceCard['id'], { slug: string; serviceType: string }> = {
  tv: { slug: 'tv', serviceType: 'TV mounting' },
  wifi: { slug: 'wifi', serviceType: 'Home network installation' },
  cameras: { slug: 'cameras', serviceType: 'Security camera installation' },
  smart: { slug: 'smarthome', serviceType: 'Smart home installation' },
};

const PLACE_SAMEAS: Record<string, { type: string; sameAs: string }> = {
  'Downtown Miami': { type: 'Place', sameAs: 'https://en.wikipedia.org/wiki/Downtown_Miami' },
  Brickell: { type: 'Place', sameAs: 'https://en.wikipedia.org/wiki/Brickell' },
  Edgewater: { type: 'Place', sameAs: 'https://en.wikipedia.org/wiki/Edgewater,_Miami' },
  Wynwood: { type: 'Place', sameAs: 'https://en.wikipedia.org/wiki/Wynwood' },
  'Coconut Grove': { type: 'Place', sameAs: 'https://en.wikipedia.org/wiki/Coconut_Grove' },
  'Coral Gables': { type: 'City', sameAs: 'https://en.wikipedia.org/wiki/Coral_Gables,_Florida' },
  Doral: { type: 'City', sameAs: 'https://en.wikipedia.org/wiki/Doral,_Florida' },
  Kendall: { type: 'Place', sameAs: 'https://en.wikipedia.org/wiki/Kendall,_Florida' },
  'Miami Beach': { type: 'City', sameAs: 'https://en.wikipedia.org/wiki/Miami_Beach,_Florida' },
};

/** Observed names for the same business (seo-spec §5 alternateName). */
const ALTERNATE_NAMES = ['TechSolutions Smart Home Installations', 'tech_solutionsfl'];

export function buildSchema(site: URL | undefined) {
  const SITE = absolute('/', site);
  const id = (frag: string) => `${SITE}#${frag}`;
  const sampleNote = services.footnote;

  const offer = (name: string, amount: number) => ({
    '@type': 'Offer',
    name,
    priceSpecification: { '@type': 'PriceSpecification', minPrice: amount, priceCurrency: 'USD' },
    description: sampleNote,
  });

  const serviceNodes = services.items.map((s) => {
    const t = SERVICE_TYPE[s.id];
    const offers = [offer(s.h3, s.fromPrice.amount)];
    if (s.alsoFrom) offers.push(offer(s.alsoFrom.label, s.alsoFrom.price.amount));
    return {
      '@type': 'Service',
      '@id': id(`service-${t.slug}`),
      name: s.h3,
      serviceType: t.serviceType,
      description: `${s.body} ${s.points.join('. ')}.`,
      provider: { '@id': id('business') },
      offers: offers.length === 1 ? offers[0] : offers,
    };
  });

  const areaServed = [
    { '@type': 'AdministrativeArea', name: 'Miami-Dade County', sameAs: 'https://en.wikipedia.org/wiki/Miami-Dade_County,_Florida' },
    { '@type': 'AdministrativeArea', name: 'Broward County', sameAs: 'https://en.wikipedia.org/wiki/Broward_County,_Florida' },
    { '@type': 'City', name: 'Miami', sameAs: 'https://en.wikipedia.org/wiki/Miami' },
    ...serviceArea.neighborhoods.map((n) => ({ '@type': PLACE_SAMEAS[n]?.type ?? 'Place', name: n, ...(PLACE_SAMEAS[n] ? { sameAs: PLACE_SAMEAS[n].sameAs } : {}) })),
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HomeAndConstructionBusiness',
        '@id': id('business'),
        name: nav.logoAlt,
        alternateName: ALTERNATE_NAMES,
        description: footer.tagline,
        url: SITE,
        logo: absolute('brand/logo-512.png', site),
        image: absolute(meta.ogImage, site),
        telephone: contact.phoneE164, // NEEDS DATA: fictional 555-01XX until Jay supplies his number
        address: { '@type': 'PostalAddress', addressLocality: 'Miami', addressRegion: 'FL', addressCountry: 'US' },
        areaServed,
        sameAs: [contact.instagramUrl],
        knowsAbout: services.items.map((s) => s.h3),
      },
      {
        '@type': 'WebSite',
        '@id': id('website'),
        url: SITE,
        name: meta.siteName,
        inLanguage: meta.lang,
        publisher: { '@id': id('business') },
      },
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
        mainEntity: faq.items.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
}
