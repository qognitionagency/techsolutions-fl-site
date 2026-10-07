/**
 * TechSolutions FL: concept site copy, v3 (PRODUCT-GRADE direction).
 *
 * The single source for every visible string on the page, and for the FAQPage JSON-LD
 * (generate `mainEntity` from `faq.items` so markup can never drift from visible text).
 *
 * Author: Theo (content), under MARS, 2026-10-07. Third rebuild. Operator: "make it like a
 *   professional website… worth $10k". Stripe/Linear/Apple-grade marketing site for a Miami
 *   installer: diagrams and app-UI mockups instead of photos, an interactive instant-quote
 *   builder, almost no images.
 * Status: DRAFT. Not shippable until Ruth (brand-guard) returns SHIP.
 * Basis: context.md (AI-derived, prospect, NOT client-confirmed), guardrails.md, brand-voice.md
 *   (incl. the 2026-10-07 "we" ruling), standards/anti-slop.md, v2 content.ts (gated FAQ, form,
 *   prices, reviews), deliverables/2026-10-landing/page-copy.md.
 * Markdown mirror for review: ~/qognition-ops/clients/techsolutions-fl/deliverables/2026-10-landing/page-copy.md
 *
 * ── EXPORTS (every one) ────────────────────────────────────────────────────────────────
 *   Types         ServiceKey, QuoteServiceKey, PropertyType, WiresKey, WallKey, RoleKey, Prefill,
 *                 CtaKind, TrackEvent, Cta, Option, Price, PhoneScreen, DiagramLabel,
 *                 DiagramState, ServiceTab, QuoteChoice, QuoteField, QuoteService, MicroUi,
 *                 ProcessStep, BuiltForCard, Review, ReviewId, FaqItem, StepKey, Field
 *   contact       NAP + dummy phone/email (shared by CTAs, schema, llms.txt)
 *   anchors       every section id, plus per-tab ids for the services explorer
 *   meta          <head>, OG, schema basics
 *   ribbon        concept disclosure (required by guardrails)
 *   nav           top bar
 *   hero          headline, subline, CTAs, phoneMockup (3 app screens)
 *   services      services EXPLORER: 4 tabs, each with pitch, bullets, diagram + toggle, price
 *   quoteBuilder  instant-quote builder: steps, fields, price deltas, estimate, handoff, disclaimer
 *   processSteps  4 steps, each with a micro-UI (quote card, SMS thread, checklist)
 *   builtFor      Condo / House / Office icon cards (COI as a question only)
 *   reviews       3 SAMPLE reviews, labelled
 *   serviceArea   Miami-Dade & Broward + neighborhoods
 *   faq           8 gated Q&As, VERBATIM from v2 (schema-bound)
 *   form          booking form, VERBATIM from v2 (5 steps; sms_consent + email_optin unchecked)
 *   stickyBar     mobile bar: Call | Text | Book
 *   footer        NAP, links, disclosure, credits
 *   needsData     registry for lib/indexing.ts (promotion gate)
 *
 * REMOVED from v2 (components importing them break until Mira ports them):
 *   partners (Partners.astro), sectors (Sectors.astro), beforeAfter (Signature.astro),
 *   trade (Process.astro), projects (Gallery.astro), testimonials (→ reviews,
 *   Testimonials.astro), formConsent (legacy), Link, MediaRef, ServiceTile (lib/schema.ts),
 *   SectorPanel, Project, Testimonial, TestimonialId. `services` keeps its name but not its
 *   shape: lib/schema.ts and pages/llms.txt.ts read services.tiles and must move to services.tabs.
 *   Gear/brand names are gone entirely (no dealer/partner risk; footer trademark line dropped).
 *
 * ── BRIEF ──────────────────────────────────────────────────────────────────────────────
 * Search intent: a Miami condo, house or office owner with a TV leaning on the wall, Wi-Fi
 *   that dies in the back bedroom, or a front door with no camera. Thirty seconds ago they
 *   searched "tv mounting miami" or tapped through from @tech_solutionsfl, and they want a
 *   price before they let anyone drill. (For the concept: the reader is Jay, 2026-10-09 call.)
 * Citation angle: FAQ "hide-wires", verbatim: no in-wall cabling inside solid concrete;
 *   drywall (or drywall furred over concrete) yes, with a listed power kit (NEC 400.12);
 *   raceway on concrete. The TV diagram toggle (drywall vs concrete) and the quote builder's
 *   disabled in-wall option on concrete SHOW the same rule, so the page and the answer agree.
 * Internal links: one page, so anchors. Nav → #services #quote #how-it-works #built-for #faq.
 *   Hero primary → #quote; every "Book" → #book with prefill; explorer "Price this" → #quote
 *   with the tab's service; quote "Book this install" → #book carrying the selections.
 *   FAQ coi → #built-for, hide-wires → #service-tv, airbnb-lock → #service-smart.
 *   Inbound: none (noindex concept; IG bio has no link). Outbound: tel, sms, mailto, Instagram.
 * Owned claim: you see the price before anyone drills, and the wall decides the method.
 *   In-wall on drywall, paint-matched raceway on solid concrete, price confirmed by text.
 *   No comparison with other installers in copy (guardrails: category only, with Jay's OK).
 * ───────────────────────────────────────────────────────────────────────────────────────
 *
 * Conventions
 * - `heading` = the semantic H1/H2/H3. `eyebrow` = small label above it. `display` = a <p>.
 * - `// NEEDS DATA` marks every sample value and every fact Jay must confirm. `sample: true`
 *   marks a dummy that renders; show a visible "Sample" label wherever it is true.
 * - All prices are SAMPLES. Base prices are the gated v2 dummies ($129 / $249 in-wall / $179 /
 *   $349 for 2 / $89). Every builder delta is new and invented for the demo. NEEDS DATA, all.
 * - FAQ answers are byte-bound to schema. Do not trim, retype or "fix" them.
 * - Concrete: in-wall on drywall only. Solid concrete = paint-matched raceway. Never edit a
 *   string here to promise in-wall on solid concrete.
 * - No light switches anywhere (mains wiring may need a Florida licence). The form key
 *   "switches" is legacy; its label is "Smart plugs and hubs".
 * - Never add "licensed", "insured", "certified", "bonded", "background-checked", dealer or
 *   partner language, years in business, job counts, star ratings, "#1" or "best".
 * - Voice: "we". Jay is named only in SMS bodies, the demo line, reviews and the reviews heading.
 * - Template tokens ({firstName}, {last4}, {email}, {ref}, {current}, {total}, {step}, {used},
 *   {service}, {summary}, {count}, {amount}) are replaced at runtime.
 */

// ── Shared types ──────────────────────────────────────────────────────────────────────

export type ServiceKey = "tv" | "theater" | "wifi" | "cameras" | "smart" | "office" | "other";

/** The four services the explorer and the quote builder sell. The form still accepts all seven. */
export type QuoteServiceKey = Extract<ServiceKey, "tv" | "wifi" | "cameras" | "smart">;

export type PropertyType = "condo" | "house" | "townhouse" | "office";

