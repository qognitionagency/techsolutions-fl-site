/**
 * TechSolutions FL: concept landing page copy, rebuilt on the Iron Sound section architecture.
 *
 * The single source for every visible string on the page, and for the FAQPage JSON-LD
 * (seo-spec.md §5: generate `mainEntity` from `faq.items` so markup can never drift from
 * visible text).
 *
 * Author: Theo (content), under MARS, 2026-10-07. Rebuild after the operator rejected the
 *   owner-led concept: "show the services like the Iron Sound one". Theme stays "Miami Signal".
 * Status: DRAFT. Not shippable until Ruth (brand-guard) returns SHIP.
 * Basis: context.md (AI-derived, prospect, NOT client-confirmed), guardrails.md, brand-voice.md,
 *   seo-spec.md (Nadia), cro-spec.md (Marcus), ADR 0001, and the Iron Sound content module as
 *   the structural template.
 * Markdown mirror for review: ~/qognition-ops/clients/techsolutions-fl/deliverables/2026-10-landing/page-copy.md
 *
 * ── EXPORT MAP (for Mira: export → Iron Sound component it feeds) ───────────────────────
 *   contact        → shared: Consult.astro, Process.astro, lib/schema.ts, pages/llms.txt.ts
 *   anchors        → every section id. Iron Sound hard-codes ids (id="consult", id="lighting",
 *                    id="build"); use anchors.* here, because the values differ (consult = "book").
 *   meta           → layouts/Base.astro, lib/schema.ts
 *   ribbon         → Nav.astro (ribbon), Footer.astro (concept line)
 *   nav            → Nav.astro, Base.astro (skipLink)
 *   hero           → Hero.astro. NEW field: `byline` (small text, render under the CTAs or not at all)
 *   partners       → Partners.astro ("Gear we install and set up")
 *   services       → Services.astro (bento, 2 large + 4 small). NEW per tile: `price`, `alsoFrom`,
 *                    `priceNote`; NEW section field: `footnote` (render under the grid)
 *   sectors        → Sectors.astro (Condo / House / Office tabs; no `proof` blocks)
 *   beforeAfter    → Lighting.astro (Iron Sound `lighting`), ported as the drag slider:
 *                    states.day → states.before, states.dusk → states.after; the toggle becomes a
 *                    role="slider" handle labelled `sliderAriaLabel`; event `slider_use` (cro-spec §5)
 *                    replaces `lighting_toggle`. Same shape otherwise (heading, display, body,
 *                    controlLabel, illustrationNote, cta).
 *   processSteps   → Process.astro (ordered list). step4TestimonialId is null: no quote beside step 4.
 *   trade          → Process.astro (the #build band), now the multi-unit band (id anchors.trade)
 *   projects       → Gallery.astro. NEW per item: `label` ("Stock image, sample"), `tag`;
 *                    NEW section field: `instagramLink`
 *   testimonials   → Testimonials.astro. NEW per item: `sample`, `label`, `service`. Render `label`
 *                    on every card. No Review/AggregateRating schema (seo-spec §5).
 *   serviceArea    → ServiceArea.astro (`cities` holds neighborhoods; NEW: `neighborhoodsLabel`,
 *                    `outOfAreaNote`)
 *   faq            → Faq.astro, lib/schema.ts (FAQPage). Items are { id, question, answer, link? }
 *                    as Iron Sound; the old { q, a } keys are gone.
 *   form           → Consult.astro. Steps differ from Iron Sound: service → details → property →
 *                    when → contact (cro-spec §4 + operator). Field `name`s are carried in the data.
 *   stickyBar      → MobileBar.astro. NEW cell: `text` (Call | Text | Book, cro-spec §2)
 *   footer         → Footer.astro. NEW: nap.text, hours, spanish, conceptCredit, legal
 *   needsData      → lib/indexing.ts (promotion gate). Shape unchanged.
 *   formConsent    → LEGACY alias for the old Booking.astro. Delete once the Consult port lands.
 *   Types          → Cta (ui/Button.astro), Link = Cta (legacy alias), Price (ui/Price.astro),
 *                    Prefill, Option, MediaRef, ServiceKey, PropertyType, RoleKey, TestimonialId.
 *
 *   Button.astro prefill: Iron Sound emits data-prefill-type/scope/stage/role. Here the Prefill keys
 *   are services, propertyType, wires, role → data-prefill-services, data-prefill-property-type,
 *   data-prefill-wires, data-prefill-role. form.ts snake-cases them to the field names `services`,
 *   `property_type`, `wires`, `role`. Deep links: initMultiStepForm({ urlParams: { service: "services" } }).
 *   lib/schema.ts and pages/llms.txt.ts in this repo still read the OLD shapes and will not compile
 *   against this file until they are ported (Iron Sound versions read faq.items[].question/answer).
 *
 * ── BRIEF ────────────────────────────────────────────────────────────────────────────
 * Search intent: a Miami condo, house or office owner with a new TV leaning on the wall, Wi-Fi
 *   that dies in the back bedroom, or a front door with no camera. Thirty seconds ago they
 *   searched "tv mounting miami" or tapped through from @tech_solutionsfl, and they are weighing
 *   a $65 app slot against a named installer. (For the concept: Jay, on the 2026-10-09 call.)
 * Citation angle: Nadia's FAQ Q3, verbatim: no in-wall cabling inside solid concrete; drywall
 *   (or drywall furred over concrete) yes, with a listed power kit (NEC 400.12); raceway on
 *   concrete. Repeated in the before/after body, the condo panel and the form `wires` helper.
 * Internal links: one page, so anchors. Nav → #services #spaces #how-it-works #work #faq.
 *   Every CTA → #book with prefill. FAQ hide-wires → #before-after, coi → #spaces,
 *   airbnb-lock → #multi-unit. Inbound: none (noindex concept; IG bio has no link).
 *   Outbound: tel, sms, mailto, Instagram, Pexels credit.
 * Owned claim: the wall decides the method, and you hear which before anyone drills. In-wall on
 *   drywall, paint-matched raceway on solid concrete, price before the visit. Apps sell a time
 *   slot; big-box services sell "concealment" plus a concrete surcharge (research brief §1).
 *   Comparisons stay out of the copy (guardrails: category only, and only with Jay's approval).
 * ─────────────────────────────────────────────────────────────────────────────────────
 *
 * Conventions (same as Iron Sound)
 * - `heading` = the semantic H1/H2/H3. Nadia's strings where she fixed them (seo-spec §3).
 *   CHANGED from seo-spec in this rebuild, pending her sign-off: hero H1 (service-led, "same
 *   visit" dropped), services H2 (six services), process H2 kept, sectors H2 new.
 * - `display` = the memorable line, rendered as a <p>, styled as large as Elena wants.
 * - `// NEEDS DATA:` marks a fact Jay must confirm. `sample: true` marks a dummy that renders;
 *   show a visible "Sample" label wherever it is true (guardrails, Required disclosures).
 * - FAQ answers are byte-bound to schema. Do not trim, retype or "fix" them.
 * - Concrete: in-wall concealment on drywall only. Solid concrete = paint-matched raceway.
 *   Never edit a string here to promise in-wall on solid concrete (seo-spec §8 D2).
 * - Never add "licensed", "insured", "certified", "bonded", years in business, job counts,
 *   star ratings, "#1" or "best". Brands are gear we install, never dealer/partner/certified.
 * - Voice: "we" by default (operator: services-first, Jay as a byline). Jay is named in the
 *   hero byline, SMS bodies, the demo line and the Ruth-approved reviews heading only.
 * - Template tokens ({firstName}, {last4}, {email}, {ref}, {current}, {total}, {step}, {used},
 *   {service}) are replaced at runtime.
 */

// ── Shared types ────────────────────────────────────────────────────────────────────

export type ServiceKey = "tv" | "theater" | "wifi" | "cameras" | "smart" | "office" | "other";

export type PropertyType = "condo" | "house" | "townhouse" | "office";

export type WiresKey = "in_wall" | "raceway" | "as_is" | "advise";

export type RoleKey = "owner" | "renter" | "property_manager" | "host" | "office_manager";

