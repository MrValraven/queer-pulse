/**
 * The zoom/pan arithmetic behind the chat photo viewer, kept free of React and
 * of the DOM so every clamp and anchor can be tested directly. The hook that
 * drives pointers (`useZoomPan`) owns all the event plumbing and writes the
 * result of these functions straight to the image node.
 *
 * The model: the image is laid out to FIT the stage at scale 1 via
 * `object-fit: contain`, so it is letterboxed to the stage's own box in
 * whichever axis its aspect ratio does not match the stage's. At scale 1
 * there is nothing to pan and the idle state is the origin. Above 1, the
 * scaled image is `scale * imageSize` in each axis, and the pan is clamped so
 * that size can never leave less than `stageSize` of the visible stage
 * uncovered, which is what keeps the image edges from ever leaving the
 * viewport, including on the letterboxed axis where the image starts out
 * smaller than the stage.
 */

export interface ZoomPanState {
  scale: number;
  /**
   * Translation in CSS pixels. The transform this state renders to is
   * `translate(x, y) scale(scale)`, so the point is scaled first and this
   * offset is added after, which is why `x`/`y` stay unscaled CSS pixels
   * regardless of `scale`.
   */
  x: number;
  y: number;
}

export const MIN_SCALE = 1;
export const MAX_SCALE = 4;
/** Where a double tap lands, and what it toggles back from. */
export const DOUBLE_TAP_SCALE = 2.5;

export const IDLE_ZOOM: ZoomPanState = { scale: 1, x: 0, y: 0 };

