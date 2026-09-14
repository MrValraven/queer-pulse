import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  clampScale,
  clampTranslate,
  DOUBLE_TAP_SCALE,
  IDLE_ZOOM,
  toTransform,
  zoomAround,
  type ZoomPanState,
} from "./chatImageZoom";
import {
  useDragFeedback,
  type DragFeedbackController,
} from "./useDragFeedback";
import { isInteractiveTarget } from "./useMessageGestures";

/** Max gap between the two taps of a double tap. */
const DOUBLE_TAP_MS = 280;
/** Max movement still counted as a tap. Must stay BELOW
 *  `DRAG_AXIS_LOCK_PX` in `chatImageZoom.ts`, so a tap that jitters can never
 *  also lock a drag axis and blink the chrome off and back on. */
const TAP_SLOP_PX = 16;

/** Live pointer position, keyed by pointer id. */
type PointerMap = Map<number, { x: number; y: number }>;

/**
 * Both boxes `chatImageZoom.ts` needs, plus their shared centre in client
 * (window) coordinates. The image is laid out with
 * `max-width:100%; max-height:100%; object-fit:contain` inside a flex-centred
 * stage, so its own box is smaller than the stage's in one axis for any photo
 * whose aspect ratio differs from the stage's (the letterboxed axis). The
 * anchor maths in `zoomAround` needs the image's own box; the pan clamp in
 * `clampTranslate` needs the stage's, which is the true visible boundary. The
 * two are kept as separate fields, never merged, so a call site cannot pass
 * one where the other belongs.
 */
interface StageGeometry {
  imageWidth: number;
  imageHeight: number;
  stageWidth: number;
  stageHeight: number;
  centerX: number;
  centerY: number;
}

/** Distance between the two active pointers, for pinch scale. Pure and
 *  DOM-free so it stays outside the hook body. */
function distanceBetweenPointers(pointers: PointerMap): number {
  const points = [...pointers.values()];
  const [first, second] = points;
  if (!first || !second) return 0;
  return Math.hypot(first.x - second.x, first.y - second.y);
}

/** Midpoint between the two active pointers, for the pinch anchor. */
function midpointOfPointers(pointers: PointerMap): { x: number; y: number } {
  const points = [...pointers.values()];
  const [first, second] = points;
  if (!first || !second) return { x: 0, y: 0 };
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
}

/**
 * Converts a point in client (window) coordinates into the image box's own
 * coordinate space, where the origin is the box's centre. This is what makes
 * `clientX - centerX` (the true offset from the image's own centre, not the
 * stage's) resolve correctly inside `zoomAround`, which internally subtracts
 * `imageSize.width / 2` from the point it is given.
 */
function toImageBoxPoint(
  clientX: number,
  clientY: number,
  geometry: StageGeometry,
): { x: number; y: number } {
  return {
    x: clientX - geometry.centerX + geometry.imageWidth / 2,
    y: clientY - geometry.centerY + geometry.imageHeight / 2,
  };
}

/**
 * Computes the current `StageGeometry` from the live DOM nodes. Pure given
 * its inputs, so it lives at module scope; the hook only supplies the nodes.
 * Falls back to the stage's own box for the image size too when the image
 * has not laid out yet (`offsetWidth` is 0), so an early gesture cannot
 * divide by a zero-sized box.
 */
function computeStageGeometry(
  imageNode: HTMLImageElement | null,
  stageNode: HTMLDivElement | null,
): StageGeometry {
  const stageRect = stageNode?.getBoundingClientRect();
  const stageWidth = stageRect?.width ?? 0;
  const stageHeight = stageRect?.height ?? 0;
  const centerX = stageRect ? stageRect.left + stageWidth / 2 : 0;
  const centerY = stageRect ? stageRect.top + stageHeight / 2 : 0;
  if (imageNode && imageNode.offsetWidth > 0) {
    return {
      imageWidth: imageNode.offsetWidth,
      imageHeight: imageNode.offsetHeight,
      stageWidth,
      stageHeight,
      centerX,
      centerY,
    };
  }
  return {
    imageWidth: stageWidth,
    imageHeight: stageHeight,
    stageWidth,
    stageHeight,
    centerX,
    centerY,
  };
}

