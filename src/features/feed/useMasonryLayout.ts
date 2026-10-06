import { useLayoutEffect, type RefObject } from "react";
import { planMasonry } from "./masonryPlan";

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
// Placement: a card the reader has seen keeps its column. Each pass
// remembers the column every card got. At the start of the next pass, a
// remembered card whose painted top sits above the bottom of the viewport
// (on screen, or scrolled past) is pinned to that column, and it stays
// pinned for as long as the column count holds. `planMasonry` (in
// `masonryPlan.ts`) stacks every pinned card at the bottom of its own
// column, in DOM order, and drops every other card (below the fold, never
// seen, or brand new) into whichever column currently has the least
// content queued in it.
//
// Why: the reader keeps the layout they have seen in their head, so a seen
// card hopping to the other column reads as the feed reordering itself.
// With pins, expanding or collapsing a card (the people-joined "Show all"
// fold, the interest-tag "+N" fold, a bio's "Read more") only slides the
// cards below it in its own column, in step with its height, one
// ResizeObserver pass per frame. Cards below the fold repack freely,
// because moving them is invisible, and that repacking also corrects the
// 320px `content-visibility` placeholder heights (`FeedCard.module.css`)
// once a card's real height arrives. Removing a card closes the gap within
// its column, and appends and tab swaps place their new cards by the
// shortest-column rule.
//
// Fresh pack: a change in the column count (a resize across the
// breakpoint) or a drop to one column clears every remembered column and
// pin, so the next multi-column pass packs the whole feed from scratch.
//
// Order guarantee: free packing keeps every card's top at or after the top
// of the card before it in DOM order (WCAG 2.4.3, focus order matches
// reading order); see the comment on `planMasonry` for why that holds by
// construction. Around pinned cards it can lapse once a card has folded in
// place, and each column still reads top to bottom.
//
// Every relayout is instant. That also needs the `.grid > *` rule in
// FeedPage.module.css, which keeps reduced motion's forced 0.01ms
// transitions off the inline `top`/`left`/`width`, so a position lands in
// the frame it is written.

/** Narrowest a column may get before the layout drops to fewer columns. Same
 *  floor the old `auto-fill` / `minmax(320px, 1fr)` grid used. */
const MIN_COLUMN_WIDTH = 320;

/** Space between cards, both across and down. Mirrors `--feed-grid-gap` on
 *  `.grid` in FeedPage.module.css (its `gap`, which the one-column fallback
 *  uses). */
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
  directChildrenOf(container).forEach((childElement) => {
    CHILD_STYLE_PROPERTIES.forEach((property) =>
      childElement.style.removeProperty(property),
    );
  });
}

/** What one pass leaves for the next: the column count it packed for, the
 *  column each card got, and the cards the reader has seen (pinned to the
 *  column they had). Keyed by element, so a card React moves keeps its
 *  entry and a removed card's entry goes with it. */
interface MasonryMemory {
  columnCount: number;
  rememberedColumns: WeakMap<HTMLElement, number>;
  pinnedElements: WeakSet<HTMLElement>;
}

function createMasonryMemory(columnCount = 0): MasonryMemory {
  return {
    columnCount,
    rememberedColumns: new WeakMap(),
    pinnedElements: new WeakSet(),
  };
}

/** Whether a card has been in front of the reader: its painted top is above
 *  the bottom of the viewport, so it is on screen or scrolled past. */
function hasBeenSeen(element: HTMLElement): boolean {
  return element.getBoundingClientRect().top < window.innerHeight;
}

/** The column each child must keep this pass, indexed like `childElements`:
 *  the remembered column for a pinned card, undefined for every other one.
 *  A card with a remembered column is pinned the first pass it has been
 *  seen, and stays pinned until the column count changes. Only reads, so
 *  it runs before the pass writes anything. */
