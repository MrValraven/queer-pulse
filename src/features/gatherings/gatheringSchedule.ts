import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";

/**
 * How a gathering's schedule reads, in parts.
 *
 * A gathering can run past midnight (23:00 to 04:00) or across several days (a
 * three-day festival). Printed as a bare clock range, an overnight party reads
 * as `23:00 – 04:00`, which looks like it ended nineteen hours before it began.
 * This is the one place that decides how a schedule reads, so the detail hero,
 * the cancelled card, the co-host invite, the create wizard's review step and
 * the edit-details modal all say the same thing.
 *
 * Parts rather than one finished string: the hero puts the date and the time in
 * two separate chips, while the cards put them on a single line. Returning one
 * string would force the hero to split it apart again.
 */
export interface GatheringWhen {
  /** "Fri 17 Oct" for a single day, "17 to 19 Oct" across several. */
  dateText: string;
  /** "23:00 – 04:00", or just "23:00" when there is no stated end. */
  timeText: string;
  /** True when the end falls on a later calendar day than the start. */
  isMultiDay: boolean;
  /** True when the end falls on exactly the day after the start. This is the
   *  case that needs saying out loud: a 23:00 to 04:00 time range reads as
   *  backwards until the reader is told the end is tomorrow morning. */
  isNextDay: boolean;
  /** "(next day)" when `isNextDay`, otherwise null. Ready to render. */
  nextDayNote: string | null;
}

/** The day shape a caller gets when it names no date options of its own. */
const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
};

/** The day-level fields a date range falls back on when the caller's options
 *  name none (the co-host card asks only for a weekday, and "Fri to Sun" would
 *  say nothing about which weekend it is). */
const RANGE_DAY_FALLBACK: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};

const MILLISECONDS_PER_DAY = 86_400_000;

/** A wall-clock calendar date, already resolved into some zone. */
interface CalendarDay {
  year: number;
  month: number;
  day: number;
}

/**
 * The calendar date `at` falls on in `timeZone` (the reader's own zone when
 * `timeZone` is absent).
 *
 * The whole point of reading the parts back out of `Intl` is that "same
 * calendar day" has to be judged in the GATHERING's zone rather than the
 * reader's. `getDate()` on a `Date` answers in whatever zone the browser
 * resolved: a gathering that runs 23:00 to 23:30 in Lisbon, read from São
 * Paulo, sits on one Lisbon day and straddles two São Paulo ones, and the
 * reader would be told it ends the next day when it does not.
 */
function calendarDayIn(
  at: Date,
  timeZone: string | undefined,
): CalendarDay | null {
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
    if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
    if (!Number.isFinite(day)) return null;
    return { year, month, day };
  } catch {
    // An unusable IANA name (older mock data, a hand-edited row) must never
    // take the page down. The caller treats `null` as "no day comparison".
    return null;
  }
}

/** Whole calendar days from `start` to `end`, negative when `end` is earlier. */
function calendarDaysBetween(start: CalendarDay, end: CalendarDay): number {
  const startUtc = Date.UTC(start.year, start.month - 1, start.day);
  const endUtc = Date.UTC(end.year, end.month - 1, end.day);
  return Math.round((endUtc - startUtc) / MILLISECONDS_PER_DAY);
}

/** The caller's date options reduced to the day-level shape a range wants: a
 *  weekday on each end of a span is noise, and a span needs an actual date. */
