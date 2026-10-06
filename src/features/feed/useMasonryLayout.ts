import { useLayoutEffect, type RefObject } from "react";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
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
// queued in it. A removed card's neighbours slide straight into its old
// slot, closing the space it left, and a height change anywhere simply
// repacks around it.
//
// Order guarantee: this placement also keeps every card's top at or after
// the top of the card before it in DOM order (WCAG 2.4.3, focus order
// matches reading order). See the comment on `planMasonry` for why that
// holds by construction.
//
// Hold: a card that animates its own height (the people-joined "Show all"
// fold, the interest-tag "+N" fold, a bio's "Read more") marks the moving
// part with `data-masonry-hold` for as long as the animation runs. Plain
// repacking would let the cards after it hop between columns mid-animation,
// in one frame, the moment its bottom crosses the other column's bottom. So
// while any hold mark is inside the grid, each pass keeps every card in the
// column it had on the last pass without a hold, and only restacks the tops
// within those columns: the cards below the moving one slide with it. The
// only memory kept between passes is that last resting pass. A change to
// the card list or to the column count drops the hold for that pass and
// repacks normally, since the remembered columns no longer fit.
//
// Release: when the last hold mark goes, one plain repack restores the
// order guarantee, and every card it moves glides from where it was painted
// to its new spot (`glideFrom`), using the independent `translate`
// property through the Web Animations API. That leaves `transform` to the
// reveal and the exit fade, and leaves no inline style behind once the
// glide finishes. A relayout that lands while a glide is still running
// retargets that card's glide from where it is. Every other relayout
// (resize, appends, tab swaps, first paint) stays instant, and under
// reduced motion so does the release. "Instant" also needs the
// `.grid > *` rule in FeedPage.module.css, which keeps reduced motion's
// forced 0.01ms transitions off the inline `top`/`left`/`width`, so a
// position lands in the frame it is written.

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

/** Set, anywhere inside a card, by a part of it that is animating its own
 *  height. While one is present, relayouts keep every card's column (see
 *  "Hold" at the top). */
const HOLD_ATTRIBUTE = "data-masonry-hold";

/** Token and fallback for how long a released card takes to glide to its
 *  new spot, and the easing it glides with. */
const GLIDE_DURATION_TOKEN = "--dur-slow";
const GLIDE_DURATION_FALLBACK_MS = 400;
const GLIDE_EASING_TOKEN = "--ease";

/** A glide shorter than this (in pixels, either axis) is not worth playing. */
const GLIDE_MIN_DISTANCE = 0.5;

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

/** The glide each card is currently playing, if any. An entry leaves as soon
 *  as its glide finishes or is cancelled, so presence means "still moving". */
const runningGlides = new WeakMap<HTMLElement, Animation>();

function cancelGlide(element: HTMLElement) {
  runningGlides.get(element)?.cancel();
  runningGlides.delete(element);
}

function clearMasonryStyles(container: HTMLElement) {
  CONTAINER_STYLE_PROPERTIES.forEach((property) =>
    container.style.removeProperty(property),
  );
  directChildrenOf(container).forEach((childElement) => {
    cancelGlide(childElement);
    CHILD_STYLE_PROPERTIES.forEach((property) =>
      childElement.style.removeProperty(property),
    );
  });
}

/** What one pass leaves for the next: the last pass that placed every card
 *  freely (the columns a hold keeps to), and whether the latest pass held. */
interface MasonryMemory {
  restingChildren: HTMLElement[];
  restingColumns: number[];
  restingColumnCount: number;
  wasHolding: boolean;
}

function createMasonryMemory(): MasonryMemory {
  return {
    restingChildren: [],
    restingColumns: [],
    restingColumnCount: 0,
    wasHolding: false,
  };
}

function isSameChildList(
  previousChildren: HTMLElement[],
  childElements: HTMLElement[],
): boolean {
  return (
    previousChildren.length === childElements.length &&
    previousChildren.every(
      (previousChild, index) => previousChild === childElements[index],
    )
  );
}

/** The columns this pass must keep to, or undefined to pack freely: no hold
 *  is asked for, or the cards or the column count changed since the resting
 *  pass, so the remembered columns no longer describe this feed. */
function heldColumnsFor(
  memory: MasonryMemory,
  childElements: HTMLElement[],
  columnCount: number,
  isHoldRequested: boolean,
): number[] | undefined {
  const canHold =
    isHoldRequested &&
    memory.restingColumnCount === columnCount &&
    isSameChildList(memory.restingChildren, childElements);
  return canHold ? memory.restingColumns : undefined;
}

/** A time token such as "400ms" or "0.4s", in milliseconds. */
function durationTokenMs(styleSource: Element, token: string): number {
  const value = getComputedStyle(styleSource).getPropertyValue(token).trim();
  const amount = parseFloat(value);
  if (!Number.isFinite(amount)) return GLIDE_DURATION_FALLBACK_MS;
  return value.endsWith("ms") ? amount : amount * 1000;
}

/** The cards whose painted spot must be kept for a glide this pass: every
 *  card on a release, otherwise only the cards still gliding, so a relayout
 *  mid-glide carries on from where they are. Nothing under reduced motion,
 *  where a glide still running (the setting flipped mid-glide) stops too. */
function elementsToGlide(
  childElements: HTMLElement[],
  isRelease: boolean,
): HTMLElement[] {
  if (prefersReducedMotionNow()) {
    childElements.forEach(cancelGlide);
    return [];
  }
  if (isRelease) return childElements;
  return childElements.filter((childElement) =>
    runningGlides.has(childElement),
  );
}

/** Where a card was painted before a pass, and the `top`/`left` it had. */
interface PaintedSpot {
  box: DOMRect;
  position: string;
}

