import { routes } from "../../app/routeMap";

/**
 * i18n Pattern A. `labelKey` is chrome (a static nav grid); the component
 * resolves it with `t()`. `label` stays only as a stable React `key`.
 */
export interface RailLink {
  label: string;
  labelKey: string;
  to: string;
  end?: boolean;
}

export const RAIL_MAIN: RailLink[] = [
  {
    label: "Home",
    labelKey: "studio:rail.main.home",
    to: routes.studio,
    end: true,
  },
  {
    label: "The Wednesday set",
    labelKey: "studio:rail.main.wednesdaySet",
    to: routes.studio,
    end: true,
  },
  {
    label: "Browse",
    labelKey: "studio:rail.main.browse",
    to: routes.studio,
    end: true,
  },
  {
    label: "Sheet music",
    labelKey: "studio:rail.main.sheetMusic",
    to: "/studio/sheet-store",
  },
  {
    label: "Live broadcasts",
    labelKey: "studio:rail.main.liveBroadcasts",
    to: routes.studioLive,
  },
  {
    label: "Notifications",
    labelKey: "studio:rail.main.notifications",
    to: routes.studioNotifications,
  },
];

export const CONTRIBUTE: RailLink[] = [
  {
    label: "Submit a set",
    labelKey: "studio:rail.contribute.submitSet",
    to: routes.studioSetSubmission,
  },
  {
    label: "Go live",
    labelKey: "studio:rail.contribute.goLive",
    to: routes.studioBroadcast,
  },
  {
    label: "Open calls",
    labelKey: "studio:rail.contribute.openCalls",
    to: routes.studioCalls,
  },
  {
    label: "Rights & takedown",
    labelKey: "studio:rail.contribute.rightsTakedown",
    to: routes.studioRights,
  },
  {
    label: "Solidarity fund",
    labelKey: "studio:rail.contribute.solidarityFund",
    to: "/studio/solidarity-fund",
  },
];

export const GOVERNANCE: RailLink[] = [
  {
    label: "Programme the week",
    labelKey: "studio:rail.governance.programWeek",
    to: routes.studioProgram,
  },
  {
    label: "Curation council",
    labelKey: "studio:rail.governance.curationCouncil",
    to: routes.studioCouncil,
  },
  {
    label: "Submission inbox",
    labelKey: "studio:rail.governance.submissionInbox",
    to: routes.studioTriage,
  },
  {
    label: "Flagged tracks",
    labelKey: "studio:rail.governance.flaggedTracks",
    to: routes.studioFlagReview,
  },
];

export const UTILITY: RailLink[] = [
  {
    label: "About the co-op",
    labelKey: "studio:rail.utility.about",
    to: routes.studioAbout,
  },
  {
    label: "Help & FAQ",
    labelKey: "studio:rail.utility.help",
    to: routes.studioHelp,
  },
  {
    label: "Accessibility",
    labelKey: "studio:rail.utility.accessibility",
    to: routes.studioAccessibility,
  },
  {
    label: "Trust & terms",
    labelKey: "studio:rail.utility.trustTerms",
    to: routes.studioTerms,
  },
];

export const PLAYER_ART =
  "https://images.unsplash.com/photo-1654432673600-33ff123df18a?q=80&w=400&auto=format&fit=crop";

/** Mock signed-in member's avatar initials — content, not chrome. */
export const CURRENT_MEMBER_INITIALS = "RM";

/** Studio's flat monthly sustain price — a number so it can go through `useFormat().currency()`. */
export const SUSTAIN_PRICE = 7;

/** Real `Date` the mock member became a sustainer, formatted via `useFormat()`. */
export const SUSTAINER_SINCE_DATE = new Date(2026, 1, 1);

/** This year's mock giving totals — numbers only; the sentence is chrome. */
export const YEARLY_GIVING = { amount: 312, artistCount: 47 };

export interface LibraryItem {
  name: string;
  em: string;
  meta: string;
  tint: "coral" | "plum" | "jade";
  to: string;
  image?: string;
}

export const LIBRARY: LibraryItem[] = [
  {
    name: "Cidade dos ",
    em: "santos",
    meta: "Album · Mariana Sol",
    tint: "coral",
    to: routes.studioAlbum,
    image:
      "https://images.unsplash.com/photo-1629794138560-46d2815a6d79?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Vespertina ",
    em: "vol. iv",
    meta: "Set · Sara Marques",
    tint: "plum",
    to: routes.studio,
    image:
      "https://images.unsplash.com/photo-1528643609128-c50fdc20cc58?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Lisbon dyke-bar ",
    em: "standards",
    meta: "Collection · 28 tracks",
    tint: "jade",
    to: routes.studio,
    image:
      "https://images.unsplash.com/photo-1565502233254-3d22afd146eb?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Trans ",
    em: "composers",
    meta: "Mix · D. Okoye",
    tint: "plum",
    to: routes.studio,
    image:
      "https://images.unsplash.com/photo-1566108253680-7c860e4633a3?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "The Anjos ",
    em: "tape",
    meta: "Live · Casa do Comum",
    tint: "coral",
    to: routes.studio,
    image:
      "https://images.unsplash.com/photo-1585310808021-c2221275d7ad?q=80&w=800&auto=format&fit=crop",
  },
];
