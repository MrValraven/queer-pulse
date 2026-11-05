/** The collapsible filter groups on the members directory. Order here is the
 *  render order in the sidebar. `useFilterPageState` builds the all-collapsed
 *  default and the stored-map guard from `FILTER_SECTION_KEYS`. */
export type SectionKey =
  | "ambassadors"
  | "openTo"
  | "hoods"
  | "fields"
  | "professions"
  | "identities"
  | "languages";

export const FILTER_SECTION_KEYS: SectionKey[] = [
  "ambassadors",
  "openTo",
  "hoods",
  "fields",
  "professions",
  "identities",
  "languages",
];