export type WiresKey = "in_wall" | "raceway" | "as_is" | "advise";

export type WallKey = "drywall" | "concrete" | "brick_stone" | "fireplace" | "not_sure";

export type RoleKey = "owner" | "renter" | "property_manager" | "host" | "office_manager";

/**
 * Read by form.ts (and the quote builder) from data-prefill-* attributes.
 * NEW in v3: wallType → data-prefill-wall-type → field `wall_type`.
 */
export interface Prefill {
  services?: readonly ServiceKey[];
  propertyType?: PropertyType;
  wires?: WiresKey;
  wallType?: WallKey;
  role?: RoleKey;
}

export type CtaKind = "primary" | "secondary" | "trade" | "contextual";
export type TrackEvent = "cta_click" | "call_click" | "text_click" | "email_click" | "outbound_click";

export interface Cta {
  label: string;
  href: string;
  /** data-track */
  track: TrackEvent;
  /** data-track-id */
  trackId: string;
  /** data-track-type */
  kind: CtaKind;
  ariaLabel?: string;
  prefill?: Prefill;
  /** target="_blank" rel="noopener" (Instagram only) */
  external?: boolean;
}

export interface Option<K extends string = string> {
  key: K;
  label: string;
}

export interface Price {
  /** Whole US dollars. */
  amount: number;
  /** Rendered as "from $129" */
  prefix: "from";
  /** e.g. "per TV", "for 2 cameras" */
  unit?: string;
  sample: true;
}

// ── Contact (all dummy except Instagram) ─────────────────────────────────────────────

const SMS_DEFAULT = "Hi Jay, I found you on your website. I need help with a TV / Wi-Fi / camera job.";

export const contact = {
  businessName: "TechSolutions FL", // must match schema `name` exactly
  owner: "Jay", // first name only; surname unknown (context.md)
  phoneDisplay: "(305) 555-0142", // NEEDS DATA: Jay's real phone. Fictional 555-01XX range.
  phoneE164: "+13055550142", // NEEDS DATA: Jay's real phone
  phoneHref: "tel:+13055550142", // NEEDS DATA: Jay's real phone
  /** sms: base. Append encodeURIComponent(body). */
  smsBase: "sms:+13055550142?&body=", // NEEDS DATA: Jay's real mobile (text-first per IG "Text or call" highlight)
  email: "book@techsolutionsfl.example", // NEEDS DATA: Jay's real email. .example TLD cannot deliver.
  emailHref: "mailto:book@techsolutionsfl.example", // NEEDS DATA: Jay's real email
  instagramHandle: "@tech_solutionsfl", // observed 2026-10-07
  instagramUrl: "https://www.instagram.com/tech_solutionsfl/", // observed 2026-10-07
  areaLong: "Miami-Dade and Broward", // NEEDS DATA: service radius; only "Downtown MIA" is observed
  sample: true,
} as const;

const sms = (body: string): string => contact.smsBase + encodeURIComponent(body);

/** Section ids. */
export const anchors = {
  top: "top",
  services: "services",
  quote: "quote",
  process: "how-it-works",
  builtFor: "built-for",
  reviews: "reviews",
  area: "service-area",
  faq: "faq",
  consult: "book",
  /** Explorer panels. Selecting a tab updates the hash; landing on the hash selects the tab. */
  serviceTabs: {
    tv: "service-tv",
    wifi: "service-wifi",
    cameras: "service-cameras",
    smart: "service-smart",
  } satisfies Record<QuoteServiceKey, string>,
} as const;

const BOOK = "#" + anchors.consult;
const QUOTE = "#" + anchors.quote;
const BOOK_LABEL = "Book an install";
const QUOTE_LABEL = "Get an instant quote";
const CALL_LABEL = "Call " + contact.phoneDisplay; // NEEDS DATA: Jay's real phone

const call = (trackId: string, label: string = CALL_LABEL): Cta => ({
  label,
  href: contact.phoneHref,
  track: "call_click",
  trackId,
  kind: "secondary",
  ariaLabel: "Call TechSolutions FL on " + contact.phoneDisplay, // NEEDS DATA: Jay's real phone
});

const text = (trackId: string, label: string = "Text us", body: string = SMS_DEFAULT): Cta => ({
  label,
  href: sms(body),
  track: "text_click",
  trackId,
  kind: "secondary",
  ariaLabel: "Text TechSolutions FL on " + contact.phoneDisplay, // NEEDS DATA: Jay's real mobile
});

const book = (trackId: string, label: string = BOOK_LABEL, prefill?: Prefill, kind: CtaKind = "primary"): Cta => ({
  label,
  href: BOOK,
  track: "cta_click",
  trackId,
  kind,
  ...(prefill ? { prefill } : {}),
});

const quote = (trackId: string, label: string = QUOTE_LABEL, prefill?: Prefill, kind: CtaKind = "primary"): Cta => ({
  label,
  href: QUOTE,
  track: "cta_click",
  trackId,
  kind,
  ...(prefill ? { prefill } : {}),
});

// ── Meta ──────────────────────────────────────────────────────────────────────────────

export const meta = {
  lang: "en-US",
  title: "TV Mounting in Miami, Wi-Fi & Cameras | TechSolutions FL",
  // CHANGED from seo-spec §3 (owner-led "Jay mounts…") on the operator's no-owner-focus ruling. Nadia signs off.
  description:
    "TV mounting, Wi-Fi, cameras and smart locks for Miami condos, houses and offices. Build your install, see the price, confirm by text.",
  ogTitle: "TechSolutions FL: TV mounting, Wi-Fi and cameras in Miami",
  ogDescription:
    "Build your install and see the price before anyone drills. TV mounting, Wi-Fi, cameras and smart locks in Miami-Dade and Broward.", // NEEDS DATA: service area; text-confirm practice
  ogImage: "brand/og.png", // build with withBase(); 1200x630 from Elena, must include "Concept by Qognition"
  ogImageAlt: "TechSolutions FL concept site: TV mounting, Wi-Fi and cameras in Miami",
  ogType: "website",
  ogSiteName: "TechSolutions FL",
  ogLocale: "en_US",
  twitterCard: "summary_large_image",
  /** Schema `slogan`, if Nadia emits it. */
  slogan: "Your install, priced before we drill.", // NEEDS DATA: text-confirm-before-visit practice
} as const;

// ── Concept ribbon (guardrails: required disclosure) ─────────────────────────────────

export const ribbon = {
  text: "Concept site by Qognition — sample content", // operator-supplied, verbatim. The em dash is theirs.
  /** Longer version for title/aria and the footer. */
  disclosure:
    "This is a concept site prepared by Qognition. It is not an official TechSolutions FL website. The phone number, email, prices, quote builder figures, app screens and reviews are sample content.",
  ariaLabel:
    "Concept site by Qognition. Phone, email, prices, quote figures and reviews on this page are sample content.",
} as const;

// ── Nav ──────────────────────────────────────────────────────────────────────────────

