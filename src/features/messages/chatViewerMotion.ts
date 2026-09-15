/**
 * The photo viewer's open/close choreography, as pure values and maths.
 *
 * The photo grows out of the bubble that was tapped and shrinks back into it
 * on close. The scale-and-fade survives only as the automatic fallback for
 * when there is no usable origin rectangle to grow from or shrink into (an
 * image that has not been measured yet, or a bubble the virtualized log has
 * unmounted while the viewer was open). Everything here is free of React and
 * the DOM apart from the two rectangles it is handed, the same way
 * `chatImageZoom.ts` keeps the gesture maths testable.
 */

/** How long the photo takes to arrive, and to leave. The exit is shorter: a
 *  member who asked to close has already decided, and making them wait for a
 *  symmetric animation reads as lag rather than polish. */
export const VIEWER_ENTER_MS = 240;
export const VIEWER_EXIT_MS = 180;

/** The same curve `--ease` carries in CSS. The Web Animations API takes a
 *  literal easing string and cannot resolve a custom property, so the value is
 *  repeated here rather than read off the element. */
export const VIEWER_EASE = "cubic-bezier(0.22, 0.68, 0.16, 1)";

/**
 * The transform that puts `target` exactly where `origin` is: the first half
 * of a FLIP. Applied to the layer carrying the full screen photo, it makes it
 * occupy the tapped thumbnail's box, so animating the transform away plays the
 * photo growing out of the bubble.
 *
 * Scale comes from the widths alone. The thumbnail and the viewer both render
 * the same photo at its own aspect ratio, so one uniform scale matches both
 * axes; deriving it per-axis instead would stretch the photo on any pair of
 * rectangles that rounded differently.
 *
 * Returns null when either rectangle has no area — an image that has not been
 * measured yet, or a bubble that was unmounted by the virtualized log while
 * the viewer was open. A null here is the caller's signal to fall back to the
 * scale-and-fade, which needs no origin at all.
 */
export function flipTransformFrom(
  origin: { left: number; top: number; width: number; height: number },
  target: { left: number; top: number; width: number; height: number },
): string | null {
  if (origin.width <= 0 || origin.height <= 0) return null;
  if (target.width <= 0 || target.height <= 0) return null;
  const scale = origin.width / target.width;
  if (!Number.isFinite(scale) || scale <= 0) return null;
  const deltaX =
    origin.left + origin.width / 2 - (target.left + target.width / 2);
  const deltaY =
    origin.top + origin.height / 2 - (target.top + target.height / 2);
  if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY)) return null;
  return `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
}

/**
 * Whether a bubble is still worth animating back into: it must be attached to
 * the document (the virtualized message log unmounts rows that scroll far
 * enough away) and at least partly on screen. Shrinking the photo into a
 * rectangle that sits above the top of the window reads as the photo flying
 * off somewhere arbitrary, so those cases take the fade instead.
 */
export function isOriginStillVisible(
  element: HTMLElement | null,
  viewportHeight: number,
): element is HTMLElement {
  if (!element || !element.isConnected) return false;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  return rect.bottom > 0 && rect.top < viewportHeight;
}
