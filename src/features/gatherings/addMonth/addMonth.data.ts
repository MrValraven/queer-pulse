/** The most events one batch can create (contract limit, checked again by the server). */
export const EVENT_BATCH_MAX_ROWS = 31;

/** The last allowed date is today in the template's zone plus this many calendar months. */
export const EVENT_BATCH_MAX_MONTHS_AHEAD = 12;

/**
 * Largest request body the page lets a host send, in UTF-8 bytes of
 * `JSON.stringify(payload)`. The server keeps Express's default JSON limit of
 * 100 kB (102,400 bytes) for every route (user decision 2026-11-02), and
 * Express answers a larger body with an uncoded 413 before Nest runs. 96 KiB
 * leaves a 6 KiB margin for JSON overhead variance. Task 8 measures the payload
 * against this value.
 */
export const EVENT_BATCH_MAX_BODY_BYTES = 96 * 1024;

/** localStorage key prefix for the saved month draft, suffixed per member. */
export const ADD_MONTH_DRAFT_KEY_PREFIX = "qp-add-event-month-draft-v1";

/** Quiet time after the last edit before the draft is written. */
export const ADD_MONTH_DRAFT_SAVE_DELAY_MS = 600;

/** DOM ids of the four page sections, used for scrolling and aria wiring. */
export const ADD_MONTH_SECTION_IDS = {
  template: "add-month-template",
  dates: "add-month-dates",
  rows: "add-month-rows",
  publish: "add-month-publish",
} as const;

/** DOM id of the card for one date. */
export function addMonthRowAnchorId(date: string): string {
  return `add-month-row-${date}`;
}

/** DOM id of one field inside the card for a date. */
export function addMonthRowFieldId(
  date: string,
  field: "title" | "description" | "startTime" | "endTime",
): string {
  return `add-month-row-${date}-${field}`;
}