/** The pointer stream's in-progress gesture. */
interface Gesture {
  startX: number;
  startY: number;
  startTime: number;
  startZoom: ZoomPanState;
  pinchDistance: number;
  isPinching: boolean;
  /** False once a gesture has been re-baselined (e.g. after a pinch drops to
   *  one finger), so the eventual release is never misread as a tap. */
  isTapEligible: boolean;
}

/**
 * Re-baselines a gesture when a two-finger pinch drops to one finger: the
 * surviving pointer becomes a lone pan gesture anchored at ITS current
 * position and the live post-pinch zoom, rather than the original
 * two-finger touchdown, which is what keeps the transform continuous across
 * the transition. `isTapEligible` is false because a re-baselined gesture
 * must never be read as a tap on release (or lifting the second finger of a
 * pinch would toggle the chrome).
 */
function rebaselineAfterPinchDrop(
  pointers: PointerMap,
  zoomRef: React.MutableRefObject<ZoomPanState>,
): Gesture | null {
  const [survivor] = [...pointers.values()];
  if (!survivor) return null;
  return {
    startX: survivor.x,
    startY: survivor.y,
    startTime: Date.now(),
    startZoom: zoomRef.current,
    pinchDistance: 0,
    isPinching: false,
    isTapEligible: false,
  };
}

/**
 * Computes the next zoom during an active two-finger pinch, anchored to the
 * pointers' midpoint. Pure given its inputs, hoisted to module scope purely
 * to keep `useZoomPan` under the repo's max-lines-per-function budget.
 */
function computePinchZoom(
  gesture: Gesture,
  pointers: PointerMap,
  geometry: StageGeometry,
): ZoomPanState {
  const distance = distanceBetweenPointers(pointers);
  const nextScale = clampScale(
    gesture.startZoom.scale * (distance / gesture.pinchDistance),
  );
  const midpoint = midpointOfPointers(pointers);
  return zoomAround(
    gesture.startZoom,
    nextScale,
    toImageBoxPoint(midpoint.x, midpoint.y, geometry),
    { width: geometry.imageWidth, height: geometry.imageHeight },
    { width: geometry.stageWidth, height: geometry.stageHeight },
  );
}

/**
 * Computes the next pan while dragging a zoomed photo with one finger,
 * clamped to the stage edges. Pure given its inputs, hoisted for the same
 * reason as `computePinchZoom`.
 */
function computePanZoom(
  gesture: Gesture,
  event: { clientX: number; clientY: number },
  geometry: StageGeometry,
): ZoomPanState {
  return clampTranslate(
    {
      scale: gesture.startZoom.scale,
      x: gesture.startZoom.x + (event.clientX - gesture.startX),
      y: gesture.startZoom.y + (event.clientY - gesture.startY),
    },
    { width: geometry.imageWidth, height: geometry.imageHeight },
    { width: geometry.stageWidth, height: geometry.stageHeight },
  );
}

interface TapRefs {
  zoomRef: React.MutableRefObject<ZoomPanState>;
  lastTapRef: React.MutableRefObject<{
    time: number;
    x: number;
    y: number;
  } | null>;
  tapTimerRef: React.MutableRefObject<number | null>;
}

/**
 * Resolves a tap that just ended. A tap on the bare stage, the scrim beside a
 * letterboxed photo, closes the viewer right away, matching every other
 * lightbox in the app, and never enters the double-tap window since there is
 * no on-image gesture to protect there. A tap on the desktop arrow buttons
 * (also stage descendants, but their own `onClick` already handles them) is
 * left alone entirely, the same as `useMessageGestures` leaves interactive
 * descendants to their own behaviour, rather than misreading their click as a
 * dismiss. A tap on the image itself follows the existing double-tap rule: a
 * second tap inside the window toggles zoom anchored to the tap point, and
 * any other tap only schedules the chrome toggle, deferred until the window
 * passes so a double tap never also fires it, and only carried out if the
 * photo is still at scale 1 by the time the timer fires, per the spec's
 * "single tap ON THE IMAGE AT SCALE 1" rule. Extracted to module scope purely
 * to keep `useZoomPan` under the repo's max-lines-per-function budget.
 */
