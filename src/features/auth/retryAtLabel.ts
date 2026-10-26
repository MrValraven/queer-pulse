import type { Formatters } from "../../shared/i18n/format";

function isSameCalendarDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

/** True when `iso` is a timestamp a formatter can read. */
export function isReadableTime(iso: string | undefined): iso is string {
  return iso !== undefined && !Number.isNaN(Date.parse(iso));
}

/**
 * The moment a refusal lifts, worded for "you can ask again at {time}": the
 * clock time on the same calendar day, the weekday and time on any other day.
 */
export function retryAtLabel(
  iso: string,
  format: Formatters,
  now: Date = new Date(),
): string {
  const date = new Date(iso);
  if (isSameCalendarDay(date, now)) return format.time(date);
  return format.date(date, {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