export const nav = {
  skipLink: "Skip to content",
  logoAlt: "TechSolutions FL",
  logoLabel: "TechSolutions FL, back to top",
  menuOpen: "Menu",
  menuClose: "Close menu",
  links: [
    { label: "Services", href: "#" + anchors.services },
    { label: "Pricing", href: "#" + anchors.quote },
    { label: "How it works", href: "#" + anchors.process },
    { label: "Built for", href: "#" + anchors.builtFor },
    { label: "FAQ", href: "#" + anchors.faq },
  ],
  primary: quote("nav_quote", "Get a quote"),
  /** Desktop only, as text. */
  phone: call("nav_call", contact.phoneDisplay), // NEEDS DATA: Jay's real phone
} as const;

// ── Hero ─────────────────────────────────────────────────────────────────────────────

/** One app screen inside the hero phone. Generic UI, no real app or brand. */
export interface PhoneScreen {
  id: "camera" | "lock" | "wifi";
  /** Small app-bar title */
  app: string;
  title: string;
  /** Pill beside the title. `dot` renders a live dot before it. */
  status: { text: string; tone: "live" | "ok" | "neutral"; dot: boolean };
  rows: readonly { label: string; value: string }[];
  /** Describes the screen for assistive tech. The phone itself is a figure. */
  ariaLabel: string;
}

export const hero = {
  /** Small label above the H1. */
  eyebrow: "TV · Wi-Fi · Cameras · Smart locks · Miami",
  // CHANGED from seo-spec §3 again: product-style headline. "TV mounting" + "Miami" now live in
  // the eyebrow, subhead and meta title. Nadia signs off. NEEDS DATA: text-confirm-before-visit practice.
  heading: "Your install, priced before we drill.",
  subhead:
    "TV mounting, Wi-Fi, cameras and smart locks for Miami condos, houses and offices. Pick what you need, see the price, confirm by text.",
  primary: quote("hero_quote"),
  secondary: book("hero_book", BOOK_LABEL, undefined, "secondary"),
  /** Small text under the CTAs. */
  note: "Sample prices and process for this concept. Texting the price before the visit is still to be confirmed.", // NEEDS DATA: real prices; text-confirm practice
  areaLine: "Miami-Dade & Broward", // NEEDS DATA: service radius; Broward unconfirmed
  phoneMockup: {
    /** figure aria-label */
    ariaLabel: "Sample phone screens: a live front-door camera, a smart lock with a guest code, and Wi-Fi signal by room",
    /** Visible micro-label under the phone. */
    caption: "Sample app screens. Your apps depend on the gear you choose.", // NEEDS DATA: brands Jay installs
    /** Auto-advance order; pause on hover/focus and under prefers-reduced-motion. */
    screens: [
      {
        id: "camera",
        app: "Cameras",
        title: "Front door",
        status: { text: "Live", tone: "live", dot: true },
        rows: [
          { label: "Motion", value: "2 min ago" }, // NEEDS DATA: sample UI value
          { label: "Audio", value: "Off" }, // ties to FAQ camera-audio (all-party consent)
        ],
        ariaLabel: "Camera app: front door, live",
      },
      {
        id: "lock",
        app: "Lock",
        title: "Front door",
        status: { text: "Locked", tone: "ok", dot: false },
        rows: [
          { label: "Guest code", value: "Active" }, // NEEDS DATA: sample UI value; serves STR hosts?
          { label: "Expires", value: "Sun 11:00 am" }, // NEEDS DATA: sample UI value
        ],
        ariaLabel: "Lock app: front door locked, guest code active",
      },
      {
        id: "wifi",
        app: "Wi-Fi",
        title: "Signal by room",
        status: { text: "Online", tone: "ok", dot: true },
        rows: [
          { label: "Living room", value: "Strong" }, // NEEDS DATA: sample UI value
          { label: "Bedroom 2", value: "Strong" }, // NEEDS DATA: sample UI value
          { label: "Balcony", value: "Strong" }, // NEEDS DATA: sample UI value
        ],
        ariaLabel: "Wi-Fi app: strong signal in the living room, bedroom 2 and balcony",
      },
    ] satisfies readonly PhoneScreen[],
  },
} as const;

// ── Services explorer (4 tabs, diagram per tab) ──────────────────────────────────────

/** A label pinned to a point on the diagram. `id` is Elena/Mira's anchor in the SVG. */
export interface DiagramLabel {
  id: string;
  text: string;
  /** Optional status chip, e.g. "Strong", "Dead zone", "Live". */
  value?: string;
  tone?: "good" | "weak" | "bad" | "neutral";
}

export interface DiagramState {
  /** One line under the diagram, aria-live="polite" on toggle. */
  caption: string;
  labels: readonly DiagramLabel[];
}

export interface ServiceTab {
  key: QuoteServiceKey;
  /** Element id for the panel (anchors.serviceTabs). */
  id: string;
  tabLabel: string;
  /** H3 */
  title: string;
  /** Exactly two lines. Render as two <span>s or a <br>. */
  pitch: readonly [string, string];
  bullets: readonly [string, string, string];
  diagram: {
    /** figure aria-label */
    ariaLabel: string;
    /** Segmented control */
    toggle: { label: string; options: readonly Option[] };
    /** Keyed by toggle option key. */
    states: Record<string, DiagramState>;
    /** Labels shown in every state (legend, fixed parts). */
    legend?: readonly DiagramLabel[];
  };
  price: Price;
  alsoFrom?: { label: string; price: Price };
  cta: Cta;
}

const priceThis = (key: QuoteServiceKey, what: string): Cta => ({
  label: "Price this",
  href: QUOTE,
  track: "cta_click",
  trackId: "svc_" + key + "_quote",
  kind: "contextual",
  ariaLabel: "Price " + what + " in the quote builder",
  prefill: { services: [key] },
});

