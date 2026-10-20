const MILLISECONDS_PER_DAY = 86_400_000;

/** The calendar day `at` falls on in `timeZone` (the viewer's own zone when it
 *  is omitted), as a UTC midnight timestamp so two days subtract cleanly.
 *  `null` when the zone name is unusable. */
function calendarDayStamp(
  at: Date,
  timeZone: string | undefined,
): number | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      ...(timeZone ? { timeZone } : {}),
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(at);
    const partValue = (type: Intl.DateTimeFormatPartTypes): number =>
      Number(parts.find((part) => part.type === type)?.value);
    const year = partValue("year");
    const month = partValue("month");
    const day = partValue("day");
    const hasEveryPart = [year, month, day].every(Number.isFinite);
    return hasEveryPart ? Date.UTC(year, month - 1, day) : null;
  } catch {
    // An invalid IANA name from an old row must never take the sidebar down.
    return null;
  }
}

/**
 * How many calendar days after today the event starts, read on one clock:
 * the event's own zone when it has one, the viewer's otherwise. 0 is today,
 * 1 is tomorrow. `null` when the day can't be worked out, which callers read
 * as "show the weekday".
 */
export function daysFromToday(
  startAt: Date,
  now: Date,
  timeZone: string | undefined,
): number | null {
  const eventDay = calendarDayStamp(startAt, timeZone);
  const today = calendarDayStamp(now, timeZone);
  if (eventDay === null || today === null) return null;
  return Math.round((eventDay - today) / MILLISECONDS_PER_DAY);
}
