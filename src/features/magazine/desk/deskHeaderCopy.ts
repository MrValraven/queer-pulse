/**
 * Small pure helpers behind the desk header's copy: formatted plural counts
 * for plain-string sites, and where an issue stands against its close date.
 */

import { SLOT_VALUE_PREFIX } from "../../../shared/i18n/translate";
import type { TranslateOptions } from "../../../shared/i18n/types";
import { isoCalendarDate } from "../api/pieces.adapters";
import type { Issue } from "../data/desk.data";

/**
 * `t()` values for a plural key whose `{count}` must print localized ("1 234"
 * in PT) while plural selection still reads the raw number. The same slot
 * override `<Translation slots>` uses, for sites that need a string (menu
 * descriptions, aria labels).
 */
export function formattedCountValues(
  count: number,
  formatNumber: (value: number) => string,
): TranslateOptions {
  return { count, [`${SLOT_VALUE_PREFIX}count`]: formatNumber(count) };
}

/** Where the issue stands against its close date:
 *  - `none`: no close date set
 *  - `open`: the close day is still ahead
 *  - `today`: it closes today
 *  - `closed`: the close day has passed */
export type IssueCloseState = "none" | "open" | "today" | "closed";

/** The viewer's own calendar day as `YYYY-MM-DD`. */
function localIsoDay(today: Date): string {
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

/**
 * `daysLeft` is clamped at 0 once the close day passes, so it cannot tell
 * "closes today" from "closed last week". The ISO `closesOn` can, on the
 * viewer's calendar. An issue with a display date and no ISO day (an older
 * fixture) keeps the plain days-left reading.
 */
export function issueCloseState(issue: Issue, today: Date): IssueCloseState {
  if (!issue.closes) return "none";
  const closeDay = isoCalendarDate(issue.closesOn ?? null);
  if (!closeDay) return "open";
  const todayIso = localIsoDay(today);
  if (closeDay < todayIso) return "closed";
  if (closeDay === todayIso) return "today";
  return "open";
}
