import type { AdminGroupListingQueueDTO } from "./api/adminHousingGroupListings.api";

/** At or above this a listing must always pass a human first. Mirrors the
 *  backend's `HIGH_RISK_THRESHOLD` in `housing-listings/housing-risk.ts`, which
 *  is the same scorer group listings run through. */
export const GROUP_LISTING_HIGH_RISK_SCORE = 50;
/** Below this the signals are thinness rather than red flags. */
export const GROUP_LISTING_LOW_RISK_SCORE = 20;

/** Which band a score falls in. Drives the colour AND the word beside it, so
 *  the number is never the only signal a reader has to interpret. */
export function groupListingRiskBand(score: number): "high" | "medium" | "low" {
  if (score >= GROUP_LISTING_HIGH_RISK_SCORE) return "high";
  if (score > GROUP_LISTING_LOW_RISK_SCORE) return "medium";
  return "low";
}

/**
 * How loudly each machine reason code reads. `alert` is a red flag somebody
 * has to answer for; `note` is a thinness signal that only shapes the sort.
 * Codes come from `assessHousingRisk`; anything absent here is treated as a
 * note and rendered as its own code so a new backend signal stays visible.
 */
export const GROUP_LISTING_RISK_SEVERITY: Record<string, "alert" | "note"> = {
  rent_far_below_market: "alert",
  rent_below_market: "note",
  contact_info_in_text: "alert",
  off_platform_payment_language: "alert",
  discriminatory_language: "alert",
  lister_unverified: "note",
  lister_phone_only: "note",
  incomplete_listing: "note",
  no_photos: "note",
  missing_accessibility_info: "note",
};

/**
 * Demo-mode fixture for the group-listing review queue, so the console renders
 * fully with no backend behind it. Fabricated data: the hook only ever serves
 * this while `demoMode` is on, and it must never surface as platform truth in
 * live mode. Mirrors {@link AdminGroupListingQueueDTO}.
 *
 * Deliberately covers the three states a reviewer needs to recognise: a
 * high-risk room still waiting, a listing already sent back with a question,
 * and one that was published, with its audit trail attached.
 */
export const ADMIN_GROUP_LISTING_QUEUE_DEMO: AdminGroupListingQueueDTO[] = [
  {
    id: "gl_9001",
    title: "Bright room in a shared flat, Anjos",
    description:
      "One room in a four-person flat. Deposit is two months and I can only take cash transfers outside the platform.",
    neighbourhood: "Anjos",
    priceEuros: 620,
    accessibilityInfo: "Third floor, no lift. Step-free once you are inside.",
    groupSlug: "queer-flatshares-lisboa",
    groupName: "Queer flatshares Lisboa",
    status: "review",
    riskScore: 72,
    riskReasons: [
      "off_platform_payment_language",
      "contact_info_in_text",
      "lister_unverified",
    ],
    hidden: false,
    hiddenReason: null,
    createdAt: "2026-08-21T09:12:00.000Z",
    postedBy: {
      slug: "ines-carvalho",
      firstName: "Inês",
      lastName: "Carvalho",
      pronouns: "ela/dela",
      avatarUrl: null,
    },
    decidedAt: null,
    decidedBy: null,
    decisionReason: null,
  },
  {
    id: "gl_9002",
    title: "Studio near Arroios, available from October",
    description:
      "Small studio, own kitchen, quiet street. Happy to answer anything about the building.",
    neighbourhood: "Arroios",
    priceEuros: 780,
    accessibilityInfo: "Ground floor, step-free from the street.",
    groupSlug: "queer-flatshares-lisboa",
    groupName: "Queer flatshares Lisboa",
    status: "question",
    riskScore: 24,
    riskReasons: ["no_photos"],
    hidden: false,
    hiddenReason: null,
    createdAt: "2026-08-19T17:40:00.000Z",
    postedBy: {
      slug: "rui-mendes",
      firstName: "Rui",
      lastName: "Mendes",
      pronouns: "ele/dele",
      avatarUrl: null,
    },
    decidedAt: "2026-08-20T08:05:00.000Z",
    decidedBy: "usr_moderator_demo",
    decisionReason:
      "Could you say whether bills are included, and roughly what they run to in winter?",
  },
  {
    id: "gl_9003",
    title: "Room in a trans-led house, Graça",
    description:
      "We are three, looking for a fourth. Shared cooking on Sundays if you want in.",
    neighbourhood: "Graça",
    priceEuros: 490,
    accessibilityInfo: "Two flights of stairs, no lift. Wide doorways.",
    groupSlug: "trans-housing-network",
    groupName: "Trans housing network",
    status: "live",
    riskScore: 8,
    riskReasons: [],
    hidden: false,
    hiddenReason: null,
    createdAt: "2026-08-14T11:00:00.000Z",
    postedBy: {
      slug: "sara-lopes",
      firstName: "Sara",
      lastName: "Lopes",
      pronouns: "ela/dela",
      avatarUrl: null,
    },
    decidedAt: "2026-08-15T10:30:00.000Z",
    decidedBy: "usr_moderator_demo",
    decisionReason: null,
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days a listing has been sitting in the queue. A queue without an age
 *  column becomes a queue nobody works, so this drives both the label on the
 *  card and the "this has waited too long" emphasis. */
export function daysWaiting(createdAt: string): number {
  const submitted = Date.parse(createdAt);
  if (Number.isNaN(submitted)) return 0;
  return Math.max(0, Math.floor((Date.now() - submitted) / DAY_MS));
}

/** Past this many days undecided, the age reads as a warning rather than a
 *  fact. One working week is the promise this console is keeping. */
export const GROUP_LISTING_STALE_DAYS = 7;

/**
 * Where the review console lives. Not in `routeMap` yet: `app/routeMap.ts` is
 * owned centrally, so the path is declared here and the entry is requested in
 * this build's report. Swap this constant for `routes.adminHousingGroupListings`
 * once that lands.
 */
