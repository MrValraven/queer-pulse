import {
  unobstructedViewportBand,
  type VerticalBand,
} from "./rowDragViewportBand";

/** How close to the top or bottom edge the pointer must come to scroll. */
const EDGE_ZONE_PX = 64;
/** Scroll speed with the pointer at (or past) the very edge. */
const MAX_SCROLL_PER_FRAME_PX = 18;
/** How long a measured band of pinned bars is trusted. A drag's first swap
 *  can raise the sticky save bar, so the band is re-read a few times a second. */
const BAND_REFRESH_MS = 250;

/** The nearest ancestor that scrolls vertically, or `null` for the window. */
function nearestScrollableAncestor(element: HTMLElement): HTMLElement | null {
  let ancestor = element.parentElement;
  while (
    ancestor &&
    ancestor !== document.body &&
    ancestor !== document.documentElement
  ) {
    const { overflowY } = getComputedStyle(ancestor);
    const isScrollable =
      overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";
    if (isScrollable && ancestor.scrollHeight > ancestor.clientHeight) {
      return ancestor;
    }
    ancestor = ancestor.parentElement;
  }
  return null;
}

/** The visible top and bottom of the scroll surface, in viewport terms,
 *  inside the part of the viewport the pinned bars leave uncovered. */
function visibleBandOf(
  scroller: HTMLElement | null,
  viewportBand: VerticalBand,
): VerticalBand {
  if (!scroller) return viewportBand;
  const rect = scroller.getBoundingClientRect();
  return {
    top: Math.max(rect.top, viewportBand.top),
    bottom: Math.min(rect.bottom, viewportBand.bottom),
  };
}

/** Pixels to scroll this frame: negative near the top, positive near the
 *  bottom, growing as the pointer nears the edge. */
function scrollStepFor(pointerY: number, band: VerticalBand): number {
  const proximity = (distanceFromEdge: number) =>
    Math.min(1, Math.max(0, (EDGE_ZONE_PX - distanceFromEdge) / EDGE_ZONE_PX));
  const upward = proximity(pointerY - band.top);
  if (upward > 0) return -Math.ceil(upward * MAX_SCROLL_PER_FRAME_PX);
  const downward = proximity(band.bottom - pointerY);
  if (downward > 0) return Math.ceil(downward * MAX_SCROLL_PER_FRAME_PX);
  return 0;
}

/** Trim a step so it stops once the list's own top (going up) or bottom
 *  (going down) is inside the band. The page past the list stays put. */
function stepWithinList(
  step: number,
  listRect: DOMRect,
  band: VerticalBand,
): number {
  if (step < 0) return Math.min(0, Math.max(step, listRect.top - band.top));
  if (step > 0) {
    return Math.max(0, Math.min(step, listRect.bottom - band.bottom));
  }
  return 0;
}

export interface EdgeAutoScroller {
  /** Begin watching the pointer for the list inside `container`. */
  start: (container: HTMLElement) => void;
  stop: () => void;
}

/**
 * Scrolls the list's scroll surface (its nearest scrolling ancestor, else the
 * window) while a dragged pointer sits near its top or bottom edge, one step
 * per animation frame. The edges are measured inside the fixed nav and any
 * sticky bar, and scrolling ends once the list's end in that direction is in
 * view. `onScrolled` runs after every step that moved, so the held row and
 * the swap check keep up with the page sliding under them.
 */
export function createEdgeAutoScroller(
  readPointerY: () => number,
  onScrolled: () => void,
): EdgeAutoScroller {
  let frameId = 0;
  let scroller: HTMLElement | null = null;
  let list: HTMLElement | null = null;
  let viewportBand: VerticalBand | null = null;
  let viewportBandMeasuredAt = 0;

  function readScrollTop(): number {
    return scroller ? scroller.scrollTop : window.scrollY;
  }

  function readViewportBand(container: HTMLElement): VerticalBand {
    const now = performance.now();
    if (!viewportBand || now - viewportBandMeasuredAt > BAND_REFRESH_MS) {
      viewportBand = unobstructedViewportBand(container);
      viewportBandMeasuredAt = now;
    }
    return viewportBand;
  }

  function tick() {
    frameId = window.requestAnimationFrame(tick);
    if (!list) return;
    const band = visibleBandOf(scroller, readViewportBand(list));
    const step = stepWithinList(
      scrollStepFor(readPointerY(), band),
      list.getBoundingClientRect(),
      band,
    );
    if (step === 0) return;
    const scrollTopBefore = readScrollTop();
    // "instant": the app's global `scroll-behavior: smooth` would otherwise
    // turn every per-frame step into its own smooth scroll.
    const scrollStep: ScrollToOptions = { top: step, behavior: "instant" };
    if (scroller) scroller.scrollBy(scrollStep);
    else window.scrollBy(scrollStep);
    if (readScrollTop() !== scrollTopBefore) onScrolled();
  }

  function stop() {
    window.cancelAnimationFrame(frameId);
    frameId = 0;
    scroller = null;
    list = null;
    viewportBand = null;
  }

  function start(container: HTMLElement) {
    stop();
    list = container;
    scroller = nearestScrollableAncestor(container);
    frameId = window.requestAnimationFrame(tick);
  }

  return { start, stop };
}