function resolveTapEnd(
  event: React.PointerEvent,
  refs: TapRefs,
  write: (next: ZoomPanState, withTransition: boolean) => void,
  geometry: StageGeometry,
  imageNode: HTMLImageElement | null,
  onToggleChrome: () => void,
  onDismiss: () => void,
): void {
  const isOnImage = event.target === imageNode;
  if (!isOnImage && isInteractiveTarget(event)) return;
  if (!isOnImage) {
    refs.lastTapRef.current = null;
    if (refs.tapTimerRef.current !== null) {
      window.clearTimeout(refs.tapTimerRef.current);
      refs.tapTimerRef.current = null;
    }
    onDismiss();
    return;
  }

  const now = Date.now();
  const last = refs.lastTapRef.current;
  const isDoubleTap =
    !!last &&
    now - last.time < DOUBLE_TAP_MS &&
    Math.abs(event.clientX - last.x) < TAP_SLOP_PX &&
    Math.abs(event.clientY - last.y) < TAP_SLOP_PX;

  if (isDoubleTap) {
    refs.lastTapRef.current = null;
    if (refs.tapTimerRef.current !== null) {
      window.clearTimeout(refs.tapTimerRef.current);
      refs.tapTimerRef.current = null;
    }
    const nextScale = refs.zoomRef.current.scale > 1 ? 1 : DOUBLE_TAP_SCALE;
    write(
      zoomAround(
        refs.zoomRef.current,
        nextScale,
        toImageBoxPoint(event.clientX, event.clientY, geometry),
        { width: geometry.imageWidth, height: geometry.imageHeight },
        { width: geometry.stageWidth, height: geometry.stageHeight },
      ),
      true,
    );
    return;
  }

  refs.lastTapRef.current = { time: now, x: event.clientX, y: event.clientY };
  // A single tap on the image only toggles the chrome once the double tap
  // window has passed, so a double tap never also toggles it, and only when
  // the photo is still unzoomed at that point.
  refs.tapTimerRef.current = window.setTimeout(() => {
    refs.tapTimerRef.current = null;
    if (refs.zoomRef.current.scale === 1) onToggleChrome();
  }, DOUBLE_TAP_MS);
}

/**
 * Starts tracking a pointer and returns the gesture it begins. Captures the
 * pointer to the stage so a mouse-up released outside it (over the chrome
 * bars, very reachable while panning a zoomed photo upward) still delivers
 * pointerup here instead of being lost, which is what used to leave a ghost
 * pointer behind and turn the next drag into a phantom pinch. Touch gets that
 * implicitly; the call is a no-op for it, and is wrapped defensively because
 * it throws if the pointer has already gone away.
 */
function beginGesture(
  event: React.PointerEvent,
  pointers: PointerMap,
  currentZoom: ZoomPanState,
): Gesture {
  try {
    event.currentTarget.setPointerCapture(event.pointerId);
  } catch {
    // Best-effort: if capture fails, the gesture still starts normally.
  }
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  const isPinching = pointers.size >= 2;
  return {
    startX: event.clientX,
    startY: event.clientY,
    startTime: Date.now(),
    startZoom: currentZoom,
    pinchDistance: isPinching ? distanceBetweenPointers(pointers) : 0,
    isPinching,
    isTapEligible: true,
  };
}

/**
 * Ends any scale-1 drag being followed and announces the pinch that owns the
 * photo now, the instant the second finger lands rather than deferred to the
 * first pinch move frame, so the chrome hides on the START of the pinch as
 * the spec requires. A no-op below two pointers. Hoisted alongside
 * `beginGesture` purely to keep `useZoomPan` under the repo's
 * max-lines-per-function budget.
 */
function notePinchStart(
  pointers: PointerMap,
  drag: DragFeedbackController,
  announceGesture: (active: boolean) => void,
): void {
  if (pointers.size < 2) return;
  drag.reset();
  announceGesture(true);
}

interface EndGestureContext {
  tapRefs: TapRefs;
  drag: DragFeedbackController;
  write: (next: ZoomPanState, withTransition: boolean) => void;
  stageGeometry: () => StageGeometry;
  imageRef: RefObject<HTMLImageElement | null>;
  onDismiss: () => void;
  onToggleChrome: () => void;
}

/**
 * Fires `onGestureActive` true at most once per gesture and false exactly
 * once, no matter how many independent call sites report the same edge: the
 * scale-1 drag via `useDragFeedback`'s own `onDragActive`, a pinch starting
 * at the second finger's touchdown, and a pan starting on the first move
 * frame above scale 1. `activeRef` is the single shared source of truth every
 * one of them checks before calling through, so a pinch beginning right after
 * a drag ends (a second finger landing mid-drag) cannot leave the flag stuck
 * true, and a drag settling after a pinch already reported false cannot fire
 * a redundant one either. Pure aside from the ref it is handed, hoisted to
 * module scope for the same reason `beginGesture` and its neighbours are.
 */
