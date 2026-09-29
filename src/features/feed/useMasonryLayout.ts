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
// Placement: every relayout repacks every direct child from scratch with
// plain shortest-column placement (`planMasonry` in `masonryPlan.ts`), so a
// card always goes to whichever column currently has the least content
// queued in it. There is no memory of where a card sat on a previous pass,
// so a removed card's neighbours slide straight into its old slot, closing
// the space it left, and a height change anywhere simply repacks around it.
//
// Order guarantee: this placement also keeps every card's top at or after
// the top of the card before it in DOM order (WCAG 2.4.3, focus order
// matches reading order). See the comment on `planMasonry` for why that
// holds by construction.

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

/** One full layout pass, batched as write widths, read heights, write
 *  positions, so the browser lays out at most twice however many cards there
 *  are. Repacks every direct child from scratch each time (see the block
 *  comment at the top), so it needs no memory between passes. */
function layoutMasonry(container: HTMLElement) {
  const containerWidth = container.clientWidth;
  const columnCount = columnCountFor(containerWidth);
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
}

/**
 * Lays the direct children of `containerRef` out as a masonry of
 * `MIN_COLUMN_WIDTH`-wide columns (see the block comment at the top). Every
 * relayout repacks every card from its currently measured height, so a
 * removal or a resize never leaves a stale slot behind.
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

    const relayout = () => layoutMasonry(container);
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
