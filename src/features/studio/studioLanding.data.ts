import { routes } from "../../app/routeMap";

/**
 * Logged-out marketing landing for QueerPulse Studio (shown at /studio).
 * i18n Pattern A throughout — chrome nav/footer/promise/stat copy holds
 * catalog keys; the components resolve them with `t()`.
 */

export interface FooterLink {
  label: string;
  labelKey: string;
  to: string;
}
export interface FooterColumn {
  title: string;
  titleKey: string;
  links: FooterLink[];
}

export const TOP_NAV: FooterLink[] = [
  {
    label: "About the co-op",
    labelKey: "studio:landing.nav.aboutCoop",
    to: routes.studioAbout,
  },
  {
    label: "Public ledger",
    labelKey: "studio:landing.nav.publicLedger",
    to: routes.governance,
  },
  {
    label: "How it works",
    labelKey: "studio:landing.nav.howItWorks",
    to: "#how",
  },
  {
    label: "For artists",
    labelKey: "studio:landing.nav.forArtists",
    to: "#artists",
  },
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
  titleKey: string;
  bodyKey: string;
}

export const PROMISES: Promise[] = [
  {
    num: "i.",
    titleKey: "studio:landing.promises.share.title",
    bodyKey: "studio:landing.promises.share.body",
  },
  {
    num: "ii.",
    titleKey: "studio:landing.promises.humans.title",
    bodyKey: "studio:landing.promises.humans.body",
  },
  {
    num: "iii.",
    titleKey: "studio:landing.promises.coOwned.title",
    bodyKey: "studio:landing.promises.coOwned.body",
  },
  {
    num: "iv.",
    titleKey: "studio:landing.promises.privacy.title",
    bodyKey: "studio:landing.promises.privacy.body",
  },
];

/**
 * `prefix`/`suffix` are symbolic (currency/percent glyphs), not language
 * prose, so they stay as literal display fragments. `unitKey` is the one spot
 * a unit *word* ("days") is glued to the animated number — it resolves
 * through `t()` and is appended with its own space.
 */
export interface CounterStat {
  value: number;
  prefix?: string;
  suffix?: string;
  unitKey?: string;
  labelKey: string;
}

/** The big headline payout figure. */
export const PAYOUT_TOTAL = 62140;

export const COUNTER_STATS: CounterStat[] = [
  {
    value: 5,
    prefix: "€0.0",
    suffix: "",
    labelKey: "studio:landing.counter.stat.perPlay",
  },
  {
    value: 80,
    suffix: ".3%",
    labelKey: "studio:landing.counter.stat.artistShare",
  },
  { value: 2104, labelKey: "studio:landing.counter.stat.sustainers" },
  {
    value: 9,
    suffix: ".4",
    unitKey: "studio:landing.counter.unit.days",
    labelKey: "studio:landing.counter.stat.councilAnswerTime",
  },
];

export interface CompareCard {
  labelKey: string;
  value: string;
  ctxKey: string;
  us?: boolean;
}

export const COMPARE: CompareCard[] = [
  {
    labelKey: "studio:landing.compare.spotify.label",
    value: "€0.003",
    ctxKey: "studio:landing.compare.spotify.ctx",
  },
  {
    labelKey: "studio:landing.compare.apple.label",
    value: "€0.007",
    ctxKey: "studio:landing.compare.apple.ctx",
  },
  {
    labelKey: "studio:landing.compare.tidal.label",
    value: "€0.012",
    ctxKey: "studio:landing.compare.tidal.ctx",
  },
  {
    labelKey: "studio:landing.compare.us.label",
    value: "€0.05",
    ctxKey: "studio:landing.compare.us.ctx",
    us: true,
  },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Studio",
    titleKey: "studio:landing.footer.col.studio",
    links: [
      {
        label: "This week",
        labelKey: "studio:landing.footer.col.studio.thisWeek",
        to: routes.studio,
      },
      {
        label: "Sheet music",
        labelKey: "studio:rail.main.sheetMusic",
        to: routes.studioSheetStore,
      },
      {
        label: "DJ sets",
        labelKey: "studio:landing.footer.col.studio.djSets",
        to: routes.studioSet,
      },
      {
        label: "Live broadcast",
        labelKey: "studio:landing.footer.col.studio.liveBroadcast",
        to: routes.studioLive,
      },
    ],
  },
  {
    title: "Artists",
    titleKey: "studio:landing.footer.col.artists",
    links: [
      {
        label: "Submit music",
        labelKey: "studio:landing.footer.col.artists.submitMusic",
        to: routes.studioUpload,
      },
      {
        label: "Artist dashboard",
        labelKey: "studio:landing.footer.col.artists.dashboard",
        to: routes.studioDashboard,
      },
      {
        label: "Revenue split",
        labelKey: "studio:landing.footer.col.artists.revenueSplit",
        to: routes.studioAbout,
      },
      {
        label: "Rights & takedown",
        labelKey: "studio:rail.contribute.rightsTakedown",
        to: routes.studioRights,
      },
    ],
  },
  {
    title: "The co-op",
    titleKey: "studio:rail.section.coop",
    links: [
      {
        label: "The strategy plan",
        labelKey: "studio:landing.footer.col.coop.strategyPlan",
        to: routes.studioAbout,
      },
      {
        label: "Trust & terms",
        labelKey: "studio:rail.utility.trustTerms",
        to: routes.studioTerms,
      },
      {
        label: "Public ledger",
        labelKey: "studio:landing.nav.publicLedger",
        to: routes.governance,
      },
      {
        label: "Accessibility",
        labelKey: "studio:rail.utility.accessibility",
        to: routes.studioAccessibility,
      },
    ],
  },
  {
    title: "Council",
    titleKey: "studio:landing.footer.col.council",
    links: [
      {
        label: "Programming",
        labelKey: "studio:landing.footer.col.council.programming",
        to: routes.studioProgram,
      },
      {
        label: "Submissions",
        labelKey: "studio:landing.footer.col.council.submissions",
        to: routes.studioTriage,
      },
      {
        label: "Curator council",
        labelKey: "studio:landing.footer.col.council.curatorCouncil",
        to: routes.studioCouncil,
      },
      {
        label: "Open calls",
        labelKey: "studio:rail.contribute.openCalls",
        to: routes.studioCalls,
      },
    ],
  },
];
