import { useCallback, useMemo, useRef, type RefObject } from "react";
import {
  dragFeedbackFor,
  IDLE_DRAG,
  lockDragAxis,
  toTransform,
  type DragAxis,
  type DragFeedback,
} from "./chatImageZoom";
import type { SwipeTrackController } from "./useSwipeTrack";

/**
 * The live feedback for a one-finger drag on the photo viewer at scale 1. A
 * downward drag moves the stage, shrinks it and fades the plum wash so the
 * conversation reads through. A sideways drag leaves the stage alone and is
 * handed to the swipe track (`useSwipeTrack`), which slides the previous,
 * current and next photos together and owns the commit and the settle. Split
 * out of `useZoomPan`
 * because it is a genuinely separate concern: zoom is a state the viewer holds
 * between gestures, while this is transient decoration that exists only while a
 * finger is down and is always fully cleared when it lifts.
 *
 * One exception to "always fully cleared": a drag that commits to a dismiss
 * leaves its pose on screen on purpose, because the viewer's exit animation
 * takes over from exactly there. See the dismiss branch of `end` below.
 *
 * Deliberately never touches the zoom state. Letting a drag offset into it
 * would feed a temporary translation back into the pan clamp and corrupt it.
 * It also never writes to the image node at all: the transform lands on the
 * stage itself, passed in explicitly as `stageRef`, the same node the zoom
 * pan clips against. Applying the drag's translate and scale to the same
 * element that owns the clip keeps the clip boundary and the photo locked
 * together as one rigid box, so nothing the drag ever does can cut the photo
 * against an edge that did not move with it. The image keeps carrying only
 * the zoom pan's own transform, so the two never touch the same style
 * property and can never fight, regardless of gesture timing.
 *
 * Like the rest of this viewer, every frame is written straight to the DOM and
 * never through React state, so dragging never re-renders anything.
 */

/** Downward travel that dismisses the viewer. Horizontal paging has its own
 *  distance and velocity rules in `chatImageZoom.ts` (`swipeDecision`). */
export const SWIPE_DISMISS_PX = 110;
/** The distance in the shape `dragFeedbackFor` wants, so the live feedback is
 *  scaled against exactly the threshold the release is judged against:
 *  progress reaching 1 means letting go now commits. */
const DRAG_THRESHOLDS = { dismissDistance: SWIPE_DISMISS_PX };
/** How long the photo takes to settle back when a drag is released without
 *  committing. */
const DRAG_SETTLE_MS = 200;

/**
 * Writes one frame to the two nodes a drag affects: the stage (translate and
 * scale) and the wash (opacity). `settleMs` is null while the finger is down,
 * because the finger IS the animation and a transition there would lag it; it
 * is set only when the gesture settles on release.
 */
function applyDragFeedback(
  stageNode: HTMLElement | null,
  washNode: HTMLDivElement | null,
  feedback: DragFeedback,
  settleMs: number | null,
): void {
  if (stageNode) {
    stageNode.style.transition = settleMs
      ? `transform ${settleMs}ms var(--ease)`
      : "none";
    stageNode.style.transform = toTransform(feedback);
  }
  if (washNode) {
    washNode.style.transition = settleMs
      ? `opacity ${settleMs}ms var(--ease)`
      : "none";
    washNode.style.opacity = String(feedback.scrimOpacity);
  }
}

export interface DragFeedbackController {
  /** Whether a drag is currently being followed on screen. */
  isActive: () => boolean;
  /** Whether a sideways drag has been released and its settle is still
   *  running. The chrome stays out of the way for that settle, so the shell
   *  must not announce the end of the gesture on release; the controller
   *  announces it itself once the track is at rest. */
  isHoldingChrome: () => boolean;
  /** Paints one frame of a drag from `startX`/`startY` to the current pointer.
   *  Does nothing until the drag is big enough to have committed to an axis. */
  follow: (startX: number, startY: number, event: React.PointerEvent) => void;
  /** Settles a finished drag: a downward one dismisses past its threshold, a
   *  sideways one is handed to the swipe track to commit or spring back, and
   *  anything else puts the photo and wash back. `time` is the release event's
   *  timestamp, for the release velocity. Safe to call when no drag is
   *  active. */
  end: (deltaX: number, deltaY: number, time?: number) => void;
  /** Settles a drag without letting it commit, for a release that turned out
   *  to be a tap, or a gesture cancelled by a lost pointer. */
  settleWithoutCommitting: () => void;
  /** Clears everything instantly, with no transition, for a photo change. */
  reset: () => void;
}