function pinnedColumnsFor(
  memory: MasonryMemory,
  childElements: HTMLElement[],
): (number | undefined)[] {
  return childElements.map((childElement) => {
    const rememberedColumn = memory.rememberedColumns.get(childElement);
    if (rememberedColumn === undefined) return undefined;
    if (memory.pinnedElements.has(childElement)) return rememberedColumn;
    if (!hasBeenSeen(childElement)) return undefined;
    memory.pinnedElements.add(childElement);
    return rememberedColumn;
  });
}

/** One full layout pass, batched as read pins, write widths, read heights,
 *  write positions, so the browser lays out at most twice however many
 *  cards there are. Cards the reader has seen keep the column `memory`
 *  remembers for them; every other card goes to the shortest column (see
 *  the block comment at the top). */
function layoutMasonry(container: HTMLElement, memory: MasonryMemory) {
  const containerWidth = container.clientWidth;
  const columnCount = columnCountFor(containerWidth);
  if (columnCount < 2) {
    clearMasonryStyles(container);
    Object.assign(memory, createMasonryMemory());
    return;
  }
  // A new column count is a new layout: forget every column and pin, and
  // pack the whole feed fresh.
  if (memory.columnCount !== columnCount) {
    Object.assign(memory, createMasonryMemory(columnCount));
  }

  const childElements = directChildrenOf(container);
  // Read: where each remembered card is painted right now, before anything
  // moves, in the same layout as the width read above.
  const pinnedColumns = pinnedColumnsFor(memory, childElements);

  const columnWidth =
    (containerWidth - COLUMN_GAP * (columnCount - 1)) / columnCount;
  const columns = placeChildren(
    container,
    childElements,
    columnCount,
    columnWidth,
    pinnedColumns,
  );

  childElements.forEach((childElement, index) => {
    const columnIndex = columns[index];
    const isFullWidth = childElement.hasAttribute(FULL_WIDTH_ATTRIBUTE);
    if (columnIndex !== undefined && !isFullWidth) {
      memory.rememberedColumns.set(childElement, columnIndex);
    }
  });
}

/** Writes every child's width, reads every height, plans, then writes every
 *  position and the container's height. Returns the column each child got. */
function placeChildren(
  container: HTMLElement,
  childElements: HTMLElement[],
  columnCount: number,
  columnWidth: number,
  pinnedColumns: (number | undefined)[],
): number[] {
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

  // Read: one forced layout for every height.
  const childHeights = childElements.map(
    (childElement) => childElement.offsetHeight,
  );
  const fullWidthFlags = childElements.map((childElement) =>
    childElement.hasAttribute(FULL_WIDTH_ATTRIBUTE),
  );

  // Plan in DOM order, then write the styles the plan chose.
  const { columns, tops, contentBottom } = planMasonry({
    heights: childHeights,
    fullWidth: fullWidthFlags,
    columnCount,
    gap: COLUMN_GAP,
    pinnedColumns,
  });

  childElements.forEach((childElement, index) => {
    const columnIndex = columns[index] ?? 0;
    const top = tops[index] ?? 0;
    setStyleIfChanged(childElement, "top", toPixels(top));
    setStyleIfChanged(
      childElement,
      "left",
      toPixels(columnIndex * (columnWidth + COLUMN_GAP)),
    );
  });

  // Out-of-flow children give the container no height of its own. It needs
  // the real one before paint: useSequencedTabSwap reads it to ease the tab
  // viewport, and the page below must not collapse over the cards.
  setStyleIfChanged(container, "height", toPixels(contentBottom));
  return columns;
}

/**
 * Lays the direct children of `containerRef` out as a masonry of
 * `MIN_COLUMN_WIDTH`-wide columns (see the block comment at the top). A card
 * the reader has seen keeps the column it had, so a card folding open or shut
 * only slides the cards below it in its own column; every card below the
 * fold packs into the shortest column from its currently measured height. A
 * change in the column count packs the whole feed fresh.
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

    const memory = createMasonryMemory();
    const relayout = () => layoutMasonry(container, memory);
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
