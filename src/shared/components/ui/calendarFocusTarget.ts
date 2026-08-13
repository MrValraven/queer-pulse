/**
 * Focus-target resolution for `useCalendarState`: clamps a desired focus
 * move into `[minDate, maxDate]` and, if the clamped date is still disabled
 * (out of range, or flagged by `isDateUnavailable`), redirects to the
 * nearest enabled date so the roving-tabindex grid never ends up with zero
 * tabbable cells (e.g. after a far month/year dropdown jump lands on a
 * disabled day 1). Extracted from `useCalendarState.ts` to keep that file
 * under the 200-line component budget.
 */

import { addDays, clampDate, compareDate, type PlainDate } from "./plainDate";

// How far to scan, in each direction, for the nearest enabled day once a
// focus move lands on a disabled one. 62 days comfortably spans a
// fully-disabled month either side.
const FOCUS_SEARCH_WINDOW_DAYS = 62;

export function isDateDisabled(
  date: PlainDate,
  minDate: PlainDate | null,
  maxDate: PlainDate | null,
  isDateUnavailable?: (date: PlainDate) => boolean,
): boolean {
  if (minDate !== null && compareDate(date, minDate) < 0) return true;
  if (maxDate !== null && compareDate(date, maxDate) > 0) return true;
  if (isDateUnavailable?.(date)) return true;
  return false;
}

/** Nearest enabled date to `startDate`: tries `preferredDirection` first
 *  (the direction the caller's movement was already heading in), then the
 *  opposite direction as a fallback, each bounded by
 *  `FOCUS_SEARCH_WINDOW_DAYS`. Returns `startDate` itself if it is already
 *  enabled, or unchanged if genuinely nothing enabled was found in range (no
 *  worse than the disabled target).
 *
 *  Direction matters: e.g. ArrowLeft off a day that turns out disabled must
 *  keep moving backward to the previous enabled day, never snap forward back
 *  onto the cell focus already had (that would silently swallow the
 *  keypress). */
function findNearestEnabledDate(
  startDate: PlainDate,
  minDate: PlainDate | null,
  maxDate: PlainDate | null,
  isDateUnavailable: ((date: PlainDate) => boolean) | undefined,
  preferForward: boolean,
): PlainDate {
  if (!isDateDisabled(startDate, minDate, maxDate, isDateUnavailable)) return startDate;
  const primaryStep = preferForward ? 1 : -1;
  for (let offset = 1; offset <= FOCUS_SEARCH_WINDOW_DAYS; offset += 1) {
    const primaryCandidate = addDays(startDate, primaryStep * offset);
    if (!isDateDisabled(primaryCandidate, minDate, maxDate, isDateUnavailable)) return primaryCandidate;
  }
  for (let offset = 1; offset <= FOCUS_SEARCH_WINDOW_DAYS; offset += 1) {
    const fallbackCandidate = addDays(startDate, -primaryStep * offset);
    if (!isDateDisabled(fallbackCandidate, minDate, maxDate, isDateUnavailable)) return fallbackCandidate;
  }
  return startDate;
}

/** Clamps a desired focus target into `[minDate, maxDate]`, then, if the
 *  clamped date is still disabled, redirects to the nearest enabled date.
 *  `preferForward` picks which direction the nearest-date search tries
 *  first, matching the caller's movement direction (default `true`: dropdown
 *  jumps and `focusDate` land on day 1, where forward is the natural read). */
export function resolveFocusTarget(
  desiredDate: PlainDate,
  minDate: PlainDate | null,
  maxDate: PlainDate | null,
  isDateUnavailable?: (date: PlainDate) => boolean,
  preferForward = true,
): PlainDate {
  const clampedDate = clampDate(desiredDate, minDate, maxDate);
  return findNearestEnabledDate(clampedDate, minDate, maxDate, isDateUnavailable, preferForward);
}
