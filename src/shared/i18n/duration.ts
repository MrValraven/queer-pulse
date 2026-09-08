import type { FormatUnit, Formatters } from "./format";

/**
 * Elapsed durations that arrive from the API as FRACTIONAL HOURS.
 *
 * Every "how long has this been waiting?" figure the backend sends is a number
 * of hours, and hours is the wrong unit for most of the values it actually
 * produces: a report filed three minutes ago is `0.05218305555555556`, and a
 * tile that renders it verbatim says "oldest 0.05218305555555556h" while the
 * median-response tile beside it rounds the same kind of value to a flat
 * "0.0h". Both are unreadable, and the second is worse than unreadable because
 * it reads as "no time at all".
 *
 * So the unit is chosen from the size of the value: seconds under a minute,
 * minutes under an hour, hours above that. `Intl` renders the mark, the
 * separator, and the plural form for the active locale, which is why none of
 * this needs a catalog key.
 *
 * There is deliberately NO day unit. These figures are judged against
 * thresholds and SLAs written in hours (`MEDIAN_RESPONSE_SLA_HOURS`,
 * `entry.thresholds.oldestHours`), and a median response of 26.4 hours
 * collapsed to "1 day" would lose the precision the reading is for. A surface
 * that genuinely wants days past a point does that itself, above this
 * helper.
 */
export type DurationUnit = Extract<FormatUnit, "second" | "minute" | "hour">;

export interface HoursDuration {
  /** The figure to show, already converted into `unit`. */
  value: number;
  unit: DurationUnit;
  /** True when `value` reads better with one decimal place. Hours only, since
   *  a rounded minute or second count has no meaningful fraction left. */
  hasDecimal: boolean;
}

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;

/**
 * Pick the unit that makes a fractional-hours duration readable. Rounds up
 * through the units rather than comparing the raw value, so a duration that
 * rounds to a full 60 seconds is reported as a minute instead of "60 sec".
 *
 * A negative or non-finite input (a clock skew, a missing figure coerced to
 * `NaN`) settles at zero seconds rather than rendering nonsense.
 */
export function durationFromHours(hours: number): HoursDuration {
  if (!Number.isFinite(hours) || hours <= 0) {
    return { value: 0, unit: "second", hasDecimal: false };
  }
  const seconds = Math.round(hours * SECONDS_PER_HOUR);
  if (seconds < SECONDS_PER_MINUTE) {
    return { value: seconds, unit: "second", hasDecimal: false };
  }
  const minutes = Math.round(seconds / SECONDS_PER_MINUTE);
  if (minutes < MINUTES_PER_HOUR) {
    return { value: minutes, unit: "minute", hasDecimal: false };
  }
  return {
    value: Math.round(hours * 10) / 10,
    unit: "hour",
    hasDecimal: true,
  };
}

/**
 * A fractional-hours duration as one localized phrase: `"45 sec"` / `"12 min"`
 * / `"3.2 hr"` short, `"45 seconds"` / `"12 minutes"` / `"3.2 hours"` long.
 *
 * Pass `"long"` where the figure sits in prose or carries a stat's whole
 * meaning, `"short"` (the default) where it rides inside another sentence.
 */
export function durationLabel(
  hours: number,
  fmt: Formatters,
  unitDisplay: "short" | "long" = "short",
): string {
  const { value, unit, hasDecimal } = durationFromHours(hours);
  return fmt.unit(value, unit, {
    unitDisplay,
    maximumFractionDigits: hasDecimal ? 1 : 0,
  });
}
