import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import {
  flipTransformFrom,
  isOriginStillVisible,
  VIEWER_EASE,
  VIEWER_ENTER_MS,
  VIEWER_EXIT_MS,
  type ViewerMotionVariant,
} from "./chatViewerMotion";
import type { ViewerCloseReason } from "./useViewerClose";

/**
 * Plays the photo in when the viewer opens and out when it closes.
 *
 * Everything here lands on ONE element: the flip layer, a box that exists for
 * no other reason and that no gesture ever writes to. That matters more than
 * it looks. The stage carries the drag's live transform and the image carries
 * the zoom pan's, both written straight to `style` frame by frame, and a CSS
 * or Web Animations transform sits in a higher cascade origin than an inline
 * one: an entrance animation on either node would quietly override a finger
 * already on the glass. Giving the entrance its own layer means the three
 * transforms compose instead of fighting, whatever the timing.
 *
 * Driven through the Web Animations API rather than CSS classes because the
 * zoom variant's keyframes are computed from two live rectangles and cannot be
 * written down in a stylesheet. Browsers without `element.animate` (and jsdom,
 * where every viewer test runs) simply get no animation, which is the same
 * thing reduced motion asks for.
 */
export function useViewerPhotoMotion({
  layerRef,
  stageRef,
  imageRef,
  originRef,
  variant,
  closing,
  canFlipBack,
  isZoomed,
  reducedMotion,
}: {
  /** The box wrapping the photo, and the only node this hook animates. */
  layerRef: RefObject<HTMLDivElement | null>;
  /** The stage, whose `overflow: hidden` clips the photo to the band between
   *  the two chrome bars. Unclipped for the length of a zoom flight and put
   *  back afterwards: a bubble sitting under the top or bottom bar is outside
   *  that band, so a photo flying to or from it would be cut in half on the
   *  way. The clip only matters while a zoomed photo is being panned, which
   *  cannot happen during the open or the close. */
  stageRef: RefObject<HTMLDivElement | null>;
  /** The photo itself, measured for the zoom variant's FLIP. */
  imageRef: RefObject<HTMLImageElement | null>;
  /** The bubble thumbnail the viewer was opened from, held live rather than as
   *  a snapshotted rectangle so the close can re-measure it: the log scrolls
   *  under the viewer (a reply, a new message, an arrow key jump), and a rect
   *  taken at open time would aim the photo at where the bubble used to be. */
  originRef: RefObject<HTMLElement | null>;
  variant: ViewerMotionVariant;
  /** Non-null once the viewer has started closing. */
  closing: ViewerCloseReason | null;
  /** Whether the photo on screen is still the one the viewer was opened on.
   *  Paging to a sibling photo leaves the origin bubble pointing at a
   *  different image, and shrinking photo #4 into photo #1's bubble is worse
   *  than not shrinking at all. */
  canFlipBack: boolean;
  /** Whether the photo is currently zoomed in. A zoomed photo has been moved
   *  off the layer's own centre by the pan, and the FLIP maths below assumes
   *  the two share a centre (the transform is applied to the layer, about the
   *  LAYER's origin, from a delta measured between the photo and the bubble).
   *  Rather than carry a second, pannable coordinate space through the whole
   *  calculation for a case nobody watches closely, a zoomed close fades. */
  isZoomed: boolean;
  reducedMotion: boolean;
}): void {
  // The animation currently on the layer, so the exit can cancel an entrance
  // that is still running (a photo closed within its first 240ms) instead of
  // handing the element two competing transforms.
  const runningRef = useRef<Animation | null>(null);
  // The exit plays exactly once. Its effect reads values that can still move
  // while it runs — an arrow key during the fade changes `canFlipBack`, a
  // pinch changes `isZoomed` — and without this the effect would re-fire and
  // restart the photo's departure halfway through.
  const hasExitedRef = useRef(false);
  // Latest-value refs: the enter effect runs exactly once, on mount, and must
  // not be re-run by a variant or preference change mid-viewing.
  const enterRef = useRef({ variant, reducedMotion });
  useEffect(() => {
    enterRef.current = { variant, reducedMotion };
  });

  useLayoutEffect(() => {
    const layer = layerRef.current;
    const { variant: enterVariant, reducedMotion: enterReduced } =
      enterRef.current;
    if (!layer || enterReduced || typeof layer.animate !== "function") return;
    const from =
      enterVariant === "zoom"
        ? zoomKeyframe(imageRef.current, originRef.current)
        : null;
    if (from) unclipWhile(stageRef.current, VIEWER_ENTER_MS);
    runningRef.current = layer.animate(
      from
        ? [{ transform: from }, { transform: "none" }]
        : [
            { transform: "scale(0.92)", opacity: 0 },
            { transform: "none", opacity: 1 },
          ],
      { duration: VIEWER_ENTER_MS, easing: VIEWER_EASE },
    );
    return () => runningRef.current?.cancel();
    // Refs only, so this runs exactly once per viewer: the entrance must not
    // replay because the variant or the motion preference changed halfway
    // through a viewing session. See `enterRef` above.
  }, [layerRef, stageRef, imageRef, originRef]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!closing || !layer || reducedMotion || hasExitedRef.current) return;
    if (typeof layer.animate !== "function") return;
    hasExitedRef.current = true;
    runningRef.current?.cancel();
    // A swipe-dismiss has already moved the photo out under the finger and
    // left it parked there, so the exit only fades what is left; flying it
    // back to a bubble from a pose the member chose would yank it sideways.
    const to =
      variant === "zoom" && closing !== "drag" && canFlipBack && !isZoomed
        ? zoomKeyframe(imageRef.current, originRef.current)
        : null;
    if (to) unclipWhile(stageRef.current, VIEWER_EXIT_MS);
    runningRef.current = layer.animate(
      to
        ? [{ transform: "none" }, { transform: to }]
        : [
            { transform: "none", opacity: 1 },
            { transform: "scale(0.94)", opacity: 0 },
          ],
      { duration: VIEWER_EXIT_MS, easing: VIEWER_EASE, fill: "forwards" },
    );
    // No cleanup cancel here: the element is unmounting the moment this
    // finishes, and cancelling would snap the photo back to full size for the
    // frame in between.
  }, [
    closing,
    variant,
    canFlipBack,
    isZoomed,
    reducedMotion,
    layerRef,
    stageRef,
    imageRef,
    originRef,
  ]);
}

/** Lifts the stage's clip for `durationMs`, so a photo flying between the
 *  screen and a bubble outside the stage's band is not cut against its edge.
 *  A plain timer rather than the animation's `finished` promise: the promise
 *  rejects on cancel, and a cancelled flight still has to put the clip back. */
function unclipWhile(stage: HTMLDivElement | null, durationMs: number): void {
  if (!stage) return;
  stage.style.overflow = "visible";
  window.setTimeout(() => {
    stage.style.overflow = "";
  }, durationMs);
}

/** The transform that parks the full screen photo on its bubble thumbnail, or
 *  null when there is nothing usable to park it on. */
function zoomKeyframe(
  image: HTMLImageElement | null,
  origin: HTMLElement | null,
): string | null {
  if (!image) return null;
  if (!isOriginStillVisible(origin, window.innerHeight)) return null;
  return flipTransformFrom(
    origin.getBoundingClientRect(),
    image.getBoundingClientRect(),
  );
}
