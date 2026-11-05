/** Row-shaped placeholders while the first page of leads loads. */
export const LEAD_LIST_SKELETON_ROWS = [0, 1, 2, 3] as const;

/** The value of the stage chip that lifts the stage filter. */
export const ALL_STAGES_CHIP = "all";

/** The search params the list keeps its filters in. */
export const LEAD_LIST_PARAM = {
  query: "q",
  stage: "stage",
  type: "type",
  isDueOnly: "due",
} as const;

/** `due=1` turns the due filter on; any other value reads as off. */
export const DUE_ONLY_PARAM_VALUE = "1";

/** The pause in typing before the search reaches the URL and the list. */
export const LEAD_SEARCH_DEBOUNCE_MS = 250;

/** How a follow-up day reads on a row: "30 Oct 2026". */
export const LEAD_FOLLOW_UP_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};
