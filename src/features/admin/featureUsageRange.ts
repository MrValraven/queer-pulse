import {
  addDays,
  daysFromCivil,
  formatIsoDate,
  parseDate,
  type PlainDate,
} from "../../shared/components/ui/plainDate";
import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";

/**
 * Range model for the feature usage panel. Every day here is a bare UTC
 * calendar day (`YYYY-MM-DD`), the same inclusive strings the backend sends
 * as `rangeStart`/`rangeEnd`. Date math runs on `plainDate.ts`'s civil-day
 * count, so it never drifts with the browser's time zone or DST.
 */

export const FEATURE_USAGE_PRESET_RANGE_DAYS = [7, 30, 90] as const;
export type FeatureUsagePresetRangeDays =
  (typeof FEATURE_USAGE_PRESET_RANGE_DAYS)[number];
export const FEATURE_USAGE_MAX_CUSTOM_RANGE_DAYS = 365;
/** Fallback only, for the date picker before the first response lands. The
 *  DTO's `retentionStart` is authoritative. */
export const FEATURE_USAGE_RETENTION_DAYS = 730;

export type FeatureUsageRangeSelection =
  | { kind: "preset"; rangeDays: FeatureUsagePresetRangeDays }
  | { kind: "custom"; from: string; to: string };

/** The resolved range the backend reports back, every day inclusive. */
export interface FeatureUsageWindow {
  rangeDays: number;
  rangeStart: string;
  rangeEnd: string;
  previousRangeStart: string;
  previousRangeEnd: string;
  retentionStart: string;
  isPreviousRangePartial: boolean;
}

export type FeatureUsageRangeIssue =
  | "rangeIncomplete"
  | "rangeReversed"
  | "rangeTooLong"
  | "rangeBeforeRetention"
  | "rangeIncludesToday";

/** A stable string per selection, for react-query keys. */
export function rangeSelectionKey(
  selection: FeatureUsageRangeSelection,
): string {
  return selection.kind === "preset"
    ? `preset:${selection.rangeDays}`
    : `custom:${selection.from}:${selection.to}`;
}

function parseUtcDay(day: string): PlainDate {
  const parsed = parseDate(day);
  if (!parsed) {
    throw new RangeError(
      `Feature usage expected a YYYY-MM-DD day, got "${day}"`,
    );
  }
  return parsed;
}

/** Today as a UTC calendar day. */
export function todayUtcDay(now: Date = new Date()): string {
  return formatIsoDate({
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    day: now.getUTCDate(),
  });
}

export function addUtcDays(day: string, amount: number): string {
  return formatIsoDate(addDays(parseUtcDay(day), amount));
}

/** The latest day a range may include: today is still being counted. */
export function yesterdayUtcDay(now: Date = new Date()): string {
  return addUtcDays(todayUtcDay(now), -1);
}

/** The earliest day still kept, by the fallback retention length. */
export function earliestCustomRangeDay(now: Date = new Date()): string {
  return addUtcDays(todayUtcDay(now), -FEATURE_USAGE_RETENTION_DAYS);
}

/** Days from the epoch for a UTC day, for seeding and day arithmetic. */
export function utcDayNumber(day: string): number {
  return daysFromCivil(parseUtcDay(day));
}

export function countDaysInclusive(fromDay: string, toDay: string): number {
  return utcDayNumber(toDay) - utcDayNumber(fromDay) + 1;
}

export function dayAtIndex(rangeStart: string, index: number): string {
  return addUtcDays(rangeStart, index);
}

export function utcDayToDate(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}

/** "Sep 26", or "Sep 26, 2025" with `isYearShown`. Always read in UTC, so a
 *  day never slides to its neighbour in a browser west of Greenwich. */
export function formatShortDay(
  day: string,
  fmt: Formatters,
  options: { isYearShown?: boolean } = {},
): string {
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  };
  if (options.isYearShown) dateOptions.year = "numeric";
  return fmt.date(utcDayToDate(day), dateOptions);
}

/** "Aug 27 to Sep 25". Both ends carry the year when the two years differ
 *  or when either one is a year other than the current UTC year. */
export function formatDayRange(
  startDay: string,
  endDay: string,
  fmt: Formatters,
  t: TFunction,
  now: Date = new Date(),
): string {
  const startYear = parseUtcDay(startDay).year;
  const endYear = parseUtcDay(endDay).year;
  const currentYear = now.getUTCFullYear();
  const isYearShown = startYear !== endYear || startYear !== currentYear;
  return t("admin:featureUsage.dateRange", {
    start: formatShortDay(startDay, fmt, { isYearShown }),
    end: formatShortDay(endDay, fmt, { isYearShown }),
  });
}

/**
 * Checks a custom range draft against the same limits the backend enforces,
 * so an out-of-bounds draft never reaches the network. `bounds.earliestDay`
 * is the retention start and `bounds.latestDay` is yesterday, both inclusive.
 * A day that fails to parse counts as missing, since the date picker only
 * ever emits real calendar days.
 */
export function validateCustomRange(
  fromDay: string | null,
  toDay: string | null,
  bounds: { earliestDay: string; latestDay: string },
): FeatureUsageRangeIssue | null {
  if (!fromDay || !toDay || !parseDate(fromDay) || !parseDate(toDay)) {
    return "rangeIncomplete";
  }
  if (fromDay > toDay) return "rangeReversed";
  if (toDay > bounds.latestDay) return "rangeIncludesToday";
  if (fromDay < bounds.earliestDay) return "rangeBeforeRetention";
  if (
    countDaysInclusive(fromDay, toDay) > FEATURE_USAGE_MAX_CUSTOM_RANGE_DAYS
  ) {
    return "rangeTooLong";
  }
  return null;
}
