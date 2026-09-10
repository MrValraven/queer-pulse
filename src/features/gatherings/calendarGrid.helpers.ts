/** Whether two dates fall on the same calendar day. Split out of CalendarGrid.tsx
 * so that file only exports components (react-refresh/only-export-components). */
export function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

/** The calendar day a date sits on, as a comparable number. Read in the
 *  reader's own zone, matching the day cells `MonthGrid` builds. */
function dayOrdinal(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Is a gathering running from `start` to `end` under way at any point during
 * the calendar day `date`?
 *
 * The month grid used to ask `sameDay(event.date, cell)`, which dots a
 * gathering on the day it starts and nowhere else. A three-day festival showed
 * a single dot, and clicking day two said "nothing on this day" about a day it
 * was actually running.
 *
 * A gathering with no end occupies only its start day, so this answers exactly
 * what `sameDay` answered for every gathering that has no `endAt`. An `end`
 * that lands before the start (older or hand-edited data) is read as no end at
 * all rather than as an empty span.
 */
export function spansDay(
  start: Date,
  end: Date | undefined,
  date: Date,
): boolean {
  const firstDay = dayOrdinal(start);
  const lastDay = Math.max(firstDay, dayOrdinal(end ?? start));
  const cellDay = dayOrdinal(date);
  return cellDay >= firstDay && cellDay <= lastDay;
}