/** Read by form.ts from data-prefill-* attributes (cro-spec §2, §4). */
export interface Prefill {
  services?: readonly ServiceKey[];
  propertyType?: PropertyType;
  wires?: WiresKey;
  role?: RoleKey;
}

export type CtaKind = "primary" | "secondary" | "trade" | "contextual";
export type TrackEvent = "cta_click" | "call_click" | "text_click" | "email_click" | "outbound_click";

export interface Cta {
  label: string;
  href: string;
  /** data-track */
  track: TrackEvent;
  /** data-track-id (cro-spec §2 table) */
  trackId: string;
  /** data-track-type */
  kind: CtaKind;
  ariaLabel?: string;
  prefill?: Prefill;
  /** target="_blank" rel="noopener" (Instagram only) */
  external?: boolean;
}

/** Legacy alias: the old ui/Button.astro imports `Link`. */
export type Link = Cta;

export interface Option<K extends string = string> {
  key: K;
  label: string;
}

export type MediaSource = "client" | "pexels";

export interface MediaRef {
  /** Elena's slot name or the client file name. */
  slot: string;
  source: MediaSource;
  /** "" = decorative (the heading beside it carries the meaning). */
  alt: string;
}

export interface Price {
  /** Whole US dollars. Rendered in Geist Mono with the sunset badge. */
  amount: number;
  /** Rendered as "from $129" */
  prefix: "from";
  /** e.g. "per TV", "for 2 cameras" */
  unit?: string;
  sample: true;
}

// ── Contact (all dummy except Instagram) ───────────────────────────────────────────

const SMS_DEFAULT = "Hi Jay, I found you on your website. I need help with a TV / Wi-Fi / camera job.";

export const contact = {
  businessName: "TechSolutions FL", // must match schema `name` exactly (seo-spec §3)
  owner: "Jay", // first name only; surname unknown (context.md)
  phoneDisplay: "(305) 555-0142", // NEEDS DATA: Jay's real phone. Fictional 555-01XX range so a demo tap rings no one.
  phoneE164: "+13055550142", // NEEDS DATA: Jay's real phone. Matches schema telephone (seo-spec §5).
  phoneHref: "tel:+13055550142", // NEEDS DATA: Jay's real phone
  /** sms: base. Append encodeURIComponent(body). `?&body=` is the cross-platform form (cro-spec §2, UNVERIFIED on current iOS/Android). */
  smsBase: "sms:+13055550142?&body=", // NEEDS DATA: Jay's real mobile (text-first per IG "Text or call" highlight)
  email: "book@techsolutionsfl.example", // NEEDS DATA: Jay's real email. .example TLD cannot deliver.
  emailHref: "mailto:book@techsolutionsfl.example", // NEEDS DATA: Jay's real email
  instagramHandle: "@tech_solutionsfl", // observed 2026-10-07
  instagramUrl: "https://www.instagram.com/tech_solutionsfl/", // observed 2026-10-07
  // No officialSite: Jay has no website (context.md, observed 2026-10-07).
  areaLong: "Miami-Dade and Broward", // NEEDS DATA: service radius; only "Downtown MIA" is observed
  sample: true,
} as const;

const sms = (body: string) => `${contact.smsBase}${encodeURIComponent(body)}`;

/** Section ids. Keys mirror Iron Sound's `anchors`; values are TechSolutions'. */
export const anchors = {
  top: "top",
  brands: "gear",
  services: "services",
  sectors: "spaces",
  lighting: "before-after", // Iron Sound's signature slot, here the wires slider
  process: "how-it-works",
  trade: "multi-unit",
  work: "work",
  reviews: "reviews",
  area: "service-area",
  faq: "faq",
  consult: "book",
} as const;

const BOOK = `#${anchors.consult}`;
const BOOK_LABEL = "Book an install"; // cro-spec §2: one primary action, Book. Submit says "Send my request".
const CALL_LABEL = `Call ${contact.phoneDisplay}`;

const call = (trackId: string, label: string = CALL_LABEL): Cta => ({
  label,
  href: contact.phoneHref,
  track: "call_click",
  trackId,
  kind: "secondary",
  ariaLabel: `Call TechSolutions FL on ${contact.phoneDisplay}`, // NEEDS DATA: Jay's real phone
});

const text = (trackId: string, label: string = "Text us", body: string = SMS_DEFAULT): Cta => ({
  label,
  href: sms(body),
  track: "text_click",
  trackId,
  kind: "secondary",
  // Button.astro demotes this to a description when it does not contain the visible label (WCAG 2.5.3).
  ariaLabel: `Text TechSolutions FL on ${contact.phoneDisplay}`, // NEEDS DATA: Jay's real mobile
});

const book = (trackId: string, label: string = BOOK_LABEL, prefill?: Prefill, kind: CtaKind = "primary"): Cta => ({
  label,
  href: BOOK,
  track: "cta_click",
  trackId,
  kind,
  ...(prefill ? { prefill } : {}),
});

// ── Meta / SEO (seo-spec §3, as before) ────────────────────────────────────────────

export const meta = {
  lang: "en-US",
  title: "TV Mounting in Miami, Wi-Fi & Cameras | TechSolutions FL",
  // Ruth: was "hides the wires" (read as in-wall on concrete). Mirror in seo-spec §3.
  description:
    "Jay mounts TVs on Miami concrete and drywall, hides wires in drywall, sets up mesh Wi-Fi and installs cameras. See starting prices, then text, call or book.",
  ogTitle: "TechSolutions FL: TV mounting, Wi-Fi and cameras in Miami",
  ogDescription:
    "TV mounting, Wi-Fi and cameras for Miami condos, homes and offices. Starting prices on the page. Book by text, call or the form.",
  ogImage: "brand/og.png", // build with withBase(); 1200x630 from Elena, must include "Concept by Qognition"
  ogImageAlt: "TechSolutions FL concept site: TV mounting, Wi-Fi and cameras in Miami",
  ogType: "website",
  ogSiteName: "TechSolutions FL",
  ogLocale: "en_US",
  twitterCard: "summary_large_image",
  /** Iron Sound feeds this to schema `slogan`. Nadia decides whether to emit it. */
  slogan: "The room looks finished. Everything in it works.",
  // NEEDS DATA: "Jay mounts" and "One Miami installer" are inferred positioning (seo-spec §3).
} as const;

// ── Concept ribbon (guardrails: required disclosure) ───────────────────────────────

export const ribbon = {
  text: "Concept site by Qognition — sample content", // operator-supplied, verbatim. The em dash is theirs.
  /** Longer version for title/aria and the footer. */
  disclosure:
    "This is a concept site prepared by Qognition. It is not an official TechSolutions FL website. The phone number, email, prices, gear list and reviews are sample content.",
  ariaLabel: "Concept site by Qognition. Phone, email, prices, gear list and reviews on this page are sample content.",
} as const;

// ── Nav ────────────────────────────────────────────────────────────────────────────

export const nav = {
  skipLink: "Skip to content",
  logoAlt: "TechSolutions FL", // must match schema `name` exactly (seo-spec §3)
  logoLabel: "TechSolutions FL, back to top",
  menuOpen: "Menu",
  menuClose: "Close menu",
  links: [
    { label: "Services", href: `#${anchors.services}` },
    { label: "Condo · House · Office", href: `#${anchors.sectors}` },
    { label: "How it works", href: `#${anchors.process}` },
    { label: "Work", href: `#${anchors.work}` },
    { label: "FAQ", href: `#${anchors.faq}` },
  ],
  primary: book("nav_book"),
  /** Desktop only, as text (cro-spec §2). */
  phone: call("nav_call", contact.phoneDisplay), // NEEDS DATA: Jay's real phone
} as const;

// ── Hero (service-led; Jay is a byline only) ───────────────────────────────────────

export interface Hero {
  /** Display <p> ABOVE the H1, may be styled largest (Iron Sound pattern). */
  kicker: string;
  /** The only H1 on the page. */
  heading: string;
  subhead: string;
  primary: Cta;
  secondary: Cta;
  /** Small text. Render under the CTAs, never as a headline or a portrait. null = render nothing. */
  byline: { text: string; sample: true } | null;
  areaLine: string;
  /** Poster <Picture> alt. The video is aria-hidden. */
  posterAlt: string;
}