export const services = {
  eyebrow: "Services",
  heading: "TV mounting, Wi-Fi, cameras and smart locks in Miami",
  display: "Four jobs. One booking.",
  tablistLabel: "Choose a service",
  tabs: [
    {
      key: "tv",
      id: anchors.serviceTabs.tv,
      tabLabel: "TV & wires",
      title: "TV mounting & hidden wires",
      pitch: [
        "Level on drywall or concrete, soundbar underneath.",
        "The wall decides where the cables go. You know which before we drill.",
      ],
      bullets: [
        "Drywall: cables inside the wall, power through a listed in-wall kit.",
        "Solid concrete: a slim raceway, painted to match.", // NEEDS DATA: Jay's concrete method
        "Every HDMI input tested before we pack up.", // NEEDS DATA: test-before-leaving practice
      ],
      diagram: {
        ariaLabel: "Cross-section of a TV wall showing where the cables run on drywall and on concrete",
        toggle: {
          label: "Wall",
          options: [
            { key: "drywall", label: "Drywall" },
            { key: "concrete", label: "Concrete" },
          ],
        },
        states: {
          drywall: {
            caption: "Drywall has a cavity. Cables run inside it. Nothing shows.",
            labels: [
              { id: "wall", text: "Drywall" },
              { id: "cable", text: "HDMI inside the wall" },
              { id: "power-top", text: "Recessed power inlet" },
              { id: "power-bottom", text: "Listed in-wall power kit" },
              { id: "mount", text: "Mount" },
            ],
          },
          concrete: {
            caption: "Solid concrete has no cavity. Cables go in a raceway, painted to match.",
            labels: [
              { id: "wall", text: "Solid concrete. No cavity." },
              { id: "cable", text: "Paint-matched raceway" }, // NEEDS DATA: Jay's concrete method
              { id: "anchors", text: "Concrete anchors rated for the TV" },
              { id: "outlet", text: "Existing outlet" },
              { id: "mount", text: "Mount" },
            ],
          },
        },
      },
      price: { amount: 129, prefix: "from", unit: "per TV", sample: true }, // NEEDS DATA: Jay's TV mount price; concrete surcharge or not; mount included or extra
      alsoFrom: {
        label: "With wires inside the wall (drywall)",
        price: { amount: 249, prefix: "from", sample: true }, // NEEDS DATA: Jay's in-wall price; power kit included?
      },
      cta: priceThis("tv", "TV mounting"),
    },
    {
      key: "wifi",
      id: anchors.serviceTabs.wifi,
      tabLabel: "Wi-Fi",
      title: "Wi-Fi & mesh",
      pitch: [
        "Wi-Fi that reaches the back bedroom and the balcony.",
        "We find the dead zone and fix it with mesh or a wired access point.",
      ],
      bullets: [
        "Signal checked room by room, before and after.", // NEEDS DATA: Jay's survey practice
        "Mesh, or a wired access point where concrete blocks the signal.",
        "One network name. Your devices reconnected.",
      ],
      diagram: {
        ariaLabel: "Floor plan of a condo showing Wi-Fi signal by room, with a router only and with mesh",
        toggle: {
          label: "Setup",
          options: [
            { key: "router", label: "Router only" },
            { key: "mesh", label: "With mesh" },
          ],
        },
        legend: [
          { id: "legend-strong", text: "Strong", tone: "good" },
          { id: "legend-weak", text: "Weak", tone: "weak" },
          { id: "legend-dead", text: "Dead zone", tone: "bad" },
        ],
        states: {
          router: {
            caption: "Router in the entry closet. Concrete stops the signal two rooms in.",
            labels: [
              { id: "router", text: "Router" },
              { id: "living", text: "Living room", value: "Strong", tone: "good" },
              { id: "kitchen", text: "Kitchen", value: "Weak", tone: "weak" },
              { id: "bedroom-2", text: "Bedroom 2", value: "Dead zone", tone: "bad" },
              { id: "balcony", text: "Balcony", value: "Dead zone", tone: "bad" },
            ],
          },
          mesh: {
            caption: "A mesh point outside the bedroom. One network name, every room.",
            labels: [
              { id: "router", text: "Router" },
              { id: "mesh-point", text: "Mesh point" },
              { id: "living", text: "Living room", value: "Strong", tone: "good" },
              { id: "kitchen", text: "Kitchen", value: "Strong", tone: "good" },
              { id: "bedroom-2", text: "Bedroom 2", value: "Strong", tone: "good" },
              { id: "balcony", text: "Balcony", value: "Strong", tone: "good" },
            ],
          },
        },
      },
      price: { amount: 179, prefix: "from", sample: true }, // NEEDS DATA: Jay's Wi-Fi/mesh price; gear and Ethernet runs priced separately?
      cta: priceThis("wifi", "Wi-Fi and mesh"),
    },
    {
      key: "cameras",
      id: anchors.serviceTabs.cameras,
      tabLabel: "Cameras",
      // Body says "camera installation". No "secure", "alarm", "monitoring" (guardrails).
      // NEEDS DATA: DBPR licence status for camera work.
      title: "Cameras & doorbells",
      pitch: [
        "Camera installation for the front door, the gate and the driveway.",
        "Mounted, aimed and live in the app on your phone before we leave.", // NEEDS DATA: test-before-leaving practice
      ],
      bullets: [
        "Wired or battery cameras, plus video doorbells.",
        "Each view framed with you, on your phone.",
        "Audio off on request. Florida is an all-party consent state.",
      ],
      diagram: {
        ariaLabel: "Top-down plan of a house showing what each camera sees",
        toggle: {
          label: "Coverage",
          options: [
            { key: "two", label: "2 cameras" },
            { key: "three", label: "3 cameras + doorbell" },
          ],
        },
        legend: [
          { id: "legend-view", text: "Field of view", tone: "good" },
          { id: "legend-blind", text: "Blind spot", tone: "bad" },
        ],
        states: {
          two: {
            caption: "Front door and driveway in view. The side gate is a blind spot.",
            labels: [
              { id: "cam-front", text: "Front door", value: "Live", tone: "good" },
              { id: "cam-drive", text: "Driveway", value: "Live", tone: "good" },
              { id: "gate", text: "Side gate", value: "Blind spot", tone: "bad" },
            ],
          },
          three: {
            caption: "Gate in view. The doorbell shows who's at the door.",
            labels: [
              { id: "cam-front", text: "Front door", value: "Live", tone: "good" },
              { id: "cam-drive", text: "Driveway", value: "Live", tone: "good" },
              { id: "gate", text: "Side gate", value: "Live", tone: "good" },
              { id: "doorbell", text: "Video doorbell", value: "Live", tone: "good" },
            ],
          },
        },
      },
      price: { amount: 349, prefix: "from", unit: "for 2 cameras", sample: true }, // NEEDS DATA: Jay's camera price
      cta: priceThis("cameras", "camera installation"),
    },
    {
      key: "smart",
      id: anchors.serviceTabs.smart,
      tabLabel: "Smart home",
      title: "Smart locks & home",
      // No light switches: mains wiring may need a Florida licence. NEEDS DATA.
      pitch: [
        "Locks, thermostats and speakers, installed and on your Wi-Fi.",
        "Set up in your app, so it works the day we leave.",
      ],
      bullets: [
        "Guest codes for renters and Airbnb check-in.", // NEEDS DATA: does Jay serve short-term-rental hosts?
        "Thermostat schedules set with you.",
        "Smart plugs and hubs paired to the same app.",
      ],
      diagram: {
        ariaLabel: "Sample app scenes showing the lock, thermostat and lamps in three modes",
        toggle: {
          label: "Scene",
          options: [
            { key: "away", label: "Away" },
            { key: "guest", label: "Guest arriving" },
            { key: "night", label: "Good night" },
          ],
        },
        states: {
          away: {
            caption: "Away: door locked, cooling eased off, lamps off.",
            labels: [
              { id: "lock", text: "Front door", value: "Locked", tone: "good" },
              { id: "thermostat", text: "Thermostat", value: "80°F", tone: "neutral" }, // NEEDS DATA: sample UI value
              { id: "lamps", text: "Lamps (smart plugs)", value: "Off", tone: "neutral" },
            ],
          },
          guest: {
            caption: "Guest arriving: code live, room cooled, a lamp on.",
            labels: [
              { id: "lock", text: "Front door", value: "Guest code active", tone: "good" },
              { id: "thermostat", text: "Thermostat", value: "74°F", tone: "neutral" }, // NEEDS DATA: sample UI value
              { id: "lamps", text: "Lamps (smart plugs)", value: "On", tone: "good" },
            ],
          },
          night: {
            caption: "Good night: door locked, lamps off, one tap.",
            labels: [
              { id: "lock", text: "Front door", value: "Locked", tone: "good" },
              { id: "thermostat", text: "Thermostat", value: "76°F", tone: "neutral" }, // NEEDS DATA: sample UI value
              { id: "lamps", text: "Lamps (smart plugs)", value: "Off", tone: "neutral" },
            ],
          },
        },
      },
      price: { amount: 89, prefix: "from", unit: "per device", sample: true }, // NEEDS DATA: Jay's smart-device price
      cta: priceThis("smart", "smart locks and home devices"),
    },
  ] satisfies readonly ServiceTab[],
  footnote: "Sample prices for this concept. The real price is confirmed by text before the visit.", // NEEDS DATA: real prices, trip fee, warranty; text-confirm practice
  /** Under the explorer: services sold off-page. */
  more: "Home theater, office networks or something else? Pick \"Something else\" when you book.", // NEEDS DATA: does Jay do theater/office AV?
} as const;

