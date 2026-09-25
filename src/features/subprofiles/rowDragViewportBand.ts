/** How far in from the top and bottom edges to look for pinned bars. A few
 *  depths, so a floating nav that starts below the very edge is still found. */
const PROBE_DEPTHS_PX = [2, 32, 96];
/** Horizontal probe inset from the list's own left and right sides. */
const PROBE_SIDE_INSET_PX = 8;

export interface VerticalBand {
  top: number;
  bottom: number;
}

function isPinned(element: Element): boolean {
  const { position } = getComputedStyle(element);
  return position === "fixed" || position === "sticky";
}

/** The nearest fixed or sticky element at or above `element`, if any. */
function pinnedAncestorOf(element: Element): Element | null {
  let current: Element | null = element;
  while (current && current !== document.body) {
    if (isPinned(current)) return current;
    current = current.parentElement;
  }
  return null;
}

/**
 * The pinned bar painted over the point, ignoring the list itself (the held
 * row may float above a bar) and anything that wraps the list, since a
 * sticky panel holding the list carries the list along with it.
 */
function pinnedOverlayAt(
  x: number,
  y: number,
  container: HTMLElement,
): Element | null {
  for (const hit of document.elementsFromPoint(x, y)) {
    if (container.contains(hit)) continue;
    if (hit === document.body || hit === document.documentElement) return null;
    const pinned = pinnedAncestorOf(hit);
    if (!pinned || pinned.contains(container)) return null;
    return pinned;
  }
  return null;
}

function probeXsFor(container: HTMLElement): number[] {
  const rect = container.getBoundingClientRect();
  const clampX = (x: number) =>
    Math.min(Math.max(x, 0), Math.max(window.innerWidth - 1, 0));
  return [
    rect.left + PROBE_SIDE_INSET_PX,
    rect.left + rect.width / 2,
    rect.right - PROBE_SIDE_INSET_PX,
  ].map(clampX);
}

/**
 * The part of the viewport no fixed or sticky bar covers above or below the
 * list's column: the top nav and a sticky save bar are inset away. Only
 * bars that sit wholly in the top or bottom half count, so a pinned column
 * running the full height never swallows the band.
 */
export function unobstructedViewportBand(container: HTMLElement): VerticalBand {
  const viewportHeight = window.innerHeight;
  const halfway = viewportHeight / 2;
  const band = { top: 0, bottom: viewportHeight };
  for (const x of probeXsFor(container)) {
    for (const depth of PROBE_DEPTHS_PX) {
      const topBar = pinnedOverlayAt(x, depth, container);
      const topRect = topBar?.getBoundingClientRect();
      if (topRect && topRect.bottom <= halfway) {
        band.top = Math.max(band.top, topRect.bottom);
      }
      const bottomBar = pinnedOverlayAt(x, viewportHeight - depth, container);
      const bottomRect = bottomBar?.getBoundingClientRect();
      if (bottomRect && bottomRect.top >= halfway) {
        band.bottom = Math.min(band.bottom, bottomRect.top);
      }
    }
  }
  return band;
}
