// ── Masonry placement, pure ─────────────────────────────────────────────────
// The pure column-picking and top-writing math behind `useMasonryLayout`,
// pulled out so a plain-array unit test can exercise it directly, with no
// real DOM involved.
//
// Placement rule: every card goes to the column whose next top is currently
// lowest, ties keep the leftmost column. Full-width rows sit below every
// column and every column continues underneath them. There is no memory of
// where a card sat on a previous pass, so a removal or a height change
// simply repacks the whole feed from scratch on the next layout, and no card
// is ever padded down to a stale slot.
//
// Order guarantee: this also keeps every card's top at or after the top of
// the card before it in DOM order (WCAG 2.4.3, focus order matches reading
// order), and it falls straight out of the packing rule: between two cards,
// only the column the first card was placed in changes, and it only grows,
// so the lowest column-next-top available to the second card can never be
// smaller than the top the first card was given.

/** One planning pass over every direct child, in DOM order. Every array is
 *  indexed the same way as the children themselves. */
export interface MasonryPlanInput {
  /** Each child's measured height in pixels. */
  heights: number[];
  /** Whether each child is a full-width row (sits below every column). */
  fullWidth: boolean[];
  /** How many columns the current layout has. */
  columnCount: number;
  /** Space below every card, both across and down columns. */
  gap: number;
}

export interface MasonryPlanResult {
  /** The column each child was placed in this pass. */
  columns: number[];
  /** The top each child was placed at this pass. */
  tops: number[];
  /** The bottom of the tallest column, for the container's own height. */
  contentBottom: number;
}

/** The column with the least content queued in it. A tie keeps the
 *  leftmost column. */
function indexOfShortestColumn(columnNextTops: number[]): number {
  let shortestIndex = 0;
  columnNextTops.forEach((nextTop, index) => {
    if (nextTop < (columnNextTops[shortestIndex] ?? 0)) shortestIndex = index;
  });
  return shortestIndex;
}

/**
 * Places every child into a column, in DOM order, and returns the top each
 * one should paint at.
 *
 * Every regular card goes to whichever column's next slot is currently
 * lowest. Full-width rows keep the original rule (the tallest column's next
 * slot), since they already sit below every column in play.
 */
export function planMasonry({
  heights,
  fullWidth,
  columnCount,
  gap,
}: MasonryPlanInput): MasonryPlanResult {
  const columnNextTops: number[] = Array.from({ length: columnCount }, () => 0);
  const columns: number[] = [];
  const tops: number[] = [];
  let contentBottom = 0;

  heights.forEach((height, index) => {
    const isFullWidth = fullWidth[index] ?? false;
    let columnIndex: number;
    let top: number;

    if (isFullWidth) {
      columnIndex = 0;
      top = Math.max(...columnNextTops);
    } else {
      columnIndex = indexOfShortestColumn(columnNextTops);
      top = columnNextTops[columnIndex] ?? 0;
    }

    columns.push(columnIndex);
    tops.push(top);

    // An empty child (the pager wrapper once the feed is exhausted) takes no
    // room, so it adds no gap either.
    if (height === 0) return;
    const nextTop = top + height + gap;
    if (isFullWidth) columnNextTops.fill(nextTop);
    else columnNextTops[columnIndex] = nextTop;
    contentBottom = Math.max(contentBottom, top + height);
  });

  return { columns, tops, contentBottom };
}
