/**
 * Per-segment keyboard editing for `DateField`: ArrowUp/Down stepping (with
 * wrap + day/month/year reclamping), digit-key entry with auto-advance, and
 * min/max range clamping. All day-count math runs through `./plainDate`'s
 * DST-proof model; this module only reads `Date` via `todayPlain()`, as a
 * sensible default when a segment is stepped from empty.
 */

import {
  clampDate,
  getDaysInMonth,
  todayPlain,
  type PlainDate,
  type PlainTime,
} from "./plainDate";
import type { SegmentType } from "./dateSegments";
import {
  hourFromInternal,
  hourToInternal,
  type FieldBounds,
  type WorkingParts,
} from "./dateFieldParts";
import type { FieldMode } from "./DateField";

const SEGMENT_MAX_DIGITS: Record<SegmentType, number> = {
  day: 2,
  month: 2,
  year: 4,
  hour: 2,
  minute: 2,
  meridiem: 0,
};

/** Resolve the year/month a lone day segment uses for its day-count ceiling,
 *  falling back to today's when either isn't typed yet. */
function resolveYearMonth(parts: WorkingParts): {
  year: number;
  month: number;
} {
  const today = todayPlain();
  return { year: parts.year ?? today.year, month: parts.month ?? today.month };
}

/** `aria-valuemin`/`aria-valuemax` for `type`, given the parts typed so far. */
export function segmentRange(
  type: SegmentType,
  parts: WorkingParts,
  is12Hour: boolean,
): { min: number; max: number } {
  switch (type) {
    case "day": {
      const { year, month } = resolveYearMonth(parts);
      return { min: 1, max: getDaysInMonth(year, month) };
    }
    case "month":
      return { min: 1, max: 12 };
    case "year":
      return { min: 1, max: 9999 };
    case "hour":
      return is12Hour ? { min: 1, max: 12 } : { min: 0, max: 23 };
    case "minute":
      return { min: 0, max: 59 };
    case "meridiem":
      return { min: 0, max: 1 };
  }
}

function wrap(value: number, min: number, max: number): number {
  const range = max - min + 1;
  return ((((value - min) % range) + range) % range) + min;
}

/** ArrowUp/Down: increment or decrement `type`, wrapping within its range.
 *  Changing month/year reclamps an already-typed day so it never points past
 *  the new month's end (e.g. Jan 31 -> Feb clamps day to 28/29). */
export function stepSegment(
  type: SegmentType,
  parts: WorkingParts,
  direction: 1 | -1,
  is12Hour: boolean,
): WorkingParts {
  const { min, max } = segmentRange(type, parts, is12Hour);
  if (type === "meridiem")
    return { ...parts, meridiem: parts.meridiem === "AM" ? "PM" : "AM" };
  if (type === "year") {
    const nextYear = (parts.year ?? todayPlain().year) + direction;
    const day =
      parts.day !== null && parts.month !== null
        ? Math.min(parts.day, getDaysInMonth(nextYear, parts.month))
        : parts.day;
    return { ...parts, year: nextYear, day };
  }
  if (type === "month") {
    const nextMonth = wrap(
      (parts.month ?? todayPlain().month) + direction,
      min,
      max,
    );
    const { year } = resolveYearMonth(parts);
    const day =
      parts.day !== null
        ? Math.min(parts.day, getDaysInMonth(year, nextMonth))
        : parts.day;
    return { ...parts, month: nextMonth, day };
  }
  if (type === "day")
    return {
      ...parts,
      day: wrap((parts.day ?? todayPlain().day) + direction, min, max),
    };
  if (type === "hour")
    return { ...parts, hour: wrap((parts.hour ?? min) + direction, min, max) };
  return { ...parts, minute: wrap((parts.minute ?? 0) + direction, min, max) };
}

/** Clamp a fully-typed hour:minute into `[minTime, maxTime]` (either bound
 *  may be `null`), comparing as minutes-since-midnight so a 12h field's
 *  displayed hour/meridiem round-trips through the 24h internal value the
 *  bounds are expressed in. Leaves `parts` untouched until hour/minute (and
 *  meridiem, in 12h mode) are all typed. */
