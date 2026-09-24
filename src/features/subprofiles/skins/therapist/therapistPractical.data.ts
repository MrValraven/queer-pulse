/** Static option lists and display caps for the therapist "practical bits"
 *  section and its cost calculator. */

/** The calculator's "Sessions a month" choices. */
export const SESSIONS_PER_MONTH_OPTIONS = [2, 4, 8] as const;

/** Weekly sessions: the calculator's starting point. */
export const DEFAULT_SESSIONS_PER_MONTH = 4;

/** The calculator's "No insurance" choice. Insurers are picked by their
 *  index in `view.reimbursement`, since two owner-typed labels may match. */
export const NO_INSURANCE_INDEX = -1;

/** Most sliding-scale place pills drawn; the hint carries the real count. */
export const MAX_SLIDING_PILLS = 12;

/** Most squares drawn for people ahead in the waitlist bar (plus one for
 *  "you"); the number above the bar carries the real count. */
export const MAX_QUEUE_SQUARES = 29;

/** Euro amounts as plain localized numbers ("65", "12,5" in PT); the euro
 *  sign lives in the catalog strings. */
export const AMOUNT_FORMAT: Intl.NumberFormatOptions = {
  maximumFractionDigits: 2,
};