export const hero: Hero = {
  kicker: "The room looks finished. Everything in it works.",
  // CHANGED from seo-spec §3 ("TV mounting in Miami. Wi-Fi and cameras in the same visit.") on the
  // operator's services-first ruling. Keeps "TV mounting" + "Miami" for the primary term. Nadia signs off.
  heading: "TV mounting, Wi-Fi, cameras and smart home installs for Miami condos, homes and offices",
  // NEEDS DATA: "before we leave" = Jay's test-before-leaving practice.
  subhead:
    "TVs mounted on drywall or concrete, with the cables inside the wall on drywall and in a paint-matched raceway on concrete. Wi-Fi that reaches the back bedroom. Cameras, doorbells and smart locks working on your phone before we leave.",
  primary: book("hero_book"),
  secondary: text("hero_text", "Text us"),
  byline: {
    text: "Installed by Jay, owner of TechSolutions FL",
    sample: true, // NEEDS DATA: Jay does the installs himself, or with helpers
  },
  areaLine: "Miami-Dade and Broward", // NEEDS DATA: service radius; Broward unconfirmed
  // COPY NEEDED after Mira pins the poster: describe the actual frame. Never attribute stock to Jay.
  posterAlt: "Bright living room with a TV set into a lit wall niche and floor-to-ceiling glass doors",
};

// ── Gear strip (Iron Sound `partners`) ─────────────────────────────────────────────

export interface Brand {
  name: string;
  system: string;
}

// Plain text, no logo files. Gear we install, never "dealer", "partner", "authorized" or "certified" (guardrails).
// NEEDS DATA: confirm with Jay. Each brand below is an operator example, not observed on his Instagram.
export const partners = {
  heading: "Gear we install and set up (sample list)",
  brands: [
    { name: "Samsung · LG · Sony", system: "TVs" }, // NEEDS DATA: confirm with Jay
    { name: "Sonos", system: "Soundbars and speakers" }, // NEEDS DATA: confirm with Jay
    { name: "eero · Ubiquiti", system: "Mesh Wi-Fi and access points" }, // NEEDS DATA: confirm with Jay
    { name: "Ring · Google Nest", system: "Cameras and video doorbells" }, // NEEDS DATA: confirm with Jay
    { name: "August · Yale", system: "Smart locks" }, // NEEDS DATA: confirm with Jay
  ] satisfies readonly Brand[],
} as const;

// ── Services bento (6) ─────────────────────────────────────────────────────────────

export interface ServiceTile {
  id: Exclude<ServiceKey, "other">;
  size: "large" | "small";
  /** H3 */
  heading: string;
  /** Opens with what gets installed and where. */
  lede: string;
  body: string;
  /** null = no starting price; render `priceNote` instead. */
  price: Price | null;
  /** Second price line under the main one. */
  alsoFrom?: { label: string; price: Price };
  /** Shown when price is null. */
  priceNote?: string;
  link: Cta;
  media: MediaRef;
}

// trackIds keep Marcus's svc_* prefix (cro-spec §2) rather than Iron Sound's services_tile_*.
const tileLink = (id: Exclude<ServiceKey, "other">, what: string): Cta => ({
  label: "Add to my booking",
  href: BOOK,
  track: "cta_click",
  trackId: `svc_${id}_book`,
  kind: "contextual",
  ariaLabel: `Add ${what} to my booking request`,
  prefill: { services: [id] },
});

export const services = {
  // CHANGED from seo-spec §3 (four services) to six. Nadia signs off.
  heading: "TV mounting, home theater, Wi-Fi, cameras, smart home and office AV in Miami",
  display: "From the wall to the Wi-Fi.",
  tiles: [
    {
      id: "tv",
      size: "large",
      heading: "TV mounting and hidden wires",
      lede: "Your TV mounted level on drywall or concrete, with the soundbar under it if you have one.",
      // NEEDS DATA: Jay's concrete method (raceway, paint-matched or not).
      body: "On drywall, the cables run inside the wall and power goes through an in-wall kit, the way the electrical code requires. Solid concrete has no cavity, so the cables go in a slim raceway painted to match. You know which before we drill.",
      price: { amount: 129, prefix: "from", unit: "per TV", sample: true }, // NEEDS DATA: Jay's TV mount price; concrete surcharge or not; mount included or extra
      alsoFrom: {
        label: "With wires inside the wall (drywall)",
        price: { amount: 249, prefix: "from", sample: true }, // NEEDS DATA: Jay's in-wall price; power kit included?
      },
      link: tileLink("tv", "TV mounting"),
      media: { slot: "svc-tv", source: "pexels", alt: "" },
    },
    {
      id: "wifi",
      size: "large",
      heading: "Wi-Fi and mesh networking",
      lede: "Wi-Fi that reaches the back bedroom, the balcony and the desk where you take calls.",
      body: "Concrete walls and a tower full of neighbors' networks choke the signal. We find the dead zone, fix it with mesh or a wired access point, then reconnect your devices.",
      price: { amount: 179, prefix: "from", sample: true }, // NEEDS DATA: Jay's Wi-Fi/mesh price; Ethernet runs priced separately?
      link: tileLink("wifi", "Wi-Fi and mesh networking"),
      media: { slot: "svc-wifi", source: "pexels", alt: "" },
    },
    {
      id: "theater",
      size: "small",
      heading: "Home theater and sound", // NEEDS DATA: does Jay do surround and multi-room audio? Not in his IG bio.
      lede: "A soundbar under the TV, or a surround set placed and wired for the room.",
      body: "Speaker wire goes inside drywall, or along a paint-matched raceway on concrete. Sonos speakers grouped so music plays in every room from one app.",
      price: null,
      priceNote: "Quoted per room. Text a photo and we'll send a price.", // NEEDS DATA: Jay's theater pricing and photo-quote practice
      link: tileLink("theater", "home theater and sound"),
      media: { slot: "svc-theater", source: "pexels", alt: "" },
    },
    {
      id: "cameras",
      size: "small",
      // Operator-specified title. Body says "camera installation". No "secure", "alarm", "monitoring" (guardrails).
      // NEEDS DATA: DBPR licence status for camera work (held FAQ Q9).
      heading: "Security cameras and doorbells",
      lede: "Camera installation for the front door, the gate and the driveway, plus video doorbells.",
      body: "Wired or battery cameras, mounted, aimed and running in the app on your phone. Audio recording switched off on request.",
      price: { amount: 349, prefix: "from", unit: "for 2 cameras", sample: true }, // NEEDS DATA: Jay's camera price
      link: tileLink("cameras", "security cameras and doorbells"),
      media: { slot: "svc-cameras", source: "pexels", alt: "" },
    },
    {
      id: "smart",
      size: "small",
      heading: "Smart locks and home automation",
      lede: "Smart locks, thermostats, doorbells and speakers, installed and on your Wi-Fi.", // light switches removed: mains wiring may need a Florida licence (NEEDS DATA)
      // NEEDS DATA: does Jay serve short-term-rental hosts?
      body: "Set up in your app, not just screwed to the door. Renting the unit out? We set the guest lock codes so check-in works when you're not there.",
      price: { amount: 89, prefix: "from", unit: "per device", sample: true }, // NEEDS DATA: Jay's smart-device price
      link: tileLink("smart", "smart locks and home automation"),
      media: { slot: "svc-smart", source: "pexels", alt: "" },
    },
    {
      id: "office",
      size: "small",
      heading: "Office network and AV setup", // NEEDS DATA: does Jay take office jobs? (one reported competitor review only)
      lede: "Office Wi-Fi, wired desks and printers, and the meeting-room TV.",
      body: "One cable or a screen-share puts a laptop on the meeting-room screen. A camera on the entrance, viewable from the owner's phone.",
      price: null,
      priceNote: "Quoted per office.", // NEEDS DATA: Jay's office pricing
      link: tileLink("office", "office network and AV"),
      media: { slot: "svc-office", source: "pexels", alt: "" },
    },
  ] satisfies readonly ServiceTile[],
  footnote: "Sample prices for this concept. The final price is confirmed by text before the visit.", // NEEDS DATA: real prices, trip fee, warranty; text-confirm practice
  cta: book("services_book"),
} as const;

// ── Property switcher (Iron Sound Home / Business / Boat → Condo / House / Office) ──

