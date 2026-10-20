/** The hub tab id of a community's support section (`?tab=giving`). */
export const GIVING_TAB_ID = "giving";

/** DOM id of the support panel, the scroll target of the sidebar button. */
export const GIVING_PANEL_ID = "community-giving";

/** Mirror of the backend limits in `community-giving-rules.ts`. */
export const GIVING_LIMITS = {
  maxMethods: 8,
  introMax: 400,
  labelMax: 60,
  noteMax: 160,
  valueMax: 500,
} as const;
