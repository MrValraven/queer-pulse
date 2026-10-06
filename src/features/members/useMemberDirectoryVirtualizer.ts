import { useLayoutEffect, useMemo, useState, type RefObject } from "react";
import {
  useWindowVirtualizer,
  type Virtualizer,
} from "@tanstack/react-virtual";
import type { MemberCard } from "./memberDirectoryFilter.data";

/** Mirror the grid rules in `MemberDirectoryFilterPage.module.css` so the row
 *  grouping below produces exactly the column count CSS grid would lay out on
 *  its own; keep each pair in sync if its rule changes. The compact card
 *  mirrors `.mGrid`'s `repeat(auto-fill, minmax(280px, 1fr))`. The split card
 *  mirrors `.mGridSplit`'s `minmax(420px, 1fr)`: its 30% portrait column
 *  needs a wider card, so the results area holds two cards at 1280 to 1440
 *  with the filters open, and three once the filters collapse on a wide
 *  screen. Both grids use `gap: 14px`. */
const COMPACT_MIN_CARD_WIDTH_PX = 280;
const SPLIT_MIN_CARD_WIDTH_PX = 420;
const GRID_GAP_PX = 14;
/** Rough pre-measurement guesses for one row's height, including the row's
 *  14px bottom padding. A compact row is the avatar head, the two-line role,
 *  a tag row and the footer (`.mCard`). A split row measured 223 to 275px
 *  at 1024 to 1440, as its narrower details column wraps tags and footer more
 *  often. `measureElement` (wired in `MemberResultsGrid`) corrects either to
 *  the real rendered height on first paint, same as
 *  `useMessageRowVirtualizer`'s `estimateRowHeight`. */
const COMPACT_ESTIMATED_ROW_HEIGHT_PX = 236;
const SPLIT_ESTIMATED_ROW_HEIGHT_PX = 240;

export interface MemberDirectoryVirtualizerResult {
  /** How many cards fit per row at the container's current width. */
  columnCount: number;
  /** `members` grouped into `columnCount`-sized rows, one virtualized item
   *  per row, matching the CSS grid's own line-wrapping. */
  rows: MemberCard[][];
  rowVirtualizer: Virtualizer<Window, Element>;
}

/**
 * Windows the member-directory results grid so a fully-scrolled, heavily
 * filtered directory mounts only the rows near the viewport instead of every
 * card fetched so far (was `useIncrementalList`, which only capped the
 * *initial* mount: every revealed card stayed mounted forever once
 * scrolled into view; see that hook's own doc comment).
 *
 * The grid is a normal part of the page's document flow (scrolled by the
 * window, not a bounded `overflow` box; `PullToRefresh` is deliberately used
 * here without its `scrollable` prop, see that component's doc comment), so
 * this uses `useWindowVirtualizer` rather than `MessageArea`'s
 * bounded-container `useVirtualizer`, and groups cards into rows of
 * `columnCount` so one virtual item covers one grid row, the multi-column
 * shape `useMessageRowVirtualizer`'s single-column chat log doesn't have to
 * solve.
 */
export function useMemberDirectoryVirtualizer(
  members: MemberCard[],
  /** The grid's own wrapper, owned by the caller (`MemberResultsGrid`) so
   *  `useShuffledMembers` can measure the same node. Both its measured width
   *  (column count) and its position on the page (the virtualizer's
   *  `scrollMargin`: the whole page is what scrolls here) are read off it. */
  containerRef: RefObject<HTMLDivElement | null>,
  /** True during a result-set shuffle (`useShuffledMembers`): a row
   *  re-measured mid-shuffle then leaves the window scroll where it is, so the
   *  gliding cards and fading ghosts keep their painted positions. It turns
   *  true in the commit before the swap, ahead of the rows the swap commit
   *  mounts and measures. */
  shouldSuspendScrollAdjustment: boolean,
  /** Whether the cards render split (`useIsMemberCardSplit`), which sets the
   *  minimum card width and the row-height estimate. */
  isSplit: boolean,
): MemberDirectoryVirtualizerResult {
  const minCardWidth = isSplit
    ? SPLIT_MIN_CARD_WIDTH_PX
    : COMPACT_MIN_CARD_WIDTH_PX;
  const estimatedRowHeight = isSplit
    ? SPLIT_ESTIMATED_ROW_HEIGHT_PX
    : COMPACT_ESTIMATED_ROW_HEIGHT_PX;
  const [columnCount, setColumnCount] = useState(1);
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const recomputeColumnCount = () => {
      const width = node.getBoundingClientRect().width;
      const fitted = Math.floor(
        (width + GRID_GAP_PX) / (minCardWidth + GRID_GAP_PX),
      );
      setColumnCount((previous) => Math.max(1, fitted) || previous);
    };
    // Position, not just size, matters for `scrollMargin`: content ABOVE the
    // grid (the header skeleton swapping for the real header, the applied
    // filter chips row appearing/disappearing) shifts the grid down the page
    // without the grid's own box ever resizing, so this is driven by a
    // `document.body` observer, not just the grid's own ResizeObserver below.
    const recomputeScrollMargin = () => {
      const top = node.getBoundingClientRect().top + window.scrollY;
      setScrollMargin((previous) => (previous === top ? previous : top));
    };

    recomputeColumnCount();
    recomputeScrollMargin();

    const columnObserver = new ResizeObserver(recomputeColumnCount);
    columnObserver.observe(node);
    const positionObserver = new ResizeObserver(recomputeScrollMargin);
    positionObserver.observe(document.body);
    window.addEventListener("resize", recomputeScrollMargin);

    return () => {
      columnObserver.disconnect();
      positionObserver.disconnect();
      window.removeEventListener("resize", recomputeScrollMargin);
    };
  }, [containerRef, minCardWidth]);

  const rows = useMemo(() => {
    const grouped: MemberCard[][] = [];
    for (let index = 0; index < members.length; index += columnCount) {
      grouped.push(members.slice(index, index + columnCount));
    }
    return grouped;
  }, [members, columnCount]);

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => estimatedRowHeight,
    // A little deeper than the default so a fast scroll or a keyboard "page
    // down" doesn't outrun the mounted window and flash empty space.
    overscan: 4,
    scrollMargin,
    // Rows keep the default index keys: a row element and its measured
    // height survive a result-set change, and cards move between rows by
    // their own slug keys (the shuffle's shared `layoutId` covers that).
  });

  // TanStack Virtual exposes this predicate only as an instance field;
  // `undefined` restores its default compensation.
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- TanStack Virtual v3.17 exposes this predicate only as a public instance field (no option exists), and the instance is a stable object owned by useWindowVirtualizer.
    rowVirtualizer.shouldAdjustScrollPositionOnItemSizeChange =
      shouldSuspendScrollAdjustment ? () => false : undefined;
  }, [rowVirtualizer, shouldSuspendScrollAdjustment]);

  return { columnCount, rows, rowVirtualizer };
}