export interface SectorPanel {
  id: Exclude<PropertyType, "townhouse">;
  tabLabel: string;
  /** H3 inside the panel */
  heading: string;
  /** Memorable line, <p> */
  headline: string;
  /** One sentence naming what is installed there. */
  opener: string;
  bullets: readonly [string, string, string];
  cta: Cta;
  secondary: Cta;
  media: MediaRef;
  /** Optional line, render only when non-null. */
  note: string | null;
}

export const sectors = {
  heading: "TV, Wi-Fi and camera installs for condos, houses and offices",
  display: "High-rise, house or office. Different walls, same clean finish.",
  tablistLabel: "Choose the type of property",
  panels: [
    {
      id: "condo",
      tabLabel: "Condo",
      heading: "Condos and high-rises",
      headline: "The wall decides how the wires go.",
      opener:
        "In condos and high-rises we mount TVs on concrete and drywall, fix Wi-Fi that dies two rooms from the router, and set up smart locks and thermostats.",
      bullets: [
        // NEEDS DATA: Jay's concrete method. Never in-wall on solid concrete (seo-spec §8 D2).
        "Drywall: cables run inside the wall. Solid concrete: a slim raceway, painted to match. You know which before we drill.",
        "Wi-Fi planned around concrete: mesh, or a wired access point in the room where the signal dies.",
        // A question, not a claim. NEEDS DATA: liability insurance and COI capability. Do not answer it here until Jay confirms.
        "Does your building ask for a certificate of insurance, set drilling hours or need the service elevator booked? Tell us when you book.",
      ],
      cta: book("env_condo_book", "Book a condo install", { propertyType: "condo" }, "contextual"),
      secondary: text("env_text", "Text us"),
      media: { slot: "env-condo", source: "pexels", alt: "" },
      note: null,
    },
    {
      id: "house",
      tabLabel: "House",
      heading: "Houses and townhouses",
      headline: "Every room on the Wi-Fi. Every door on your phone.",
      opener:
        "In houses and townhouses we mount TVs room by room, push Wi-Fi out to the patio and the far bedroom, and put cameras on the front door, the side gate and the driveway.",
      bullets: [
        "Interior drywall: cables inside the wall. Block or concrete walls: a paint-matched raceway.",
        "Mesh or wired access points, so the signal reaches the patio and the bedroom at the end of the hall.",
        "Cameras, video doorbells and smart locks set up and working on your phone.",
      ],
      cta: book("env_house_book", "Book a house install", { propertyType: "house" }, "contextual"),
      secondary: text("env_text", "Text us"),
      media: { slot: "env-house", source: "pexels", alt: "" },
      note: null,
    },
    {
      id: "office",
      tabLabel: "Office",
      heading: "Offices",
      headline: "The screen works when the meeting starts.",
      // NEEDS DATA: does Jay take office jobs?
      opener:
        "In small offices we set up the Wi-Fi and wired desks, mount the meeting-room TV and put a camera on the entrance.",
      bullets: [
        "Meeting-room TV mounted, with one cable or a screen-share to put a laptop on it.",
        "Office Wi-Fi plus wired runs to desks and printers.", // NEEDS DATA: Ethernet runs priced separately?
        // A question, not an availability claim. NEEDS DATA: Jay's working hours.
        "Need it done before opening or after close? Say so when you book.",
      ],
      cta: book("env_office_book", "Book an office install", { propertyType: "office", services: ["office"] }, "contextual"),
      secondary: text("env_text", "Text us"),
      media: { slot: "env-office", source: "pexels", alt: "" },
      note: null,
    },
  ] satisfies readonly SectorPanel[],
} as const;

// ── Signature: before/after "wires gone" slider (Iron Sound `lighting` slot) ────────

// One illustration pair, drywall wall, one visible cord in the Before frame (MARS alignment,
// 2026-10-07). Captions describe only what changes in the frame. Body carries the concrete rule.
export const beforeAfter = {
  heading: "Before and after: the same wall, wires hidden", // seo-spec §3, unchanged
  display: "Same wall. Wires gone.",
  // NEEDS DATA: Jay's concrete method.
  body: "Same TV, same wall. Before, the cord hangs in plain sight. After, the cables run inside the drywall and power goes through an in-wall kit. On solid concrete there's no cavity, so the cables go in a slim raceway painted to match. You know which before we drill.",
  /** Visible label beside the handle. */
  controlLabel: "Drag to compare",
  /** role="slider" aria-label (seo-spec §3). */
  sliderAriaLabel: "Compare before and after",
  states: {
    before: {
      label: "Before",
      caption: "Before. The cord hangs from the TV to the outlet.",
      alt: "Before: wall-mounted TV with a power cord hanging below it",
    },
    after: {
      label: "After",
      caption: "After. Same TV, cables inside the drywall. Nothing shows.",
      alt: "After: same TV with no cables visible",
    },
  },
  /** Visible label on the image (guardrails: stock is never captioned as Jay's work). */
  // NEEDS DATA: Jay's own before/after pair. Swap to "Drywall, <neighborhood>" only with his photos.
  illustrationNote: "Illustration, drywall wall. Not a photo of a TechSolutions FL job.",
  /** Prefills the TV service only: a wires value would be wrong for a concrete wall. */
  cta: book("slider_book", "Book a TV mount with hidden wires", { services: ["tv"] }, "contextual"),
} as const;

// ── Process ────────────────────────────────────────────────────────────────────────

export interface ProcessStep {
  n: 1 | 2 | 3 | 4;
  /** Stepper label: Pick & price → Confirm by text → Install & test → Walkthrough */
  short: string;
  /** H3 */
  heading: string;
  body: string;
}

export type TestimonialId = "andrea-brickell" | "luis-edgewater" | "renee-coral-gables";

// Named `processSteps`, not `process`, so it never shadows Node's global in shared tooling.
export const processSteps = {
  heading: "How booking an install works", // seo-spec §3, unchanged
  display: "Price first. Drill second.",
  steps: [
    {
      n: 1,
      short: "Pick & price",
      heading: "Pick the job, see the price",
      body: "Choose the service, the TV size or the room where the Wi-Fi dies. Most services show a starting price on the page before you send anything.",
    },
    {
      n: 2,
      short: "Confirm by text",
      heading: "We confirm by text",
      // NEEDS DATA: does Jay confirm by text, give time windows, ask about building rules?
      body: "You get a text back with the final price, a time window, and any building rules to plan for, like drilling hours or the service elevator.",
    },
    {
      n: 3,
      short: "Install & test",
      heading: "Installed and tested",
      // NEEDS DATA: test-before-leaving practice. Ruth struck "Done in one visit" earlier; do not restore without Jay.
      body: "Mounted, wired and connected. Every HDMI input, every device on the Wi-Fi and every camera in your app gets checked before we pack up.",
    },
    {
      n: 4,
      short: "Walkthrough",
      heading: "A walkthrough before we leave",
      // NEEDS DATA: walkthrough and clean-up practice.
      body: "We show you the remote, the app and the new Wi-Fi name, then clear the dust and the boxes.",
    },
  ] satisfies readonly ProcessStep[],
  /** No quote beside step 4: the reviews are samples, and repeating one there doubles a dummy. */
  step4TestimonialId: null as TestimonialId | null,
  primary: book("how_book"),
  secondary: text("how_text", "or text us"),
} as const;

// ── Multi-unit band (Iron Sound `trade`) ───────────────────────────────────────────

// NEEDS DATA: does Jay serve property managers and short-term-rental hosts, and price multi-unit jobs as a set?
export const trade = {
  heading: "One booking for every unit.",
  body: "Same TV height, same Wi-Fi setup and lock codes you can change from your phone, in every unit. Send the unit list and the addresses, and we text back one price for the set.",
  audience: "For property managers, Airbnb hosts and office managers.",
  cta: {
    label: "Quote my units",
    href: BOOK,
    track: "cta_click",
    trackId: "trade_quote",
    kind: "trade",
    prefill: { role: "property_manager" },
  } satisfies Cta,
  secondary: text("trade_text", "Text us the unit list", "Hi Jay, I manage several units and need a quote for TV, Wi-Fi and lock installs."),
} as const;

