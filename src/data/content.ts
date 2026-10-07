/**
 * TechSolutions FL — all page copy for the one-page concept site.
 *
 * Author: Theo (content), under MARS. 2026-10-07.
 * Written against: context.md, guardrails.md, brand-voice.md, research-brief.md,
 * seo-spec.md (Nadia), cro-spec.md (Marcus), ADR 0001.
 * Mirror for review: ~/qognition-ops/clients/techsolutions-fl/deliverables/2026-10-landing/page-copy.md
 * Status: DRAFT until Ruth (brand-guard) passes it.
 *
 * Rules for whoever imports this:
 * - Copy lives only here (ADR §2). Components never hard-code strings.
 * - Every dummy value carries a `// NEEDS DATA:` comment and, where it renders, a `sample: true` flag.
 *   Render a visible "Sample" label wherever `sample` is true (guardrails, Required disclosures).
 * - Promotion gate (seo-spec §1): when PUBLIC_INDEXABLE === 'true', the build must fail while
 *   `needsData` below is non-empty or any `sample: true` remains.
 * - Template tokens in braces ({firstName}, {last4}, {service}, {n}, {ref}, {email}, {count}) are
 *   replaced at runtime by the form/picker scripts.
 * - "Miami" appears in headings only in: hero H1, services H2, service-area H2, FAQ H2 (seo-spec §2).
 * - Concrete walls: in-wall concealment on drywall only. Solid concrete = paint-matched raceway.
 *   Never edit a string here to promise in-wall on solid concrete.
 * - Never add "licensed", "insured", "certified", "bonded", years in business, job counts or ratings.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ServiceId = 'tv' | 'wifi' | 'cameras' | 'smart';

export interface Link {
  label: string;
  href: string;
  /** data-track value */
  track?: 'cta_click' | 'call_click' | 'text_click' | 'outbound_click';
  /** data-track-id value (cro-spec §2) */
  trackId?: string;
  ariaLabel?: string;
  external?: boolean;
}

export interface Price {
  /** Whole US dollars. Rendered in Geist Mono with the sunset badge. */
  amount: number;
  /** Rendered as "from $129" */
  prefix: 'from';
  /** e.g. "per TV", "for 2 cameras" */
  unit?: string;
  sample: true;
}

export interface Meta {
  lang: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageAlt: string;
  ogType: string;
  ogLocale: string;
  twitterCard: string;
  siteName: string;
}

export interface Contact {
  phoneDisplay: string;
  phoneE164: string;
  tel: string;
  /** sms: base. Append encodeURIComponent(body). `?&body=` is the cross-platform form (cro-spec §2, UNVERIFIED on current iOS/Android). */
  smsBase: string;
  email: string;
  instagramHandle: string;
  instagramUrl: string;
  sample: true;
}

export interface Ribbon {
  text: string;
  ariaLabel: string;
}

export interface Nav {
  logoAlt: string;
  homeLabel: string;
  links: Link[];
  phone: Link;
  book: Link;
  menuOpen: string;
  menuClose: string;
}

export interface PickerOption {
  id: ServiceId;
  /** Chip label */
  label: string;
  /** Result-card heading */
  name: string;
  fromPrice: Price;
  /** Optional second price line under the main one */
  alsoFrom?: { label: string; price: Price };
  includes: string[];
  cta: Link;
  textLink: Link;
  /** Pre-filled SMS body for this service */
  smsBody: string;
  /** Visual slot hint for Elena/Mira */
  iconSlot: string;
}

export interface Hero {
  kicker: string;
  h1: string;
  sub: string;
  jay: { name: string; role: string; photoAlt: string; sample: true };
  posterAlt: string;
  picker: {
    legend: string;
    defaultId: ServiceId;
    options: PickerOption[];
    sampleNote: string;
  };
}

export interface PromiseItem {
  title: string;
  body: string;
  sample: true;
}

export interface Promises {
  /** H2, visually hidden (seo-spec §3) */
  srHeading: string;
  sampleLabel: string;
  items: PromiseItem[];
}

export interface ServiceCard {
  id: ServiceId;
  h3: string;
  body: string;
  fromPrice: Price;
  alsoFrom?: { label: string; price: Price; cta: Link };
  points: string[];
  cta: Link;
}

export interface Services {
  id: string;
  h2: string;
  intro: string;
  items: ServiceCard[];
  footnote: string;
}

export interface BeforeAfter {
  id: string;
  h2: string;
  body: string;
  wallNote: string;
  beforeLabel: string;
  afterLabel: string;
  beforeAlt: string;
  afterAlt: string;
  sliderAriaLabel: string;
  caption: string;
  cta: Link;
}

export interface Step {
  n: number;
  h3: string;
  body: string;
}

export interface HowItWorks {
  id: string;
  h2: string;
  steps: Step[];
  cta: Link;
  textLink: Link;
}

export interface WorkItem {
  slot: string;
  caption: string;
  alt: string;
  tag: string;
  label: string;
  sample: true;
}

export interface RecentWork {
  id: string;
  h2: string;
  intro: string;
  items: WorkItem[];
  instagramLink: Link;
}

export interface Review {
  quote: string;
  firstName: string;
  neighborhood: string;
  service: string;
  label: string;
  sample: true;
}

export interface Reviews {
  id: string;
  h2: string;
  subhead: string;
  items: Review[];
  cta: Link;
}

export interface ServiceArea {
  id: string;
  h2: string;
  body: string;
  neighborhoodsLabel: string;
  neighborhoods: string[];
  outOfAreaNote: string;
  cta: Link;
  sample: true;
}

export interface FaqItem {
  /** faq_open faq_id slug (cro-spec §5) */
  id: string;
  q: string;
  a: string;
}

export interface Faq {
  id: string;
  h2: string;
  items: FaqItem[];
  textLink: Link;
  callLink: Link;
}

export interface Option<V extends string = string> {
  value: V;
  label: string;
}

export interface Field {
  name: string;
  label: string;
  helper?: string;
  options?: Option[];
  errors?: Record<string, string>;
}

