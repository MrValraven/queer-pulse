/**
 * Geometry of the Reach cell's mini bars, kept out of the component file so
 * it exports only a component. Everything is in viewBox units: one unit of
 * width per slot, where a slot is a day, or a 7-day bucket on long ranges.
 */

export const REACH_BARS_HEIGHT = 28;
/** The baseline's top edge; bars stand on it. */
export const REACH_BARS_BASELINE_Y = REACH_BARS_HEIGHT - 1;
const REACH_BARS_TOP_PADDING = 2;
/** A nonzero slot never shrinks below this, so a single request still shows. */
const REACH_BARS_MIN_HEIGHT = 1.5;
/** Matches `.bars` width in FeatureUsageReachCell.module.css. */
const REACH_BARS_RENDERED_WIDTH_PX = 120;
/** Past this many days one slot per day gets thinner than 2px at 120px, so
 *  days fold into weekly buckets. */
const REACH_BARS_WEEKLY_AFTER_DAYS = 60;
const REACH_BARS_DAYS_PER_BUCKET = 7;
const REACH_BARS_CURRENT_SLOT_SHARE = 0.6;
/** The current bar keeps its narrower share while that stays this wide on
 *  screen; below it the bar takes the whole slot. */
const REACH_BARS_MIN_CURRENT_WIDTH_PX = 2;

export interface ReachBarsGeometry {
  slotCount: number;
  /** One path for every previous-period bar, full slot width. */
  previousPath: string;
  /** One path for every current bar, centred in its slot. */
  currentPath: string;
}

/** Sums consecutive 7-day runs from the first day; the last bucket keeps
 *  whatever days are left, so it may hold fewer than seven. */
export function bucketWeekly(daily: number[]): number[] {
  const buckets: number[] = [];
  for (
    let start = 0;
    start < daily.length;
    start += REACH_BARS_DAYS_PER_BUCKET
  ) {
    const bucketDays = daily.slice(start, start + REACH_BARS_DAYS_PER_BUCKET);
    buckets.push(bucketDays.reduce((total, value) => total + value, 0));
  }
  return buckets;
}

function barsPath(
  values: number[],
  maxValue: number,
  barWidth: number,
): string {
  const plotHeight = REACH_BARS_BASELINE_Y - REACH_BARS_TOP_PADDING;
  const inset = (1 - barWidth) / 2;
  return values
    .map((value, index) => {
      if (value <= 0 || maxValue <= 0) return "";
      const barHeight = Math.max(
        REACH_BARS_MIN_HEIGHT,
        (value / maxValue) * plotHeight,
      );
      const top = REACH_BARS_BASELINE_Y - barHeight;
      return `M${index + inset} ${top}h${barWidth}V${REACH_BARS_BASELINE_Y}h${-barWidth}Z`;
    })
    .join("");
}

/** Both series share one maximum, so a ghost bar taller than its current bar
 *  means that slot was busier last period. Above 60 days each series folds
 *  into weekly buckets from its own first day, and the two line up by bucket
 *  index. Zero slots draw nothing and leave the baseline showing. One path
 *  per series keeps a 365-day row light. */
export function buildReachBarsGeometry(
  currentDaily: number[],
  previousDaily: number[],
): ReachBarsGeometry {
  const dayCount = Math.max(currentDaily.length, previousDaily.length);
  const isWeekly = dayCount > REACH_BARS_WEEKLY_AFTER_DAYS;
  const currentSlots = isWeekly ? bucketWeekly(currentDaily) : currentDaily;
  const previousSlots = isWeekly ? bucketWeekly(previousDaily) : previousDaily;
  const slotCount = Math.max(currentSlots.length, previousSlots.length, 1);
  const maxValue = Math.max(0, ...currentSlots, ...previousSlots);
  const slotWidthPx = REACH_BARS_RENDERED_WIDTH_PX / slotCount;
  const shouldNarrowCurrent =
    slotWidthPx * REACH_BARS_CURRENT_SLOT_SHARE >=
    REACH_BARS_MIN_CURRENT_WIDTH_PX;
  const currentWidth = shouldNarrowCurrent ? REACH_BARS_CURRENT_SLOT_SHARE : 1;
  return {
    slotCount,
    previousPath: barsPath(previousSlots, maxValue, 1),
    currentPath: barsPath(currentSlots, maxValue, currentWidth),
  };
}
