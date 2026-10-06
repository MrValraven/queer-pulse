// ── Masonry placement, pure ─────────────────────────────────────────────────
// The pure column-picking and top-writing math behind `useMasonryLayout`,
// pulled out so a plain-array unit test can exercise it directly, with no
// real DOM involved.
//
// Placement rule: every card goes to the column whose next top is currently
// lowest, ties keep the leftmost column. Full-width rows sit below every
// column and every column continues underneath them. The planner itself
// keeps no memory between passes; the caller brings any it needs.
//
// Order guarantee: this also keeps every card's top at or after the top of
// the card before it in DOM order (WCAG 2.4.3, focus order matches reading
// order), and it falls straight out of the packing rule: between two cards,
// only the column the first card was placed in changes, and it only grows,
// so the lowest column-next-top available to the second card can never be
// smaller than the top the first card was given.
//
// Pinned columns: the caller may pass `pinnedColumns`, the column a card
// must keep this pass. `useMasonryLayout` pins every card the reader has
// seen to the column it had on the previous pass, so a seen card never
// changes column. A pinned card is stacked at the bottom of its own column
// in DOM order, so when a card above it grows or shrinks (a fold opening
// or closing), only the cards below it in that column slide, and each
// column stays contiguous. Cards without a pin (below the fold, never
// seen, or brand new) still go to the shortest column: they sit out of
// sight, so moving them is invisible, and they settle at their real
// heights. The order guarantee above holds across a run of freely packed
// cards. Around pinned cards it can lapse once a card has folded in place,
// and each column still reads top to bottom.

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
  /** Optional: the column each pinned child keeps this pass, in place of the
   *  shortest one (see "Pinned columns" at the top). A child with no valid
   *  entry here, and every full-width row, is placed by the usual rule. */
  pinnedColumns?: (number | undefined)[];
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

/** The pinned column for one child, or null when it has none this pass (an
 *  unpinned child, or a column that no longer exists). */
function pinnedColumnFor(
  pinnedColumns: (number | undefined)[] | undefined,
  index: number,
  columnCount: number,
): number | null {
  const pinnedColumn = pinnedColumns?.[index];
  if (pinnedColumn === undefined) return null;
  const isValidColumn =
    Number.isInteger(pinnedColumn) &&
    pinnedColumn >= 0 &&
    pinnedColumn < columnCount;
  return isValidColumn ? pinnedColumn : null;
}

/**
 * Places every child into a column, in DOM order, and returns the top each
 * one should paint at.
 *
 * Every regular card goes to whichever column's next slot is currently
 * lowest, or to its pinned column when `pinnedColumns` gives it one. Full-width
 * rows keep the original rule (the tallest column's next slot), since they
 * already sit below every column in play.
 */
export function planMasonry({
  heights,
  fullWidth,
  columnCount,
  gap,
  pinnedColumns,
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
      columnIndex =
        pinnedColumnFor(pinnedColumns, index, columnCount) ??
        indexOfShortestColumn(columnNextTops);
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