export function clampScale(scale: number): number {
  if (Number.isNaN(scale)) return MIN_SCALE;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

/**
 * Half the overflow in one axis: the furthest the image may travel from the
 * origin before its edge would come inside the visible stage. Needs BOTH
 * sizes, because the image's own box is only equal to the stage's on the
 * fitting axis; on the letterboxed axis the image starts out smaller than the
 * stage, so `imageSize` alone (or `stageSize` alone) gives the wrong limit.
 */
function panLimit(scale: number, imageSize: number, stageSize: number): number {
  return Math.max(0, (scale * imageSize - stageSize) / 2);
}

/**
 * Clamps a pan so the image can never be dragged into dead space.
 * `imageSize` is the image's own untransformed box (what it fits at scale 1);
 * `stageSize` is the visible stage it sits in, which is the true clamp
 * boundary once the two differ on the letterboxed axis.
 */
export function clampTranslate(
  state: ZoomPanState,
  imageSize: { width: number; height: number },
  stageSize: { width: number; height: number },
): ZoomPanState {
  const limitX = panLimit(state.scale, imageSize.width, stageSize.width);
  const limitY = panLimit(state.scale, imageSize.height, stageSize.height);
  return {
    scale: state.scale,
    // When a limit is zero, skip Math.max/Math.min: Math.max(-0, negative)
    // returns -0, which would fail a strict equality check against 0.
    x: limitX === 0 ? 0 : Math.min(limitX, Math.max(-limitX, state.x)),
    y: limitY === 0 ? 0 : Math.min(limitY, Math.max(-limitY, state.y)),
  };
}

/**
 * Scales to `nextScale` while holding `point` (in the image box's own
 * coordinate space, origin at its centre) visually still, which is what makes
 * a pinch feel anchored to the fingers and a double tap feel anchored to the
 * tap. The anchor maths uses `imageSize` alone, since the point it is holding
 * still is expressed in that box's own space; the result is then clamped
 * against `stageSize`, the true visible boundary, so an anchor near an edge
 * cannot drag the image out of view.
 */
export function zoomAround(
  state: ZoomPanState,
  nextScale: number,
  point: { x: number; y: number },
  imageSize: { width: number; height: number },
  stageSize: { width: number; height: number },
): ZoomPanState {
  const scale = clampScale(nextScale);
  if (scale === MIN_SCALE) return IDLE_ZOOM;
  // Distance from the image box's centre to the anchor, in pre-scale pixels.
  const anchorX = point.x - imageSize.width / 2;
  const anchorY = point.y - imageSize.height / 2;
  const ratio = scale / state.scale;
  return clampTranslate(
    {
      scale,
      x: anchorX - (anchorX - state.x) * ratio,
      y: anchorY - (anchorY - state.y) * ratio,
    },
    imageSize,
    stageSize,
  );
}

/** The inline `transform` the hook writes to the image node. */
export function toTransform(state: ZoomPanState): string {
  return `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
}

// ── Live drag feedback ───────────────────────────────────────────────────────
// What the viewer shows WHILE a one-finger drag at scale 1 is in progress, as
// opposed to what it commits to on release. This is deliberately NOT part of
// `ZoomPanState`: a drag-follow is transient decoration, and folding it into
// the zoom state would feed a temporary offset back into `clampTranslate` and
// `zoomAround` and corrupt the pan clamp. The hook writes this to the same
// nodes on every pointer frame and clears it in one call on release.

/** Travel before a drag commits to an axis. Below this the intent is unclear,
 *  and following it would make the photo wobble diagonally. Deliberately ABOVE
 *  `useZoomPan`'s `TAP_SLOP_PX` of 16: a press that stays within the tap slop
 *  must never lock an axis, or a slightly shaky tap would hide the chrome and
 *  show it again on release. Keeping the two ranges disjoint removes that
 *  overlap entirely rather than resolving it after the fact. */
export const DRAG_AXIS_LOCK_PX = 18;
/** How small the photo gets at the moment a release would dismiss it. */
const DISMISS_MIN_SCALE = 0.85;
/** How much of the plum ground is left at that same moment, so the
 *  conversation reads through it and the dismiss feels like putting the photo
 *  back where it came from. */
const SCRIM_MIN_OPACITY = 0.15;
/** Past the navigate threshold a horizontal drag follows at this fraction of
 *  the finger, so it resists rather than sliding away from nothing. */
const HORIZONTAL_RESIST = 0.35;
/** And never travels further than this multiple of the threshold. */
const HORIZONTAL_MAX_FACTOR = 1.6;

export type DragAxis = "horizontal" | "vertical";

export interface DragFeedback {
  x: number;
  y: number;
  scale: number;
  /** Multiplier for the scrim wash, 1 being the full plum ground. */
  scrimOpacity: number;
  /** 0 to 1 toward the dismiss threshold. 1 means a release commits. */
  progress: number;
}

export const IDLE_DRAG: DragFeedback = {
  x: 0,
  y: 0,
  scale: 1,
  scrimOpacity: 1,
  progress: 0,
};

/**
 * Which axis a drag has committed to, or null while it is still ambiguous.
 * An exactly diagonal drag counts as vertical, so a dismiss is never stolen by
 * a stray sideways pixel.
 */
export function lockDragAxis(deltaX: number, deltaY: number): DragAxis | null {
  // A non-finite coordinate carries no intent, and every comparison below is
  // false against NaN, so without this guard a garbage deltaX would let a
  // 5px deltaY lock an axis and hide the chrome on what is really a tap.
  if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY)) return null;
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < DRAG_AXIS_LOCK_PX) {
    return null;
  }
  return Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
}

/** Interpolates from `full` at progress 0 down to `atThreshold` at progress 1,
 *  hitting both endpoints exactly rather than accumulating float drift. */
function easeTo(full: number, atThreshold: number, progress: number): number {
  return atThreshold + (full - atThreshold) * (1 - progress);
}

/**
 * The visual state for a drag of `deltaX`/`deltaY` along an already-locked
 * axis. `allowScale` is false under `prefers-reduced-motion`: the photo still
 * tracks the finger, because following a finger is direct manipulation rather
 * than decoration, but it does not shrink.
 */
export function dragFeedbackFor(
  axis: DragAxis,
  deltaX: number,
  deltaY: number,
  thresholds: { dismissDistance: number; nextDistance: number },
  options: { allowScale: boolean },
): DragFeedback {
  // A later frame can carry a non-finite coordinate even once the axis has
  // locked (`lockDragAxis` only runs once, at lock time, and does not see
  // frames after that). Every comparison below is false against NaN, so an
  // unguarded frame would fall through to a translate with a NaN component,
  // which browsers discard wholesale: the photo snaps to the origin for that
  // one frame and recovers on the next. Idle is always a safe frame to paint
  // instead.
  if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY)) return IDLE_DRAG;
  if (axis === "horizontal") {
    const limit = thresholds.nextDistance * HORIZONTAL_MAX_FACTOR;
    const magnitude = Math.abs(deltaX);
    const followed =
      magnitude <= thresholds.nextDistance
        ? magnitude
        : thresholds.nextDistance +
          (magnitude - thresholds.nextDistance) * HORIZONTAL_RESIST;
    return {
      ...IDLE_DRAG,
      x: Math.sign(deltaX) * Math.min(limit, followed),
    };
  }
  // Only downward travel means anything: there is no upward dismiss.
  const travel = Math.max(0, deltaY);
  if (travel === 0) return IDLE_DRAG;
  const progress = Math.min(1, travel / thresholds.dismissDistance);
  return {
    x: 0,
    y: travel,
    scale: options.allowScale ? easeTo(1, DISMISS_MIN_SCALE, progress) : 1,
    scrimOpacity: easeTo(1, SCRIM_MIN_OPACITY, progress),
    progress,
  };
}