// ── Projects (gallery) ─────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  /** Elena's slot (seo-spec §3 file-name rule). */
  slot: string;
  /** H3: what + where in the room. City only with Jay's own photo. */
  heading: string;
  caption: string;
  alt: string;
  source: MediaSource;
  credit: string;
  /** Visible on the frame while source is "pexels". */
  label: string;
  tag: string;
  sample: true;
}

// All six are Pexels stock until Jay supplies his own with permission. Captions and alts are
// aligned to the stock frames Mira already pinned (MARS, 2026-10-07). If the image changes,
// change the image back, not the caption.
// NEEDS DATA: Jay's install photos + permission.
const PROJECT_PHOTOS_CONFIRMED = false;

export const projects = {
  // seo-spec §3: "Recent installs" only when every image is Jay's own, used with permission.
  heading: PROJECT_PHOTOS_CONFIRMED ? "Recent installs" : "What a finished install looks like",
  display: "Look closely. Then look for the cables.",
  intro: "These frames are stock photos, labelled as samples. Real installs are on Instagram.",
  items: [
    {
      id: "tv-drywall",
      slot: "tv-mounted-hidden-cables",
      heading: "Living room TV, drywall",
      caption: "Living room TV on drywall. Cables inside the wall.",
      alt: "Large TV mounted above a low console with no visible cables",
      source: "pexels",
      credit: "Stock photo, Pexels",
      label: "Stock image, sample",
      tag: "TV",
      sample: true,
    },
    {
      id: "raceway",
      slot: "tv-concrete-raceway",
      heading: "Cable raceway, concrete wall",
      caption: "Concrete wall? Cables run in a slim raceway, painted to match.",
      alt: "Slim white cable raceway running neatly along a wall",
      source: "pexels",
      credit: "Stock photo, Pexels",
      label: "Stock image, sample",
      tag: "TV",
      sample: true,
    },
    {
      id: "tv-centered",
      slot: "soundbar-under-tv",
      heading: "TV, centered on the wall",
      caption: "TV centered on the wall. No cords below it.",
      alt: "Wall-mounted TV in a clean, cable-free living room",
      source: "pexels",
      credit: "Stock photo, Pexels",
      label: "Stock image, sample",
      tag: "TV",
      sample: true,
    },
    {
      id: "devices",
      slot: "mesh-wifi-node-shelf",
      heading: "Connected devices, shelf",
      caption: "Smart home devices set up and connected.",
      alt: "Small white smart home device on a shelf",
      source: "pexels",
      credit: "Stock photo, Pexels",
      label: "Stock image, sample",
      tag: "Wi-Fi",
      sample: true,
    },
    {
      id: "camera",
      slot: "outdoor-camera-eave",
      heading: "Outdoor camera, entry",
      caption: "Outdoor camera on the wall, aimed at the entry.",
      alt: "Outdoor security camera mounted on an exterior wall",
      source: "pexels",
      credit: "Stock photo, Pexels",
      label: "Stock image, sample",
      tag: "Cameras",
      sample: true,
    },
    {
      id: "lock",
      slot: "smart-lock-door",
      heading: "Smart lock, front door",
      caption: "Smart lock on a front door, guest codes set in the app.",
      alt: "Keypad smart lock on a grey front door",
      source: "pexels",
      credit: "Stock photo, Pexels",
      label: "Stock image, sample",
      tag: "Smart home",
      sample: true,
    },
  ] satisfies readonly Project[],
  cta: book("gallery_book"),
  instagramLink: {
    label: `More installs on Instagram ${contact.instagramHandle}`,
    href: contact.instagramUrl,
    track: "outbound_click",
    trackId: "ig_out",
    kind: "secondary",
    external: true,
  } satisfies Cta,
} as const;

// ── Testimonials (SAMPLES, not real reviews) ───────────────────────────────────────

export interface Testimonial {
  id: TestimonialId;
  quote: string;
  /** First name and neighborhood, both invented. */
  author: string;
  service: string;
  /** Kept for shape parity with Iron Sound. Render nothing when empty. */
  moment: string;
  /** Visible on every card. */
  label: string;
  sample: true;
}

// NEEDS DATA: real reviews Jay can share, with permission. No Review/AggregateRating schema (seo-spec §5).
// No stars, no photos, no counts.
export const testimonials = {
  // Ruth (2026-10-07): "What customers say" over dummy quotes reads as verified. Restore only with real reviews.
  heading: "Reviews from Jay's customers go here",
  display: "Sample reviews for this concept",
  items: [
    {
      id: "andrea-brickell",
      quote:
        "Our wall in the condo is solid concrete. Jay told me up front the cables could not go inside it and showed me the raceway he would use. Painted to match, you barely see it. The 65-inch is dead level.",
      author: "Andrea, Brickell",
      service: "TV mounting",
      moment: "",
      label: "Sample review",
      sample: true, // NEEDS DATA: real reviews
    },
    {
      id: "luis-edgewater",
      // NEEDS DATA: same-visit multi-service capacity ("One visit, both done").
      quote:
        "Booked the TV and asked about the Wi-Fi while he was here. He put a mesh point outside the bedroom and it finally works in there. One visit, both done.",
      author: "Luis, Edgewater",
      service: "TV mounting, Wi-Fi",
      moment: "",
      label: "Sample review",
      sample: true, // NEEDS DATA: real reviews
    },
    {
      id: "renee-coral-gables",
      quote:
        "Two cameras, front door and side gate, running on my phone before he left. He texted the price first and that is what I paid.",
      author: "Renee, Coral Gables",
      service: "Camera installation",
      moment: "",
      label: "Sample review",
      sample: true, // NEEDS DATA: real reviews
    },
  ] satisfies readonly Testimonial[],
  cta: book("reviews_book"),
} as const;

// ── Service area ───────────────────────────────────────────────────────────────────

// NEEDS DATA: service radius, Broward yes/no, neighborhood and ZIP list, travel fee.
// Only "Downtown MIA" is observed (IG highlight). Neighborhoods stay in this list only, never
// stacked in a sentence (seo-spec §2). The three Broward/north entries are new: Nadia adds them to
// areaServed or they come out.
export const serviceArea = {
  heading: "Service area: Miami-Dade and Broward",
  display: "Two counties. One text to find out.",
  body: "We work in high-rises, houses, townhouses and offices across Miami-Dade and Broward.", // NEEDS DATA: office jobs; Broward
  counties: ["Miami-Dade County", "Broward County"],
  neighborhoodsLabel: "Neighborhoods",
  cities: [
    "Downtown Miami", // observed: IG "Downtown MIA" highlight
    "Brickell", // NEEDS DATA: confirm
    "Edgewater", // NEEDS DATA: confirm
    "Wynwood", // NEEDS DATA: confirm
    "Coconut Grove", // NEEDS DATA: confirm
    "Coral Gables", // NEEDS DATA: confirm
    "Doral", // NEEDS DATA: confirm
    "Kendall", // NEEDS DATA: confirm
    "Miami Beach", // NEEDS DATA: confirm
    "Aventura", // NEEDS DATA: confirm; not in seo-spec areaServed
    "Hollywood", // NEEDS DATA: confirm; Broward; not in seo-spec areaServed
    "Fort Lauderdale", // NEEDS DATA: confirm; Broward; not in seo-spec areaServed
  ],
  mapLabel: "Map of Miami-Dade and Broward counties",
  outOfAreaNote: "Not on the list? Send your ZIP with the request and we'll tell you if we can make it.",
  ask: {
    label: "Not sure we cover you? Ask us",
    href: BOOK,
    track: "cta_click",
    trackId: "area_ask",
    kind: "contextual",
  } satisfies Cta,
  secondary: text("area_text", "Text us your ZIP", "Hi Jay, do you cover my area? My ZIP is "),
  sample: true,
} as const;

// ── FAQ (Nadia's Q1–Q8, VERBATIM incl. Ruth's Q1 edit; text = FAQPage schema text). Q9 held. ──

export interface FaqItem {
  /** faq_open `faq_id` (cro-spec §5) */
  id: string;
  /** H3 */
  question: string;
  /** Renders in the <p> after the H3. Bound to schema. Do not edit without Nadia. */
  answer: string;
  /** Rendered after the answer, outside the schema text. */
  link?: Cta;
}

