/**
 * The `DateField` working-value model: parsing an incoming ISO `value` (shape
 * depends on `mode`) into per-segment parts, and reassembling parts back into
 * that ISO shape. All date math runs through `./plainDate`'s DST-proof
 * `PlainDate`/`PlainTime` model, never JS `Date` arithmetic.
 */

import {
  formatIsoDate,
  formatIsoMonth,
  formatIsoTime,
  getDaysInMonth,
  parseDate,
  parseMonth,
  parseTime,
  type PlainDate,
  type PlainTime,
} from "./plainDate";
import type { FieldMode } from "./DateField";

export interface WorkingParts {
  year: number | null;
  month: number | null;
  day: number | null;
  hour: number | null; // 1-12 when 12h mode, 0-23 when 24h mode
  minute: number | null;
  meridiem: "AM" | "PM" | null;
}

export const EMPTY_PARTS: WorkingParts = {
  year: null,
  month: null,
  day: null,
  hour: null,
  minute: null,
  meridiem: null,
};

/** 24h internal hour -> the field's displayed hour + meridiem. */
export function hourFromInternal(
  hour24: number,
  is12Hour: boolean,
): { hour: number; meridiem: "AM" | "PM" | null } {
  if (!is12Hour) return { hour: hour24, meridiem: null };
  const meridiem: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";
  return { hour: hour24 % 12 === 0 ? 12 : hour24 % 12, meridiem };
}

/** The field's displayed hour + meridiem -> 24h internal hour. */
export function hourToInternal(
  hour: number,
  meridiem: "AM" | "PM" | null,
  is12Hour: boolean,
): number {
  if (!is12Hour) return hour;
  if (meridiem === "PM") return hour === 12 ? 12 : hour + 12;
  return hour === 12 ? 0 : hour;
}

const DATETIME_PATTERN = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/;

/** Parse the incoming `value` ISO (shape depends on `mode`) into working parts. */
export function partsFromValue(
  mode: FieldMode,
  value: string | null,
  is12Hour: boolean,
): WorkingParts {
  if (!value) return EMPTY_PARTS;
  if (mode === "date") {
    const date = parseDate(value);
    return date
      ? { ...EMPTY_PARTS, year: date.year, month: date.month, day: date.day }
      : EMPTY_PARTS;
  }
  if (mode === "month") {
    const date = parseMonth(value);
    return date
      ? { ...EMPTY_PARTS, year: date.year, month: date.month }
      : EMPTY_PARTS;
  }
  if (mode === "time") {
    const time = parseTime(value);
    if (!time) return EMPTY_PARTS;
    const { hour, meridiem } = hourFromInternal(time.hour, is12Hour);
    return { ...EMPTY_PARTS, hour, minute: time.minute, meridiem };
  }
  const match = DATETIME_PATTERN.exec(value);
  const date = match ? parseDate(match[1] as string) : null;
  const time = match ? parseTime(match[2] as string) : null;
  if (!date || !time) return EMPTY_PARTS;
  const { hour, meridiem } = hourFromInternal(time.hour, is12Hour);
  return {
    year: date.year,
    month: date.month,
    day: date.day,
    hour,
    minute: time.minute,
    meridiem,
  };
}

/** Reassemble working parts into the mode's ISO shape, or `null` while any
 *  required segment is still empty. The day is clamped to the typed
 *  year/month's length (e.g. a stale Jan-31 after switching to February). */
export function isoFromParts(
  mode: FieldMode,
  parts: WorkingParts,
  is12Hour: boolean,
): string | null {
  if (mode === "month") {
    if (parts.year === null || parts.month === null) return null;
    return formatIsoMonth({ year: parts.year, month: parts.month, day: 1 });
  }
  const needsDate = mode === "date" || mode === "datetime";
  const needsTime = mode === "time" || mode === "datetime";
  if (
    needsDate &&
    (parts.year === null || parts.month === null || parts.day === null)
  )
    return null;
  if (
    needsTime &&
    (parts.hour === null ||
      parts.minute === null ||
      (is12Hour && parts.meridiem === null))
  ) {
    return null;
  }
  const isoDate = needsDate
    ? formatIsoDate({
        year: parts.year as number,
        month: parts.month as number,
        day: Math.min(
          parts.day as number,
          getDaysInMonth(parts.year as number, parts.month as number),
        ),
      })
    : null;
  const isoTime = needsTime
    ? formatIsoTime({
        hour: hourToInternal(parts.hour as number, parts.meridiem, is12Hour),
        minute: parts.minute as number,
      })
    : null;
  if (mode === "date") return isoDate;
  if (mode === "time") return isoTime;
  return `${isoDate}T${isoTime}`;
}

