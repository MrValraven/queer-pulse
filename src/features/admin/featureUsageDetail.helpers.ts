import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { dayAtIndex, formatShortDay } from "./featureUsageRange";

/* Pure helpers for the feature usage detail panel (FeatureUsageDetailPanel
 * and its two charts), kept out of the component files so they only export
 * components (react-refresh/only-export-components). */

export interface DailySummary {
  /** The busiest day, or null when every day is zero. */
  peak: { value: number; day: string } | null;
  averagePerDay: number;
  zeroDays: number;
  totalDays: number;
}

/** Busiest day, average per day and the count of zero days for one daily
 *  series that starts on `rangeStart`. On a tie the earliest day wins. */
export function summarizeDaily(
  values: readonly number[],
  rangeStart: string,
): DailySummary {
  let peakIndex = -1;
  let total = 0;
  let zeroDays = 0;
  values.forEach((value, index) => {
    total += value;
    if (value === 0) zeroDays += 1;
    if (value > 0 && (peakIndex < 0 || value > values[peakIndex]!)) {
      peakIndex = index;
    }
  });
  return {
    peak:
      peakIndex < 0
        ? null
        : { value: values[peakIndex]!, day: dayAtIndex(rangeStart, peakIndex) },
    averagePerDay: values.length === 0 ? 0 : total / values.length,
    zeroDays,
    totalDays: values.length,
  };
}

/** Whether every day of both the selected range and the period before it
 *  had no requests. The panel then says so in one line and skips the
 *  summary and the charts, which would only draw a flat line. */
export function isReachZeroInBothPeriods(
  reachDaily: readonly number[],
  reachPreviousDaily: readonly number[],
): boolean {
  return (
    reachDaily.every((value) => value === 0) &&
    reachPreviousDaily.every((value) => value === 0)
  );
}

/** Labels the x-axis aims for at most. */
const MAX_DAY_LABELS = 7;

/** How many columns apart the day labels sit, so the axis keeps roughly 5
 *  to 7 labels at any range length. Counted back from the newest day, so
 *  the newest day always carries a label. */
export function labelStepFor(rangeDays: number): number {
  return Math.max(1, Math.ceil(rangeDays / MAX_DAY_LABELS));
}

/** The least room, in SVG units (equal to pixels), between two day label
 *  centres. A short "Oct 26" at the 11px label size is about 34 wide. */
const MIN_LABEL_SPACING = 48;

/** `labelStepFor`, widened when the plot is too narrow for that many labels
 *  (a 7-day range on a phone). `columnStep` is the distance between two
 *  neighbouring day centres. */
export function labelStepForWidth(
  rangeDays: number,
  columnStep: number,
): number {
  const stepForWidth =
    columnStep > 0 ? Math.ceil(MIN_LABEL_SPACING / columnStep) : 1;
  return Math.max(labelStepFor(rangeDays), stepForWidth);
}

/** Whether the column at `index` carries a day label. */
export function isDayLabelled(
  index: number,
  lastIndex: number,
  labelStep: number,
): boolean {
  return (lastIndex - index) % labelStep === 0;
}

/** Total time the staggered grow-in may spread over, before the last bar's
 *  own 0.6s rise. */
const STAGGER_TOTAL_MS = 480;
/** Short ranges cap the per-bar delay, so 7 bars still rise as one wave. */
const MAX_STAGGER_MS = 24;

/** Per-bar delay of the grow-in, so the whole wave starts within 480ms at
 *  any range length (365 bars included). */
export function staggerMsFor(rangeDays: number): number {
  if (rangeDays <= 1) return 0;
  return Math.min(MAX_STAGGER_MS, Math.floor(STAGGER_TOTAL_MS / rangeDays));
}

/** The three features whose drill-down counts the backend fills in. */
const FEATURE_USAGE_DRILL_DOWN_KEYS: ReadonlySet<string> = new Set([
  "housingListings",
  "forum",
  "communities",
]);

export function hasFeatureUsageDrillDown(featureKey: string): boolean {
  return FEATURE_USAGE_DRILL_DOWN_KEYS.has(featureKey);
}

export interface ReachDayTip {
  dayLabel: string;
  currentLabel: string;
  previousLine: string;
}

export interface ReachDay {
  day: string;
  value: number;
  previousValue: number;
  dayLabel: string;
  tip: ReachDayTip;
  ariaLabel: string;
}

/** One entry per day of the reach chart, with every label it shows built
 *  once, so a pointer moving over a 365-day range never reformats dates. */
export function buildReachDays(
  reachDaily: readonly number[],
  reachPreviousDaily: readonly number[],
  window: { rangeStart: string; previousRangeStart: string },
  fmt: Formatters,
  t: TFunction,
): ReachDay[] {
  const requestsLabel = (count: number) =>
    t("admin:featureUsage.detail.tip.requests", {
      count,
      countLabel: fmt.number(count),
    });
  return reachDaily.map((value, index) => {
    const day = dayAtIndex(window.rangeStart, index);
    const previousValue = reachPreviousDaily[index] ?? 0;
    const dayLabel = formatShortDay(day, fmt);
    const previousDayLabel = formatShortDay(
      dayAtIndex(window.previousRangeStart, index),
      fmt,
    );
    const currentLabel = requestsLabel(value);
    const previousLabel = requestsLabel(previousValue);
    return {
      day,
      value,
      previousValue,
      dayLabel,
      tip: {
        dayLabel,
        currentLabel,
        previousLine: t("admin:featureUsage.detail.tip.previous", {
          day: previousDayLabel,
          countLabel: previousLabel,
        }),
      },
      ariaLabel: t("admin:featureUsage.detail.bar.ariaLabel", {
        day: dayLabel,
        currentLabel,
        previousLabel,
      }),
    };
  });
}

export interface CreatedDay {
  day: string;
  value: number;
  dayLabel: string;
  createdLabel: string;
  ariaLabel: string;
}

/** One entry per day of the created chart, labels built once. */
export function buildCreatedDays(
  createdDaily: readonly number[],
  rangeStart: string,
  fmt: Formatters,
  t: TFunction,
): CreatedDay[] {
  return createdDaily.map((value, index) => {
    const day = dayAtIndex(rangeStart, index);
    const dayLabel = formatShortDay(day, fmt);
    const createdLabel = t("admin:featureUsage.detail.created.tip", {
      count: value,
      countLabel: fmt.number(value),
    });
    return {
      day,
      value,
      dayLabel,
      createdLabel,
      ariaLabel: t("admin:featureUsage.detail.created.pointAriaLabel", {
        day: dayLabel,
        createdLabel,
      }),
    };
  });
}