export const faq = {
  heading: "Questions Miami condo and home owners ask",
  display: "Straight answers before anyone drills.",
  items: [
    {
      id: "concrete",
      question: "Can you mount a TV on a concrete wall in a Miami condo?",
      // Ruth: removed unsourced "Most Miami high-rises have poured-concrete walls". Mirror in seo-spec §4 and §5 JSON-LD.
      answer:
        "Yes. Concrete holds a TV mount well when the holes are drilled with a hammer drill and the mount is fixed with concrete anchors rated for the TV's weight. In a high-rise, the building is usually the harder part: many associations only allow drilling during set hours, so check your condo's work rules first.",
    },
    {
      id: "coi",
      question: "What does my condo association need before a TV or camera install?",
      // NEEDS DATA: if Jay carries liability insurance and can issue a COI, Nadia's add-on line goes here. Not before.
      answer:
        "Usually a certificate of insurance. Most Miami condo boards want one on file before work begins, with the association named as additional insured. Some buildings also set work hours or ask you to reserve the service elevator. Ask your management office for its contractor requirements in writing and share them when you book.",
      link: {
        label: "See how condo installs work",
        href: `#${anchors.sectors}`,
        track: "cta_click",
        trackId: "faq_sectors",
        kind: "contextual",
      },
    },
    {
      id: "hide-wires",
      question: "Can you hide TV wires inside a concrete wall?",
      answer:
        "Not inside solid concrete, because there's no cavity for cable. If the TV wall is drywall, or drywall furred out over concrete, HDMI cables can run inside it. Power needs a listed in-wall power kit: the electrical code (NEC 400.12) bans hiding a TV's plug-in cord in a wall. On solid concrete, a paintable raceway keeps cables neat.",
      link: {
        label: "See the before and after",
        href: `#${anchors.lighting}`,
        track: "cta_click",
        trackId: "faq_slider",
        kind: "contextual",
      },
    },
    {
      id: "mesh",
      question: "Mesh Wi-Fi or a Wi-Fi extender: which is better?",
      answer:
        "Mesh, in most homes. An extender repeats your router's signal, often under a second network name, and the repeated connection is usually slower. Mesh uses several units that share one network name and pass your phone between them as you move. Faster still is mesh or access points linked by Ethernet cable, which keeps speeds up in the far bedroom.",
    },
    {
      id: "weak-wifi",
      question: "Why is my Wi-Fi weak in my Miami high-rise apartment?",
      answer:
        "Usually the concrete and the neighbors. Reinforced concrete blocks Wi-Fi far more than drywall, and in a tower dozens of nearby networks crowd the same channels. A router left in the closet where the internet line enters makes it worse. Moving the router to the unit's center, or wiring an access point into the dead room, is the usual fix.",
    },
    {
      id: "camera-audio",
      question: "Can my home security cameras record audio in Florida?",
      answer:
        "Be careful with audio. Florida is an all-party consent state, so recording a private conversation without everyone's permission can break Fla. Stat. 934.03. Video without sound isn't covered by that statute, but cameras still shouldn't look into places where people expect privacy. Most camera apps let you switch audio recording off. This is general information, not legal advice.",
    },
    {
      id: "outage",
      question: "Will my security cameras keep recording during a hurricane power outage?",
      answer:
        "Only if their power and network stay up. Wired PoE cameras draw power from one switch or recorder, so a battery backup (UPS) on that box keeps them recording for as long as the battery lasts. Battery-powered Wi-Fi cameras stay on, but they can't upload clips once the router loses power, unless the router and modem are on backup too.",
    },
    {
      id: "airbnb-lock",
      question: "Does a smart lock for an Airbnb need Wi-Fi?",
      // NEEDS DATA: whether Jay serves short-term-rental hosts. If not, Nadia swaps in a smart-thermostat question.
      answer:
        "For Airbnb's own lock connection, yes. Airbnb's help center states: \"Your lock must be connected to wifi to connect to Airbnb.\" A Bluetooth-only lock needs a phone nearby to change codes, which doesn't work when you manage the unit remotely. If the unit's Wi-Fi drops out, fix the network before you rely on the lock for guest check-in.",
      link: {
        label: "Hosting several units? Book them together",
        href: `#${anchors.trade}`,
        track: "cta_click",
        trackId: "faq_trade",
        kind: "trade",
      },
    },
  ] satisfies readonly FaqItem[],
  // cro-spec §2: people asking questions want a conversation, so Text leads here, not Book.
  primary: text("faq_text", "Text us a question", "Hi Jay, I have a question before I book."),
  secondary: call("faq_call"),
} as const;

// ── Booking form (#book): Iron Sound's multi-step structure, cro-spec §4 fields ──────

export type StepKey = "service" | "details" | "property" | "when" | "contact";

export interface Field<K extends string = string> {
  /** Form field name (cro-spec §4). */
  name: string;
  label: string;
  helper?: string;
  options?: readonly Option<K>[];
  error?: string;
}

