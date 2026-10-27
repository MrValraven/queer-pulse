import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";

/**
 * Pure logic behind the feature usage Reach cell: how this period compares
 * with the one before it, where a feature sits against the launched-feature
 * median. Kept out of the component file so it exports only a component.
 * The mini bars' geometry lives in featureUsageReachBars.helpers.ts.
 */

export type ReachDirection = "up" | "down" | "flat";

/** `percent` is a fraction (2.3 reads as 230%), ready for Intl's percent style. */
export type ReachComparison =
  | { kind: "none" }
  | { kind: "new" }
  | { kind: "same"; previous: number }
  | {
      kind: "absolute";
      direction: ReachDirection;
      difference: number;
      previous: number;
    }
  | {
      kind: "withPercent";
      direction: ReachDirection;
      difference: number;
      percent: number;
      previous: number;
    };

/** Below this previous reach a percent swings wildly (1 to 4 is +300%), so
 *  the line shows the plain difference alone. */
const PERCENT_MIN_PREVIOUS_REACH = 10;
/** A change smaller than this share of a previous reach of 10 or more is
 *  noise, so it reads as flat. The numbers still show. */
const FLAT_MAX_PERCENT_CHANGE = 0.03;

export function compareReach(
  reach: number,
  reachPrevious: number,
): ReachComparison {
  if (reachPrevious <= 0) return reach > 0 ? { kind: "new" } : { kind: "none" };
  if (reach === reachPrevious) return { kind: "same", previous: reachPrevious };
  const difference = reach - reachPrevious;
  const direction: ReachDirection = difference > 0 ? "up" : "down";
  if (reachPrevious < PERCENT_MIN_PREVIOUS_REACH) {
    return { kind: "absolute", direction, difference, previous: reachPrevious };
  }
  const percent = difference / reachPrevious;
  return {
    kind: "withPercent",
    direction: Math.abs(percent) < FLAT_MAX_PERCENT_CHANGE ? "flat" : direction,
    difference,
    percent,
    previous: reachPrevious,
  };
}

/** The direction that colours the comparison line and picks its icon. New
 *  activity counts as up; no reach and an unchanged reach stay neutral. A
 *  previous period that is only partly kept reads low, so any change against
 *  it stays neutral too. */
export function comparisonDirection(
  comparison: ReachComparison,
  isPreviousRangePartial = false,
): ReachDirection {
  if (isPreviousRangePartial) return "flat";
  if (comparison.kind === "new") return "up";
  if (comparison.kind === "absolute" || comparison.kind === "withPercent") {
    return comparison.direction;
  }
  return "flat";
}

/** The comparison line's text. The table header names the previous dates
 *  once, so the line carries only the numbers. */
export function reachComparisonText(
  comparison: ReachComparison,
  fmt: Formatters,
  t: TFunction,
): string {
  if (comparison.kind === "none") {
    return t("admin:featureUsage.reachCompare.none");
  }
  if (comparison.kind === "new") {
    return t("admin:featureUsage.reachCompare.new");
  }
  const previous = fmt.number(comparison.previous);
  if (comparison.kind === "same") {
    return t("admin:featureUsage.reachCompare.same", { previous });
  }
  const difference = fmt.number(comparison.difference, {
    signDisplay: "exceptZero",
  });
  if (comparison.kind === "absolute") {
    return t("admin:featureUsage.reachCompare.absolute", {
      difference,
      previous,
    });
  }
  // A one-request change on a large base would round to "0%"; one decimal
  // keeps a real change from reading as no change.
  const isTinyPercent = Math.abs(comparison.percent) < 0.01;
  return t("admin:featureUsage.reachCompare.withPercent", {
    difference,
    percent: fmt.number(comparison.percent, {
      style: "percent",
      signDisplay: "exceptZero",
      maximumFractionDigits: isTinyPercent ? 1 : 0,
    }),
    previous,
  });
}

export type MedianStanding =
  | { kind: "above"; ratio: number }
  | { kind: "about" }
  | { kind: "below"; ratio: number };

const MEDIAN_ABOVE_RATIO = 1.25;
const MEDIAN_BELOW_RATIO = 0.8;

/** Where this reach sits against the launched-feature median. `null` when
 *  there is no median to compare with, or no reach to place. */
export function medianStanding(
  reach: number,
  reachMedian: number,
): MedianStanding | null {
  if (reachMedian <= 0 || reach === 0) return null;
  const ratio = reach / reachMedian;
  if (ratio >= MEDIAN_ABOVE_RATIO) return { kind: "above", ratio };
  if (ratio >= MEDIAN_BELOW_RATIO) return { kind: "about" };
  return { kind: "below", ratio };
}

export function medianNoteText(
  standing: MedianStanding,
  fmt: Formatters,
  t: TFunction,
): string {
  if (standing.kind === "about") return t("admin:featureUsage.median.about");
  if (standing.kind === "above") {
    return t("admin:featureUsage.median.above", {
      multiple: fmt.number(standing.ratio, {
        maximumFractionDigits: standing.ratio >= 10 ? 0 : 1,
      }),
    });
  }
  // Two significant digits under 1%, so a sliver of reach never reads as 0%.
  const percentOptions: Intl.NumberFormatOptions =
    standing.ratio < 0.01
      ? { style: "percent", maximumSignificantDigits: 2 }
      : { style: "percent", maximumFractionDigits: 0 };
  return t("admin:featureUsage.median.below", {
    percent: fmt.number(standing.ratio, percentOptions),
  });
}