// ── Quote builder (#quote) ───────────────────────────────────────────────────────────

/** One selectable option. `delta` is whole USD; 0 renders no price badge. */
export interface QuoteChoice<K extends string = string> {
  key: K;
  label: string;
  hint?: string;
  delta: number;
  /** Render disabled with `reason` as helper text while the condition holds. */
  disabledWhen?: { field: string; equals: string; reason: string };
}

export interface QuoteField {
  /** Matches the booking form field name, so the handoff prefills it 1:1. */
  name: string;
  label: string;
  kind: "single" | "multi" | "stepper" | "checkbox";
  helper?: string;
  choices?: readonly QuoteChoice[];
  /** single: initial key. stepper: initial number. */
  initial?: string | number;
  /** stepper only */
  min?: number;
  max?: number;
  /** stepper / checkbox: USD added per unit (stepper counts above `freeUnits`). */
  unitDelta?: number;
  freeUnits?: number;
  /** "per_tv": multiply this field's delta by tv_count. Default: once. */
  scope?: "per_tv" | "once";
}

export interface QuoteService {
  key: QuoteServiceKey;
  label: string;
  base: Price;
  /** Plain-English what the base covers. */
  baseIncludes: string;
  fields: readonly QuoteField[];
  /** Pricing rule for Mira. Not rendered. */
  formula: string;
}

// EVERY number in this section is a SAMPLE. Base prices = gated v2 dummies. Deltas = invented
// for the demo. NEEDS DATA: Jay's real prices for all of it.
export const quoteBuilder = {
  eyebrow: "Instant quote",
  heading: "Build your install. Watch the price.",
  intro: "Pick the job and the wall. Every answer updates the price.",
  steps: [
    { key: "services", label: "Services", legend: "What are we installing?", helper: "Pick one or more." },
    { key: "details", label: "Details", legend: "Tell us the setup", helper: "Each answer updates the price." },
    { key: "estimate", label: "Estimate", legend: "Your estimate", helper: "" },
  ] as const,
  /** "Step 2 of 3" */
  progress: "Step {current} of {total}",
  next: "Next",
  back: "Back",
  servicesError: "Pick at least one service.",

  services: [
    {
      key: "tv",
      label: "TV mounting",
      base: { amount: 129, prefix: "from", unit: "per TV", sample: true }, // NEEDS DATA: Jay's TV mount price
      baseIncludes: "Mounting one TV on a mount you have, wires left as they are.", // NEEDS DATA: what the base covers
      formula: "tv_count × (129 + tv_size + wires + has_mount + soundbar). wall_type adds 0 and gates wires.in_wall.",
      fields: [
        { name: "tv_count", label: "How many TVs?", kind: "stepper", initial: 1, min: 1, max: 4, unitDelta: 0 },
        {
          name: "tv_size",
          label: "TV size",
          kind: "single",
          initial: "43_55",
          scope: "per_tv",
          choices: [
            { key: "up_to_42", label: "Up to 42\"", delta: 0 },
            { key: "43_55", label: "43–55\"", delta: 0 },
            { key: "56_65", label: "56–65\"", delta: 40 }, // NEEDS DATA: sample delta
            { key: "66_75", label: "66–75\"", delta: 40 }, // NEEDS DATA: sample delta
            { key: "76_plus", label: "76\" and up", delta: 80 }, // NEEDS DATA: sample delta
          ],
        },
        {
          name: "wall_type",
          label: "What's the wall?",
          kind: "single",
          initial: "drywall",
          helper: "Knock on it. A hollow knock means drywall. A dull, solid thud usually means concrete.",
          choices: [
            { key: "drywall", label: "Drywall", delta: 0 },
            // 0 = no surcharge shown. NEEDS DATA: concrete surcharge or not (approved claim pending verification). No copy says "no surcharge".
            { key: "concrete", label: "Concrete", delta: 0 },
            { key: "not_sure", label: "Not sure", delta: 0 },
          ],
        },
        {
          name: "wires",
          label: "Where should the wires go?",
          kind: "single",
          initial: "as_is",
          scope: "per_tv",
          choices: [
            { key: "as_is", label: "Leave them as they are", delta: 0 },
            { key: "raceway", label: "Paint-matched raceway", delta: 49 }, // NEEDS DATA: sample delta; Jay's concrete method
            {
              key: "in_wall",
              label: "Inside the wall",
              hint: "Drywall only",
              delta: 120, // NEEDS DATA: sample delta. 129 + 120 = the gated in-wall "from $249".
              disabledWhen: {
                field: "wall_type",
                equals: "concrete",
                reason: "Solid concrete has no cavity. We use a paint-matched raceway instead.",
              },
            },
            { key: "advise", label: "Not sure, advise me", delta: 0 },
          ],
        },
        {
          name: "has_mount",
          label: "Do you have a mount?",
          kind: "single",
          initial: "yes",
          scope: "per_tv",
          choices: [
            { key: "yes", label: "Yes, I have one", delta: 0 },
            { key: "no", label: "No, bring one", delta: 59 }, // NEEDS DATA: mount included or extra, and its price
          ],
        },
        { name: "soundbar", label: "Mount a soundbar too", kind: "checkbox", unitDelta: 49, scope: "per_tv" }, // NEEDS DATA: sample delta
      ],
    },
    {
      key: "wifi",
      label: "Wi-Fi & mesh",
      base: { amount: 179, prefix: "from", sample: true }, // NEEDS DATA: Jay's Wi-Fi/mesh price
      baseIncludes: "A signal check and mesh set up for a studio or 1 bed. Gear priced by text.", // NEEDS DATA: what the base covers; gear pricing
      formula: "179 + home_size + 99 × access_points.",
      fields: [
        {
          name: "home_size",
          label: "How big is the place?",
          kind: "single",
          initial: "studio_1",
          choices: [
            { key: "studio_1", label: "Studio or 1 bed", delta: 0 },
            { key: "2_3", label: "2–3 bed", delta: 60 }, // NEEDS DATA: sample delta
            { key: "4_plus", label: "4+ bed", delta: 120 }, // NEEDS DATA: sample delta
            { key: "office", label: "Office", delta: 60 }, // NEEDS DATA: sample delta; does Jay take office jobs?
          ],
        },
        {
          name: "access_points",
          label: "Wired access points",
          kind: "stepper",
          helper: "An Ethernet run to the room where concrete blocks the signal.",
          initial: 0,
          min: 0,
          max: 3,
          unitDelta: 99, // NEEDS DATA: sample delta; Ethernet runs priced separately?
          freeUnits: 0,
        },
      ],
    },
    {
      key: "cameras",
      label: "Cameras & doorbells",
      base: { amount: 349, prefix: "from", unit: "for 2 cameras", sample: true }, // NEEDS DATA: Jay's camera price
      baseIncludes: "Two cameras mounted, aimed and live in your app.", // NEEDS DATA: what the base covers; cameras supplied or not
      formula: "349 + 129 × max(0, camera_units − 2) + doorbell.",
      fields: [
        {
          name: "camera_units",
          label: "How many cameras?",
          kind: "stepper",
          helper: "Two are in the base price.",
          initial: 2,
          min: 2,
          max: 8,
          unitDelta: 129, // NEEDS DATA: sample delta per extra camera
          freeUnits: 2,
        },
        { name: "doorbell", label: "Add a video doorbell", kind: "checkbox", unitDelta: 99 }, // NEEDS DATA: sample delta
      ],
    },
    {
      key: "smart",
      label: "Smart locks & home",
      base: { amount: 89, prefix: "from", unit: "per device", sample: true }, // NEEDS DATA: Jay's smart-device price
      baseIncludes: "Each device installed, on your Wi-Fi and set up in your app.",
      formula: "89 × number of smart_devices ticked (min 1). rental adds 0.",
      fields: [
        {
          name: "smart_devices",
          label: "Which devices?",
          kind: "multi",
          initial: "lock",
          choices: [
            { key: "lock", label: "Smart lock", delta: 89 }, // NEEDS DATA: sample price
            { key: "thermostat", label: "Thermostat", delta: 89 }, // NEEDS DATA: sample price
            { key: "switches", label: "Smart plugs and hubs", delta: 89 }, // legacy key; NOT light switches. NEEDS DATA: sample price
            { key: "speakers", label: "Speakers or voice assistant", delta: 89 }, // NEEDS DATA: sample price
          ],
        },
        { name: "rental", label: "Set guest codes for a rental", kind: "checkbox", unitDelta: 0 }, // NEEDS DATA: does Jay serve hosts?
      ],
    },
  ] satisfies readonly QuoteService[],

  estimate: {
    heading: "Your estimate",
    totalLabel: "Estimate",
    totalPrefix: "from",
    sampleBadge: "Sample",
    empty: "Pick a service to see a price.",
    /** aria-live="polite", debounced */
    live: "Estimate updated: from {total}",
    breakdownLabel: "What's in it",
    /** One per service: "TV mounting × 2" then the amount. */
    lineItem: "{service}",
    lineQty: "{service} × {count}",
    mixedWalls: "Different walls in different rooms? Note it when you book.",
  },
  /** Always visible beside the total, not behind a tooltip. */
  disclaimer:
    "Sample prices for this concept site, not an offer. Your real price is confirmed by text before anyone drills.", // NEEDS DATA: real prices; text-confirm practice
  /** Hands every selection to #book: services, tv_count, tv_size, wall_type, wires, has_mount,
   *  soundbar, home_size, doorbell, smart_devices, rental map 1:1 by name. access_points and
   *  camera_units go into `notes`; camera_units also maps to camera_count buckets
   *  (2 → 1_2, 3–4 → 3_4, 5–8 → 5_8). The estimate goes into `notes` as "Quote: {summary}, from {total}". */
  primary: book("quote_book", "Book this install"),
  secondary: text("quote_text", "Text us this quote", "Hi Jay, my quote from the website: {summary}, from {total}."),
  reset: "Start over",
  /** Prefilled into the form's notes field. */
  notesLine: "Quote: {summary}, from {total}",
} as const;

