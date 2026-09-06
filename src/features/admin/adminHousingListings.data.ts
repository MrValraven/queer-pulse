import type { AdminHousingListingDTO } from "./api/adminHousingListings.api";

/**
 * The risk signals the backend can raise on a housing listing, in the order it
 * emits them, mapped to the sentence a moderator reads.
 *
 * The score alone is a number nobody can argue with. What a moderator actually
 * decides on is the reasoning behind it, so the console names every signal in
 * plain words rather than reducing a real person's home to "72". `weight`
 * mirrors the backend's own additive weights, so the panel can show which
 * signals carry the score.
 */
export interface HousingRiskSignal {
  /** Stable machine code from the backend. */
  code: string;
  labelKey: string;
  /** How much this signal adds to the 0-100 score. */
  weight: number;
  /** `alert` signals are the ones that usually stop a publish; `note` signals
   * are thinness or a lister the platform simply does not know yet. */
  severity: "alert" | "note";
}

export const HOUSING_RISK_SIGNALS: HousingRiskSignal[] = [
  {
    code: "rent_far_below_market",
    labelKey: "admin:housingListings.risk.rentFarBelowMarket",
    weight: 30,
    severity: "alert",
  },
  {
    code: "rent_below_market",
    labelKey: "admin:housingListings.risk.rentBelowMarket",
    weight: 15,
    severity: "alert",
  },
  {
    code: "contact_info_in_text",
    labelKey: "admin:housingListings.risk.contactInfoInText",
    weight: 25,
    severity: "alert",
  },
  {
    code: "off_platform_payment_language",
    labelKey: "admin:housingListings.risk.offPlatformPayment",
    weight: 25,
    severity: "alert",
  },
  {
    code: "discriminatory_language",
    labelKey: "admin:housingListings.risk.discriminatoryLanguage",
    weight: 25,
    severity: "alert",
  },
  {
    code: "lister_unverified",
    labelKey: "admin:housingListings.risk.listerUnverified",
    weight: 15,
    severity: "note",
  },
  {
    code: "lister_phone_only",
    labelKey: "admin:housingListings.risk.listerPhoneOnly",
    weight: 5,
    severity: "note",
  },
  {
    code: "incomplete_listing",
    labelKey: "admin:housingListings.risk.incompleteListing",
    weight: 10,
    severity: "note",
  },
  {
    code: "no_photos",
    labelKey: "admin:housingListings.risk.noPhotos",
    weight: 5,
    severity: "note",
  },
  {
    code: "missing_accessibility_info",
    labelKey: "admin:housingListings.risk.missingAccessibilityInfo",
    weight: 5,
    severity: "note",
  },
];

const SIGNALS_BY_CODE = new Map(
  HOUSING_RISK_SIGNALS.map((signal) => [signal.code, signal]),
);

/** Resolves a machine code the console has no sentence for yet, so a new
 * backend signal shows as itself rather than vanishing from the panel. */
export function riskSignalFor(code: string): HousingRiskSignal {
  return (
    SIGNALS_BY_CODE.get(code) ?? {
      code,
      labelKey: "",
      weight: 0,
      severity: "note",
    }
  );
}

/** At or above this a listing must always pass a human first. Mirrors the
 * backend's `HIGH_RISK_THRESHOLD`. */
export const HOUSING_HIGH_RISK_SCORE = 50;
/** Below this the signals are thinness rather than red flags. */
export const HOUSING_LOW_RISK_SCORE = 20;

/** Which band a score falls in. Drives the colour and the word beside it, so
 * the number is never the only signal a reader has to interpret. */
export function riskBand(score: number): "high" | "medium" | "low" {
  if (score >= HOUSING_HIGH_RISK_SCORE) return "high";
  if (score > HOUSING_LOW_RISK_SCORE) return "medium";
  return "low";
}

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (days: number) =>
  new Date(Date.now() - days * DAY_MS).toISOString();
const daysAhead = (days: number) =>
  new Date(Date.now() + days * DAY_MS).toISOString();

/** Everything a listing carries that the queue does not vary between fixture
 * rows. Keeps each demo row about what it is there to show. */
const BASE = {
  timezone: "Europe/Lisbon",
  city: "Lisbon",
  listingVerified: false,
  listingVerifiedReason: "lister_not_id_verified",
  lgbtqFriendly: true,
  filledAt: null,
  expired: false,
  bedrooms: 1,
  billsIncluded: false,
  minStayMonths: null,
  virtualTourUrl: null,
  approxLatitude: 38.7223,
  approxLongitude: -9.1393,
  preciseLatitude: null,
  preciseLongitude: null,
  addressLine: null,
  locationPrecision: "area",
  // A moderator always passes the address gate; these fixture rows simply have
  // no address on file, which is exactly the unlocked-but-area-only case.
  isLocationUnlocked: true,
  decidedBy: null,
} as const;

/**
 * Demo fixture for the review console. Four rows chosen to show the decisions
 * a moderator actually faces: a likely advance-fee scam, a listing whose
 * "ideal for" chips gate the home on identity, a thin but honest first
 * listing, and a live one that a member has complained about.
 *
 * Fabricated data. It never surfaces in live mode: `useHousingReviewQueue`
 * branches on `demoMode` and the endpoint 403s for anyone who is not staff.
 */
