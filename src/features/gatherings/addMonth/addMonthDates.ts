import {
  addMonths,
  compareDate,
  firstDayOfWeek,
  formatIsoDate,
  formatIsoMonth,
  addDays,
  getDaysInMonth,
  parseDate,
  parseMonth,
  startOfWeek,
  weekdayOf,
} from "../../../shared/components/ui/plainDate";
import { intlLocale } from "../../../shared/i18n/locale";
import type { Language } from "../../../shared/i18n/types";
import { EVENT_BATCH_MAX_MONTHS_AHEAD } from "./addMonth.data";

/** A wall-clock reading: `date` is `YYYY-MM-DD` and `time` is `HH:mm`. */
export interface WallClockNow {
  date: string;
  time: string;
}

/** Calendar parts of an instant in one zone; an unusable zone reads in the device zone. */
function zonedParts(
  at: Date,
  timezone: string,
  options: Intl.DateTimeFormatOptions,
  locale = "en-GB",
): Intl.DateTimeFormatPart[] {
  const partsIn = (timeZone: string | undefined) =>
    new Intl.DateTimeFormat(locale, {
      ...options,
      ...(timeZone ? { timeZone } : {}),
    }).formatToParts(at);
  try {
    return partsIn(timezone);
  } catch {
    return partsIn(undefined);
  }
}

function partValue(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((part) => part.type === type)?.value ?? "";
}

