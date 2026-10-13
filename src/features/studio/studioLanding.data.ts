import { routes } from "../../app/routeMap";

/**
 * Logged-out marketing landing for QueerPulse Studio (shown at /studio).
 * i18n Pattern A throughout: nav, footer, promise and stat copy hold catalog
 * keys, and the components resolve them with `t()`.
 */

export interface FooterLink {
  labelKey: string;
  to: string;
}
export interface FooterColumn {
  titleKey: string;
  links: FooterLink[];
}

export const TOP_NAV: FooterLink[] = [
  {
    labelKey: "studio:landing.nav.aboutCoop",
    to: routes.studioAbout,
  },
  {
    labelKey: "studio:landing.nav.publicLedger",
    to: routes.governance,
  },
  {
    labelKey: "studio:landing.nav.howItWorks",
    to: "#how",
  },
  {
    labelKey: "studio:landing.nav.forArtists",
    to: "#artists",
  },
];

export const HERO_SET_ART =
  "https://images.unsplash.com/photo-1528643609128-c50fdc20cc58?q=80&w=800&auto=format&fit=crop";

/** Waveform bars for the demo player; the leading `played` run is coral. */
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
 * A headline figure, formatted for the active locale at render: `style` picks
 * euros or a percentage (`value` 80.3 means 80.3%), `fractionDigits` fixes
 * the decimals. `unitKey` is the one spot a unit word ("days") is glued to
 * the number: it resolves through `t()` and is appended with its own space.
 */
export interface CounterStat {
  value: number;
  style?: "currency" | "percent";
  fractionDigits?: number;
  unitKey?: string;
  labelKey: string;
}

/** The big headline payout figure. */
export const PAYOUT_TOTAL = 62140;

export const COUNTER_STATS: CounterStat[] = [
  {
    value: 0.05,
    style: "currency",
    fractionDigits: 2,
    labelKey: "studio:landing.counter.stat.perPlay",
  },
  {
    value: 80.3,
    style: "percent",
    fractionDigits: 1,
    labelKey: "studio:landing.counter.stat.artistShare",
  },
  { value: 2104, labelKey: "studio:landing.counter.stat.sustainers" },
  {
    value: 9.4,
    fractionDigits: 1,
    unitKey: "studio:landing.counter.unit.days",
    labelKey: "studio:landing.counter.stat.councilAnswerTime",
  },
];

export interface CompareCard {
  labelKey: string;
  /** Euros per play, formatted for the active locale at render. */
  value: number;
  ctxKey: string;
  us?: boolean;
}

export const COMPARE: CompareCard[] = [
  {
    labelKey: "studio:landing.compare.spotify.label",
    value: 0.003,
    ctxKey: "studio:landing.compare.spotify.ctx",
  },
  {
    labelKey: "studio:landing.compare.apple.label",
    value: 0.007,
    ctxKey: "studio:landing.compare.apple.ctx",
  },
  {
    labelKey: "studio:landing.compare.tidal.label",
    value: 0.012,
    ctxKey: "studio:landing.compare.tidal.ctx",
  },
  {
    labelKey: "studio:landing.compare.us.label",
    value: 0.05,
    ctxKey: "studio:landing.compare.us.ctx",
    us: true,
  },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    titleKey: "studio:landing.footer.col.studio",
    links: [
      {
        labelKey: "studio:landing.footer.col.studio.thisWeek",
        to: routes.studio,
      },
      {
        labelKey: "studio:rail.main.sheetMusic",
        to: routes.studioSheetStore,
      },
      {
        labelKey: "studio:landing.footer.col.studio.djSets",
        to: routes.studioSet,
      },
      {
        labelKey: "studio:landing.footer.col.studio.liveBroadcast",
        to: routes.studioLive,
      },
    ],
  },
  {
    titleKey: "studio:landing.footer.col.artists",
    links: [
      {
        labelKey: "studio:landing.footer.col.artists.submitMusic",
        to: routes.studioUpload,
      },
      {
        labelKey: "studio:landing.footer.col.artists.dashboard",
        to: routes.studioDashboard,
      },
      {
        labelKey: "studio:landing.footer.col.artists.revenueSplit",
        to: routes.studioAbout,
      },
      {
        labelKey: "studio:rail.contribute.rightsTakedown",
        to: routes.studioRights,
      },
    ],
  },
  {
    titleKey: "studio:rail.section.coop",
    links: [
      {
        labelKey: "studio:landing.footer.col.coop.strategyPlan",
        to: routes.studioAbout,
      },
      {
        labelKey: "studio:rail.utility.trustTerms",
        to: routes.studioTerms,
      },
      {
        labelKey: "studio:landing.nav.publicLedger",
        to: routes.governance,
      },
      {
        labelKey: "studio:rail.utility.accessibility",
        to: routes.studioAccessibility,
      },
    ],
  },
  {
    titleKey: "studio:landing.footer.col.council",
    links: [
      {
        labelKey: "studio:landing.footer.col.council.programming",
        to: routes.studioProgram,
      },
      {
        labelKey: "studio:landing.footer.col.council.submissions",
        to: routes.studioTriage,
      },
      {
        labelKey: "studio:landing.footer.col.council.curatorCouncil",
        to: routes.studioCouncil,
      },
      {
        labelKey: "studio:rail.contribute.openCalls",
        to: routes.studioCalls,
      },
    ],
  },
];
