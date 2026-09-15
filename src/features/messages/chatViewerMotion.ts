/**
 * The photo viewer's open/close choreography, as pure values and maths.
 *
 * Two variants are shipped side by side so they can be compared in the real
 * app rather than described: `?photoAnim=scale` (default) opens the viewer as
 * a scale-and-fade, `?photoAnim=zoom` grows the photo out of the bubble that
 * was tapped and shrinks it back into it on close. Everything here is free of
 * React and the DOM apart from the two rectangles it is handed, the same way
 * `chatImageZoom.ts` keeps the gesture maths testable.
 */

export type ViewerMotionVariant = "scale" | "zoom";

/** Query parameter that picks the variant, e.g. `/messages?photoAnim=zoom`. */
export const VIEWER_MOTION_PARAM = "photoAnim";

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
 * Reads the variant off a query string. Anything unrecognised (a typo, a
 * missing parameter, a stale link) falls back to `scale`, which needs nothing
 * from the page it opened over and so can never fail to run.
 */
export function readViewerMotionVariant(search: string): ViewerMotionVariant {
  const value = new URLSearchParams(search).get(VIEWER_MOTION_PARAM);
  return value === "zoom" ? "zoom" : "scale";
}

/**
 * TEMPORARY, and the whole reason this is a mutable module-level value rather
 * than state on a provider: the two variants exist side by side only until the
 * maintainer picks one, and the loser (along with this store and the toggle in
 * the viewer's top bar) is deleted with it. A module store rather than React
 * state because the viewer is mounted and unmounted on every open: the choice
 * has to outlive the component that shows it, or every close would forget it.
 *
 * Seeded lazily from the query string, so `?photoAnim=zoom` still works as an
 * opening position and a toggle overrides it from there.
 */
let selectedVariant: ViewerMotionVariant | null = null;
const variantListeners = new Set<() => void>();

export function getViewerMotionVariant(): ViewerMotionVariant {
  // Guarded because this is a `useSyncExternalStore` snapshot, which React
  // can call in environments without a window. The viewer is only ever
  // mounted from a tap, so this should not happen, but a snapshot that throws
  // takes the whole conversation down rather than degrading.
  selectedVariant ??= readViewerMotionVariant(
    typeof window === "undefined" ? "" : window.location.search,
  );
  return selectedVariant;
}

export function setViewerMotionVariant(variant: ViewerMotionVariant): void {
  if (selectedVariant === variant) return;
  selectedVariant = variant;
  for (const listener of variantListeners) listener();
}

export function subscribeViewerMotionVariant(listener: () => void): () => void {
  variantListeners.add(listener);
  return () => variantListeners.delete(listener);
}

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
