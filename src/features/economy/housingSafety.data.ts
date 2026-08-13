/**
 * Housing safety content — anti-scam tips, Lisbon price-sanity ranges, and a
 * Portuguese tenant-rights reference. Strings live in the `economy` i18n
 * catalog (keys under `economy:housingSafety.*`); this file only holds the
 * structure, the icon names, and the research-verified numeric ranges.
 *
 * Legal note: the rights content is general guidance for members renting in
 * Portugal, not legal advice — the page frames it as such.
 */

/** Icon identifiers, mapped to react-icons in the components that render them. */
export type SafetyIconName =
  | "eye"
  | "video"
  | "tag"
  | "shield"
  | "lock"
  | "creditCard"
  | "fileText"
  | "coins"
  | "trendingUp"
  | "alertTriangle"
  | "flag";

/** One scannable anti-scam tip shown in the banner and the reference page. */
export interface ScamTip {
  id: string;
  icon: SafetyIconName;
  /** `economy:housingSafety.tips.<id>` */
  labelKey: string;
}

/**
 * Never-do-this list for anyone contacting a lister or listing a space.
 * Verified guidance: never pay before a signed contract; video-call the
 * landlord; be wary of suspiciously low prices; no bank transfers before
 * verification; keep the conversation on-platform; never rent sight-unseen.
 */
export const SCAM_SAFETY_TIPS: ScamTip[] = [
  { id: "neverPayFirst", icon: "creditCard", labelKey: "economy:housingSafety.tips.neverPayFirst" },
  { id: "videoCall", icon: "video", labelKey: "economy:housingSafety.tips.videoCall" },
  { id: "lowPrice", icon: "tag", labelKey: "economy:housingSafety.tips.lowPrice" },
  { id: "noTransfers", icon: "lock", labelKey: "economy:housingSafety.tips.noTransfers" },
  { id: "stayOnPlatform", icon: "shield", labelKey: "economy:housingSafety.tips.stayOnPlatform" },
  { id: "neverSightUnseen", icon: "eye", labelKey: "economy:housingSafety.tips.neverSightUnseen" },
];

/** A verified Lisbon monthly-rent range, in euros, for a rough sanity check. */
export interface PriceRange {
  id: string;
  minEuros: number;
  maxEuros: number;
  /** `economy:housingSafety.price.<id>.label` */
  labelKey: string;
}

/** Lisbon monthly-rent sanity ranges (verified as of the 2026 content pass). */
export const LISBON_PRICE_RANGES: PriceRange[] = [
  { id: "room", minEuros: 450, maxEuros: 600, labelKey: "economy:housingSafety.price.room.label" },
  { id: "double", minEuros: 350, maxEuros: 450, labelKey: "economy:housingSafety.price.double.label" },
  { id: "studio", minEuros: 700, maxEuros: 1000, labelKey: "economy:housingSafety.price.studio.label" },
];

/** One tenant-rights topic — a titled card with a few plain-language points. */
export interface RightsSection {
  id: string;
  icon: SafetyIconName;
  /** `economy:housingSafety.rights.<id>.title` */
  titleKey: string;
  /** `economy:housingSafety.rights.<id>.point.<n>` (1-indexed). */
  pointKeys: string[];
}

/**
 * Portuguese residential-tenancy rights, organised for scanning. Verified
 * facts only: written + Finanças-registered lease (tenant can self-register
 * since 2025), deposit and advance rent capped at ~2 months, 1-year minimum
 * term, annual increase capped at the INE coefficient (2.24% for 2026) with
 * 30 days' notice, evictions only via court or the Balcão Nacional do
 * Arrendamento (Lei n.º 12/2019 criminalises lock-changing / utility cuts /
 * removing belongings), and discrimination reportable to an equality body.
 */
function rightsPoints(id: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_unused, index) => `economy:housingSafety.rights.${id}.point.${index + 1}`,
  );
}

export const TENANT_RIGHTS_SECTIONS: RightsSection[] = [
  {
    id: "lease",
    icon: "fileText",
    titleKey: "economy:housingSafety.rights.lease.title",
    pointKeys: rightsPoints("lease", 4),
  },
  {
    id: "deposit",
    icon: "coins",
    titleKey: "economy:housingSafety.rights.deposit.title",
    pointKeys: rightsPoints("deposit", 2),
  },
  {
    id: "rentIncrease",
    icon: "trendingUp",
    titleKey: "economy:housingSafety.rights.rentIncrease.title",
    pointKeys: rightsPoints("rentIncrease", 3),
  },
  {
    id: "eviction",
    icon: "alertTriangle",
    titleKey: "economy:housingSafety.rights.eviction.title",
    pointKeys: rightsPoints("eviction", 3),
  },
  {
    id: "discrimination",
    icon: "flag",
    titleKey: "economy:housingSafety.rights.discrimination.title",
    pointKeys: rightsPoints("discrimination", 2),
  },
];