function announceGestureChange(
  active: boolean,
  activeRef: React.MutableRefObject<boolean>,
  onGestureActive: (isGestureActive: boolean) => void,
): void {
  if (activeRef.current === active) return;
  activeRef.current = active;
  onGestureActive(active);
}

/**
 * Resolves a pointer release once it is known to be an actual end, not a
 * pinch dropping to one finger: settles a pinch that ended below scale 1,
 * resolves a tap, or commits (or settles) a followed drag. A drag while
 * zoomed was a pan, whose transform is already written by `onPointerMove`, so
 * this never touches it beyond the early `scale > 1` return. Extracted to
 * module scope purely to keep `useZoomPan` under the repo's
 * max-lines-per-function budget, the same reason `resolveTapEnd` above is
 * hoisted.
 */
function resolveGestureEnd(
  event: React.PointerEvent,
  gesture: Gesture,
  ctx: EndGestureContext,
): void {
  const {
    tapRefs,
    drag,
    write,
    stageGeometry,
    imageRef,
    onDismiss,
    onToggleChrome,
  } = ctx;
  // Whether a followed drag is on screen. Read up front because the tap
  // branch below needs it, and because a drag and a pinch can no longer
  // overlap (a second finger ends the drag in `onPointerDown`).
  const wasDragging = drag.isActive();

  if (gesture.isPinching) {
    // Settle a pinch that ended below 1 back to the idle state.
    if (tapRefs.zoomRef.current.scale <= 1) write(IDLE_ZOOM, true);
    return;
  }

  const deltaX = event.clientX - gesture.startX;
  const deltaY = event.clientY - gesture.startY;
  const isTap =
    gesture.isTapEligible &&
    Math.abs(deltaX) < TAP_SLOP_PX &&
    Math.abs(deltaY) < TAP_SLOP_PX &&
    Date.now() - gesture.startTime < 400;

  if (isTap) {
    // Reachable even though the lock distance is wider than the tap slop: an
    // out-and-back flick can travel past the lock and return inside the slop
    // within the tap window, leaving an axis set on a release that is still a
    // tap. This is the only call that clears it, so the chrome would stay
    // hidden without it.
    if (wasDragging) drag.settleWithoutCommitting();
    resolveTapEnd(
      event,
      tapRefs,
      write,
      stageGeometry(),
      imageRef.current,
      onToggleChrome,
      onDismiss,
    );
    return;
  }

  // A drag while zoomed was a pan; the transform is already written.
  if (gesture.startZoom.scale > 1) return;
  if (!wasDragging) return;
  drag.end(deltaX, deltaY);
}

/**
 * Resets every piece of gesture state a new photo must not inherit from the
 * one before it: the zoom, the drag follow (and, through it, any scale-1
 * drag source announced to `announceGesture`), the aggregate gesture flag
 * itself (a pinch or an above-scale-1 pan can also be mid-gesture when the
 * photo changes, e.g. arrow-key navigation while zoomed, and `drag.reset()`
 * alone only knows about the scale-1 drag source), the tracked pointers, the
 * in-progress gesture, and an armed single-tap timer. Hoisted to module scope
 * purely to keep `useZoomPan` under the repo's max-lines-per-function budget.
 */
function resetForPhotoChange(
  write: (next: ZoomPanState, withTransition: boolean) => void,
  drag: DragFeedbackController,
  announceGesture: (active: boolean) => void,
  pointersRef: React.MutableRefObject<PointerMap>,
  gestureRef: React.MutableRefObject<Gesture | null>,
  lastTapRef: React.MutableRefObject<{
    time: number;
    x: number;
    y: number;
  } | null>,
  tapTimerRef: React.MutableRefObject<number | null>,
): void {
  write(IDLE_ZOOM, false);
  drag.reset();
  announceGesture(false);
  pointersRef.current.clear();
  gestureRef.current = null;
  lastTapRef.current = null;
  if (tapTimerRef.current !== null) {
    window.clearTimeout(tapTimerRef.current);
    tapTimerRef.current = null;
  }
}