function positionOf(element: HTMLElement): string {
  return `${element.style.left} ${element.style.top}`;
}

function paintedSpotOf(element: HTMLElement): PaintedSpot {
  return {
    box: element.getBoundingClientRect(),
    position: positionOf(element),
  };
}

/**
 * FLIP: each card has already been written to its new `top`/`left`, so it is
 * offset by `translate` back to where it was painted and eased to nothing.
 * A card already gliding to a spot the pass did not change keeps its glide.
 * Reads every new box before starting any glide, so the browser lays out
 * once. The glide uses the Web Animations API, which applies no inline style
 * and drops its effect when it finishes, so nothing is left on the card.
 */
function glideFrom(candidates: HTMLElement[], paintedSpots: PaintedSpot[]) {
  const paintedBoxes: DOMRect[] = [];
  const elements = candidates.filter((element, index) => {
    const paintedSpot = paintedSpots[index];
    const isUnchangedGlide =
      runningGlides.has(element) &&
      paintedSpot?.position === positionOf(element);
    if (!paintedSpot || isUnchangedGlide) return false;
    paintedBoxes.push(paintedSpot.box);
    return true;
  });
  if (elements.length === 0) return;
  elements.forEach(cancelGlide);
  const settledBoxes = elements.map((element) =>
    element.getBoundingClientRect(),
  );
  const timing = glideTiming();
  elements.forEach((element, index) => {
    const paintedBox = paintedBoxes[index];
    const settledBox = settledBoxes[index];
    if (paintedBox && settledBox) {
      startGlide(element, paintedBox, settledBox, timing);
    }
  });
}

/** The glide's duration and easing, read from the motion tokens. */
function glideTiming(): KeyframeAnimationOptions {
  const rootElement = document.documentElement;
  const easing = getComputedStyle(rootElement)
    .getPropertyValue(GLIDE_EASING_TOKEN)
    .trim();
  return {
    duration: durationTokenMs(rootElement, GLIDE_DURATION_TOKEN),
    easing: easing || "ease",
  };
}

/** Offsets one card back to its painted box and eases it home. */
function startGlide(
  element: HTMLElement,
  paintedBox: DOMRect,
  settledBox: DOMRect,
  timing: KeyframeAnimationOptions,
) {
  const offsetX = paintedBox.left - settledBox.left;
  const offsetY = paintedBox.top - settledBox.top;
  const isTooShort =
    Math.abs(offsetX) < GLIDE_MIN_DISTANCE &&
    Math.abs(offsetY) < GLIDE_MIN_DISTANCE;
  if (isTooShort) return;

  const glide = element.animate(
    [{ translate: `${offsetX}px ${offsetY}px` }, { translate: "0px 0px" }],
    timing,
  );
  runningGlides.set(element, glide);
  glide.addEventListener("finish", () => {
    if (runningGlides.get(element) === glide) runningGlides.delete(element);
  });
}

/** One full layout pass, batched as write widths, read heights, write
 *  positions, so the browser lays out at most twice however many cards there
 *  are (a release reads every card's box once more, before and after).
 *  Repacks every direct child from scratch each time, unless a hold keeps
 *  the columns of the last resting pass in `memory` (see the block comment
 *  at the top). */
function layoutMasonry(container: HTMLElement, memory: MasonryMemory) {
  const containerWidth = container.clientWidth;
  const columnCount = columnCountFor(containerWidth);
  if (columnCount < 2) {
    clearMasonryStyles(container);
    Object.assign(memory, createMasonryMemory());
    return;
  }

  const childElements = directChildrenOf(container);
  const isHoldRequested =
    container.querySelector(`[${HOLD_ATTRIBUTE}]`) !== null;
  const heldColumns = heldColumnsFor(
    memory,
    childElements,
    columnCount,
    isHoldRequested,
  );
  const isRelease = memory.wasHolding && !isHoldRequested;
  const glidingElements = elementsToGlide(childElements, isRelease);
  // Read: where each card that may glide is painted right now, before
  // anything moves (mid-glide, that includes its current `translate`).
  const paintedSpots = glidingElements.map(paintedSpotOf);

  const columnWidth =
    (containerWidth - COLUMN_GAP * (columnCount - 1)) / columnCount;
  const columns = placeChildren(
    container,
    childElements,
    columnCount,
    columnWidth,
    heldColumns,
  );

  if (!heldColumns) {
    memory.restingChildren = childElements;
    memory.restingColumns = columns;
    memory.restingColumnCount = columnCount;
  }
  memory.wasHolding = heldColumns !== undefined;
  glideFrom(glidingElements, paintedSpots);
}

/** Writes every child's width, reads every height, plans, then writes every
 *  position and the container's height. Returns the column each child got. */
function placeChildren(
  container: HTMLElement,
  childElements: HTMLElement[],
  columnCount: number,
  columnWidth: number,
  heldColumns: number[] | undefined,
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
    heldColumns,
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
 * `MIN_COLUMN_WIDTH`-wide columns (see the block comment at the top). Every
 * relayout outside a hold repacks every card from its currently measured
 * height, so a removal or a resize never leaves a stale slot behind.
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
 * - a MutationObserver on `data-masonry-hold` anywhere inside the cards, so
 *   the pass after the last hold mark goes is the release, even when the
 *   fold's final height landed earlier and no size changes with it.
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

    const holdObserver = new MutationObserver(relayout);
    holdObserver.observe(container, {
      subtree: true,
      attributes: true,
      attributeFilter: [HOLD_ATTRIBUTE],
    });

    return () => {
      holdObserver.disconnect();
      childListObserver.disconnect();
      sizeObserver.disconnect();
      clearMasonryStyles(container);
    };
  }, [containerRef, widthProbeRef]);
}
