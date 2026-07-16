/**
 * i18n Pattern A. `SECTION_NAV_KEYS` are catalog keys, resolved by
 * `CinemaMast.tsx` with `t()`. The programme week is a real `Date` range so
 * the mast can format it with `useFormat()` instead of baking an
 * English month name into the catalog.
 */
export const SECTION_NAV_KEYS = [
  "cinema:mast.sectionNav.thisWeek",
  "cinema:mast.sectionNav.browseAll",
  "cinema:mast.sectionNav.collections",
  "cinema:mast.sectionNav.documentaries",
  "cinema:mast.sectionNav.features",
  "cinema:mast.sectionNav.shorts",
  "cinema:mast.sectionNav.series",
  "cinema:mast.sectionNav.openCalls",
];

export const PROGRAMME_WEEK = 23;
export const PROGRAMME_WEEK_START = new Date(2026, 5, 8);
export const PROGRAMME_WEEK_END = new Date(2026, 5, 14);
