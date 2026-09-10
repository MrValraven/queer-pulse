/**
 * Pure helpers behind `TimeOptionsList` — the clickable time list that
 * `DatePicker`'s `mode="time"` popover shows.
 *
 * Everything here speaks the same wire shape `DateField` already commits to
 * for `mode="time"`: a 24-hour `"HH:mm"` string (see `isoFromParts` in
 * `dateFieldParts.ts`). Internally the list works in MINUTES SINCE MIDNIGHT,
 * an integer that sorts, steps and subtracts without any date arithmetic, and
 * converts back at the boundary.
 *
 * Display formatting goes through `Intl.DateTimeFormat` on a throwaway
 * reference date rather than a hand-rolled 12h/24h branch, so an `en` list
 * renders "7:00 PM" and a `pt` list renders "19:00" from the same data — the
 * same mechanism `isTwelveHourLocale` already uses to pick the field's
 * segments.
 */

import type { TFunction } from "../../i18n/types";

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;
const TIME_VALUE_PATTERN = /^(\d{1,2}):(\d{2})/;

/** Parse an `"HH:mm"` value into minutes since midnight, or `null` if it is
 *  absent or malformed. Tolerates a longer string (`"19:00:00"`) so a value
 *  that picked up seconds somewhere upstream still lands on the right row. */
export function parseTimeValue(
  value: string | null | undefined,
): number | null {
  if (!value) return null;
  const match = TIME_VALUE_PATTERN.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * MINUTES_PER_HOUR + minute;
}