/**
 * Paints one zoom/pan frame's transform onto the image node. Pure given its
 * inputs (aside from the DOM write itself), hoisted to module scope purely to
 * keep `useZoomPan` under the repo's max-lines-per-function budget, the same
 * reason `resetForPhotoChange` above it is. Does not touch `zoomRef` or
 * `isZoomed`: the hook's own `write` callback still updates those itself,
 * since a module-scope function cannot update the ref before the node is read
 * (the null check must see the same frame's value) and cannot call a
 * `useState` setter closed over from render at all.
 */
function applyZoomTransform(
  imageNode: HTMLImageElement | null,
  next: ZoomPanState,
  withTransition: boolean,
  reducedMotion: boolean,
): void {
  if (!imageNode) return;
  imageNode.style.transition =
    withTransition && !reducedMotion ? "transform 180ms var(--ease)" : "none";
  imageNode.style.transform = toTransform(next);
}

interface PointerMoveContext {
  pointersRef: React.MutableRefObject<PointerMap>;
  gestureRef: React.MutableRefObject<Gesture | null>;
  zoomRef: React.MutableRefObject<ZoomPanState>;
  write: (next: ZoomPanState, withTransition: boolean) => void;
  drag: DragFeedbackController;
  stageGeometry: () => StageGeometry;
  announceGesture: (active: boolean) => void;
}

/**
 * Handles one `pointermove` frame: pinch update, pan while zoomed, or the
 * scale-1 drag follow. Hoisted to module scope purely to keep `useZoomPan`
 * under the repo's max-lines-per-function budget, the same reason every
 * other block above it is.
 *
 * The pan branch (`gesture.startZoom.scale > 1`) always calls `write`
 * unconditionally, on every frame, so the pan itself keeps tracking the
 * finger immediately and at full precision exactly as before. Only
 * `announceGesture(true)` is gated, on the same `TAP_SLOP_PX` threshold
 * `resolveGestureEnd` already uses to tell a tap from a drag on release, so a
 * touchscreen's micro-jitter `pointermove` during an otherwise stationary tap
 * on a zoomed photo can never flash the chrome hidden and back across one
 * release. `announceGesture` is idempotent past its first `true` per gesture
 * (see `announceGestureChange`), so calling it again on every later frame of
 * the same pan, once past the threshold, is a no-op.
 */
function handlePointerMove(
  event: React.PointerEvent,
  ctx: PointerMoveContext,
): void {
  const {
    pointersRef,
    gestureRef,
    zoomRef,
    write,
    drag,
    stageGeometry,
    announceGesture,
  } = ctx;
  if (!pointersRef.current.has(event.pointerId)) return;
  pointersRef.current.set(event.pointerId, {
    x: event.clientX,
    y: event.clientY,
  });
  const gesture = gestureRef.current;
  if (!gesture) return;

  // Two fingers: pinch around their midpoint.
  if (pointersRef.current.size >= 2) {
    if (!gesture.isPinching) {
      gesture.isPinching = true;
      gesture.pinchDistance = distanceBetweenPointers(pointersRef.current);
      gesture.startZoom = zoomRef.current;
      return;
    }
    if (gesture.pinchDistance <= 0) return;
    write(
      computePinchZoom(gesture, pointersRef.current, stageGeometry()),
      false,
    );
    return;
  }

  // One finger while zoomed: pan, clamped to the stage edges. Returns,
  // because the drag follow below is scale-blind and would overwrite this
  // frame's transform on the very same node.
  if (gesture.startZoom.scale > 1) {
    // The write is unconditional: the pan tracks the finger from its very
    // first move frame, same as always. The announcement waits for real
    // movement past the tap slop, so a stationary tap's pointer jitter can
    // never flash the chrome.
    const panDeltaX = event.clientX - gesture.startX;
    const panDeltaY = event.clientY - gesture.startY;
    if (
      Math.abs(panDeltaX) >= TAP_SLOP_PX ||
      Math.abs(panDeltaY) >= TAP_SLOP_PX
    ) {
      announceGesture(true);
    }
    write(computePanZoom(gesture, event, stageGeometry()), false);
    return;
  }
  // One finger at scale 1 is a navigation or dismiss drag. Follow it live
  // so the gesture shows what letting go will do: the photo tracks the
  // finger, and a downward drag also shrinks it and fades the wash.
  drag.follow(gesture.startX, gesture.startY, event);
}