export const form = {
  heading: "Book a TV mount, Wi-Fi setup or camera install", // H2 (seo-spec §3); step labels are <legend>s
  display: "Tell us the wall. We'll text the price.", // NEEDS DATA: text-back practice
  intro: "Five short steps, most of them one tap. No address, no payment. We text you back to confirm the price and a time.",
  /** Visible progress text. Replace {current} and {total}. */
  progress: "Step {current} of {total}",
  /** Polite aria-live announcement on step change. */
  progressLive: "Step {current} of {total}: {step}",
  back: "Back",
  errorSummary: "{count} answers need a fix before you continue:",
  stepNames: {
    service: "Service",
    details: "Details",
    property: "Property",
    when: "When",
    contact: "Contact",
  } satisfies Record<StepKey, string>,

  // Step 1. Prefilled by every "Add to my booking" / panel / slider CTA.
  service: {
    legend: "What do you need?",
    helper: "Pick everything you need. One request can cover several jobs.",
    name: "services",
    options: [
      { key: "tv", label: "TV mounting" },
      { key: "theater", label: "Home theater and sound" },
      { key: "wifi", label: "Wi-Fi and networking" },
      { key: "cameras", label: "Security cameras and doorbells" },
      { key: "smart", label: "Smart locks and home automation" },
      { key: "office", label: "Office network and AV" },
      { key: "other", label: "Something else" },
    ] satisfies readonly Option<ServiceKey>[],
    error: "Pick at least one so we know what to bring.",
    next: "Next: the details",
  },

  // Step 2. Each group renders with data-show-if="services=<key>".
  details: {
    legend: "Tell us about the job",
    helper: "Only what applies. Skip anything you're not sure about.",
    tv: {
      tvCount: { name: "tv_count", label: "How many TVs?" } satisfies Field,
      tvSize: {
        name: "tv_size",
        label: "TV size",
        options: [
          { key: "up_to_42", label: "Up to 42\"" },
          { key: "43_55", label: "43–55\"" },
          { key: "56_65", label: "56–65\"" },
          { key: "66_75", label: "66–75\"" },
          { key: "76_plus", label: "76\" and up" },
          { key: "not_sure", label: "Not sure" },
        ],
      } satisfies Field,
      wallType: {
        name: "wall_type",
        label: "What's the wall?",
        helper: "Not sure? Knock on it. A dull, solid thud usually means concrete. A hollow knock means drywall.",
        options: [
          { key: "drywall", label: "Drywall" },
          { key: "concrete", label: "Concrete" },
          { key: "brick_stone", label: "Brick or stone" },
          { key: "fireplace", label: "Over a fireplace" }, // NEEDS DATA: does Jay do fireplace/brick?
          { key: "not_sure", label: "Not sure" },
        ],
      } satisfies Field,
      wires: {
        name: "wires",
        label: "Where should the wires go?",
        helper: "Cables can't go inside solid concrete. On concrete we use a slim raceway painted to match.",
        options: [
          { key: "in_wall", label: "Inside the wall (drywall)" },
          { key: "raceway", label: "Paint-matched raceway" },
          { key: "as_is", label: "Leave them as they are" },
          { key: "advise", label: "Not sure, advise me" },
        ],
      } satisfies Field<WiresKey>,
      hasMount: {
        name: "has_mount",
        label: "Do you have a mount?",
        options: [
          { key: "yes", label: "Yes, I have one" },
          { key: "no", label: "No, bring one" }, // NEEDS DATA: mount included or extra
          { key: "not_sure", label: "Not sure" },
        ],
      } satisfies Field,
      soundbar: { name: "soundbar", label: "Mount a soundbar too" } satisfies Field,
    },
    theater: {
      theaterScope: {
        name: "theater_scope",
        label: "What's the setup?",
        options: [
          { key: "soundbar", label: "Soundbar under the TV" },
          { key: "surround", label: "Surround speakers" },
          { key: "multiroom", label: "Music in more than one room" },
          { key: "not_sure", label: "Not sure yet" },
        ],
      } satisfies Field,
    },
    wifi: {
      homeSize: {
        name: "home_size",
        label: "How big is the place?",
        options: [
          { key: "studio_1", label: "Studio or 1 bed" },
          { key: "2_3", label: "2–3 bed" },
          { key: "4_plus", label: "4+ bed" },
          { key: "office", label: "Office" },
        ],
      } satisfies Field,
      wifiIssue: {
        name: "wifi_issue",
        label: "What's going on?",
        options: [
          { key: "dead_zones", label: "Dead zones" },
          { key: "slow", label: "Slow speeds" },
          { key: "new_setup", label: "New setup" },
          { key: "mesh", label: "Mesh install" },
          { key: "ethernet", label: "Wired runs (Ethernet)" },
        ],
      } satisfies Field,
    },
    cameras: {
      cameraCount: {
        name: "camera_count",
        label: "How many cameras?",
        options: [
          { key: "1_2", label: "1–2" },
          { key: "3_4", label: "3–4" },
          { key: "5_8", label: "5–8" },
          { key: "9_plus", label: "9 or more" },
        ],
      } satisfies Field,
      cameraLocation: {
        name: "camera_location",
        label: "Where do they go?",
        options: [
          { key: "indoor", label: "Indoor" },
          { key: "outdoor", label: "Outdoor" },
          { key: "both", label: "Both" },
        ],
      } satisfies Field,
      cameraEquipment: {
        name: "camera_equipment",
        label: "Do you have the cameras?",
        options: [
          { key: "have", label: "I already have the cameras" },
          { key: "recommend", label: "I need recommendations" },
        ],
      } satisfies Field,
      doorbell: { name: "doorbell", label: "Add a video doorbell" } satisfies Field,
    },
    smart: {
      smartDevices: {
        name: "smart_devices",
        label: "Which devices?",
        options: [
          { key: "lock", label: "Smart lock" },
          { key: "thermostat", label: "Thermostat" },
          { key: "switches", label: "Smart plugs and hubs" },
          { key: "speakers", label: "Speakers or voice assistant" },
          { key: "other", label: "Other" },
        ],
      } satisfies Field,
      rental: { name: "rental", label: "This is for a short-term rental" } satisfies Field, // NEEDS DATA: does Jay serve hosts?
    },
    office: {
      officeSize: {
        name: "office_size",
        label: "How many desks?",
        options: [
          { key: "1_5", label: "1–5" },
          { key: "6_15", label: "6–15" },
          { key: "16_plus", label: "16 or more" },
        ],
      } satisfies Field,
      officeScope: {
        name: "office_scope",
        label: "What's needed?",
        options: [
          { key: "network", label: "Wi-Fi and wired desks" },
          { key: "meeting_tv", label: "Meeting-room TV" },
          { key: "printers", label: "Printers" },
          { key: "cameras", label: "Entrance camera" },
          { key: "not_sure", label: "Not sure yet" },
        ],
      } satisfies Field,
    },
    other: {
      otherDesc: {
        name: "other_desc",
        label: "What do you need?",
        error: "Tell us in a sentence what you need.",
      } satisfies Field,
      /** 10–500 characters (cro-spec §4). */
      rangeError: "Keep it between 10 and 500 characters.",
    },
    notes: {
      name: "notes",
      label: "Anything we should know? (floor, parking, TV model)",
      counter: "{used} of 500 characters",
      error: "Keep it under 500 characters.",
    },
    next: "Next: the property",
  },

  // Step 3
  property: {
    legend: "Where is the job?",
    name: "property_type",
    options: [
      { key: "condo", label: "Condo or high-rise" },
      { key: "house", label: "House" },
      { key: "townhouse", label: "Townhouse" },
      { key: "office", label: "Office" },
    ] satisfies readonly Option<PropertyType>[],
    error: "Pick the closest one.",
    // Shown only when property_type=condo. Asks; claims nothing.
    // NEEDS DATA: REMOVE this field if Jay cannot issue a COI (cro-spec row 5).
    coiNeeded: {
      name: "coi_needed",
      label: "Does your building ask for a certificate of insurance (COI)?",
      helper: "Many Miami buildings ask for one before work starts. Knowing now avoids a wasted trip.",
      options: [
        { key: "yes", label: "Yes" },
        { key: "not_sure", label: "Not sure" },
        { key: "no", label: "No" },
      ],
    } satisfies Field,
    next: "Next: when",
  },

  // Step 4
  when: {
    legend: "Where and when?",
    helper: "This is a request, not a booking. We text you to confirm a time.",
    zip: {
      name: "zip",
      label: "ZIP code",
      error: "Enter a 5-digit ZIP, like 33131.",
      /** Soft warning, never a block. NEEDS DATA: service-area ZIP list. */
      outOfArea: "That's outside our usual area. Send it anyway and we'll tell you if we can make it.",
    },
    timing: {
      name: "timing",
      label: "When do you need it?",
      options: [
        { key: "asap", label: "As soon as possible" },
        { key: "this_week", label: "This week" },
        { key: "next_week", label: "Next week" },
        { key: "date", label: "Pick a date" },
      ],
      error: "Pick when you need it.",
    } satisfies Field,
    date: {
      name: "date",
      label: "Date",
      error: "Pick a date from today on.",
      rangeError: "Pick a date within the next 60 days.",
    },
    window: {
      name: "window",
      label: "Preferred time of day (optional)",
      // NEEDS DATA: Jay's working hours. No clock times on these labels until confirmed.
      options: [
        { key: "morning", label: "Morning" },
        { key: "afternoon", label: "Afternoon" },
        { key: "evening", label: "Evening" },
        { key: "any", label: "Any time" },
      ],
    } satisfies Field,
    next: "Next: your details",
  },

  // Step 5
  contact: {
    legend: "How do we reach you?",
    firstName: { name: "first_name", label: "First name", error: "What should we call you?" },
    phone: {
      name: "phone",
      label: "Mobile number",
      error: "Enter a 10-digit mobile number, like (305) 555-0123.",
    },
    email: {
      name: "email",
      label: "Email (optional)",
      error: "That email looks incomplete.",
      requiredError: "Add your email, or pick Text or Call.",
    },
    contactPref: {
      name: "contact_pref",
      legend: "How should we reply?",
      options: [
        { key: "text", label: "Text" }, // default (cro-spec §4)
        { key: "call", label: "Call" },
        { key: "email", label: "Email" },
      ] satisfies readonly Option[],
      error: "Choose how you'd like us to reply.",
    },
    role: {
      name: "role",
      label: "I'm the…",
      options: [
        { key: "owner", label: "Owner" },
        { key: "renter", label: "Renter" },
        { key: "property_manager", label: "Property manager" },
        { key: "host", label: "Airbnb or short-term-rental host" }, // NEEDS DATA: does Jay serve hosts?
        { key: "office_manager", label: "Office manager" },
      ] satisfies readonly Option<RoleKey>[],
    },
    /** Transactional line under the consent boxes. NEEDS DATA: legal review before live. */
    consent: "We'll text or call you about this request only.",
    // Both UNCHECKED by default and OPTIONAL. Decision for Imogen/Ruth: Iron Sound makes SMS consent
    // required when Text is chosen; this site kept it optional on MARS's earlier instruction.
    // NEEDS DATA: legal review of both labels (TCPA / CAN-SPAM) before the site goes live.
    smsConsent: {
      name: "sms_consent",
      label: "Text me updates about this request (msg & data rates may apply, reply STOP to opt out)",
      error: "Tick the box to allow texts, or choose call or email.", // only used if the box becomes required
    },
    emailOptIn: { name: "email_optin", label: "Email me tips and offers" },
    honeypot: { name: "website", label: "Leave this empty" },
  },

  submit: "Send my request",
  submitting: "Sending…",
  callAlt: {
    prefix: "Prefer to text?",
    cta: text("form_text", contact.phoneDisplay), // NEEDS DATA: Jay's real mobile
    call: call("form_call", "Or call"), // NEEDS DATA: Jay's real phone
  },
  /** Under the submit button. NEEDS DATA: real reply time and hours. No number until confirmed. */
  reply: "We reply by text to confirm the price and a time.",
  // NEEDS DATA: form provider name once Luke picks one. Never "we never share your data".
  dataUse:
    "Your details go to TechSolutions FL so we can reply about this request. This form is processed by our form provider.",

  /** Replaces the form in place. Focus moves to the heading. */
  success: {
    heading: "Got it, {firstName}.",
    byPref: {
      text: "We'll text you at (•••) •••-{last4} to confirm a time.",
      call: "We'll call you at (•••) •••-{last4} to confirm a time.",
      email: "We'll email you at {email} to confirm a time.",
    },
    /** Keys are field names, for data-fill (Iron Sound pattern). */
    recapLabels: { services: "Services", property_type: "Property", zip: "ZIP", timing: "When" },
    photoLink: {
      label: "Speed it up: text us a photo of the wall",
      smsBody: "Photo for my request {ref}",
    },
    nextHeading: "What happens next",
    // NEEDS DATA: confirm Jay's process.
    next: [
      "We read your request and check the date.",
      "You get a price and a time window by text to confirm.",
      "Nothing is booked until you reply yes.",
    ],
    callLine: `Can't wait? Text or call ${contact.phoneDisplay}.`, // NEEDS DATA: Jay's real phone
  },
  error: {
    heading: "That didn't send.",
    body: "Your details are still here.",
    retry: "Try again",
    textInstead: "Text us instead",
    /** Consult.astro links the email and phone inside this sentence; keep email before phone. */
    fallback: `Or email ${contact.email}, or call ${contact.phoneDisplay}.`, // NEEDS DATA: real email and phone
    /** mailto subject, service only, no PII. */
    mailtoSubject: "Install request: {service}",
  },
  timeout: "This is taking too long. Your details are still here.",
  /** ADR §6, exact. Shown with the success layout when PUBLIC_FORM_ENDPOINT is unset. */
  demoNotice: "Concept site: this form is not connected yet.",
  demoDetail: "Nothing was sent. On the live site, this request goes straight to Jay's phone.", // NEEDS DATA: where live submissions route
} as const;