const DATE_PREFIX_PATTERN = /^\d{4}-\d{2}-\d{2}/;

/**
 * Parse a `min`/`max` bound (as passed to `DateField`) into the `PlainDate`
 * `clampPartsToRange` compares against. `date`/`datetime` accept either a
 * bare `"yyyy-mm-dd"` bound (every current call site, e.g. `todayIso()`) or a
 * full `"yyyy-mm-ddThh:mm"` datetime bound — `parseDate`'s regex is anchored
 * to the whole string, so a datetime-shaped bound needs its date prefix
 * sliced off first. `month` bounds are `"yyyy-mm"`. `time` has no date
 * portion at all, so this always returns `null` for it: see `parseTimeBound`
 * for the `PlainTime` counterpart `clampPartsToRange` clamps time fields
 * against.
 */
export function parseDateBound(
  mode: FieldMode,
  raw: string | undefined,
): PlainDate | null {
  if (!raw) return null;
  if (mode === "month") return parseMonth(raw);
  if (mode === "time") return null;
  const prefixMatch = DATE_PREFIX_PATTERN.exec(raw);
  return prefixMatch ? parseDate(prefixMatch[0]) : null;
}

/** Parse a `min`/`max` bound for a `mode="time"` field (an `"hh:mm"` string)
 *  into the `PlainTime` `clampPartsToRange` compares against. `null` for any
 *  other mode: those bounds are dates, handled by `parseDateBound`. */
export function parseTimeBound(
  mode: FieldMode,
  raw: string | undefined,
): PlainTime | null {
  if (!raw || mode !== "time") return null;
  return parseTime(raw);
}

/** The parsed date and time bounds for a field, as `clampPartsToRange` needs
 *  them: `minDate`/`maxDate` for `date`/`datetime`/`month`, `minTime`/
 *  `maxTime` for `time`. Bundled into one call so `DateField` only needs a
 *  single `useMemo`. */
export interface FieldBounds {
  minDate: PlainDate | null;
  maxDate: PlainDate | null;
  minTime: PlainTime | null;
  maxTime: PlainTime | null;
}

export function parseFieldBounds(
  mode: FieldMode,
  min: string | undefined,
  max: string | undefined,
): FieldBounds {
  return {
    minDate: parseDateBound(mode, min),
    maxDate: parseDateBound(mode, max),
    minTime: parseTimeBound(mode, min),
    maxTime: parseTimeBound(mode, max),
  };
}

/** The `yyyy-mm-dd` date-portion ISO of the field's current COMPLETE value,
 *  the shape `isDateUnavailable` is called with everywhere else (mirrors
 *  `Calendar`'s own `formatIsoDate` call). `null` while the value is
 *  incomplete, or for `month`/`time` modes, which have no single date to
 *  check (a bare month or time-of-day isn't "a date" `isDateUnavailable` can
 *  judge). */
export function unavailableCheckIso(
  mode: FieldMode,
  parts: WorkingParts,
  is12Hour: boolean,
): string | null {
  if (mode !== "date" && mode !== "datetime") return null;
  const iso = isoFromParts(mode, parts, is12Hour);
  if (!iso) return null;
  return mode === "datetime" ? iso.slice(0, 10) : iso;
}

/** Whether a `DateField`'s current COMPLETE value fails `isDateUnavailable`
 *  (see `DateFieldProps`). `false` while the value is incomplete, for
 *  `month`/`time` modes (see `unavailableCheckIso`), or when no predicate
 *  was supplied. */
export function isPartsUnavailable(
  mode: FieldMode,
  parts: WorkingParts,
  is12Hour: boolean,
  isDateUnavailable: ((iso: string) => boolean) | undefined,
): boolean {
  const iso = unavailableCheckIso(mode, parts, is12Hour);
  return iso !== null && (isDateUnavailable?.(iso) ?? false);
}