interface WheelZoomContext {
  gestureRef: React.MutableRefObject<Gesture | null>;
  zoomRef: React.MutableRefObject<ZoomPanState>;
  drag: DragFeedbackController;
  write: (next: ZoomPanState, withTransition: boolean) => void;
  stageGeometry: () => StageGeometry;
  announceGesture: (active: boolean) => void;
}

/**
 * Handles a wheel zoom, anchored to the cursor. A wheel arriving while a
 * pointer is still down ends that gesture outright first: clearing the
 * drag's visuals alone would not be enough, since the gesture captured
 * `startZoom.scale` as 1, so moves would keep routing to the drag follow on a
 * photo now zoomed above 1, and the release would dismiss or navigate it,
 * which the spec forbids above scale 1. Dropping the gesture also stops the
 * drag re-locking on the next move and flickering the chrome, and it settles
 * the stage's transform before the rect is read below. Hoisted to module
 * scope purely to keep `useZoomPan` under the repo's max-lines-per-function
 * budget, the same reason every other block above it is.
 */
function handleWheelZoom(event: React.WheelEvent, ctx: WheelZoomContext): void {
  const { gestureRef, zoomRef, drag, write, stageGeometry, announceGesture } =
    ctx;
  drag.reset();
  gestureRef.current = null;
  // Covers a pinch or an above-scale-1 pan cut short by the wheel too:
  // `drag.reset()` above only knows about the scale-1 drag source.
  announceGesture(false);
  const nextScale = clampScale(
    zoomRef.current.scale * (event.deltaY < 0 ? 1.15 : 1 / 1.15),
  );
  const geometry = stageGeometry();
  write(
    zoomAround(
      zoomRef.current,
      nextScale,
      toImageBoxPoint(event.clientX, event.clientY, geometry),
      { width: geometry.imageWidth, height: geometry.imageHeight },
      { width: geometry.stageWidth, height: geometry.stageHeight },
    ),
    false,
  );
}

interface PointerEndContext extends EndGestureContext {
  pointersRef: React.MutableRefObject<PointerMap>;
  gestureRef: React.MutableRefObject<Gesture | null>;
  announceGesture: (active: boolean) => void;
}

/**
 * Resolves a `pointerup`: drops the pointer, re-baselines a pinch that just
 * dropped to one finger (see `rebaselineAfterPinchDrop`), or, once every
 * finger is up, announces the gesture's end and hands off to
 * `resolveGestureEnd`. `announceGesture(false)` runs unconditionally before
 * that hand-off so it covers every branch inside it, including the tap
 * branch, which never touches `drag` at all. Hoisted to module scope purely
 * to keep `useZoomPan` under the repo's max-lines-per-function budget, the
 * same reason `resolveGestureEnd` itself is.
 */
function handlePointerEnd(
  event: React.PointerEvent,
  ctx: PointerEndContext,
): void {
  const { pointersRef, gestureRef, tapRefs, announceGesture } = ctx;
  pointersRef.current.delete(event.pointerId);
  const gesture = gestureRef.current;
  if (!gesture) return;

  if (pointersRef.current.size > 0) {
    gestureRef.current = rebaselineAfterPinchDrop(
      pointersRef.current,
      tapRefs.zoomRef,
    );
    return;
  }
  gestureRef.current = null;
  announceGesture(false);
  resolveGestureEnd(event, gesture, ctx);
}

interface UseZoomPanOptions {
  imageRef: RefObject<HTMLImageElement | null>;
  viewportRef: RefObject<HTMLDivElement | null>;
  /** The full-bleed plum wash behind the dialog. A downward drag fades it so
   *  the conversation reads through, which is what makes the dismiss feel like
   *  putting the photo back. It is a separate node from the scrim precisely so
   *  its opacity can be animated without fading the photo and chrome with it. */
  scrimWashRef: RefObject<HTMLDivElement | null>;
  /** Fires true the instant any gesture begins (a scale-1 drag committing to
   *  an axis, a pinch's second finger landing, or a pan's first move frame
   *  above scale 1) and false when it ends by any route, including a
   *  cancelled pointer, lost pointer capture, a photo change mid-gesture, or
   *  a wheel zoom that cuts a held pointer short, so the shell can take the
   *  chrome out of the way of a photo that is being actively manipulated. */
  onGestureActive: (isGestureActive: boolean) => void;
  /** Identity of the photo on screen. Changing it resets zoom and pan. */
  photoKey: string;
  /** Whether there is another photo to swipe to. See `useDragFeedback`. */
  hasSiblings: boolean;
  reducedMotion: boolean;
  onNext: () => void;
  onPrev: () => void;
  onDismiss: () => void;
  onToggleChrome: () => void;
}

