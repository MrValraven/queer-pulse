import { useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useWindowVirtualizer, type Virtualizer } from "@tanstack/react-virtual";
import type { MemberCard } from "./memberDirectoryFilter.data";

/** Mirrors `.mGrid`'s `repeat(auto-fill, minmax(280px, 1fr))` / `gap: 14px`
 *  (`MemberDirectoryFilterPage.module.css`) so the row grouping below produces
 *  exactly the column count that CSS grid would have laid out on its own —
 *  keep these two in sync if that rule ever changes. */
const MIN_CARD_WIDTH_PX = 280;
const GRID_GAP_PX = 14;
/** Rough pre-measurement guess for one row's height (avatar + name + the
 *  two-line-reserved role + a tag row + the footer, per `.mCard`) —
 *  `measureElement` (wired in `MemberResultsGrid`) corrects it to the real
 *  rendered height on first paint, same as
 *  `useMessageRowVirtualizer`'s `estimateRowHeight`. */
const ESTIMATED_ROW_HEIGHT_PX = 236;

export interface MemberDirectoryVirtualizerResult {
  /** Attach to the grid's own wrapper. Both its measured width (column
   *  count) and its position on the page (the virtualizer's `scrollMargin` —
   *  the whole page, not a bounded box, is what scrolls here) are read off
   *  this node. */
  containerRef: RefObject<HTMLDivElement | null>;
  /** How many cards fit per row at the container's current width. */
  columnCount: number;
  /** `members` grouped into `columnCount`-sized rows — one virtualized item
   *  per row, matching the CSS grid's own line-wrapping. */
  rows: MemberCard[][];
  rowVirtualizer: Virtualizer<Window, Element>;
}

/**
 * Windows the member-directory results grid so a fully-scrolled, heavily
 * filtered directory mounts only the rows near the viewport instead of every
 * card fetched so far (was `useIncrementalList`, which only capped the
 * *initial* mount — every revealed card stayed mounted forever once
 * scrolled into view; see that hook's own doc comment).
 *
 * The grid is a normal part of the page's document flow (scrolled by the
 * window, not a bounded `overflow` box — `PullToRefresh` is deliberately used
 * here without its `scrollable` prop, see that component's doc comment), so
 * this uses `useWindowVirtualizer` rather than `MessageArea`'s
 * bounded-container `useVirtualizer`, and groups cards into rows of
 * `columnCount` so one virtual item covers one grid row — the multi-column
 * shape `useMessageRowVirtualizer`'s single-column chat log doesn't have to
 * solve.
 */
export function useMemberDirectoryVirtualizer(
  members: MemberCard[],
): MemberDirectoryVirtualizerResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(1);
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const recomputeColumnCount = () => {
      const width = node.getBoundingClientRect().width;
      const fitted = Math.floor(
        (width + GRID_GAP_PX) / (MIN_CARD_WIDTH_PX + GRID_GAP_PX),
      );
      setColumnCount((previous) => Math.max(1, fitted) || previous);
    };
    // Position, not just size, matters for `scrollMargin`: content ABOVE the
    // grid (the header skeleton swapping for the real header, the applied
    // filter chips row appearing/disappearing) shifts the grid down the page
    // without the grid's own box ever resizing — so this is driven by a
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
  }, []);

  const rows = useMemo(() => {
    const grouped: MemberCard[][] = [];
    for (let index = 0; index < members.length; index += columnCount) {
      grouped.push(members.slice(index, index + columnCount));
    }
    return grouped;
  }, [members, columnCount]);

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ESTIMATED_ROW_HEIGHT_PX,
    // A little deeper than the default so a fast scroll or a keyboard "page
    // down" doesn't outrun the mounted window and flash empty space.
    overscan: 4,
    scrollMargin,
    getItemKey: (index) =>
      rows[index]?.map((member) => member.slug).join("|") ?? index,
  });

  return { containerRef, columnCount, rows, rowVirtualizer };
}
