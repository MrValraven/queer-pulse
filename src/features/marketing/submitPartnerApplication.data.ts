import type { Region } from "./api/partners.api";

/**
 * Region options for the apply form — `value` is the canonical (stored/API)
 * region id; only `labelKey`'s resolved value is translated (i18n brief
 * §5.1 — never translate a stored enum value).
 */
export const REGION_OPTIONS: { value: Region; labelKey: string }[] = [
  { value: "pt", labelKey: "marketing:submitPartner.region.pt" },
  { value: "eu", labelKey: "marketing:submitPartner.region.eu" },
  { value: "int", labelKey: "marketing:submitPartner.region.int" },
];

/** The human `regionLabel` key synthesized per region in `toDto()` at submit time. */
export const DEFAULT_REGION_LABEL_KEY: Record<Region, string> = {
  pt: "marketing:submitPartner.region.pt",
  eu: "marketing:submitPartner.region.eu",
  int: "marketing:submitPartner.region.int",
};

/**
 * Curated tag vocabulary for the apply form's chip picker. Stored value === the
 * displayed label (English, shown as-is on the public card like every other
 * partner tag — tags are content, not a translated enum, so they are never run
 * through i18n). Grounded in the tags real partners already use.
 */
export const TAG_OPTIONS: readonly string[] = [
  "Rights",
  "Legal",
  "Crisis support",
  "Mental health",
  "Peer support",
  "Health",
  "Trans care",
  "Therapy",
  "Youth",
  "Trans rights",
  "Activism",
  "Migration",
  "Refugees",
  "Housing",
  "Food",
  "Drop-in",
  "Culture",
  "Education",
  "Funder",
  "Network",
];

/** Most tags a card renders cleanly — the picker caps selection here. */
export const MAX_TAGS = 3;

/** The eyebrow shown on the card is `Partner · <the type the applicant typed>`. */
export const EYEBROW_PREFIX = "Partner · ";

/**
 * Pending applications carry a neutral default tier. The real partnership tier
 * ("Founding partner", "Health partner", …) is assigned by the team at approval,
 * NOT self-declared by the applicant.
 */
export const DEFAULT_TIER = "Community partner";

/** Tips shown in the sidebar while filling out the application. */
export const APPLY_TIPS: { titleKey: string; bodyKey: string }[] = [
  {
    titleKey: "marketing:submitPartner.tips.readEvery.title",
    bodyKey: "marketing:submitPartner.tips.readEvery.body",
  },
  {
    titleKey: "marketing:submitPartner.tips.sharedValues.title",
    bodyKey: "marketing:submitPartner.tips.sharedValues.body",
  },
  {
    titleKey: "marketing:submitPartner.tips.whatNext.title",
    bodyKey: "marketing:submitPartner.tips.whatNext.body",
  },
];