function clampTimeParts(
  parts: WorkingParts,
  minTime: PlainTime | null,
  maxTime: PlainTime | null,
  is12Hour: boolean,
): WorkingParts {
  if (minTime === null && maxTime === null) return parts;
  if (
    parts.hour === null ||
    parts.minute === null ||
    (is12Hour && parts.meridiem === null)
  )
    return parts;
  const minutesOfDay =
    hourToInternal(parts.hour, parts.meridiem, is12Hour) * 60 + parts.minute;
  const minMinutes = minTime ? minTime.hour * 60 + minTime.minute : null;
  const maxMinutes = maxTime ? maxTime.hour * 60 + maxTime.minute : null;
  let clampedMinutes = minutesOfDay;
  if (minMinutes !== null && clampedMinutes < minMinutes)
    clampedMinutes = minMinutes;
  if (maxMinutes !== null && clampedMinutes > maxMinutes)
    clampedMinutes = maxMinutes;
  if (clampedMinutes === minutesOfDay) return parts;
  const { hour, meridiem } = hourFromInternal(
    Math.floor(clampedMinutes / 60),
    is12Hour,
  );
  return { ...parts, hour, minute: clampedMinutes % 60, meridiem };
}

/** Clamp a fully-typed value into `bounds` (either side may be `null`):
 *  year/month(/day) against `minDate`/`maxDate` for `date`/`datetime`/
 *  `month`, hour:minute against `minTime`/`maxTime` for `time`. Leaves
 *  `parts` untouched until the relevant segments are all typed — a partial
 *  value has nothing to compare. */
export function clampPartsToRange(
  mode: FieldMode,
  parts: WorkingParts,
  bounds: FieldBounds,
  is12Hour: boolean,
): WorkingParts {
  if (mode === "time")
    return clampTimeParts(parts, bounds.minTime, bounds.maxTime, is12Hour);
  const { minDate, maxDate } = bounds;
  if (minDate === null && maxDate === null) return parts;
  if (parts.year === null || parts.month === null) return parts;
  const day = mode === "month" ? 1 : parts.day;
  if (day === null) return parts;
  const current: PlainDate = { year: parts.year, month: parts.month, day };
  const clamped = clampDate(current, minDate, maxDate);
  if (
    clamped.year === current.year &&
    clamped.month === current.month &&
    clamped.day === current.day
  )
    return parts;
  return {
    ...parts,
    year: clamped.year,
    month: clamped.month,
    day: mode === "month" ? parts.day : clamped.day,
  };
}

function valueOf(type: SegmentType, parts: WorkingParts): number | null {
  if (type === "meridiem")
    return parts.meridiem === null ? null : parts.meridiem === "PM" ? 1 : 0;
  return parts[type];
}

function setValue(
  type: SegmentType,
  parts: WorkingParts,
  value: number,
): WorkingParts {
  if (type === "meridiem") return parts; // digits never drive the meridiem segment
  return { ...parts, [type]: value };
}

export interface DigitEntry {
  parts: WorkingParts;
  bufferLength: number;
  advance: boolean;
}

/** Digit key handling: accumulates a per-segment typed buffer (tracked by the
 *  caller via `bufferLength`), restarting the buffer whenever the next digit
 *  would overflow the segment's max, and signalling `advance` once the
 *  segment is full or no further digit could still keep the value valid. */
export function enterDigit(
  type: SegmentType,
  parts: WorkingParts,
  bufferLength: number,
  digit: number,
  is12Hour: boolean,
): DigitEntry {
  const { max } = segmentRange(type, parts, is12Hour);
  const maxDigits = SEGMENT_MAX_DIGITS[type];
  const priorValue = bufferLength > 0 ? (valueOf(type, parts) ?? 0) : 0;
  let nextValue = priorValue * 10 + digit;
  let nextBufferLength = bufferLength + 1;
  if (nextValue > max || nextBufferLength > maxDigits) {
    nextValue = digit;
    nextBufferLength = 1;
  }
  const noRoomForMoreDigits = nextValue * 10 > max;
  const advance = nextBufferLength >= maxDigits || noRoomForMoreDigits;
  return {
    parts: setValue(type, parts, nextValue),
    bufferLength: advance ? 0 : nextBufferLength,
    advance,
  };
}

/** Clear the focused segment back to empty. */
export function clearSegment(
  type: SegmentType,
  parts: WorkingParts,
): WorkingParts {
  if (type === "meridiem") return { ...parts, meridiem: null };
  return { ...parts, [type]: null };
}

/** Displayed text for a segment: zero-padded to its natural width, or the
 *  meridiem word itself. `null` while the segment is still empty. */
export function formatSegmentText(
  type: SegmentType,
  parts: WorkingParts,
): string | null {
  if (type === "meridiem") return parts.meridiem;
  const value = parts[type];
  if (value === null) return null;
  const width = type === "year" ? 4 : 2;
  return String(value).padStart(width, "0");
}