export const DEMO_HOUSING_REVIEW_QUEUE: AdminHousingListingDTO[] = [
  {
    ...BASE,
    ref: "QPH-2026-0211",
    slug: "bright-t2-alvalade-available-now",
    status: "review",
    lister: {
      slug: "rui-marques",
      firstName: "Rui",
      lastName: "Marques",
      avatarUrl: null,
      memberSince: daysAgo(11),
      bio: null,
    },
    listerVerificationLevel: "email",
    createdAt: daysAgo(2),
    decision: null,
    expiresAt: daysAhead(58),
    type: "sublet",
    title: "Bright T2 in Alvalade, available now",
    blurb: "Whole flat, furnished, ready to move into this week.",
    area: "Alvalade",
    rentEuros: 380,
    depositEuros: null,
    accessibilityInfo: "",
    listerKind: "member",
    availableFrom: null,
    description:
      "Whole flat available. Deposit by MB Way before viewing, message me on WhatsApp 912 345 678 and I will send the keys by courier.",
    features: [],
    idealFor: [],
    gallery: [],
    riskScore: 100,
    riskReasons: [
      "rent_far_below_market",
      "contact_info_in_text",
      "off_platform_payment_language",
      "lister_unverified",
      "no_photos",
      "missing_accessibility_info",
    ],
    listerHistory: {
      totalListings: 3,
      liveListings: 0,
      changesRequestedListings: 0,
      rejectedListings: 2,
      takenDownListings: 0,
      hasCleanRecord: false,
    },
  },
  {
    ...BASE,
    ref: "QPH-2026-0209",
    slug: "quiet-room-benfica-long-let",
    status: "review",
    lister: {
      slug: "ana-belo",
      firstName: "Ana",
      lastName: "Belo",
      avatarUrl: null,
      memberSince: daysAgo(420),
      bio: "Landscape gardener. Two cats.",
    },
    listerVerificationLevel: "phone",
    createdAt: daysAgo(3),
    decision: null,
    expiresAt: daysAhead(57),
    type: "room",
    title: "Quiet room in Benfica, long let",
    blurb: "A calm room in a family flat with a small garden.",
    area: "Benfica",
    rentEuros: 520,
    depositEuros: 520,
    accessibilityInfo: "Second floor, lift in the building.",
    listerKind: "member",
    availableFrom: "2026-10-01",
    minStayMonths: 12,
    description:
      "A quiet room at the back of the flat with a garden view. Shared kitchen and bathroom. We keep regular hours and would like someone who does too.",
    features: ["Furnished", "Lift", "Quiet street"],
    idealFor: ["A quiet household", "Traditional family"],
    gallery: [],
    riskScore: 45,
    riskReasons: ["discriminatory_language", "lister_phone_only", "no_photos"],
    listerHistory: {
      totalListings: 2,
      liveListings: 1,
      changesRequestedListings: 0,
      rejectedListings: 0,
      takenDownListings: 0,
      hasCleanRecord: true,
    },
  },
  {
    ...BASE,
    ref: "QPH-2026-0207",
    slug: "room-in-a-queer-flatshare-arroios",
    status: "review",
    lister: {
      slug: "noor-haddad",
      firstName: "Noor",
      lastName: "Haddad",
      avatarUrl: null,
      memberSince: daysAgo(96),
      bio: "Nurse, night shifts. Learning to bake bread badly.",
    },
    listerVerificationLevel: "id_verified",
    createdAt: daysAgo(5),
    decision: null,
    expiresAt: daysAhead(55),
    type: "room",
    title: "Room in a queer flatshare, Arroios",
    blurb: "A double room in a three-person flat two streets from the metro.",
    area: "Arroios",
    rentEuros: 610,
    depositEuros: 1220,
    billsIncluded: true,
    accessibilityInfo: "Third floor, no lift, one flight per landing.",
    listerKind: "member",
    availableFrom: "2026-09-15",
    minStayMonths: 6,
    description: "Double room, west facing.",
    features: ["Furnished", "Washing machine"],
    idealFor: ["Long stays"],
    gallery: [],
    riskScore: 15,
    riskReasons: ["incomplete_listing", "no_photos"],
    listerHistory: {
      totalListings: 1,
      liveListings: 0,
      changesRequestedListings: 0,
      rejectedListings: 0,
      takenDownListings: 0,
      hasCleanRecord: true,
    },
  },
  {
    ...BASE,
    ref: "QPH-2026-0188",
    slug: "studio-near-anjos",
    status: "live",
    lister: {
      slug: "teresa-lopes",
      firstName: "Teresa",
      lastName: "Lopes",
      avatarUrl: null,
      memberSince: daysAgo(730),
      bio: "Runs a bookbinding studio in Anjos.",
    },
    listerVerificationLevel: "id_verified",
    listingVerified: true,
    listingVerifiedReason: "id_verified_live_low_risk",
    createdAt: daysAgo(24),
    decision: {
      status: "live",
      reason: null,
      at: daysAgo(23),
    },
    expiresAt: daysAhead(36),
    type: "studio",
    title: "Studio near Anjos",
    blurb: "A compact studio on a quiet street, five minutes from the metro.",
    area: "Anjos",
    rentEuros: 840,
    depositEuros: 840,
    bedrooms: 0,
    accessibilityInfo: "Ground floor, step-free entrance.",
    listerKind: "member",
    availableFrom: null,
    description:
      "One room with a kitchenette along the wall and a separate bathroom. Windows on two sides, so it stays bright most of the day.",
    features: ["Furnished", "Natural light", "Air conditioning"],
    idealFor: ["Short stays", "Someone new to Lisbon"],
    gallery: [],
    riskScore: 0,
    riskReasons: [],
    listerHistory: {
      totalListings: 4,
      liveListings: 2,
      changesRequestedListings: 1,
      rejectedListings: 0,
      takenDownListings: 0,
      hasCleanRecord: true,
    },
  },
];
