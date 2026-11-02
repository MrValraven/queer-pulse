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
/** In a single-photo gallery a horizontal drag has nowhere to go, so past the
 *  swipe floor it follows at this fraction of the finger and settles back. A
 *  gallery with neighbours never resists: the track follows the finger 1:1. */
const SINGLE_PHOTO_RESIST = 0.35;
/** And the single-photo drag never travels further than this multiple of the
 *  swipe floor. */
const SINGLE_PHOTO_MAX_FACTOR = 1.6;

// ── Horizontal paging ────────────────────────────────────────────────────────
// The numbers behind the finger-tracked slide between photos. Pure and free of
// the DOM so the commit decision can be tested without a pointer stream; the
// hook that writes the track transform (`useSwipeTrack`) supplies the samples.

/** The least travel that commits a swipe by distance alone, whatever the stage
 *  width: a narrow stage must not commit on a nudge. */
export const SWIPE_DISTANCE_FLOOR_PX = 64;
/** Travel that commits a swipe by distance, as a share of the stage width. */
export const SWIPE_DISTANCE_FRACTION = 0.25;
/** A release faster than this, in the direction of the drag, is a flick and
 *  commits however short the drag was. */
export const FLICK_VELOCITY_PX_PER_MS = 0.4;
/** How far back from the release the pointer samples still count toward the
 *  release velocity. A finger that paused before lifting reads as slow. */
export const FLICK_SAMPLE_WINDOW_MS = 100;
/** Two samples closer together than this say nothing reliable about speed. */
const MIN_VELOCITY_SPAN_MS = 4;
/** The decelerating curve every settle uses: fast out of the finger's hands,
 *  long soft landing. */
export const SETTLE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
/** Bounds on how long a settle runs. */
const SETTLE_MIN_MS = 180;
const SETTLE_MAX_MS = 320;
/** The slowest speed a settle is paced at, so a release with no speed still
 *  lands in a sensible time. */
const SETTLE_MIN_SPEED_PX_PER_MS = 1;

export type SwipeDirection = "next" | "prev";

/** One recorded pointer position of a horizontal drag. */
export interface PointerSample {
  /** Drag offset from where the finger went down, in CSS pixels. */
  x: number;
  /** A `DOMHighResTimeStamp` in milliseconds. */
  time: number;
}

/**
 * The signed release velocity in px/ms (positive is rightward), read from the
 * samples inside `FLICK_SAMPLE_WINDOW_MS` of `releaseTime`. Zero when fewer
 * than two usable samples remain, which is what a finger that rested before
 * lifting looks like.
 */
export function releaseVelocity(
  samples: PointerSample[],
  releaseTime: number,
): number {
  const recent = samples.filter(
    (sample) => releaseTime - sample.time <= FLICK_SAMPLE_WINDOW_MS,
  );
  const first = recent[0];
  const last = recent[recent.length - 1];
  if (!first || !last) return 0;
  const elapsed = last.time - first.time;
  if (!(elapsed >= MIN_VELOCITY_SPAN_MS)) return 0;
  return (last.x - first.x) / elapsed;
}

/**
 * Whether a release commits to the next or previous photo, or null to spring
 * back. `offset` is where the track sits (negative is dragged left, toward the
 * next photo), `velocity` the signed release velocity and `width` the stage
 * width the distance rule is a share of.
 *
 * A flick in the direction of the drag commits however short the drag was. A
 * flick AGAINST the drag cancels even past the distance, because the finger
 * has already said it is taking the photo back. Otherwise distance decides.
 */
export function swipeDecision({
  offset,
  velocity,
  width,
}: {
  offset: number;
  velocity: number;
  width: number;
}): SwipeDirection | null {
  if (!Number.isFinite(offset) || !Number.isFinite(velocity)) return null;
  const dragSign = Math.sign(offset);
  const flickSign =
    Math.abs(velocity) > FLICK_VELOCITY_PX_PER_MS ? Math.sign(velocity) : 0;
  if (flickSign !== 0 && dragSign !== 0 && flickSign !== dragSign) return null;
  const threshold = Math.max(
    SWIPE_DISTANCE_FLOOR_PX,
    width * SWIPE_DISTANCE_FRACTION,
  );
  const hasTravelled = Math.abs(offset) >= threshold;
  const sign = flickSign !== 0 ? flickSign : hasTravelled ? dragSign : 0;
  if (sign === 0) return null;
  return sign < 0 ? "next" : "prev";
}

/**
 * Where the track sits for a raw horizontal drag offset. With neighbours it is
 * the finger, one to one: the next photo is right there beside the current one,
 * so there is nothing to resist. Without neighbours (a single-photo gallery)
 * the drag follows the finger only up to the swipe floor, resists beyond it
 * and is capped, so it still reads as "nowhere to go" and settles back.
 */
export function horizontalTrackOffset(
  rawOffset: number,
  hasNeighbours: boolean,
): number {
  if (!Number.isFinite(rawOffset)) return 0;
  if (hasNeighbours) return rawOffset;
  const magnitude = Math.abs(rawOffset);
  const followed =
    magnitude <= SWIPE_DISTANCE_FLOOR_PX
      ? magnitude
      : SWIPE_DISTANCE_FLOOR_PX +
        (magnitude - SWIPE_DISTANCE_FLOOR_PX) * SINGLE_PHOTO_RESIST;
  return (
    Math.sign(rawOffset) *
    Math.min(SWIPE_DISTANCE_FLOOR_PX * SINGLE_PHOTO_MAX_FACTOR, followed)
  );
}

/** How long a settle over `remainingPx` runs at `speedPxPerMs`: the time the
 *  distance takes at that speed (never slower than the minimum pace), held
 *  inside the 180 to 320ms band so neither a flick nor a slow release feels
 *  abrupt or sluggish. */
export function settleDurationMs(
  remainingPx: number,
  speedPxPerMs: number,
): number {
  const pace = Math.max(SETTLE_MIN_SPEED_PX_PER_MS, speedPxPerMs);
  const duration = Math.abs(remainingPx) / pace;
  if (!Number.isFinite(duration)) return SETTLE_MIN_MS;
  return Math.round(Math.min(SETTLE_MAX_MS, Math.max(SETTLE_MIN_MS, duration)));
}

/** The inline `transform` the swipe track carries for a horizontal offset. */
export function trackTransform(offset: number): string {
  return `translateX(${offset}px)`;
}

/**
 * The horizontal translation in a computed `transform` value, which is what
 * lets a drag that begins mid-settle pick up from where the track visibly is.
 * Reads the `matrix(...)` and `matrix3d(...)` forms browsers compute, plus the
 * `translateX(...)` form an inline value keeps where no style is computed;
 * anything else (`none` included) is zero.
 */
export function translateXFromTransform(transform: string): number {
  const matrix = /^matrix\(([^)]+)\)$/.exec(transform.trim());
  if (matrix?.[1]) return Number(matrix[1].split(",")[4]) || 0;
  const matrix3d = /^matrix3d\(([^)]+)\)$/.exec(transform.trim());
  if (matrix3d?.[1]) return Number(matrix3d[1].split(",")[12]) || 0;
  const translate = /^translateX\((-?[\d.]+)px\)$/.exec(transform.trim());
  return translate?.[1] ? Number(translate[1]) : 0;
}

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
  thresholds: { dismissDistance: number },
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
  // A sideways drag moves the swipe track, so the stage itself has nothing
  // to show for it (see `horizontalTrackOffset` and
  // `useSwipeTrack`). Idle here keeps the stage, the wash and the scale still.
  if (axis === "horizontal") return IDLE_DRAG;
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
