import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";

/** The release glide back into the slot: the house ease, a touch quicker
 *  than a reorder glide so the drop feels settled at once. */
const SETTLE_DURATION_MS = 180;
const SETTLE_EASING = "cubic-bezier(0.22, 0.68, 0.16, 1)";
const SETTLE_ANIMATION_ID = "row-drag-settle";

/** Vertical translation a row is painted with: motion's `transform` (a pure
 *  translate for `layout="position"`) plus the CSS `translate` the drag sets. */
function paintedOffsetYOf(element: HTMLElement): number {
  const style = getComputedStyle(element);
  let offsetY = 0;
  if (style.transform && style.transform !== "none") {
    offsetY += new DOMMatrixReadOnly(style.transform).m42;
  }
  if (style.translate && style.translate !== "none") {
    const [, translateY = "0"] = style.translate.split(/\s+/);
    offsetY += Number.parseFloat(translateY) || 0;
  }
  return offsetY;
}

/**
 * Where the list LAID OUT a row, in viewport coordinates, with every
 * in-flight translation taken back off. Measured through the box centre, so a
 * centred lift scale on the held row leaves the answer unchanged.
 */
export function layoutTopOf(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  const layoutCentre = rect.top + rect.height / 2 - paintedOffsetYOf(element);
  return layoutCentre - element.offsetHeight / 2;
}

function layoutMidpointOf(element: HTMLElement): number {
  return layoutTopOf(element) + element.offsetHeight / 2;
}

/**
 * The one neighbour step the held row should take, or `null` to stay. The
 * held row's painted centre is compared with each neighbour's laid-out
 * midpoint, so a neighbour still gliding out of the way after a swap is judged
 * by the slot it is heading to. A swap moves the neighbour a whole held-row
 * height away, so stepping back needs a real move back, and the pair never
 * flips to and fro under a still pointer.
 */
export function nextRowNeighbourIndex(
  rows: HTMLElement[],
  heldIndex: number,
  heldCentre: number,
): number | null {
  const next = rows[heldIndex + 1];
  if (next && heldCentre > layoutMidpointOf(next)) return heldIndex + 1;
  const previous = rows[heldIndex - 1];
  if (previous && heldCentre < layoutMidpointOf(previous)) {
    return heldIndex - 1;
  }
  return null;
}

/** How far past the list's first or last slot the held row may travel. */
const HELD_ROW_OVERSHOOT_PX = 12;

/**
 * Clamp where the held row's top would sit so it stays over the list: no
 * higher than the first slot and no lower than the last, give or take a small
 * overshoot. Measured from the rows as laid out, so glides do not skew it.
 */
export function clampHeldRowTop(
  rows: HTMLElement[],
  held: HTMLElement,
  desiredTop: number,
): number {
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (!first || !last) return desiredTop;
  const highestTop = layoutTopOf(first) - HELD_ROW_OVERSHOOT_PX;
  const lowestTop =
    layoutTopOf(last) +
    last.offsetHeight -
    held.offsetHeight +
    HELD_ROW_OVERSHOOT_PX;
  return Math.min(
    Math.max(desiredTop, highestTop),
    Math.max(highestTop, lowestTop),
  );
}

/** Paint the held row `offsetY` pixels from its slot. The `translate`
 *  property composes with motion's `transform`, so the two never fight. */
export function setRowOffset(element: HTMLElement, offsetY: number): void {
  element.style.translate = `0 ${offsetY}px`;
}

function cancelRowSettle(element: HTMLElement): void {
  if (typeof element.getAnimations !== "function") return;
  for (const animation of element.getAnimations()) {
    if (animation.id === SETTLE_ANIMATION_ID) animation.cancel();
  }
}

/** Drop the held-row offset at once (a cancel, an unmount, a new drag). */
export function clearRowOffset(element: HTMLElement): void {
  cancelRowSettle(element);
  element.style.translate = "";
}

/**
 * Glide the released row from where the pointer left it back into its slot.
 * The inline style is cleared first and the animation runs from the old
 * offset to zero with no fill, so the row rests with no inline style at all.
 * Instant under reduced motion.
 */
export function settleRowOffset(element: HTMLElement): void {
  const releasedTranslate = element.style.translate;
  clearRowOffset(element);
  if (releasedTranslate === "" || prefersReducedMotionNow()) return;
  if (typeof element.animate !== "function") return;
  element.animate([{ translate: releasedTranslate }, { translate: "0 0" }], {
    duration: SETTLE_DURATION_MS,
    easing: SETTLE_EASING,
    id: SETTLE_ANIMATION_ID,
  });
}