/** Render minutes since midnight back as the `"HH:mm"` wire value. */
export function formatTimeValue(minutes: number): string {
  const hour = Math.floor(minutes / MINUTES_PER_HOUR);
  const minute = minutes % MINUTES_PER_HOUR;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * A reusable row formatter: "7:00 PM" in `en`, "19:00" in `pt`.
 *
 * Returns a closure over ONE `Intl.DateTimeFormat` rather than formatting in
 * place, because the list renders ~96 rows at the default 15-minute step and
 * re-renders on every arrow key. Constructing a formatter per row per render
 * is the expensive part of `Intl`; formatting with an existing one is not.
 * Callers hold the closure across renders (`useMemo` on `locale`).
 */
export function createTimeLabelFormatter(
  locale: string,
): (minutes: number) => string {
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
  const reference = new Date(2000, 0, 1);
  return (minutes: number) => {
    reference.setHours(
      Math.floor(minutes / MINUTES_PER_HOUR),
      minutes % MINUTES_PER_HOUR,
    );
    return formatter.format(reference);
  };
}

/** One-off convenience over {@link createTimeLabelFormatter}. Use the
 *  factory directly anywhere more than a couple of labels are formatted. */
export function formatTimeLabel(minutes: number, locale: string): string {
  return createTimeLabelFormatter(locale)(minutes);
}

export interface TimeOptionsRange {
  /** Minutes between adjacent rows. */
  step: number;
  /** Inclusive `"HH:mm"` bounds, when the caller constrains the range. */
  min?: string;
  max?: string;
  /** The field's current value. Kept in the list even when it sits off the
   *  step grid, so the list never disagrees with the field beside it. */
  value?: string | null;
}

/**
 * The ordered list of rows to render, as minutes since midnight.
 *
 * A `value` that is not a multiple of `step` (someone typed 19:07 into the
 * field) is spliced into sorted position rather than dropped — a list that
 * silently omits the selected row would read as "your time is not allowed"
 * and leave nothing highlighted to scroll to.
 */
export function buildTimeOptions({
  step,
  min,
  max,
  value,
}: TimeOptionsRange): number[] {
  const safeStep = step > 0 ? step : 15;
  const lowerBound = parseTimeValue(min) ?? 0;
  const upperBound = parseTimeValue(max) ?? MINUTES_PER_DAY - 1;
  const options: number[] = [];
  const firstRow = Math.ceil(lowerBound / safeStep) * safeStep;
  for (let minutes = firstRow; minutes <= upperBound; minutes += safeStep) {
    options.push(minutes);
  }
  const current = parseTimeValue(value);
  if (
    current !== null &&
    current >= lowerBound &&
    current <= upperBound &&
    !options.includes(current)
  ) {
    const insertAt = options.findIndex((minutes) => minutes > current);
    options.splice(insertAt === -1 ? options.length : insertAt, 0, current);
  }
  return options;
}

/**
 * Minutes from `start` to `end`, wrapping past midnight.
 *
 * An end at or before the start is read as the NEXT day (a party from 22:00
 * to 01:00 runs three hours, and one from 20:00 to 20:00 runs a full day)
 * rather than as a negative number.
 *
 * SINGLE DAY ONLY, by contract: the result can never exceed 24 hours. That is
 * the right answer for the time list, which offers "+2h" against a start time
 * and knows nothing about calendar dates. The gathering wizard now states an
 * end DATE beside the end time, so it measures its span from the two real
 * instants and reads it back through `formatSpanDuration`. This wrap survives
 * as `combineEndDateTime`'s fallback in events.adapters.ts, for a payload that
 * carries an end time and no end date.
 */
export function durationMinutes(start: number, end: number): number {
  const span = end - start;
  return span > 0 ? span : span + MINUTES_PER_DAY;
}

/** True when `end` lands on the day after `start` (see `durationMinutes`). */
export function isOvernightSpan(
  start: string | null | undefined,
  end: string | null | undefined,
): boolean {
  const startMinutes = parseTimeValue(start);
  const endMinutes = parseTimeValue(end);
  if (startMinutes === null || endMinutes === null) return false;
  return endMinutes <= startMinutes;
}

/**
 * A duration as "2h 30m" / "3h" / "45m", assembled from the three localized
 * patterns rather than one string with optional parts, so a translator can
 * order the units per language.
 */
export function formatDuration(minutes: number, translate: TFunction): string {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const remainder = minutes % MINUTES_PER_HOUR;
  if (hours === 0)
    return translate("shared:calendar.durationMinutes", {
      minutes: remainder,
    });
  if (remainder === 0)
    return translate("shared:calendar.durationHours", { hours });
  return translate("shared:calendar.durationHoursMinutes", {
    hours,
    minutes: remainder,
  });
}

/**
 * The same duration, with DAYS in front of it: "3 days 5h", "1 day", "2h 30m".
 *
 * A sibling rather than a fourth branch inside `formatDuration`, because every
 * existing caller measures a span with `durationMinutes`, which wraps at 24
 * hours. A day branch inside `formatDuration` would be code no current caller
 * can reach, and it would quietly widen a contract the time list depends on.
 * A gathering that runs across calendar days has no such ceiling: printed as
 * hours, a three-day festival reads "77h", which is arithmetic the host has to
 * do in their head.
 *
 * The day count goes through a plural key so "1 day" and "3 days" both agree
 * with themselves in either language, and whatever is left of the day is
 * handed to `formatDuration`, so the two readings can never drift apart.
 */
export function formatSpanDuration(
  minutes: number,
  translate: TFunction,
): string {
  // A negative span belongs to a schedule the wizard is already refusing. It
  // still must not render as "-1 days 19h" while the host is mid-edit.
  const safeMinutes = Math.max(0, Math.round(minutes));
  const days = Math.floor(safeMinutes / MINUTES_PER_DAY);
  const remainder = safeMinutes % MINUTES_PER_DAY;
  if (days === 0) return formatDuration(remainder, translate);
  const daysText = translate("shared:calendar.durationDays", { count: days });
  if (remainder === 0) return daysText;
  return translate("shared:calendar.durationDaysRemainder", {
    days: daysText,
    remainder: formatDuration(remainder, translate),
  });
}
