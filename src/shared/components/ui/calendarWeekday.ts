/**
 * Localized weekday column labels for `Calendar`'s `<thead>`, ordered starting
 * from `weekStart` (0 = Sunday .. 6 = Saturday). Split out of `Calendar.tsx`
 * to keep that component under the line budget.
 */

import { addDays, civilFromDays } from "./plainDate";

const WEEKDAY_COUNT = 7;
/** `civilFromDays(-4)` lands on a Sunday: `weekdayOf` gives `((-4 % 7) + 4) % 7 === 0`. */
const A_SUNDAY = civilFromDays(-4);

export interface WeekdayLabel {
  dayOfWeek: number;
  /** Short form for the visible `<th>` text, e.g. "Mo". */
  short: string;
  /** Full form for the `<abbr title>`, e.g. "Monday". */
  full: string;
}

export function buildWeekdayLabels(locale: string, weekStart: number): WeekdayLabel[] {
  const shortFormatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const longFormatter = new Intl.DateTimeFormat(locale, { weekday: "long" });
  return Array.from({ length: WEEKDAY_COUNT }, (_unused, index) => {
    const dayOfWeek = (weekStart + index) % WEEKDAY_COUNT;
    const date = addDays(A_SUNDAY, dayOfWeek);
    const jsDate = new Date(date.year, date.month - 1, date.day);
    return { dayOfWeek, short: shortFormatter.format(jsDate), full: longFormatter.format(jsDate) };
  });
}
