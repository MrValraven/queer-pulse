import { useLayoutEffect, type RefObject } from "react";

// ── Feed masonry ────────────────────────────────────────────────────────────
// Feed cards run very different heights (a new-member card with a bio and
// tags is far taller than a gathering card), so a row-based grid leaves a hole
// under every short card. This hook packs the container's DIRECT children into
// columns instead: each card drops into whichever column is currently
// shortest, so it sits a constant gap below the card above it.
//
// The DOM keeps feed order, so tab order, screen readers and infinite-scroll
// appends are untouched; only the paint positions move. Positions use
// `top`/`left` because the `.cardReveal` wrappers already animate `transform`
// (the `sbReveal` keyframes) and `.leaving` transforms the whole list.
//
// With one column (phones, or before the container has a width) every inline
// style is cleared and the CSS fallback on `.grid` (a flex column with the same
// gap) renders the list in normal flow.
//
// Column locks: a card the reader can see, or has scrolled past, keeps the
// column it was first given. Offscreen cards start at the `content-visibility`
// placeholder height and resolve to their real height as they near the
// viewport; re-packing everything by "shortest column" at that moment could
// move a visible card sideways. With the lock, a height change on screen only
// pushes the later cards in the same column down (normal flow), and only cards
// below the fold rebalance. A change in column count drops every lock, so a
// resize re-packs the whole feed.

/** Narrowest a column may get before the layout drops to fewer columns. Same
 *  floor the old `auto-fill` / `minmax(320px, 1fr)` grid used. */
const MIN_COLUMN_WIDTH = 320;

/** Space between cards, both across and down. Mirrors the `gap` on `.grid` in
 *  FeedPage.module.css, which the one-column fallback uses. */
const COLUMN_GAP = 14;

/** Marks a direct child as a full-width row (the empty/error panels and the
 *  infinite-scroll pager). It sits below the tallest column, and every column
 *  continues underneath it. */
const FULL_WIDTH_ATTRIBUTE = "data-masonry-full";

const CONTAINER_STYLE_PROPERTIES = ["position", "height"] as const;
const CHILD_STYLE_PROPERTIES = ["position", "width", "left", "top"] as const;

function columnCountFor(containerWidth: number): number {
  return Math.max(
    1,
    Math.floor((containerWidth + COLUMN_GAP) / (MIN_COLUMN_WIDTH + COLUMN_GAP)),
  );
}

/** Rounded to two decimals so the value reads back from `style` exactly as it
 *  was written, which keeps `setStyleIfChanged` from rewriting it every pass. */
function toPixels(value: number): string {
  return `${Math.round(value * 100) / 100}px`;
}

/** Skips identical writes, so a relayout that changes nothing dirties nothing
 *  and cannot feed the ResizeObserver another round. */
function setStyleIfChanged(
  element: HTMLElement,
  property: string,
  value: string,
) {
  if (element.style.getPropertyValue(property) !== value) {
    element.style.setProperty(property, value);
  }
}

function directChildrenOf(container: HTMLElement): HTMLElement[] {
  return Array.from(container.children).filter(
    (childElement): childElement is HTMLElement =>
      childElement instanceof HTMLElement,
  );
}

function clearMasonryStyles(container: HTMLElement) {
  CONTAINER_STYLE_PROPERTIES.forEach((property) =>
    container.style.removeProperty(property),
  );
  directChildrenOf(container).forEach((childElement) =>
    CHILD_STYLE_PROPERTIES.forEach((property) =>
      childElement.style.removeProperty(property),
    ),
  );
}

/** Per-hook-instance memory of which column each card was placed in, valid
 *  for one column count. */
interface ColumnLocks {
  columnCount: number;
  columnByChild: WeakMap<HTMLElement, number>;
}

function indexOfShortestColumn(columnNextTops: number[]): number {
  let shortestIndex = 0;
  columnNextTops.forEach((nextTop, index) => {
    // Strictly shorter, so a tie keeps the leftmost column.
    if (nextTop < (columnNextTops[shortestIndex] ?? 0)) shortestIndex = index;
  });
  return shortestIndex;
}

/** The column for a regular card. A card that already has a column and whose
 *  last written top starts above the viewport bottom (on screen, or scrolled
 *  past) keeps it; any other card takes the shortest column. The choice is
 *  stored either way. */
function pickColumn(
  childElement: HTMLElement,
  columnNextTops: number[],
  columnLocks: ColumnLocks,
  viewportBottom: number,
): number {
  const lockedColumn = columnLocks.columnByChild.get(childElement);
  // The inline `top` still holds the previous pass's value here, since this
  // pass writes it only after picking the column.
  const previousTop = Number.parseFloat(childElement.style.top);
  const isOnOrAboveScreen =
    !Number.isNaN(previousTop) && previousTop < viewportBottom;
  const columnIndex =
    lockedColumn !== undefined && isOnOrAboveScreen
      ? lockedColumn
      : indexOfShortestColumn(columnNextTops);
  columnLocks.columnByChild.set(childElement, columnIndex);
  return columnIndex;
}

/** One full layout pass, batched as write widths, read heights, write
 *  positions, so the browser lays out at most twice however many cards there
 *  are. */