/** The pointer event's own timestamp, which is what the release velocity is
 *  measured against, or the clock when an event carries none. */
function eventTime(event: { timeStamp?: number }): number {
  return Number.isFinite(event.timeStamp)
    ? (event.timeStamp as number)
    : performance.now();
}

export function useDragFeedback({
  stageRef,
  scrimWashRef,
  reducedMotion,
  track,
  onDragActive,
  onDismiss,
}: {
  /** The node the drag transform actually lands on: the stage element that
   *  owns `overflow: hidden` and clips the photo. `useZoomPan` already holds
   *  this exact ref, attached to `.stage` in `ChatImageViewerStage`, and
   *  threads it straight through, so the clip invariant is structural rather
   *  than an incidental `imageRef.current.parentElement` hop that a later
   *  wrapper around the `<img>` (a figure, a skeleton) could silently
   *  retarget with no type error and no test failure. */
  stageRef: RefObject<HTMLDivElement | null>;
  scrimWashRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  /** The horizontal slide between photos. A sideways drag is followed, then
   *  committed or sprung back, by this controller, which also decides whether
   *  the gallery has anywhere to go (a single photo resists and settles back).
   *  Stable for the life of the viewer, like this controller. */
  track: SwipeTrackController;
  /** Fires true when a drag commits to an axis and false once it has ended
   *  and, for a sideways drag, its settle has finished, so the shell can take
   *  the chrome out of the way of a photo that is moving. */
  onDragActive: (isDragging: boolean) => void;
  onDismiss: () => void;
}): DragFeedbackController {
  /** The axis this drag committed to, or null when nothing is being followed.
   *  Doubles as "a drag is currently on screen". Set the instant the axis
   *  locks, independent of `hasAnnouncedRef` below: `end()` needs it to keep
   *  the two axes exclusive however long the drag ran before its first real
   *  paint, e.g. an upward flick that locked vertical, produced nothing
   *  visible, then reversed down past the dismiss distance. */
  const axisRef = useRef<DragAxis | null>(null);
  /** Whether `onDragActive(true)` has fired for the drag currently locked in
   *  `axisRef`. An axis can lock a full frame before it produces anything
   *  worth showing (an upward flick locks vertical immediately, but
   *  `dragFeedbackFor`'s vertical branch stays idle until `deltaY` turns
   *  positive), and firing here on lock would fade the chrome for a photo
   *  that has not moved. Reset alongside `axisRef` in `stop()`. */
  const hasAnnouncedRef = useRef(false);

  const write = useCallback(
    (feedback: DragFeedback, settleMs: number | null) =>
      applyDragFeedback(
        stageRef.current,
        scrimWashRef.current,
        feedback,
        settleMs,
      ),
    [stageRef, scrimWashRef],
  );

  /** The settle duration to use on release, or null under reduced motion,
   *  where the photo still tracks the finger (following a finger is direct
   *  manipulation) but does not animate its way back. */
  const settleMs = reducedMotion ? null : DRAG_SETTLE_MS;

  const isActive = useCallback(() => axisRef.current !== null, []);

  /** Announces the end of an announced drag, once. Shared by the immediate
   *  exits (`stop`, `reset`) and by the sideways settle, which calls it when
   *  the track comes to rest. Idempotent, so a settle that was overtaken by a
   *  photo change or a new drag cannot emit a second `false`. */
  const announceEnd = useCallback(() => {
    if (!hasAnnouncedRef.current) return;
    hasAnnouncedRef.current = false;
    onDragActive(false);
  }, [onDragActive]);

  const isHoldingChrome = useCallback(
    () => axisRef.current === null && hasAnnouncedRef.current,
    [],
  );

  const follow = useCallback(
    (startX: number, startY: number, event: React.PointerEvent) => {
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      const axis = axisRef.current ?? lockDragAxis(deltaX, deltaY);
      if (!axis) return;
      // Recorded the instant it locks, whether or not this frame paints
      // anything: see the `axisRef` doc above.
      axisRef.current = axis;
      if (axis === "horizontal") {
        // The track moves and the stage stays put. A frame with a non-finite
        // coordinate carries no position, so it is skipped.
        if (!Number.isFinite(deltaX)) return;
        if (!hasAnnouncedRef.current) {
          hasAnnouncedRef.current = true;
          onDragActive(true);
        }
        track.follow(deltaX, eventTime(event));
        return;
      }
      const feedback = dragFeedbackFor(axis, deltaX, deltaY, DRAG_THRESHOLDS, {
        allowScale: !reducedMotion,
      });
      // Announced on the first frame that actually paints something, not the
      // frame the axis locks on: see the `hasAnnouncedRef` doc above.
      if (!hasAnnouncedRef.current && feedback !== IDLE_DRAG) {
        hasAnnouncedRef.current = true;
        onDragActive(true);
      }
      write(feedback, null);
    },
    [write, onDragActive, reducedMotion, track],
  );

  const stop = useCallback((): DragAxis | null => {
    const axis = axisRef.current;
    if (axis === null) return null;
    axisRef.current = null;
    // Only announce the end of a drag that was actually announced started:
    // an axis that locked but never painted (a pure upward flick, released
    // before it ever reversed downward) must not emit an orphan `false`.
    announceEnd();
    return axis;
  }, [announceEnd]);

  const end = useCallback(
    (deltaX: number, deltaY: number, time: number = performance.now()) => {
      const axis = axisRef.current;
      if (!axis) return;
      // The two axes are exclusive: a horizontal drag must never fall through
      // into the dismiss test, or an L-shaped drag that locked sideways and
      // then travelled down would close the viewer after promising a slide.
      if (axis === "horizontal") {
        // The drag is over, but the chrome stays hidden until the track has
        // landed: `axisRef` clears here and `hasAnnouncedRef` is left set, which
        // is exactly what `isHoldingChrome` reports. The track decides between
        // committing to a neighbour and springing back, and announces the end
        // through `announceEnd` when it is at rest.
        axisRef.current = null;
        track.release(deltaX, time, announceEnd);
        return;
      }
      stop();
      if (deltaY >= SWIPE_DISMISS_PX) {
        // Deliberately NOT reset. The viewer no longer unmounts on the same
        // frame: it plays an exit animation first, and putting the photo back
        // in the middle of the screen for that exit to fade would undo the
        // throw the member just made. The pose stays exactly where the finger
        // left it and the viewer's own exit carries it the rest of the way
        // out (see `useViewerPhotoMotion`, which fades rather than flies on a
        // drag close for this reason). The whole stage unmounts a breath
        // later, so there is nothing left parked afterwards.
        onDismiss();
        return;
      }
      write(IDLE_DRAG, settleMs);
    },
    [stop, write, settleMs, track, announceEnd, onDismiss],
  );

  const settleWithoutCommitting = useCallback(() => {
    if (axisRef.current === "horizontal") {
      axisRef.current = null;
      track.cancel(announceEnd);
      return;
    }
    if (!stop()) return;
    write(IDLE_DRAG, settleMs);
  }, [stop, write, settleMs, track, announceEnd]);

  const reset = useCallback(() => {
    // Announces through the same path as every other exit. A photo change can
    // land while a drag is still being followed (an arrow key mid-drag does
    // exactly that), and without this the shell's dragging flag would stay
    // true and leave the chrome hidden with no way back. It also lands while a
    // sideways settle is holding the chrome, which is the normal end of a
    // committed swipe: the track goes back to zero in the same commit as the
    // new photo, and the chrome returns with it.
    stop();
    announceEnd();
    track.reset();
    write(IDLE_DRAG, null);
  }, [stop, announceEnd, track, write]);

  // Memoized on its own stable callbacks. The controller is a dependency of
  // `useZoomPan`'s photo-change layout effect, and a fresh object every render
  // would re-run that effect on every render: a single `setIsZoomed` at the
  // start of a pinch would then reset the zoom out from under the gesture.
  return useMemo(
    () => ({
      isActive,
      isHoldingChrome,
      follow,
      end,
      settleWithoutCommitting,
      reset,
    }),
    [isActive, isHoldingChrome, follow, end, settleWithoutCommitting, reset],
  );
}
