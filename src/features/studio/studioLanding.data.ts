import { routes } from "../../app/routeMap";

/** Logged-out marketing landing for QueerPulse Studio (shown at /studio). */

export interface FooterLink {
  label: string;
  to: string;
}
export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export const TOP_NAV: FooterLink[] = [
  { label: "About the co-op", to: routes.studioAbout },
  { label: "Public ledger", to: routes.governance },
  { label: "How it works", to: "#how" },
  { label: "For artists", to: "#artists" },
];

export const HERO_SET_ART =
  "https://images.unsplash.com/photo-1528643609128-c50fdc20cc58?q=80&w=800&auto=format&fit=crop";

/** Waveform bars for the demo player — the leading `played` run is coral. */
export const DEMO_WAVE: { h: number; played: boolean }[] = [
  { h: 30, played: true },
  { h: 55, played: true },
  { h: 70, played: true },
  { h: 90, played: true },
  { h: 65, played: true },
  { h: 80, played: true },
  { h: 50, played: true },
  { h: 42, played: true },
  { h: 60, played: true },
  { h: 75, played: true },
  { h: 55, played: false },
  { h: 88, played: false },
  { h: 62, played: false },
  { h: 48, played: false },
  { h: 72, played: false },
  { h: 34, played: false },
  { h: 58, played: false },
  { h: 80, played: false },
  { h: 46, played: false },
  { h: 64, played: false },
  { h: 78, played: false },
  { h: 42, played: false },
  { h: 90, played: false },
  { h: 54, played: false },
];

export interface Promise {
  num: string;
  titlePre: string;
  titleEm: string;
  titlePost?: string;
  body: string;
}

export const PROMISES: Promise[] = [
  {
    num: "i.",
    titlePre: "A fair, ",
    titleEm: "visible",
    titlePost: " share.",
    body: "80% of every listen to the artist. 100% of every tip. The other 20% covers payments, hosting, captions, sheet-music typesetting, and council stipends. The split is on every artist page, every receipt, every album.",
  },
  {
    num: "ii.",
    titlePre: "A room ",
    titleEm: "programmed",
    titlePost: " by humans.",
    body: 'Every track on the homepage has a curator’s name and a one-paragraph note. No "popular near you", no "made for you", no infinite scroll. The week is small, hand-built, and dated.',
  },
  {
    num: "iii.",
    titlePre: "Co-owned by the ",
    titleEm: "listeners",
    titlePost: ".",
    body: "Sustainers (€7/mo) become voting co-op members after twelve months. They elect the council, approve the rate card, and see every euro on the ledger. The platform is structurally accountable to the room.",
  },
  {
    num: "iv.",
    titlePre: "Privacy as a ",
    titleEm: "default",
    titlePost: ".",
    body: "No listening data sold, syndicated, or used to recommend. Personal play history is private and deletable in one click. Aggregate plays exist for the ledger; nothing else leaves the building.",
  },
];

export interface CounterStat {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

/** The big headline payout figure. */
export const PAYOUT_TOTAL = 62140;

export const COUNTER_STATS: CounterStat[] = [
  {
    value: 5,
    prefix: "€0.0",
    suffix: "",
    label: "per qualifying play · 15× Spotify",
  },
  { value: 80, suffix: ".3%", label: "share to artists, aggregate" },
  { value: 2104, label: "sustainers in the co-op" },
  { value: 9, suffix: ".4 days", label: "median council answer time" },
];

export interface CompareCard {
  label: string;
  value: string;
  ctx: string;
  us?: boolean;
}

export const COMPARE: CompareCard[] = [
  {
    label: "Spotify · avg",
    value: "€0.003",
    ctx: "Pro-rata · ad-blended · about 3 cents per 10 plays",
  },
  {
    label: "Apple Music",
    value: "€0.007",
    ctx: "Slightly better, still mostly nominal",
  },
  {
    label: "Tidal HiFi",
    value: "€0.012",
    ctx: "User-centric · hi-fi tier only",
  },
  {
    label: "QP Studio · committed floor",
    value: "€0.05",
    ctx: "No ads · no shareholders · sustainer-pooled. Set annually by vote.",
    us: true,
  },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Studio",
    links: [
      { label: "This week", to: routes.studio },
      { label: "Sheet music", to: routes.studioSheetStore },
      { label: "DJ sets", to: routes.studioSet },
      { label: "Live broadcast", to: routes.studioLive },
    ],
  },
  {
    title: "Artists",
    links: [
      { label: "Submit music", to: routes.studioUpload },
      { label: "Artist dashboard", to: routes.studioDashboard },
      { label: "Revenue split", to: routes.studioAbout },
      { label: "Rights & takedown", to: routes.studioRights },
    ],
  },
  {
    title: "The co-op",
    links: [
      { label: "The strategy plan", to: routes.studioAbout },
      { label: "Trust & terms", to: routes.studioTerms },
      { label: "Public ledger", to: routes.governance },
      { label: "Accessibility", to: routes.studioAccessibility },
    ],
  },
  {
    title: "Council",
    links: [
      { label: "Programming", to: routes.studioProgram },
      { label: "Submissions", to: routes.studioTriage },
      { label: "Curator council", to: routes.studioCouncil },
      { label: "Open calls", to: routes.studioCalls },
    ],
  },
];
