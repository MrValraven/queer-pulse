/** The collapsible filter groups in the `/communities` sidebar. Order here is
 *  the render order. `useFilterPageState` builds the all-collapsed default and
 *  the stored-map guard from `COMMUNITIES_FILTER_SECTION_KEYS`, so adding a
 *  group later resets a member's stored open map cleanly. */
export type CommunitiesFilterSectionKey = "category" | "quick" | "tags";

export const COMMUNITIES_FILTER_SECTION_KEYS: readonly CommunitiesFilterSectionKey[] =
  ["category", "quick", "tags"];

/** localStorage keys for the sidebar's view state, registered in
 *  `shared/consent/storageInventory.ts` (the `panelLayout` entry). */
export const COMMUNITIES_PANEL_STORAGE_KEY = "qp.communities.filtersPanelOpen";
export const COMMUNITIES_SECTIONS_STORAGE_KEY = "qp.communities.filterSections";