// ── Process ──────────────────────────────────────────────────────────────────────────

export type MicroUi =
  | { kind: "quote"; title: string; lines: readonly string[]; total: string; sample: true }
  | { kind: "sms"; messages: readonly { from: "us" | "you"; text: string }[]; sample: true }
  | { kind: "checklist"; items: readonly { label: string; value: string }[]; sample: true };

export interface ProcessStep {
  n: 1 | 2 | 3 | 4;
  short: string;
  /** H3 */
  heading: string;
  body: string;
  micro: MicroUi;
}

// Named `processSteps`, not `process`, so it never shadows Node's global in shared tooling.
export const processSteps = {
  eyebrow: "How it works",
  heading: "How booking an install works",
  display: "Price first. Drill second.",
  steps: [
    {
      n: 1,
      short: "Quote",
      heading: "Build your quote",
      body: "Pick the service, the wall and the TV size. The price updates as you go.",
      micro: {
        kind: "quote",
        title: "Estimate",
        lines: ["55\" TV", "Drywall", "Wires inside the wall"],
        total: "from $249", // NEEDS DATA: sample price (gated in-wall dummy)
        sample: true,
      },
    },
    {
      n: 2,
      short: "Confirm",
      heading: "We confirm by text",
      // NEEDS DATA: does Jay confirm by text, give two-hour windows, ask about building rules?
      body: "You get the final price and a time window by text. Nothing is booked until you reply yes.",
      micro: {
        kind: "sms",
        messages: [
          { from: "us", text: "Hi Maria, it's Jay. 55\" TV, wires in the wall: $249. Thu 2–4 pm work?" }, // NEEDS DATA: sample price, window, name
          { from: "you", text: "Yes" },
          { from: "us", text: "Confirmed: Thu 2–4 pm" }, // NEEDS DATA: sample window
        ],
        sample: true,
      },
    },
    {
      n: 3,
      short: "Install",
      heading: "Installed and tested",
      // NEEDS DATA: test-before-leaving practice. Ruth struck "Done in one visit" earlier; do not restore without Jay.
      body: "Mounted, wired and connected. Every input and every device gets checked before we pack up.",
      micro: {
        kind: "checklist",
        items: [
          { label: "HDMI 1–3", value: "Picture" },
          { label: "Wi-Fi, bedroom 2", value: "Strong" },
          { label: "Front door camera", value: "Live" },
        ],
        sample: true,
      },
    },
    {
      n: 4,
      short: "Walkthrough",
      heading: "A walkthrough before we leave",
      // NEEDS DATA: walkthrough and clean-up practice.
      body: "We show you the remote, the app and the Wi-Fi name, then clear the dust and the boxes.",
      micro: {
        kind: "checklist",
        items: [
          { label: "Wi-Fi name", value: "Shared" },
          { label: "Guest code", value: "Set" },
          { label: "Dust and boxes", value: "Cleared" },
        ],
        sample: true,
      },
    },
  ] satisfies readonly ProcessStep[],
  primary: quote("how_quote"),
  secondary: text("how_text", "or text us"),
} as const;

