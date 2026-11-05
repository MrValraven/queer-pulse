/** The collapsible filter groups in the persona directory's sidebar. Order
 *  here is the render order. `useFilterPageState` builds the all-collapsed
 *  default and the stored-map guard from `SUBPROFILE_FILTER_SECTION_KEYS`. */
export type SubprofileFilterSectionKey =
  "profession" | "table" | "availability" | "tags";

export const SUBPROFILE_FILTER_SECTION_KEYS: readonly SubprofileFilterSectionKey[] =
  ["profession", "table", "availability", "tags"];
