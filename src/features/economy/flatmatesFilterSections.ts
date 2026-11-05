/** The collapsible filter groups in the flatmates sidebar. Order here is the
 *  render order. `useFilterPageState` builds the all-collapsed default and
 *  the stored-map guard from `FLATMATES_FILTER_SECTION_KEYS`. */
export type FlatmatesFilterSectionKey =
  "type" | "neighbourhood" | "budget" | "moveIn" | "lifestyle";

export const FLATMATES_FILTER_SECTION_KEYS: readonly FlatmatesFilterSectionKey[] =
  ["type", "neighbourhood", "budget", "moveIn", "lifestyle"];

/** The desktop "show filters" choice, shared with the Housing tab so the
 *  sidebar stays the way the member left it when they switch tabs. */
export const FLATMATES_PANEL_STORAGE_KEY = "qp.housing.filtersPanelOpen";

/** Which flatmates sections are open. Registered in `storageInventory`. */
export const FLATMATES_SECTIONS_STORAGE_KEY = "qp.flatmates.filterSections";