/** LEGACY alias for the old Booking.astro. Delete once Consult.astro is ported. */
export const formConsent = {
  sms: { name: form.contact.smsConsent.name, label: form.contact.smsConsent.label },
  email: { name: form.contact.emailOptIn.name, label: form.contact.emailOptIn.label },
} as const;

// ── Mobile sticky bar (Call | Text | Book, cro-spec §2) ────────────────────────────

export const stickyBar = {
  label: "Quick contact",
  call: call("sticky_call", "Call"), // NEEDS DATA: Jay's real phone
  text: text("sticky_text", "Text"), // NEEDS DATA: Jay's real mobile
  book: book("sticky_book"),
  bookAria: "Book an install",
  /** Replace "a TV / Wi-Fi / camera job" with the chosen service name when one is selected. */
  smsBody: SMS_DEFAULT,
} as const;

// ── Footer ─────────────────────────────────────────────────────────────────────────

export const footer = {
  tagline: "TV mounting, home theater, Wi-Fi, cameras, smart home and office AV, installed across Miami-Dade and Broward.", // NEEDS DATA: service area
  contactHeading: "Book or ask",
  nap: {
    name: contact.businessName,
    text: text("footer_text", `Text ${contact.phoneDisplay}`), // NEEDS DATA: Jay's real mobile
    phone: call("footer_call", `Call ${contact.phoneDisplay}`), // NEEDS DATA: Jay's real phone
    email: {
      label: contact.email,
      href: contact.emailHref,
      track: "email_click",
      trackId: "footer_email",
      kind: "secondary",
    } satisfies Cta, // NEEDS DATA: Jay's real email
    area: "Serving Miami-Dade and Broward", // NEEDS DATA: service radius
    instagram: {
      label: `Instagram ${contact.instagramHandle}`,
      href: contact.instagramUrl,
      track: "outbound_click",
      trackId: "ig_out",
      kind: "secondary",
      external: true,
    } satisfies Cta,
  },
  links: nav.links,
  hours: null as string | null, // NEEDS DATA: Jay's working hours. Render nothing while null.
  spanish: null as string | null, // NEEDS DATA: Spanish-language service. If yes: "Se habla español."
  // No licence, no "licensed & insured", no founding year.
  trademarks:
    "Samsung, LG, Sony, Sonos, eero, Ubiquiti, Ring, Google Nest, August and Yale are trademarks of their respective owners. Naming them describes the gear we install. No affiliation is implied.",
  credits: {
    pexels: { label: "Photos and video from Pexels", href: "https://www.pexels.com" }, // API term: visible link
    /** Prefix for per-author credits rendered from media-credits.json. */
    authorsPrefix: "Stock photography by",
  },
  concept: `${ribbon.disclosure} For real contact details, use Instagram ${contact.instagramHandle}.`,
  conceptCredit: "Concept and build by Qognition Agency",
  legal: "© 2026 TechSolutions FL", // NEEDS DATA: legal business name (Sunbiz)
  backToTop: "Back to top",
} as const;

// ── NEEDS DATA registry: feeds the promotion gate (lib/indexing.ts) and the README ──

export const needsData: { key: string; what: string }[] = [
  { key: "contact.phone", what: "Jay's real phone/mobile (dummy (305) 555-0142)" },
  { key: "contact.email", what: "Jay's real email (dummy book@techsolutionsfl.example)" },
  { key: "prices", what: "Real prices: TV mount, in-wall wires, Wi-Fi/mesh, 2 cameras, smart device (dummies $129 / $249 / $179 / $349 / $89); theater and office pricing (unpriced)" },
  { key: "prices.concrete", what: "Concrete surcharge or not" },
  { key: "prices.mount", what: "Mount included or extra, and its price" },
  { key: "prices.extras", what: "Ethernet runs, soundbar, fireplace/brick: priced separately or not; trip fee; warranty" },
  { key: "method.concrete", what: "Jay's concrete method: raceway, paint-matched or not" },
  { key: "process", what: "Text confirmation, time windows, reply time, working hours, test-before-leaving, walkthrough and clean-up, photo quotes" },
  { key: "positioning.sameVisit", what: "Same-visit multi-service capacity (sample review 2)" },
  { key: "positioning.solo", what: "Jay installs himself or with helpers (hero byline; \"we\" voice)" },
  { key: "gear", what: "Brands Jay actually installs: Samsung, LG, Sony, Sonos, eero, Ubiquiti, Ring, Google Nest, August, Yale" },
  { key: "services.theater", what: "Whether Jay does home theater, surround and multi-room audio" },
  { key: "office", what: "Whether Jay takes small-office network and AV jobs; after-hours availability" },
  { key: "multiUnit", what: "Whether Jay serves property managers and multi-unit jobs, and quotes them as a set" },
  { key: "hosts", what: "Serves short-term-rental hosts (smart tile, FAQ Q8, rental checkbox, role option)" },
  { key: "reviews", what: "Real reviews Jay can share, with permission (3 samples)" },
  { key: "media", what: "Jay's own before/after pair and install photos + permission" },
  { key: "area", what: "Service radius, Broward yes/no, neighborhood and ZIP list (incl. Aventura, Hollywood, Fort Lauderdale), travel fee" },
  { key: "coi", what: "Liability insurance and COI capability (form field coi_needed; FAQ Q2 add-on)" },
  { key: "licence", what: "DBPR licence status for camera work (camera tile, held FAQ Q9)" },
  { key: "spanish", what: "Spanish-language service" },
  { key: "legalName", what: "Legal business name (Sunbiz)" },
  { key: "consent", what: "Legal review of SMS consent and opt-in wording; required vs optional SMS box" },
  { key: "formRouting", what: "Where live form submissions route (SMS/email); form provider name" },
];
