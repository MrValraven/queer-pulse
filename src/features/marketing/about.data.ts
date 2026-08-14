/**
 * i18n Pattern A — this whole page is platform-authored "About" chrome (no
 * fetched/authored-by-a-member content anywhere on it), so every field below
 * is a catalog key that AboutPage.tsx resolves with `t()`.
 */
export const WHY_PARAGRAPH_KEYS = [
  "marketing:about.why.p1",
  "marketing:about.why.p2",
  "marketing:about.why.p3",
];

export const CONTRAST_THEM_KEYS = [
  "marketing:about.contrast.them.attention",
  "marketing:about.contrast.them.algorithm",
  "marketing:about.contrast.them.signup",
  "marketing:about.contrast.them.growth",
  "marketing:about.contrast.them.value",
];

export const CONTRAST_US_KEYS = [
  "marketing:about.contrast.us.noTracking",
  "marketing:about.contrast.us.feedIsYours",
  "marketing:about.contrast.us.vouched",
  "marketing:about.contrast.us.growthPace",
  "marketing:about.contrast.us.valueStays",
];

export const WHO_PARAGRAPH_KEYS = [
  "marketing:about.who.p1",
  "marketing:about.who.p2",
];

export const VALUES: { titleKey: string; bodyKey: string }[] = [
  {
    titleKey: "marketing:about.values.smallByDesign.title",
    bodyKey: "marketing:about.values.smallByDesign.body",
  },
  {
    titleKey: "marketing:about.values.infrastructure.title",
    bodyKey: "marketing:about.values.infrastructure.body",
  },
  {
    titleKey: "marketing:about.values.communityEconomy.title",
    bodyKey: "marketing:about.values.communityEconomy.body",
  },
  {
    titleKey: "marketing:about.values.communityOwns.title",
    bodyKey: "marketing:about.values.communityOwns.body",
  },
  {
    titleKey: "marketing:about.values.noDataEconomy.title",
    bodyKey: "marketing:about.values.noDataEconomy.body",
  },
  {
    titleKey: "marketing:about.values.accessNotEarned.title",
    bodyKey: "marketing:about.values.accessNotEarned.body",
  },
];
