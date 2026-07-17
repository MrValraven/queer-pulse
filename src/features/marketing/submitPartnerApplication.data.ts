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

/** The default human `regionLabel` key prefilled per region (user can override). */
export const DEFAULT_REGION_LABEL_KEY: Record<Region, string> = {
  pt: "marketing:submitPartner.region.pt",
  eu: "marketing:submitPartner.region.eu",
  int: "marketing:submitPartner.region.int",
};

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
