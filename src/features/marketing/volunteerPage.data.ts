/** Chip values that map onto the API's `cause` param (the rest are commitment
 *  levels, or "all"). */
export const CAUSE_FILTERS = new Set<string>([
  "Rights",
  "Health",
  "Youth",
  "Housing",
  "Arts",
]);

/** The single chip row above the roles grid: commitment levels then causes. */
export const FILTERS = [
  { f: "all", labelKey: "marketing:volunteer.filter.all" },
  { f: "low", labelKey: "marketing:volunteer.filter.low" },
  { f: "medium", labelKey: "marketing:volunteer.filter.medium" },
  { f: "Rights", labelKey: "marketing:volunteer.filter.rights" },
  { f: "Health", labelKey: "marketing:volunteer.filter.health" },
  { f: "Youth", labelKey: "marketing:volunteer.filter.youth" },
  { f: "Housing", labelKey: "marketing:volunteer.filter.housing" },
  { f: "Arts", labelKey: "marketing:volunteer.filter.arts" },
];