function layoutMasonry(container: HTMLElement, columnLocks: ColumnLocks) {
  const containerWidth = container.clientWidth;
  const columnCount = columnCountFor(containerWidth);
  if (columnLocks.columnCount !== columnCount) {
    columnLocks.columnCount = columnCount;
    columnLocks.columnByChild = new WeakMap();
  }
  if (columnCount < 2) {
    clearMasonryStyles(container);
    return;
  }

  const childElements = directChildrenOf(container);
  const columnWidth =
    (containerWidth - COLUMN_GAP * (columnCount - 1)) / columnCount;
  const columnWidthValue = toPixels(columnWidth);

  // Write: take every child out of flow at its final width, so the heights
  // read next are the heights it will paint at.
  setStyleIfChanged(container, "position", "relative");
  childElements.forEach((childElement) => {
    setStyleIfChanged(childElement, "position", "absolute");
    setStyleIfChanged(
      childElement,
      "width",
      childElement.hasAttribute(FULL_WIDTH_ATTRIBUTE)
        ? "100%"
        : columnWidthValue,
    );
  });

  // Read: one forced layout for every height, plus where the bottom of the
  // viewport falls in the container's own coordinates.
  const childHeights = childElements.map(
    (childElement) => childElement.offsetHeight,
  );
  const viewportBottom =
    window.innerHeight - container.getBoundingClientRect().top;

  // Place in DOM order. `columnNextTops` holds where the next card in each
  // column would start, with the gap below the previous card already added.
  const columnNextTops: number[] = Array.from({ length: columnCount }, () => 0);
  let contentBottom = 0;
  childElements.forEach((childElement, index) => {
    const childHeight = childHeights[index] ?? 0;
    const isFullWidth = childElement.hasAttribute(FULL_WIDTH_ATTRIBUTE);
    const columnIndex = isFullWidth
      ? 0
      : pickColumn(childElement, columnNextTops, columnLocks, viewportBottom);
    const top = isFullWidth
      ? Math.max(...columnNextTops)
      : (columnNextTops[columnIndex] ?? 0);

    setStyleIfChanged(childElement, "top", toPixels(top));
    setStyleIfChanged(
      childElement,
      "left",
      toPixels(columnIndex * (columnWidth + COLUMN_GAP)),
    );

    // An empty child (the pager wrapper once the feed is exhausted) takes no
    // room, so it adds no gap either.
    if (childHeight === 0) return;
    const nextTop = top + childHeight + COLUMN_GAP;
    if (isFullWidth) columnNextTops.fill(nextTop);
    else columnNextTops[columnIndex] = nextTop;
    contentBottom = Math.max(contentBottom, top + childHeight);
  });

  // Out-of-flow children give the container no height of its own. It needs
  // the real one before paint: useSequencedTabSwap reads it to ease the tab
  // viewport, and the page below must not collapse over the cards.
  setStyleIfChanged(container, "height", toPixels(contentBottom));
}

/**
 * Lays the direct children of `containerRef` out as a masonry of
 * `MIN_COLUMN_WIDTH`-wide columns (see the block comment at the top). Cards
 * on screen or above it keep their column across relayouts (column locks,
 * also described at the top); the locks live as long as this effect.
 *
 * `widthProbeRef` is a zero-height element in normal flow beside the
 * container, with the container's width. Width changes are observed on the
 * probe because the container's own box changes height on every relayout: a
 * ResizeObserver entry for it would arrive one level above the children that
 * caused it, which the browser defers to the next frame and reports as a
 * "ResizeObserver loop" error. The probe only ever changes when the width
 * does.
 *
 * Relayout triggers:
 * - once, synchronously, in a layout effect, so the first paint is already
 *   packed. The caller must be a component that renders the container (a
 *   child of FeedPage), so this runs before FeedPage's own layout effects
 *   measure the list height.
 * - a ResizeObserver on the probe (width) and on every child (a font or
 *   image arriving, an offscreen card rendering, a card expanding). Its
 *   callbacks run after layout and before paint, so nothing flashes.
 * - a MutationObserver on the container's child list, so cards appended by
 *   pagination, or swapped in by the loading and empty states, are observed
 *   and placed.
 *
 * Without ResizeObserver (jsdom) the hook does nothing and the CSS fallback
 * renders.
 */
export function useMasonryLayout(
  containerRef: RefObject<HTMLElement | null>,
  widthProbeRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    const widthProbe = widthProbeRef.current;
    if (!container || !widthProbe) return;
    if (
      typeof ResizeObserver === "undefined" ||
      typeof MutationObserver === "undefined"
    ) {
      return;
    }

    const columnLocks: ColumnLocks = {
      columnCount: 0,
      columnByChild: new WeakMap(),
    };
    const relayout = () => layoutMasonry(container, columnLocks);
    relayout();

    const sizeObserver = new ResizeObserver(relayout);
    sizeObserver.observe(widthProbe);
    directChildrenOf(container).forEach((childElement) =>
      sizeObserver.observe(childElement),
    );

    const childListObserver = new MutationObserver((mutations) => {
      // Records arrive in order, so a node React moves (removed, then added
      // back) ends up observed.
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node instanceof HTMLElement) sizeObserver.unobserve(node);
        });
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) sizeObserver.observe(node);
        });
      });
      relayout();
    });
    childListObserver.observe(container, { childList: true });

    return () => {
      childListObserver.disconnect();
      sizeObserver.disconnect();
      clearMasonryStyles(container);
    };
  }, [containerRef, widthProbeRef]);
}