/**
 * The stage's whole pointer stream: pinch to zoom, drag to pan when zoomed,
 * horizontal drag to change photo and downward drag to dismiss when not,
 * double tap to toggle zoom, single tap to toggle the chrome.
 *
 * Like `useMessageGestures`, the live transform is written STRAIGHT to the
 * image node on every pointer frame and never through React state, so a pinch
 * never re-renders the viewer. The only state here is `isZoomed`, which flips
 * at most once per gesture and exists because the rest of the viewer needs to
 * know (the cursor, and whether a drag should navigate).
 */
export function useZoomPan({
  imageRef,
  viewportRef,
  scrimWashRef,
  onGestureActive,
  photoKey,
  hasSiblings,
  reducedMotion,
  onNext,
  onPrev,
  onDismiss,
  onToggleChrome,
}: UseZoomPanOptions) {
  const zoomRef = useRef<ZoomPanState>(IDLE_ZOOM);
  const [isZoomed, setIsZoomed] = useState(false);
  /** Live pointers by id, for pinch detection. */
  const pointersRef = useRef<PointerMap>(new Map());
  const gestureRef = useRef<Gesture | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(
    null,
  );
  const tapTimerRef = useRef<number | null>(null);
  /** Whether the aggregate "a gesture is in progress" signal was last
   *  reported true. See `announceGestureChange`: every source that can start
   *  or end a gesture shares this one ref so `onGestureActive` never fires
   *  true twice in a row or an orphaned true with no matching false. */
  const gestureActiveRef = useRef(false);

  const write = useCallback(
    (next: ZoomPanState, withTransition: boolean) => {
      zoomRef.current = next;
      const node = imageRef.current;
      applyZoomTransform(node, next, withTransition, reducedMotion);
      if (node) setIsZoomed(next.scale > 1);
    },
    [imageRef, reducedMotion],
  );

  /** The single external signal for "a gesture is in progress": every source
   *  below (the scale-1 drag, a pinch, a pan above scale 1) calls through
   *  this one stable function rather than `onGestureActive` directly, so
   *  `announceGestureChange`'s ref guard sees every source and can actually
   *  enforce the true-once, false-once contract across all three. Stable
   *  regardless of how often it is called: identity only changes if the
   *  prop's own identity does, which the shell keeps stable (a `useState`
   *  setter). Passed to `useDragFeedback` as its `onDragActive`. */
  const announceGesture = useCallback(
    (active: boolean) =>
      announceGestureChange(active, gestureActiveRef, onGestureActive),
    [onGestureActive],
  );

  /** The live follow shown while a one-finger drag at scale 1 is in progress.
   *  Its own hook: see `useDragFeedback` for why it is kept out of the zoom
   *  state entirely. `stageRef` is `viewportRef`: the same node `.stage`
   *  attaches to in `ChatImageViewerStage`, which is what keeps the drag's
   *  clip invariant structural rather than a `parentElement` hop. */
  const drag: DragFeedbackController = useDragFeedback({
    stageRef: viewportRef,
    scrimWashRef,
    reducedMotion,
    hasSiblings,
    onDragActive: announceGesture,
    onNext,
    onPrev,
    onDismiss,
  });

  /** Both boxes the arithmetic needs, and their shared centre; see
   *  `StageGeometry` above. Deliberately does NOT clear a drag follow: the tap
   *  path settles its drag with a transition immediately before reading this,
   *  and resetting here would cancel that settle in the same task, so the
   *  photo snapped home instead of easing. The only call site that can reach
   *  this while the stage still carries a live drag transform is `onWheel`,
   *  which ends the gesture itself for reasons of its own. Pinch and pan
   *  cannot: a pinch clears the drag when the second finger lands, and a pan
   *  only runs while `gesture.startZoom.scale > 1`, where the follow never
   *  ran at all. */
  const stageGeometry = useCallback(
    () => computeStageGeometry(imageRef.current, viewportRef.current),
    [imageRef, viewportRef],
  );

  // A new photo always starts unzoomed and centred, with no leftover gesture
  // state from the previous photo: an armed single-tap timer must not fire
  // onToggleChrome() after the switch, and a stale gesture must not be read
  // as still in progress. Runs as a layout effect, not a passive one, so the
  // reset commits before the browser paints the new photo: otherwise a photo
  // change while zoomed (e.g. the arrow-key navigation) paints one frame of
  // the new image at the old zoom before snapping back. See
  // `resetForPhotoChange` for what it clears and why.
  useLayoutEffect(() => {
    resetForPhotoChange(
      write,
      drag,
      announceGesture,
      pointersRef,
      gestureRef,
      lastTapRef,
      tapTimerRef,
    );
    // `write`, `drag.reset` and `announceGesture` are stable; `photoKey` is
    // the real trigger.
  }, [photoKey, write, drag, announceGesture]);

  useEffect(() => {
    return () => {
      if (tapTimerRef.current !== null)
        window.clearTimeout(tapTimerRef.current);
    };
  }, []);

  /** Drops a pointer from tracking and clears the in-progress gesture. Shared
   *  by every path that ends a gesture without a clean pointer-up: an
   *  explicit `pointercancel`, and capture being lost (see
   *  `onLostPointerCapture` below). */
  const clearGestureFor = useCallback(
    (pointerId: number) => {
      pointersRef.current.delete(pointerId);
      gestureRef.current = null;
      // A followed drag ending without a clean release still has to put the
      // photo and the wash back rather than leaving them offset.
      drag.settleWithoutCommitting();
      // Covers a pinch or an above-scale-1 pan cancelled the same way: only
      // `settleWithoutCommitting` above knows about the scale-1 drag source.
      announceGesture(false);
    },
    [drag, announceGesture],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      gestureRef.current = beginGesture(
        event,
        pointersRef.current,
        zoomRef.current,
      );
      // A second finger means a pinch owns the photo now, so any drag being
      // followed ends here rather than surviving the pinch and stranding the
      // chrome hidden. Cleared INSTANTLY rather than settled, because the drag
      // transform now lives on the stage and the zoom anchor reads the stage's
      // rect: an animating settle would leave the anchor reading a rect that
      // is still moving for the length of the transition. See
      // `notePinchStart` for why this is also where the pinch is announced.
      notePinchStart(pointersRef.current, drag, announceGesture);
    },
    [drag, announceGesture],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) =>
      handlePointerMove(event, {
        pointersRef,
        gestureRef,
        zoomRef,
        write,
        drag,
        stageGeometry,
        announceGesture,
      }),
    [write, drag, stageGeometry, announceGesture],
  );

  const endGesture = useCallback(
    (event: React.PointerEvent) =>
      handlePointerEnd(event, {
        pointersRef,
        gestureRef,
        tapRefs: { zoomRef, lastTapRef, tapTimerRef },
        drag,
        write,
        stageGeometry,
        imageRef,
        onDismiss,
        onToggleChrome,
        announceGesture,
      }),
    [
      write,
      drag,
      stageGeometry,
      imageRef,
      onDismiss,
      onToggleChrome,
      announceGesture,
    ],
  );

  const onPointerCancel = useCallback(
    (event: React.PointerEvent) => clearGestureFor(event.pointerId),
    [clearGestureFor],
  );

  // Browsers never fire `pointercancel` for a mouse, so a captured pointer
  // whose capture is later released (e.g. the OS revokes it) is the only
  // signal left that the gesture ended abnormally; without this, the next
  // pointerdown would see a stale pointer still in the map and misread it as
  // the start of a pinch.
  const onLostPointerCapture = useCallback(
    (event: React.PointerEvent) => clearGestureFor(event.pointerId),
    [clearGestureFor],
  );

  const onWheel = useCallback(
    (event: React.WheelEvent) =>
      handleWheelZoom(event, {
        gestureRef,
        zoomRef,
        drag,
        write,
        stageGeometry,
        announceGesture,
      }),
    [write, drag, stageGeometry, announceGesture],
  );

  return {
    isZoomed,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endGesture,
      onPointerCancel,
      onLostPointerCapture,
      onWheel,
    },
  };
}
