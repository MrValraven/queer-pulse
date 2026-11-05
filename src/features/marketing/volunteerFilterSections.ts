/** The collapsible filter groups on `/about/volunteer`. Order here is the
 *  render order in the sidebar. `useFilterPageState` builds the all-collapsed
 *  default and the stored-map guard from `VOLUNTEER_FILTER_SECTION_KEYS`. */
export type VolunteerFilterSectionKey = "commitment" | "cause";

export const VOLUNTEER_FILTER_SECTION_KEYS: readonly VolunteerFilterSectionKey[] =
  ["commitment", "cause"];

/** localStorage keys for the sidebar's view state, registered in
 *  `shared/consent/storageInventory.ts` (the `panelLayout` entry). */
export const VOLUNTEER_PANEL_STORAGE_KEY = "qp.volunteer.filtersPanelOpen";
export const VOLUNTEER_SECTIONS_STORAGE_KEY = "qp.volunteer.filterSections";