export interface Booking {
  id: string;
  h2: string;
  intro: string;
  progress: string;
  stepNames: Record<'service' | 'details' | 'when' | 'contact', string>;
  buttons: { next: string; back: string; submit: string; submitting: string };
  errorSummary: string;
  step1: { heading: string; microcopy: string; services: Field; otherDesc: Field };
  step2: {
    heading: string;
    propertyType: Field;
    coiNeeded: Field;
    tv: { tvCount: Field; tvSize: Field; wallType: Field; wires: Field; hasMount: Field; soundbar: Field };
    wifi: { homeSize: Field; wifiIssue: Field };
    cameras: { cameraCount: Field; cameraLocation: Field; cameraEquipment: Field };
    smart: { smartDevices: Field; rental: Field };
    notes: Field & { counter: string };
  };
  step3: { heading: string; microcopy: string; zip: Field & { outOfArea: string }; timing: Field; date: Field; window: Field };
  step4: {
    heading: string;
    firstName: Field;
    phone: Field;
    email: Field;
    contactPref: Field;
    honeypot: Field;
    consent: string;
    marketingOptIn: string;
  };
  belowSubmit: { reply: string; textLink: Link; callLink: Link };
  success: {
    heading: string;
    byPref: Record<'text' | 'call' | 'email', string>;
    summaryHeading: string;
    summaryLabels: { services: string; zip: string; when: string };
    photoLink: { label: string; smsBody: string };
    nextHeading: string;
    next: string[];
    demoNotice: string;
    demoDetail: string;
  };
  error: {
    banner: string;
    retry: string;
    textInstead: string;
    emailInstead: string;
    mailtoSubject: string;
  };
  timeout: string;
}

export interface Footer {
  tagline: string;
  contactHeading: string;
  links: Link[];
  instagram: Link;
  areaHeading: string;
  areaLine: string;
  hours: string | null;
  spanish: string | null;
  sampleNotice: string;
  pexelsCredit: { label: string; href: string };
  conceptCredit: string;
  legal: string;
}

export interface StickyBar {
  call: Link;
  text: Link;
  book: Link;
  smsBody: string;
}

/* ------------------------------------------------------------------ */
/* Shared contact (dummy)                                              */
/* ------------------------------------------------------------------ */

export const contact: Contact = {
  phoneDisplay: '(305) 555-0142', // NEEDS DATA: Jay's real phone. Fictional 555-01XX range so a demo tap rings no one.
  phoneE164: '+13055550142', // NEEDS DATA: Jay's real phone. Matches schema telephone in seo-spec §5.
  tel: 'tel:+13055550142', // NEEDS DATA: Jay's real phone
  smsBase: 'sms:+13055550142?&body=', // NEEDS DATA: Jay's real mobile (text-first per IG "Text or call" highlight)
  email: 'book@techsolutionsfl.example', // NEEDS DATA: Jay's real email. .example TLD cannot deliver.
  instagramHandle: '@tech_solutionsfl', // observed 2026-10-07
  instagramUrl: 'https://www.instagram.com/tech_solutionsfl/', // observed 2026-10-07
  sample: true,
};

const sms = (body: string) => `${contact.smsBase}${encodeURIComponent(body)}`;

/* ------------------------------------------------------------------ */
/* Meta / SEO — verbatim from seo-spec §3                               */
/* ------------------------------------------------------------------ */

export const meta: Meta = {
  lang: 'en-US',
  title: 'TV Mounting in Miami, Wi-Fi & Cameras | TechSolutions FL',
  description:
    'Jay mounts TVs on Miami concrete and drywall, hides wires in drywall, sets up mesh Wi-Fi and installs cameras. See starting prices, then text, call or book.', // Ruth: was "hides the wires" (read as in-wall on concrete). Mirror in seo-spec §3.
  ogTitle: 'TechSolutions FL: TV mounting, Wi-Fi and cameras in Miami',
  ogDescription:
    'One Miami installer for the TV, the Wi-Fi and the cameras. Starting prices on the page. Book by text, call or the form.',
  ogImage: 'brand/og.png', // build with withBase(); 1200x630 from Elena, must include "Concept by Qognition"
  ogImageAlt: 'TechSolutions FL concept site: TV mounting, Wi-Fi and cameras in Miami',
  ogType: 'website',
  ogLocale: 'en_US',
  twitterCard: 'summary_large_image',
  siteName: 'TechSolutions FL',
};

/* ------------------------------------------------------------------ */
/* Concept ribbon — operator-supplied text, verbatim                   */
/* ------------------------------------------------------------------ */

export const ribbon: Ribbon = {
  text: 'Concept site by Qognition — sample content',
  ariaLabel: 'Concept site by Qognition. Phone, email, prices and reviews on this page are sample content.',
};

/* ------------------------------------------------------------------ */
/* Nav                                                                 */
/* ------------------------------------------------------------------ */