function rangeDayOptions(
  dateOptions: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormatOptions {
  const dayOptions: Intl.DateTimeFormatOptions = { ...dateOptions };
  delete dayOptions.weekday;
  const hasDayLevelField =
    Boolean(dayOptions.dateStyle) ||
    Boolean(dayOptions.day) ||
    Boolean(dayOptions.month) ||
    Boolean(dayOptions.year);
  return hasDayLevelField
    ? dayOptions
    : { ...dayOptions, ...RANGE_DAY_FALLBACK };
}

/** The opening end of a range. Inside one month the month and the year belong
 *  once, at the close: "17 to 19 Oct" rather than "17 Oct to 19 Oct". */
function rangeStartOptions(
  dayOptions: Intl.DateTimeFormatOptions,
  isSameMonth: boolean,
): Intl.DateTimeFormatOptions {
  if (!isSameMonth || dayOptions.dateStyle || !dayOptions.day) {
    return dayOptions;
  }
  const startOptions: Intl.DateTimeFormatOptions = { ...dayOptions };
  delete startOptions.month;
  delete startOptions.year;
  return startOptions;
}

/** The zone label belongs once in a time range, on the closing time. */
function withoutZoneName(
  timeOptions: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormatOptions {
  const plainOptions: Intl.DateTimeFormatOptions = { ...timeOptions };
  delete plainOptions.timeZoneName;
  return plainOptions;
}

/**
 * Read a gathering's schedule as display parts.
 *
 * Works from two plain `Date` objects, so the create wizard's review step can
 * print the span a host is about to publish before any gathering exists.
 *
 * `dateOptions` / `timeOptions` are the caller's own `Intl` options, normally
 * `zone.dateOptions` / `zone.timeOptions` from `eventZoneFormat`, which carry
 * the gathering's IANA zone and the short zone label. They flow through every
 * date and time this builds, so the whole schedule reads on one clock.
 *
 * @example
 * const zone = eventZoneFormat(gathering.timezone, gathering.date);
 * const when = gatheringWhen(gathering.date, gathering.endAt, fmt, t,
 *   { weekday: "short", day: "numeric", month: "short", ...zone.dateOptions },
 *   zone.timeOptions);
 * when.dateText;     // "Fri 17 Oct"
 * when.timeText;     // "23:00 – 04:00"
 * when.nextDayNote;  // "(next day)"
 */
export function gatheringWhen(
  startAt: Date,
  endAt: Date | null | undefined,
  fmt: Formatters,
  t: TFunction,
  dateOptions: Intl.DateTimeFormatOptions = DEFAULT_DATE_OPTIONS,
  timeOptions: Intl.DateTimeFormatOptions = {},
): GatheringWhen {
  const endDate = endAt ?? null;
  // The note says something about the CLOCK beside it ("those two times are on
  // different days"), so the day judgement follows the zone the times are drawn
  // on, and falls back to the date one. A caller that fills a single bag then
  // still gets a reading that agrees with the digits it renders. Normal callers
  // spread both bags from one `eventZoneFormat`, so the two are the same zone.
  const scheduleZone = timeOptions.timeZone ?? dateOptions.timeZone;
  const startDay = calendarDayIn(startAt, scheduleZone);
  const endDay = endDate ? calendarDayIn(endDate, scheduleZone) : null;
  // With no usable day on either side the schedule degrades to a single-day
  // reading, which is exactly what every surface printed before this existed.
  const dayOffset =
    startDay && endDay ? calendarDaysBetween(startDay, endDay) : 0;

  const isMultiDay = dayOffset >= 1;
  const isNextDay = dayOffset === 1;
  const isSameMonth = Boolean(
    startDay &&
    endDay &&
    startDay.year === endDay.year &&
    startDay.month === endDay.month,
  );

  // Two days apart or more earns a date range. One day apart reads better as
  // the start date plus a note, because the range the reader is puzzling over
  // is the clock one: "Fri 17 Oct · 23:00 – 04:00 (next day)".
  const dayOptions = rangeDayOptions(dateOptions);
  const dateText =
    dayOffset >= 2 && endDate
      ? t("gatherings:common.dateRange", {
          start: fmt.date(startAt, rangeStartOptions(dayOptions, isSameMonth)),
          end: fmt.date(endDate, dayOptions),
        })
      : fmt.date(startAt, dateOptions);

  const timeText = endDate
    ? t("gatherings:common.timeRange", {
        start: fmt.time(startAt, withoutZoneName(timeOptions)),
        end: fmt.time(endDate, timeOptions),
      })
    : fmt.time(startAt, timeOptions);

  return {
    dateText,
    timeText,
    isMultiDay,
    isNextDay,
    nextDayNote: isNextDay ? t("gatherings:common.nextDayNote") : null,
  };
}