// ── Built for (Condo / House / Office) ───────────────────────────────────────────────

export interface BuiltForCard {
  id: Exclude<PropertyType, "townhouse">;
  /** Icon name for Elena's set: building | house | briefcase */
  icon: "building" | "house" | "briefcase";
  /** H3 */
  title: string;
  /** Exactly two lines. */
  lines: readonly [string, string];
  cta: Cta;
}

export const builtFor = {
  eyebrow: "Built for",
  heading: "TV, Wi-Fi and camera installs for condos, houses and offices",
  cards: [
    {
      id: "condo",
      icon: "building",
      title: "Condos & high-rises",
      lines: [
        "Concrete walls, drilling hours, the service elevator. We plan around all three.",
        // A question, not a claim. NEEDS DATA: liability insurance and COI capability.
        "Does your building ask for a certificate of insurance? Tell us when you book.",
      ],
      cta: book("built_condo_book", "Book a condo install", { propertyType: "condo" }, "contextual"),
    },
    {
      id: "house",
      icon: "house",
      title: "Houses & townhouses",
      lines: [
        "TVs room by room. Wi-Fi out to the patio.",
        "Cameras on the front door, the side gate and the driveway.",
      ],
      cta: book("built_house_book", "Book a house install", { propertyType: "house" }, "contextual"),
    },
    {
      id: "office",
      icon: "briefcase",
      title: "Offices",
      // NEEDS DATA: does Jay take office jobs; working hours.
      lines: [
        "Office Wi-Fi, wired desks and the meeting-room TV.",
        "Need it done before opening or after close? Ask when you book.",
      ],
      cta: book("built_office_book", "Book an office install", { propertyType: "office", services: ["office"] }, "contextual"),
    },
  ] satisfies readonly BuiltForCard[],
} as const;

// ── Reviews (SAMPLES, not real reviews) ──────────────────────────────────────────────

export type ReviewId = "andrea-brickell" | "luis-edgewater" | "renee-coral-gables";

export interface Review {
  id: ReviewId;
  quote: string;
  /** First name and neighborhood, both invented. */
  author: string;
  service: string;
  /** Visible on every card. */
  label: string;
  sample: true;
}

// NEEDS DATA: real reviews Jay can share, with permission. No Review/AggregateRating schema.
// No stars, no photos, no counts. Quotes verbatim from v2.
export const reviews = {
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
      label: "Sample review",
      sample: true, // NEEDS DATA: real reviews
    },
    {
      id: "renee-coral-gables",
      quote:
        "Two cameras, front door and side gate, running on my phone before he left. He texted the price first and that is what I paid.",
      author: "Renee, Coral Gables",
      service: "Camera installation",
      label: "Sample review",
      sample: true, // NEEDS DATA: real reviews
    },
  ] satisfies readonly Review[],
  cta: quote("reviews_quote"),
} as const;

// ── Service area ─────────────────────────────────────────────────────────────────────

// NEEDS DATA: service radius, Broward yes/no, neighborhood and ZIP list, travel fee.
// Only "Downtown MIA" is observed (IG highlight). Neighborhoods render as a list, never a sentence.
export const serviceArea = {
  eyebrow: "Service area",
  heading: "Service area: Miami-Dade and Broward",
  display: "Two counties. One text to find out.",
  body: "We work in high-rises, houses, townhouses and offices across Miami-Dade and Broward.", // NEEDS DATA: office jobs; Broward
  counties: ["Miami-Dade County", "Broward County"],
  neighborhoodsLabel: "Neighborhoods",
  neighborhoodsCountLabel: "neighborhoods",
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

// ── FAQ (Q1–Q8 VERBATIM from v2; text = FAQPage schema text). Q9 held. ──────────────

export interface FaqItem {
  id: string;
  /** H3 */
  question: string;
  /** Bound to schema. Do not edit without Nadia. */
  answer: string;
  /** Rendered after the answer, outside the schema text. */
  link?: Cta;
}

export const faq = {
  eyebrow: "FAQ",
  heading: "Questions Miami condo and home owners ask",
  display: "Straight answers before anyone drills.",
  items: [
    {
      id: "concrete",
      question: "Can you mount a TV on a concrete wall in a Miami condo?",
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
        label: "See condo installs",
        href: "#" + anchors.builtFor,
        track: "cta_click",
        trackId: "faq_built_for",
        kind: "contextual",
      },
    },
    {
      id: "hide-wires",
      question: "Can you hide TV wires inside a concrete wall?",
      answer:
        "Not inside solid concrete, because there's no cavity for cable. If the TV wall is drywall, or drywall furred out over concrete, HDMI cables can run inside it. Power needs a listed in-wall power kit: the electrical code (NEC 400.12) bans hiding a TV's plug-in cord in a wall. On solid concrete, a paintable raceway keeps cables neat.",
      link: {
        label: "See the wall diagram",
        href: "#" + anchors.serviceTabs.tv,
        track: "cta_click",
        trackId: "faq_tv_diagram",
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
        label: "See smart lock setup",
        href: "#" + anchors.serviceTabs.smart,
        track: "cta_click",
        trackId: "faq_smart",
        kind: "contextual",
      },
    },
  ] satisfies readonly FaqItem[],
  // People asking questions want a conversation, so Text leads here, not Book.
  primary: text("faq_text", "Text us a question", "Hi Jay, I have a question before I book."),
  secondary: call("faq_call"),
} as const;

// ── Booking form (#book): VERBATIM from v2 (gated). Do not edit labels without Ruth. ──

export type StepKey = "service" | "details" | "property" | "when" | "contact";

export interface Field<K extends string = string> {
  /** Form field name. */
  name: string;
  label: string;
  helper?: string;
  options?: readonly Option<K>[];
  error?: string;
}