export const nav: Nav = {
  logoAlt: 'TechSolutions FL', // must match schema `name` exactly (seo-spec §3)
  homeLabel: 'TechSolutions FL, back to top',
  links: [
    { label: 'Services', href: '#services' },
    { label: 'Work', href: '#work' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Area', href: '#service-area' },
  ],
  phone: {
    label: contact.phoneDisplay, // NEEDS DATA: Jay's real phone
    href: contact.tel,
    track: 'call_click',
    trackId: 'nav_call',
    ariaLabel: `Call Jay at ${contact.phoneDisplay}`,
  },
  book: { label: 'Book an install', href: '#book', track: 'cta_click', trackId: 'nav_book' },
  menuOpen: 'Menu',
  menuClose: 'Close menu',
};

/* ------------------------------------------------------------------ */
/* Hero + picker                                                       */
/* ------------------------------------------------------------------ */

export const hero: Hero = {
  kicker: 'Installed by Jay', // NEEDS DATA: confirm Jay does the installs himself (solo or with helpers)
  // H1 verbatim from seo-spec §3. "Same visit" is proposed positioning. NEEDS DATA: Jay to confirm same-visit multi-service.
  h1: 'TV mounting in Miami. Wi-Fi and cameras in the same visit.',
  sub: "Jay does TV mounting on concrete and drywall, runs the cables the right way for your wall, and fixes the Wi-Fi dead zone while he's there. You see the price before you book.",
  jay: {
    name: 'Jay',
    role: 'Owner, TechSolutions FL',
    photoAlt: 'Jay, owner of TechSolutions FL', // NEEDS DATA: photo of Jay + permission. Until then render initials, never a stock face.
    sample: true,
  },
  posterAlt: 'Bright living room with a large TV on a built-in wall ledge, no cables in sight',
  picker: {
    legend: 'What do you need done?',
    defaultId: 'tv',
    sampleNote: 'Sample price. Jay confirms by text before booking.', // NEEDS DATA: Jay's real prices
    options: [
      {
        id: 'tv',
        label: 'TV mounting',
        name: 'TV mounting',
        fromPrice: { amount: 129, prefix: 'from', unit: 'per TV', sample: true }, // NEEDS DATA: Jay's TV mount price
        alsoFrom: {
          label: 'With wires inside the wall (drywall)',
          price: { amount: 249, prefix: 'from', sample: true }, // NEEDS DATA: Jay's in-wall concealment price
        },
        includes: [
          'Mounted level on concrete or drywall, same price', // NEEDS DATA: concrete surcharge or not
          'Wires inside the wall on drywall, or a paint-matched raceway on concrete', // NEEDS DATA: Jay's method on concrete; paint-match included?
          'Your mount, or Jay brings one sized to the TV', // NEEDS DATA: mount included or extra, and its price
        ],
        cta: { label: 'Book TV mounting', href: '#book', track: 'cta_click', trackId: 'hero_book' },
        textLink: { label: 'Text Jay about TV mounting', href: sms('Hi Jay, I need a TV mounted.'), track: 'text_click', trackId: 'hero_text' },
        smsBody: 'Hi Jay, I need a TV mounted.',
        iconSlot: 'icon-tv',
      },
      {
        id: 'wifi',
        label: 'Wi-Fi & networking',
        name: 'Wi-Fi and networking',
        fromPrice: { amount: 179, prefix: 'from', sample: true }, // NEEDS DATA: Jay's Wi-Fi/mesh setup price
        includes: [
          'Dead zones found room by room',
          'Mesh or a wired access point set up, every device reconnected',
          'Ethernet run to the TV or desk that needs the speed', // NEEDS DATA: are Ethernet runs priced separately?
        ],
        cta: { label: 'Book Wi-Fi setup', href: '#book', track: 'cta_click', trackId: 'hero_book' },
        textLink: { label: 'Text Jay about Wi-Fi', href: sms('Hi Jay, my Wi-Fi needs help.'), track: 'text_click', trackId: 'hero_text' },
        smsBody: 'Hi Jay, my Wi-Fi needs help.',
        iconSlot: 'icon-wifi',
      },
      {
        id: 'cameras',
        // Operator-specified chip label. Body copy says "camera installation" only (guardrails). No "secure", "alarm", "monitoring".
        label: 'Security cameras',
        name: 'Camera installation',
        fromPrice: { amount: 349, prefix: 'from', unit: 'for 2 cameras', sample: true }, // NEEDS DATA: Jay's camera price. NEEDS DATA: DBPR licence status for camera work.
        includes: [
          'Indoor or outdoor cameras mounted and aimed at the door, gate or driveway',
          'Cables run neat, or battery cameras placed where the Wi-Fi reaches',
          'Running in the app on your phone before Jay leaves',
        ],
        cta: { label: 'Book camera installation', href: '#book', track: 'cta_click', trackId: 'hero_book' },
        textLink: { label: 'Text Jay about cameras', href: sms('Hi Jay, I need cameras installed.'), track: 'text_click', trackId: 'hero_text' },
        smsBody: 'Hi Jay, I need cameras installed.',
        iconSlot: 'icon-camera',
      },
      {
        id: 'smart',
        label: 'Smart home',
        name: 'Smart home setup',
        fromPrice: { amount: 89, prefix: 'from', unit: 'per device', sample: true }, // NEEDS DATA: Jay's smart-device price
        includes: [
          'Smart locks, thermostats, switches and speakers',
          'Connected to your Wi-Fi and your app',
          'Guest lock codes set up for rentals', // NEEDS DATA: does Jay serve short-term-rental hosts?
        ],
        cta: { label: 'Book smart home setup', href: '#book', track: 'cta_click', trackId: 'hero_book' },
        textLink: { label: 'Text Jay about smart home', href: sms('Hi Jay, I need a smart device installed.'), track: 'text_click', trackId: 'hero_text' },
        smsBody: 'Hi Jay, I need a smart device installed.',
        iconSlot: 'icon-smart',
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Promises strip (replaces "Trust stats" — operator ruling)           */
/* No numbers, years, job counts or ratings. Each is a dummy promise.  */
/* COI deliberately excluded: it implies insurance (guardrails).       */
/* ------------------------------------------------------------------ */

export const promises: Promises = {
  srHeading: 'What every install includes',
  sampleLabel: 'Sample promises',
  items: [
    {
      title: 'Price before the visit',
      body: 'You see a starting price here. Jay confirms the final number by text before he drives over.',
      sample: true, // NEEDS DATA: does Jay confirm price by text before the visit? Trip fee?
    },
    {
      title: 'Concrete costs the same',
      body: "High-rise concrete or drywall, the mount price doesn't change.",
      sample: true, // NEEDS DATA: concrete surcharge or not
    },
    {
      title: 'Wires done right for your wall',
      body: 'Inside the wall on drywall. A slim raceway painted to match on concrete. You know which before he drills.',
      sample: true, // NEEDS DATA: Jay's concrete method; paint-match included?
    },
    {
      title: 'Tested before he leaves',
      body: 'Every HDMI input, every device on the Wi-Fi, every camera in your app. Checked with you in the room.',
      sample: true, // NEEDS DATA: confirm this is Jay's practice
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Services (H2/H3 verbatim from seo-spec §3)                          */
/* ------------------------------------------------------------------ */

export const services: Services = {
  id: 'services',
  h2: 'TV mounting, Wi-Fi, cameras and smart home setup in Miami',
  intro: 'Four jobs, one installer. Book one or put them all in the same visit.', // NEEDS DATA: confirm same-visit capacity
  items: [
    {
      id: 'tv',
      h3: 'TV mounting and hidden wires',
      body: 'On concrete or drywall. On drywall, the cables run inside the wall with an in-wall power kit, the way the electrical code requires. On solid concrete there is no cavity, so Jay runs a slim raceway and paints it to match.',
      fromPrice: { amount: 129, prefix: 'from', unit: 'per TV', sample: true }, // NEEDS DATA: Jay's TV mount price
      alsoFrom: {
        label: 'With wires inside the wall (drywall)',
        price: { amount: 249, prefix: 'from', sample: true }, // NEEDS DATA: Jay's in-wall price; is the power kit included?
        cta: { label: 'Book with hidden wires', href: '#book', track: 'cta_click', trackId: 'svc_tvwall_book' },
      },
      points: [
        'Concrete or drywall, same mount price', // NEEDS DATA: concrete surcharge
        'Soundbar mounted under the TV on request', // NEEDS DATA: soundbar price
        'Over a fireplace or on brick: ask first', // NEEDS DATA: does Jay do fireplace/brick?
      ],
      cta: { label: 'Book TV mounting', href: '#book', track: 'cta_click', trackId: 'svc_tv_book' },
    },
    {
      id: 'wifi',
      h3: 'Wi-Fi and mesh network setup',
      body: "Signal dies in the back bedroom. Concrete does that, and so does every neighbor's network on the same channel. Jay finds the dead zone and fixes it with mesh or a wired access point, then reconnects every device you own.",
      fromPrice: { amount: 179, prefix: 'from', sample: true }, // NEEDS DATA: Jay's Wi-Fi/mesh price
      points: [
        'Router moved or replaced where it is choking the signal',
        'Ethernet to the TV, console or desk', // NEEDS DATA: Ethernet runs priced separately?
        'Small office networks and printers', // NEEDS DATA: does Jay take office jobs?
      ],
      cta: { label: 'Book Wi-Fi setup', href: '#book', track: 'cta_click', trackId: 'svc_wifi_book' },
    },
    {
      id: 'cameras',
      h3: 'Camera installation',
      body: 'Indoor and outdoor cameras mounted, aimed and running in the app on your phone before Jay leaves. Bring your own cameras, or ask what fits your door, gate and driveway.',
      fromPrice: { amount: 349, prefix: 'from', unit: 'for 2 cameras', sample: true }, // NEEDS DATA: Jay's camera price. NEEDS DATA: DBPR licence status.
      points: [
        'Wired or battery cameras', // NEEDS DATA: brands Jay installs
        'Video doorbells', // kept under Cameras, not Smart home (cro-spec §3, licensing)
        'Audio switched off on request', // ties to FAQ Q6; no privacy or "secure" claim
      ],
      cta: { label: 'Book camera installation', href: '#book', track: 'cta_click', trackId: 'svc_cam_book' },
    },
    {
      id: 'smart',
      h3: 'Smart locks and smart home devices',
      body: 'Smart locks, thermostats, switches and speakers installed and on your Wi-Fi. Renting the unit out? Jay sets the guest lock codes so check-in works when you are not there.',
      fromPrice: { amount: 89, prefix: 'from', unit: 'per device', sample: true }, // NEEDS DATA: Jay's smart-device price
      points: [
        'Lock, thermostat or switch, per device',
        'Set up in your app, not just on the wall',
        'Airbnb lock codes for hosts', // NEEDS DATA: does Jay serve short-term-rental hosts?
      ],
      cta: { label: 'Book smart home setup', href: '#book', track: 'cta_click', trackId: 'svc_smart_book' },
    },
  ],
  footnote: 'Sample prices for this concept. Jay confirms the final price by text before the visit.', // NEEDS DATA: real prices, trip fee, warranty terms
};

/* ------------------------------------------------------------------ */
/* Before / after                                                      */
/* ------------------------------------------------------------------ */

export const beforeAfter: BeforeAfter = {
  id: 'before-after',
  h2: 'Before and after: the same wall, wires hidden',
  body: 'Same TV, same wall. Before, the cord hangs in plain sight. After, nothing shows.',
  wallNote: 'This is drywall, so the cables go inside it. On solid concrete they go in a slim raceway painted to match. Jay tells you which before he drills.', // NEEDS DATA: Jay's concrete method
  beforeLabel: 'Before',
  afterLabel: 'After',
  beforeAlt: 'Before: wall-mounted TV with a power cord hanging below it',
  afterAlt: 'After: same TV with no cables visible',
  sliderAriaLabel: 'Compare before and after',
  caption: 'Illustration, drywall wall. Not a photo of a TechSolutions FL job.', // NEEDS DATA: real before/after pair from Jay. Swap caption to "Drywall, <neighborhood>" only with his photos.
  cta: { label: 'Book TV + hidden wires', href: '#book', track: 'cta_click', trackId: 'slider_book' },
};

/* ------------------------------------------------------------------ */
/* How it works — no time promises (seo-spec §3)                       */
/* ------------------------------------------------------------------ */

export const howItWorks: HowItWorks = {
  id: 'how-it-works',
  h2: 'How booking an install works',
  steps: [
    {
      n: 1,
      h3: 'Pick the job, see the price',
      body: 'Tell Jay the TV size, the wall, or the room where the Wi-Fi dies. The starting price is on screen before you send anything.',
    },
    {
      n: 2,
      h3: 'Jay texts to confirm',
      body: 'He confirms the price, a time window, and anything your building asks for, like work hours or the service elevator.', // NEEDS DATA: does Jay confirm by text and give time windows?
    },
    {
      n: 3,
      h3: 'Installed and tested', // Ruth: was "Done in one visit", an unlabelled promise. Restore only if Jay confirms.
      body: 'Mounted, wired and connected. Jay tests every input and device with you before he packs up.', // NEEDS DATA: confirm one-visit and test-before-leaving practice
    },
  ],
  cta: { label: 'Book an install', href: '#book', track: 'cta_click', trackId: 'how_book' },
  textLink: { label: 'or text Jay', href: sms('Hi Jay, I found you on your website. I need help with a TV / Wi-Fi / camera job.'), track: 'text_click', trackId: 'how_text' },
};

/* ------------------------------------------------------------------ */
/* Recent work — IG-style grid, links to the real profile              */
/* Images are stock until Jay supplies his own with permission.        */
/* Captions describe the job type shown, never "Jay's install in X".   */
/* ------------------------------------------------------------------ */

export const recentWork: RecentWork = {
  id: 'work',
  h2: "See Jay's installs on Instagram", // seo-spec §3: stays true whatever the grid holds
  intro: 'Jay posts his jobs on Instagram: the wall, the TV, where the cables went. The grid below is illustration until his own photos go in.',
  items: [
    {
      slot: 'tv-mounted-hidden-cables',
      caption: 'Living room TV on drywall. Cables inside the wall.',
      alt: 'Large TV mounted above a low console with no visible cables',
      tag: 'TV',
      label: 'Stock image, sample',
      sample: true, // NEEDS DATA: Jay's photos + permission
    },
    {
      slot: 'tv-concrete-raceway',
      caption: 'Concrete wall? Cables run in a slim raceway, painted to match.',
      alt: 'Slim white cable raceway running neatly along a wall',
      tag: 'TV',
      label: 'Stock image, sample',
      sample: true, // NEEDS DATA: Jay's concrete install photos
    },
    {
      slot: 'soundbar-under-tv',
      caption: 'TV centered on the wall. No cords below it.',
      alt: 'Wall-mounted TV in a clean, cable-free living room',
      tag: 'TV',
      label: 'Stock image, sample',
      sample: true, // NEEDS DATA: Jay's photos + permission
    },
    {
      slot: 'mesh-wifi-node-shelf',
      caption: 'Smart home devices set up and connected.',
      alt: 'Small white smart home device on a shelf',
      tag: 'Wi-Fi',
      label: 'Stock image, sample',
      sample: true, // NEEDS DATA: Jay's photos + permission
    },
    {
      slot: 'outdoor-camera-eave',
      caption: 'Outdoor camera on the wall, aimed at the entry.',
      alt: 'Outdoor security camera mounted on an exterior wall',
      tag: 'Cameras',
      label: 'Stock image, sample',
      sample: true, // NEEDS DATA: Jay's photos + permission
    },
    {
      slot: 'smart-lock-door',
      caption: 'Smart lock on a front door, guest codes set in the app.',
      alt: 'Keypad smart lock on a grey front door',
      tag: 'Smart home',
      label: 'Stock image, sample',
      sample: true, // NEEDS DATA: Jay's photos + permission
    },
  ],
  instagramLink: {
    label: `More installs on Instagram ${contact.instagramHandle}`,
    href: contact.instagramUrl,
    track: 'outbound_click',
    trackId: 'ig_out',
    external: true,
  },
};

/* ------------------------------------------------------------------ */
/* Reviews — dummies. No Review/AggregateRating schema (seo-spec §5).  */
/* ------------------------------------------------------------------ */

export const reviews: Reviews = {
  id: 'reviews',
  h2: "Reviews from Jay's customers go here", // Ruth: "What customers say" over dummy quotes reads as verified. Restore with real reviews.
  subhead: 'Sample reviews for this concept',
  items: [
    {
      quote: 'Our wall in the condo is solid concrete. Jay told me up front the cables could not go inside it and showed me the raceway he would use. Painted to match, you barely see it. The 65-inch is dead level.',
      firstName: 'Andrea',
      neighborhood: 'Brickell',
      service: 'TV mounting',
      label: 'Sample review',
      sample: true, // NEEDS DATA: real reviews Jay can share
    },
    {
      quote: 'Booked the TV and asked about the Wi-Fi while he was here. He put a mesh point outside the bedroom and it finally works in there. One visit, both done.',
      firstName: 'Luis',
      neighborhood: 'Edgewater',
      service: 'TV mounting, Wi-Fi',
      label: 'Sample review',
      sample: true, // NEEDS DATA: real reviews Jay can share
    },
    {
      quote: 'Two cameras, front door and side gate, running on my phone before he left. He texted the price first and that is what I paid.',
      firstName: 'Renee',
      neighborhood: 'Coral Gables',
      service: 'Camera installation',
      label: 'Sample review',
      sample: true, // NEEDS DATA: real reviews Jay can share
    },
  ],
  cta: { label: 'Book an install', href: '#book', track: 'cta_click', trackId: 'reviews_book' },
};

/* ------------------------------------------------------------------ */
/* Service area — neighborhoods only here (seo-spec §2)                */
/* ------------------------------------------------------------------ */

export const serviceArea: ServiceArea = {
  id: 'service-area',
  h2: 'Service area: Miami-Dade and Broward', // NEEDS DATA: Broward confirmed? Only "Downtown MIA" is observed.
  body: 'Jay works out of Miami. High-rises, houses, townhouses and offices.', // NEEDS DATA: service radius; office jobs
  neighborhoodsLabel: 'Neighborhoods',
  neighborhoods: [
    'Downtown Miami', // observed: IG "Downtown MIA" highlight
    'Brickell', // NEEDS DATA: confirm
    'Edgewater', // NEEDS DATA: confirm
    'Wynwood', // NEEDS DATA: confirm
    'Coconut Grove', // NEEDS DATA: confirm
    'Coral Gables', // NEEDS DATA: confirm
    'Doral', // NEEDS DATA: confirm
    'Kendall', // NEEDS DATA: confirm
    'Miami Beach', // NEEDS DATA: confirm
  ],
  outOfAreaNote: 'Not on the list? Send your ZIP with the request and Jay will tell you if he can make it.',
  cta: { label: 'Book an install', href: '#book', track: 'cta_click', trackId: 'area_book' },
  sample: true, // NEEDS DATA: service radius, service-area ZIP list, travel fee
};

/* ------------------------------------------------------------------ */
/* FAQ — Nadia's approved Q1–Q8 VERBATIM (seo-spec §4). Q9 held.        */
/* Same strings feed FAQPage JSON-LD. Do not edit one without the other.*/
/* ------------------------------------------------------------------ */

export const faq: Faq = {
  id: 'faq',
  h2: 'Questions Miami condo and home owners ask',
  items: [
    {
      id: 'concrete',
      q: 'Can you mount a TV on a concrete wall in a Miami condo?',
      // Ruth: removed unsourced "Most Miami high-rises have poured-concrete walls". Mirror in seo-spec §4 and §5 JSON-LD.
      a: "Yes. Concrete holds a TV mount well when the holes are drilled with a hammer drill and the mount is fixed with concrete anchors rated for the TV's weight. In a high-rise, the building is usually the harder part: many associations only allow drilling during set hours, so check your condo's work rules first.",
    },
    {
      id: 'coi',
      q: 'What does my condo association need before a TV or camera install?',
      // NEEDS DATA: if Jay carries liability insurance and can issue a COI, Nadia's add-on line goes here. Not before.
      a: 'Usually a certificate of insurance. Most Miami condo boards want one on file before work begins, with the association named as additional insured. Some buildings also set work hours or ask you to reserve the service elevator. Ask your management office for its contractor requirements in writing and share them when you book.',
    },
    {
      id: 'hide-wires',
      q: 'Can you hide TV wires inside a concrete wall?',
      a: "Not inside solid concrete, because there's no cavity for cable. If the TV wall is drywall, or drywall furred out over concrete, HDMI cables can run inside it. Power needs a listed in-wall power kit: the electrical code (NEC 400.12) bans hiding a TV's plug-in cord in a wall. On solid concrete, a paintable raceway keeps cables neat.",
    },
    {
      id: 'mesh',
      q: 'Mesh Wi-Fi or a Wi-Fi extender: which is better?',
      a: "Mesh, in most homes. An extender repeats your router's signal, often under a second network name, and the repeated connection is usually slower. Mesh uses several units that share one network name and pass your phone between them as you move. Faster still is mesh or access points linked by Ethernet cable, which keeps speeds up in the far bedroom.",
    },
    {
      id: 'weak-wifi',
      q: 'Why is my Wi-Fi weak in my Miami high-rise apartment?',
      a: "Usually the concrete and the neighbors. Reinforced concrete blocks Wi-Fi far more than drywall, and in a tower dozens of nearby networks crowd the same channels. A router left in the closet where the internet line enters makes it worse. Moving the router to the unit's center, or wiring an access point into the dead room, is the usual fix.",
    },
    {
      id: 'camera-audio',
      q: 'Can my home security cameras record audio in Florida?',
      a: "Be careful with audio. Florida is an all-party consent state, so recording a private conversation without everyone's permission can break Fla. Stat. 934.03. Video without sound isn't covered by that statute, but cameras still shouldn't look into places where people expect privacy. Most camera apps let you switch audio recording off. This is general information, not legal advice.",
    },
    {
      id: 'outage',
      q: 'Will my security cameras keep recording during a hurricane power outage?',
      a: "Only if their power and network stay up. Wired PoE cameras draw power from one switch or recorder, so a battery backup (UPS) on that box keeps them recording for as long as the battery lasts. Battery-powered Wi-Fi cameras stay on, but they can't upload clips once the router loses power, unless the router and modem are on backup too.",
    },
    {
      id: 'airbnb-lock',
      q: 'Does a smart lock for an Airbnb need Wi-Fi?',
      // NEEDS DATA: whether Jay serves short-term-rental hosts. If not, Nadia swaps in a smart-thermostat question.
      a: 'For Airbnb\'s own lock connection, yes. Airbnb\'s help center states: "Your lock must be connected to wifi to connect to Airbnb." A Bluetooth-only lock needs a phone nearby to change codes, which doesn\'t work when you manage the unit remotely. If the unit\'s Wi-Fi drops out, fix the network before you rely on the lock for guest check-in.',
    },
  ],
  textLink: { label: 'Text Jay a question', href: sms('Hi Jay, I have a question before I book.'), track: 'text_click', trackId: 'faq_text' },
  callLink: { label: `Call ${contact.phoneDisplay}`, href: contact.tel, track: 'call_click', trackId: 'faq_call' }, // NEEDS DATA: Jay's real phone
};

/* ------------------------------------------------------------------ */
/* Booking form (#book) — field names/enums match cro-spec §4          */
/* ------------------------------------------------------------------ */

export const booking: Booking = {
  id: 'book',
  h2: 'Book a TV mount, Wi-Fi setup or camera install',
  intro: 'Four short steps. No address, no payment. Jay texts you back to confirm the price and a time.', // NEEDS DATA: confirm text-back practice
  progress: 'Step {n} of 4: {stepName}',
  stepNames: { service: 'Service', details: 'Details', when: 'When', contact: 'Contact' },
  buttons: { next: 'Next', back: 'Back', submit: 'Send my request', submitting: 'Sending…' },
  errorSummary: '{count} fields need a fix before you continue:',

  step1: {
    heading: 'What do you need?',
    microcopy: 'Pick everything you need. Jay can often do it all in one visit.', // NEEDS DATA: confirm same-visit claim
    services: {
      name: 'services',
      label: 'Services',
      options: [
        { value: 'tv', label: 'TV mounting' },
        { value: 'wifi', label: 'Wi-Fi & networking' },
        { value: 'cameras', label: 'Security cameras' },
        { value: 'smart', label: 'Smart home' },
        { value: 'other', label: 'Something else' },
      ],
      errors: { required: 'Pick at least one so Jay knows what to bring.' },
    },
    otherDesc: {
      name: 'other_desc',
      label: 'What do you need?',
      errors: {
        required: 'Tell Jay in a sentence what you need.',
        range: 'Keep it between 10 and 500 characters.',
      },
    },
  },

  step2: {
    heading: 'Tell Jay about the job',
    propertyType: {
      name: 'property_type',
      label: 'Where is the job?',
      options: [
        { value: 'condo', label: 'Condo / high-rise' },
        { value: 'house', label: 'House' },
        { value: 'townhouse', label: 'Townhouse' },
        { value: 'office', label: 'Office' },
      ],
      errors: { required: 'Pick the closest one.' },
    },
    coiNeeded: {
      // NEEDS DATA: REMOVE this field if Jay cannot issue a COI (cro-spec row 5). Asks only; claims nothing.
      name: 'coi_needed',
      label: 'Does your building ask for a certificate of insurance (COI)?',
      helper: 'Many Miami buildings ask for one before work starts. Knowing now avoids a wasted trip.',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'not_sure', label: 'Not sure' },
        { value: 'no', label: 'No' },
      ],
    },
    tv: {
      tvCount: { name: 'tv_count', label: 'How many TVs?' },
      tvSize: {
        name: 'tv_size',
        label: 'TV size',
        options: [
          { value: 'up_to_42', label: 'Up to 42"' },
          { value: '43_55', label: '43–55"' },
          { value: '56_65', label: '56–65"' },
          { value: '66_75', label: '66–75"' },
          { value: '76_plus', label: '76" and up' },
          { value: 'not_sure', label: 'Not sure' },
        ],
      },
      wallType: {
        name: 'wall_type',
        label: 'What is the wall?',
        helper: 'Not sure? Knock on it. A dull, solid thud usually means concrete. A hollow knock means drywall.',
        options: [
          { value: 'drywall', label: 'Drywall' },
          { value: 'concrete', label: 'Concrete' },
          { value: 'brick_stone', label: 'Brick or stone' },
          { value: 'fireplace', label: 'Over a fireplace' },
          { value: 'not_sure', label: 'Not sure' },
        ],
      },
      wires: {
        name: 'wires',
        label: 'What about the wires?',
        helper: 'Cables cannot go inside solid concrete. On concrete, Jay uses a slim raceway painted to match.',
        options: [
          { value: 'in_wall', label: 'Inside the wall (drywall)' },
          { value: 'raceway', label: 'Paint-matched raceway' },
          { value: 'as_is', label: 'Leave them as they are' },
          { value: 'advise', label: 'Not sure, Jay can advise' },
        ],
      },
      hasMount: {
        name: 'has_mount',
        label: 'Do you have a mount?',
        options: [
          { value: 'yes', label: 'Yes, I have one' },
          { value: 'no', label: 'No, bring one' }, // NEEDS DATA: mount included or extra
          { value: 'not_sure', label: 'Not sure' },
        ],
      },
      soundbar: { name: 'soundbar', label: 'Mount a soundbar too' },
    },
    wifi: {
      homeSize: {
        name: 'home_size',
        label: 'How big is the place?',
        options: [
          { value: 'studio_1', label: 'Studio or 1 bed' },
          { value: '2_3', label: '2–3 bed' },
          { value: '4_plus', label: '4+ bed' },
          { value: 'office', label: 'Office' },
        ],
      },
      wifiIssue: {
        name: 'wifi_issue',
        label: 'What is going on?',
        options: [
          { value: 'dead_zones', label: 'Dead zones' },
          { value: 'slow', label: 'Slow speeds' },
          { value: 'new_setup', label: 'New setup' },
          { value: 'mesh', label: 'Mesh install' },
          { value: 'ethernet', label: 'Wired runs (Ethernet)' },
          { value: 'office', label: 'Office network' },
        ],
      },
    },
    cameras: {
      cameraCount: {
        name: 'camera_count',
        label: 'How many cameras?',
        options: [
          { value: '1_2', label: '1–2' },
          { value: '3_4', label: '3–4' },
          { value: '5_8', label: '5–8' },
          { value: '9_plus', label: '9 or more' },
        ],
      },
      cameraLocation: {
        name: 'camera_location',
        label: 'Where do they go?',
        options: [
          { value: 'indoor', label: 'Indoor' },
          { value: 'outdoor', label: 'Outdoor' },
          { value: 'both', label: 'Both' },
        ],
      },
      cameraEquipment: {
        name: 'camera_equipment',
        label: 'Do you have the cameras?',
        options: [
          { value: 'have', label: 'I already have the cameras' },
          { value: 'recommend', label: 'I need recommendations' },
        ],
      },
    },
    smart: {
      smartDevices: {
        name: 'smart_devices',
        label: 'Which devices?',
        options: [
          { value: 'lock', label: 'Smart lock' },
          { value: 'thermostat', label: 'Thermostat' },
          { value: 'switches', label: 'Light switches' },
          { value: 'speakers', label: 'Speakers or voice assistant' },
          { value: 'other', label: 'Other' },
        ],
      },
      rental: { name: 'rental', label: 'This is for a short-term rental' }, // NEEDS DATA: does Jay serve hosts?
    },
    notes: {
      name: 'notes',
      label: 'Anything Jay should know? (floor, parking, TV model)',
      counter: '{n}/500',
      errors: { range: 'Keep it under 500 characters.' },
    },
  },

  step3: {
    heading: 'Where and when?',
    microcopy: 'This is a request, not a booking. Jay texts you to confirm a time.',
    zip: {
      name: 'zip',
      label: 'ZIP code',
      errors: { required: 'Enter a 5-digit ZIP, like 33131.', format: 'Enter a 5-digit ZIP, like 33131.' },
      outOfArea: "That's outside Jay's usual area. Send it anyway and he'll tell you if he can make it.", // NEEDS DATA: service-area ZIP list
    },
    timing: {
      name: 'timing',
      label: 'When do you need it?',
      options: [
        { value: 'asap', label: 'As soon as possible' },
        { value: 'this_week', label: 'This week' },
        { value: 'next_week', label: 'Next week' },
        { value: 'date', label: 'Pick a date' },
      ],
      errors: { required: 'Pick when you need it.' },
    },
    date: {
      name: 'date',
      label: 'Date',
      errors: {
        required: 'Pick a date from today on.',
        range: 'Pick a date within the next 60 days.',
      },
    },
    window: {
      name: 'window',
      label: 'Best time of day (optional)',
      // NEEDS DATA: Jay's working hours. Do not add clock times to these labels until confirmed.
      options: [
        { value: 'morning', label: 'Morning' },
        { value: 'afternoon', label: 'Afternoon' },
        { value: 'evening', label: 'Evening' },
        { value: 'any', label: 'Any time' },
      ],
    },
  },

  step4: {
    heading: 'How does Jay reach you?',
    firstName: {
      name: 'first_name',
      label: 'First name',
      errors: { required: 'What should Jay call you?' },
    },
    phone: {
      name: 'phone',
      label: 'Mobile number',
      errors: {
        required: 'Enter a 10-digit mobile number, like (305) 555-0123.',
        format: 'Enter a 10-digit mobile number, like (305) 555-0123.',
      },
    },
    email: {
      name: 'email',
      label: 'Email (optional)',
      errors: {
        format: 'That email looks incomplete.',
        required: 'Add your email, or pick Text or Call.',
      },
    },
    contactPref: {
      name: 'contact_pref',
      label: 'Best way to reach you',
      options: [
        { value: 'text', label: 'Text' },
        { value: 'call', label: 'Call' },
        { value: 'email', label: 'Email' },
      ],
    },
    honeypot: { name: 'website', label: 'Leave this empty' },
    consent: 'Jay will text or call you about this request only.', // NEEDS DATA: legal review of consent wording before live
    marketingOptIn: 'Text me the occasional tip or offer. Optional. Reply STOP anytime.', // NEEDS DATA: legal review (TCPA). Unticked by default.
  },

  belowSubmit: {
    reply: 'Jay replies by text to confirm the price and a time.', // NEEDS DATA: real reply time + hours. No number until confirmed.
    textLink: { label: `Prefer to text? ${contact.phoneDisplay}`, href: sms('Hi Jay, I found you on your website. I need help with a TV / Wi-Fi / camera job.'), track: 'text_click', trackId: 'form_text' }, // NEEDS DATA: Jay's real mobile
    callLink: { label: 'Or call', href: contact.tel, track: 'call_click', trackId: 'form_call' }, // NEEDS DATA: Jay's real phone
  },

  success: {
    heading: 'Got it, {firstName}.',
    byPref: {
      text: 'Jay will text you at (•••) •••-{last4} to confirm a time.',
      call: 'Jay will call you at (•••) •••-{last4} to confirm a time.',
      email: 'Jay will email you at {email} to confirm a time.',
    },
    summaryHeading: 'Your request',
    summaryLabels: { services: 'Services', zip: 'ZIP', when: 'When' },
    photoLink: {
      label: 'Speed it up: text Jay a photo of the wall',
      smsBody: 'Photo for my request {ref}',
    },
    nextHeading: 'What happens next',
    next: [
      'Jay reads your request and checks the date.',
      'He sends you a price and a time window to confirm.', // NEEDS DATA: confirm Jay's process
      'Nothing is booked until you reply yes.',
    ],
    demoNotice: 'Concept site: this form is not connected yet.', // verbatim ADR §6
    demoDetail: 'Nothing was sent to Jay. On the live site, this request goes straight to his phone.', // NEEDS DATA: where live submissions route (SMS/email)
  },

  error: {
    banner: "That didn't send. Your details are still here.",
    retry: 'Try again',
    textInstead: 'Text Jay instead',
    emailInstead: 'Email instead',
    mailtoSubject: 'Install request from the website',
  },
  timeout: 'This is taking too long. Your details are still here.',
};

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export const footer: Footer = {
  tagline: 'TV mounting, Wi-Fi, cameras and smart home installs in Miami. Installed by Jay.', // NEEDS DATA: confirm Jay installs himself
  contactHeading: 'Reach Jay',
  links: [
    { label: `Text ${contact.phoneDisplay}`, href: sms('Hi Jay, I found you on your website.'), track: 'text_click', trackId: 'footer_text' }, // NEEDS DATA: Jay's real mobile
    { label: `Call ${contact.phoneDisplay}`, href: contact.tel, track: 'call_click', trackId: 'footer_call' }, // NEEDS DATA: Jay's real phone
    { label: contact.email, href: `mailto:${contact.email}`, track: 'cta_click', trackId: 'footer_email' }, // NEEDS DATA: Jay's real email
  ],
  instagram: {
    label: contact.instagramHandle,
    href: contact.instagramUrl,
    track: 'outbound_click',
    trackId: 'ig_out',
    external: true,
  },
  areaHeading: 'Service area',
  areaLine: 'Miami-Dade and Broward', // NEEDS DATA: service radius
  hours: null, // NEEDS DATA: Jay's working hours. Render nothing while null.
  spanish: null, // NEEDS DATA: Spanish-language service. If yes: "Se habla español."
  sampleNotice:
    "This is a concept site by Qognition. The phone number, email, prices, promises and reviews are sample content, not TechSolutions FL's real details. For Jay's real contact, use Instagram.",
  pexelsCredit: { label: 'Photos and video from Pexels', href: 'https://www.pexels.com' }, // authors listed from media-credits.json
  conceptCredit: 'Concept and build by Qognition Agency',
  legal: '© 2026 TechSolutions FL', // NEEDS DATA: legal business name (Sunbiz)
};

/* ------------------------------------------------------------------ */
/* Sticky mobile bar (Call | Text | Book) — cro-spec §2                 */
/* ------------------------------------------------------------------ */

const stickySmsBody = "Hi Jay, I found you on your website. I need help with a TV / Wi-Fi / camera job.";

export const stickyBar: StickyBar = {
  call: { label: 'Call', href: contact.tel, track: 'call_click', trackId: 'sticky_call', ariaLabel: `Call Jay at ${contact.phoneDisplay}` }, // NEEDS DATA: Jay's real phone
  text: { label: 'Text', href: sms(stickySmsBody), track: 'text_click', trackId: 'sticky_text', ariaLabel: `Text Jay at ${contact.phoneDisplay}` }, // NEEDS DATA: Jay's real mobile
  book: { label: 'Book an install', href: '#book', track: 'cta_click', trackId: 'sticky_book' },
  // Replace "a TV / Wi-Fi / camera job" with the picker's service name when one is selected.
  smsBody: stickySmsBody,
};

/* ------------------------------------------------------------------ */
/* NEEDS DATA registry — feeds the promotion gate and the repo README  */
/* ------------------------------------------------------------------ */

export const needsData: { key: string; what: string }[] = [
  { key: 'contact.phone', what: "Jay's real phone/mobile (dummy (305) 555-0142)" },
  { key: 'contact.email', what: "Jay's real email (dummy book@techsolutionsfl.example)" },
  { key: 'prices', what: 'Real prices: TV mount, in-wall wires, Wi-Fi/mesh, 2 cameras, smart device (dummies $129 / $249 / $179 / $349 / $89)' },
  { key: 'prices.concrete', what: 'Concrete surcharge or not (promise "Concrete costs the same")' },
  { key: 'prices.mount', what: 'Mount included or extra, and its price' },
  { key: 'prices.extras', what: 'Ethernet runs, soundbar, fireplace/brick: priced separately or not' },
  { key: 'method.concrete', what: "Jay's concrete method: raceway, paint-matched or not" },
  { key: 'promises', what: 'All four promises confirmed or struck by Jay' },
  { key: 'process', what: 'Text confirmation, time windows, reply time, working hours, test-before-leaving' },
  { key: 'positioning.sameVisit', what: 'Same-visit multi-service capacity (H1, step 1 microcopy)' },
  { key: 'positioning.solo', what: 'Jay does installs himself, or with helpers ("Installed by Jay")' },
  { key: 'jay.photo', what: 'Photo of Jay + permission' },
  { key: 'reviews', what: 'Real reviews Jay can share (3 dummies)' },
  { key: 'media', what: "Jay's own before/after pair and install photos + permission" },
  { key: 'area', what: 'Service radius, Broward yes/no, neighborhood and ZIP list, travel fee' },
  { key: 'coi', what: 'Liability insurance and COI capability (form field coi_needed; FAQ Q2 add-on)' },
  { key: 'licence', what: 'DBPR licence status for camera work (camera service line, held FAQ Q9)' },
  { key: 'hosts', what: 'Serves short-term-rental hosts (smart-home bullets, FAQ Q8, rental checkbox)' },
  { key: 'office', what: 'Takes small-office network jobs' },
  { key: 'spanish', what: 'Spanish-language service' },
  { key: 'legalName', what: 'Legal business name (Sunbiz)' },
  { key: 'consent', what: 'Legal review of SMS consent and opt-in wording' },
];

/* ------------------------------------------------------------------ */
/* Form consent checkboxes (step 4) — added by Mira on MARS instruction */
/* Both optional and UNCHECKED by default.                               */
/* ------------------------------------------------------------------ */

// NEEDS DATA: legal review of both consent labels (TCPA / CAN-SPAM) before the site goes live.
export const formConsent = {
  sms: { name: 'sms_consent', label: 'Text me updates about this request (msg & data rates may apply, reply STOP to opt out)' },
  email: { name: 'email_optin', label: 'Email me tips and offers' },
} as const;