/** The date and time on the wall clock of `timezone` at the instant `now`. */
export function wallClockNow(timezone: string, now: Date): WallClockNow {
  const parts = zonedParts(now, timezone, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const date = `${partValue(parts, "year")}-${partValue(parts, "month")}-${partValue(parts, "day")}`;
  return {
    date,
    time: `${partValue(parts, "hour")}:${partValue(parts, "minute")}`,
  };
}

/** The last date a host may pick: `today` plus twelve calendar months, day clamped. */
export function lastAllowedDate(today: string): string {
  const parsed = parseDate(today);
  if (!parsed) return today;
  return formatIsoDate(addMonths(parsed, EVENT_BATCH_MAX_MONTHS_AHEAD));
}

/** Whether a date sits inside `[today, lastDate]`. ISO dates compare in string order. */
export function isDateSelectable(
  date: string,
  bounds: { today: string; lastDate: string },
): boolean {
  return date >= bounds.today && date <= bounds.lastDate;
}

/** The `YYYY-MM` month a date belongs to. */
export function monthOf(date: string): string {
  return date.slice(0, 7);
}

/** The month `amount` months after `month` (negative goes back), as `YYYY-MM`. */
export function shiftMonth(month: string, amount: number): string {
  const parsed = parseMonth(month);
  if (!parsed) return month;
  return formatIsoMonth(addMonths(parsed, amount));
}

/**
 * Cells of a month grid: leading `null` padding up to the first weekday, one
 * date string per day, then `null` padding to fill the last week.
 * `weekStart` is 0 for Sunday through 6 for Saturday.
 */
export function monthCells(
  month: string,
  weekStart: number,
): Array<string | null> {
  const first = parseMonth(month);
  if (!first) return [];
  const leadingBlanks = (weekdayOf(first) - weekStart + 7) % 7;
  const dayCount = getDaysInMonth(first.year, first.month);
  const cells: Array<string | null> = Array.from(
    { length: leadingBlanks },
    () => null,
  );
  for (let day = 1; day <= dayCount; day += 1) {
    cells.push(formatIsoDate({ ...first, day }));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Dates in ascending order with repeats dropped. */
export function sortedDates(dates: Iterable<string>): string[] {
  return Array.from(new Set(dates)).sort((first, second) => {
    const firstParsed = parseDate(first);
    const secondParsed = parseDate(second);
    if (!firstParsed || !secondParsed) return first.localeCompare(second);
    return compareDate(firstParsed, secondParsed);
  });
}

/**
 * An end at or before the start on the clock reads as the next day, the rule
 * `steps/schedulePair.ts` documents. The server builds the real instants.
 */
export function isEndNextDay(
  startTime: string,
  endTime: string | null,
): boolean {
  if (endTime === null) return false;
  return endTime <= startTime;
}

/** Joins the wanted parts in order with single spaces, dropping commas and literals. */
function joinParts(
  parts: Intl.DateTimeFormatPart[],
  order: Intl.DateTimeFormatPartTypes[],
): string {
  return order
    .map((type) => partValue(parts, type))
    .filter((value) => value !== "")
    .join(" ");
}

/**
 * The locale for date labels and weekday headers: the bare language id, as
 * the shared Calendar reads it. `pt-PT` turns a short weekday into the whole name ("sexta") and a
 * short month into digits ("27/11"); bare `pt` reads "sex. 27 nov.".
 */
export function dateLabelLocale(language: Language): string {
  return language;
}

/** A plain calendar date as a UTC noon instant, so the device zone never shifts the day. */
function plainDateInstant(date: string): Date {
  return new Date(`${date}T12:00:00Z`);
}

/** "Fri 7 Nov" in English and "sex. 7 nov." in Portuguese, whatever zone the device is in. */
export function formatRowDate(date: string, language: Language): string {
  const parts = zonedParts(
    plainDateInstant(date),
    "UTC",
    { weekday: "short", day: "numeric", month: "short" },
    dateLabelLocale(language),
  );
  return joinParts(parts, ["weekday", "day", "month"]);
}

/** "Friday 7 November 2026" in English, used as the calendar button's aria-label. */
export function formatRowDateLong(date: string, language: Language): string {
  const parts = zonedParts(
    plainDateInstant(date),
    "UTC",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
    dateLabelLocale(language),
  );
  return joinParts(parts, ["weekday", "day", "month", "year"]);
}

/** "November 2026" in English. */
export function formatMonthCaption(month: string, language: Language): string {
  const parts = zonedParts(
    plainDateInstant(`${month}-01`),
    "UTC",
    { month: "long", year: "numeric" },
    dateLabelLocale(language),
  );
  return joinParts(parts, ["month", "year"]);
}

/** "Fri 7 Nov, 21:00": the instant `startAt` read on the wall clock of `timezone`. */
export function formatCreatedEventWhen(
  startAt: string,
  timezone: string,
  language: Language,
): string {
  const at = new Date(startAt);
  const dayParts = zonedParts(
    at,
    timezone,
    { weekday: "short", day: "numeric", month: "short" },
    dateLabelLocale(language),
  );
  const timeParts = zonedParts(at, timezone, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const dayText = joinParts(dayParts, ["weekday", "day", "month"]);
  return `${dayText}, ${partValue(timeParts, "hour")}:${partValue(timeParts, "minute")}`;
}

/** The first weekday of the grid for a language, 0 for Sunday through 6 for Saturday. */
export function weekStartFor(language: Language): number {
  return firstDayOfWeek(intlLocale(language));
}

/**
 * The date a key moves the calendar's focus to from `date`: arrows step a day
 * or a week, Home and End reach the edges of the week inside its month,
 * PageUp and PageDown step a month with the day clamped. Any other key gives
 * `null`.
 */
export function dateAfterCalendarKey(
  date: string,
  key: string,
  weekStart: number,
): string | null {
  const parsed = parseDate(date);
  if (!parsed) return null;
  switch (key) {
    case "ArrowLeft":
      return formatIsoDate(addDays(parsed, -1));
    case "ArrowRight":
      return formatIsoDate(addDays(parsed, 1));
    case "ArrowUp":
      return formatIsoDate(addDays(parsed, -7));
    case "ArrowDown":
      return formatIsoDate(addDays(parsed, 7));
    case "Home": {
      const weekFirst = startOfWeek(parsed, weekStart);
      return weekFirst.month === parsed.month
        ? formatIsoDate(weekFirst)
        : formatIsoDate({ ...parsed, day: 1 });
    }
    case "End": {
      const weekLast = addDays(startOfWeek(parsed, weekStart), 6);
      return weekLast.month === parsed.month
        ? formatIsoDate(weekLast)
        : formatIsoDate({
            ...parsed,
            day: getDaysInMonth(parsed.year, parsed.month),
          });
    }
    case "PageUp":
      return formatIsoDate(addMonths(parsed, -1));
    case "PageDown":
      return formatIsoDate(addMonths(parsed, 1));
    default:
      return null;
  }
}

/**
 * The day that holds the calendar's single Tab stop in `month`: the first
 * picked day there, else today, else the first pickable day, else the 1st.
 */
export function rovingStartDate(
  month: string,
  pickedDates: ReadonlySet<string>,
  bounds: { today: string; lastDate: string },
): string {
  const days = monthCells(month, 0).filter(
    (cell): cell is string => cell !== null,
  );
  const firstPicked = days.find((day) => pickedDates.has(day));
  if (firstPicked) return firstPicked;
  if (monthOf(bounds.today) === month) return bounds.today;
  return (
    days.find((day) => isDateSelectable(day, bounds)) ??
    days[0] ??
    `${month}-01`
  );
}