export const form = {
  heading: "Book a TV mount, Wi-Fi setup or camera install", // H2; step labels are <legend>s
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

  // Step 1. Prefilled by the quote builder and every Book CTA.
  service: {
    legend: "What do you need?",
    helper: "Pick everything you need. One request can cover several jobs.",
    name: "services",
    options: [
      { key: "tv", label: "TV mounting" },
      { key: "theater", label: "Home theater and sound" }, // NEEDS DATA: does Jay do theater?
      { key: "wifi", label: "Wi-Fi and networking" },
      { key: "cameras", label: "Security cameras and doorbells" },
      { key: "smart", label: "Smart locks and home automation" },
      { key: "office", label: "Office network and AV" }, // NEEDS DATA: does Jay take office jobs?
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
      } satisfies Field<WallKey>,
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
          { key: "switches", label: "Smart plugs and hubs" }, // legacy key; NOT light switches
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
      /** 10–500 characters. */
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
    // NEEDS DATA: REMOVE this field if Jay cannot issue a COI.
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
        { key: "text", label: "Text" }, // default
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
    // Both UNCHECKED by default and OPTIONAL (operator ruling 2026-10-07). Never a condition of submitting.
    // NEEDS DATA: legal review of both labels (TCPA / CAN-SPAM) before the site goes live.
    smsConsent: {
      name: "sms_consent",
      label: "Text me updates about this request (msg & data rates may apply, reply STOP to opt out)",
      defaultChecked: false,
      required: false,
      error: "Tick the box to allow texts, or choose call or email.", // only used if the box becomes required
    },
    emailOptIn: { name: "email_optin", label: "Email me tips and offers", defaultChecked: false, required: false },
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
    /** Keys are field names, for data-fill. */
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
    callLine: "Can't wait? Text or call " + contact.phoneDisplay + ".", // NEEDS DATA: Jay's real phone
  },
  error: {
    heading: "That didn't send.",
    body: "Your details are still here.",
    retry: "Try again",
    textInstead: "Text us instead",
    /** Consult.astro links the email and phone inside this sentence; keep email before phone. */
    fallback: "Or email " + contact.email + ", or call " + contact.phoneDisplay + ".", // NEEDS DATA: real email and phone
    /** mailto subject, service only, no PII. */
    mailtoSubject: "Install request: {service}",
  },
  timeout: "This is taking too long. Your details are still here.",
  /** Shown with the success layout when PUBLIC_FORM_ENDPOINT is unset. */
  demoNotice: "Concept site: this form is not connected yet.",
  demoDetail: "Nothing was sent. On the live site, this request goes straight to Jay's phone.", // NEEDS DATA: where live submissions route
} as const;

// ── Mobile sticky bar ────────────────────────────────────────────────────────────────

export const stickyBar = {
  label: "Quick contact",
  call: call("sticky_call", "Call"), // NEEDS DATA: Jay's real phone
  text: text("sticky_text", "Text"), // NEEDS DATA: Jay's real mobile
  /** Primary cell. Opens the quote builder, which hands off to #book. Marcus may swap to book(). */
  quote: quote("sticky_quote", "Get a quote"),
  quoteAria: "Get an instant quote",
  /** Replace "a TV / Wi-Fi / camera job" with the chosen service name when one is selected. */
  smsBody: SMS_DEFAULT,
} as const;

// ── Footer ───────────────────────────────────────────────────────────────────────────

export const footer = {
  tagline: "TV mounting, Wi-Fi, cameras and smart locks, installed across Miami-Dade and Broward.", // NEEDS DATA: service area
  contactHeading: "Book or ask",
  nap: {
    name: contact.businessName,
    text: text("footer_text", "Text " + contact.phoneDisplay), // NEEDS DATA: Jay's real mobile
    phone: call("footer_call", "Call " + contact.phoneDisplay), // NEEDS DATA: Jay's real phone
    email: {
      label: contact.email,
      href: contact.emailHref,
      track: "email_click",
      trackId: "footer_email",
      kind: "secondary",
    } satisfies Cta, // NEEDS DATA: Jay's real email
    area: "Serving Miami-Dade and Broward", // NEEDS DATA: service radius
    instagram: {
      label: "Instagram " + contact.instagramHandle,
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
  // No licence, no "licensed & insured", no founding year, no brand names.
  credits: {
    /** Render only if any Pexels asset ships. v3 is diagram-led, so probably none. */
    pexels: { label: "Photos from Pexels", href: "https://www.pexels.com" },
    authorsPrefix: "Stock photography by",
  },
  /** Illustrations and app screens are drawn for the concept. */
  illustrationNote: "Diagrams and app screens are illustrations, not screenshots of a specific product.",
  mapNote: "The service-area map is embedded from Google Maps. When it loads, your browser connects to Google, which may read and set cookies.",
  concept: ribbon.disclosure + " For real contact details, use Instagram " + contact.instagramHandle + ".",
  conceptCredit: "Concept and build by Qognition Agency",
  legal: "© 2026 TechSolutions FL", // NEEDS DATA: legal business name (Sunbiz)
  backToTop: "Back to top",
} as const;

// ── NEEDS DATA registry: feeds the promotion gate (lib/indexing.ts) and the README ────

export const needsData: { key: string; what: string }[] = [
  { key: "contact.phone", what: "Jay's real phone/mobile (dummy (305) 555-0142)" },
  { key: "contact.email", what: "Jay's real email (dummy book@techsolutionsfl.example)" },
  { key: "prices", what: "Real base prices: TV mount, in-wall wires, Wi-Fi/mesh, 2 cameras, smart device (dummies $129 / $249 / $179 / $349 / $89)" },
  { key: "prices.deltas", what: "Every quote-builder delta is invented: TV 56–75\" +$40, 76\"+ +$80, raceway +$49, in-wall +$120, mount +$59, soundbar +$49; Wi-Fi 2–3 bed +$60, 4+ bed +$120, office +$60, access point +$99; extra camera +$129, doorbell +$99" },
  { key: "prices.concrete", what: "Concrete surcharge or not (builder shows none; no copy claims none)" },
  { key: "prices.mount", what: "Mount included or extra, and its price" },
  { key: "prices.extras", what: "Gear pricing (mesh kits, cameras), Ethernet runs, fireplace/brick, trip fee, warranty" },
  { key: "prices.baseIncludes", what: "What each base price covers (builder baseIncludes lines)" },
  { key: "method.concrete", what: "Jay's concrete method: raceway, paint-matched or not" },
  { key: "process", what: "Text confirmation before the visit (hero headline, slogan), two-hour windows, reply time, working hours, room-by-room Wi-Fi check, test-before-leaving, walkthrough and clean-up, photo quotes" },
  { key: "positioning.sameVisit", what: "Same-visit multi-service capacity (sample review 2)" },
  { key: "positioning.solo", what: "Jay installs himself or with helpers (\"we\" voice)" },
  { key: "gear", what: "Brands and apps Jay installs (hero phone screens are generic)" },
  { key: "services.theater", what: "Whether Jay does home theater (form option, explorer footer line)" },
  { key: "office", what: "Whether Jay takes small-office jobs; before-opening/after-close availability" },
  { key: "hosts", what: "Serves short-term-rental hosts (smart tab, FAQ Q8, rental checkbox, role option)" },
  { key: "reviews", what: "Real reviews Jay can share, with permission (3 samples)" },
  { key: "area", what: "Service radius, Broward yes/no, neighborhood and ZIP list (incl. Aventura, Hollywood, Fort Lauderdale), travel fee" },
  { key: "coi", what: "Liability insurance and COI capability (condo card question, form field coi_needed, FAQ Q2 add-on)" },
  { key: "licence", what: "DBPR licence status for camera work (cameras tab, held FAQ Q9)" },
  { key: "spanish", what: "Spanish-language service" },
  { key: "legalName", what: "Legal business name (Sunbiz)" },
  { key: "consent", what: "Legal review of SMS consent and opt-in wording" },
  { key: "formRouting", what: "Where live form submissions route (SMS/email); form provider name" },
];
