import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import {
  dragFeedbackFor,
  IDLE_DRAG,
  lockDragAxis,
  toTransform,
  type DragAxis,
  type DragFeedback,
} from "./chatImageZoom";

/**
 * The live feedback for a one-finger drag on the photo viewer at scale 1: the
 * photo follows the finger, and a downward drag also shrinks it and fades the
 * plum wash so the conversation reads through. Split out of `useZoomPan`
 * because it is a genuinely separate concern: zoom is a state the viewer holds
 * between gestures, while this is transient decoration that exists only while a
 * finger is down and is always fully cleared when it lifts.
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

/** Horizontal travel that moves to the neighbouring photo. */
export const SWIPE_NEXT_PX = 64;
/** Downward travel that dismisses the viewer. */
export const SWIPE_DISMISS_PX = 110;
/** The same two distances in the shape `dragFeedbackFor` wants, so the live
 *  feedback is scaled against exactly the thresholds the release is judged
 *  against: progress reaching 1 means letting go now commits. */
const DRAG_THRESHOLDS = {
  dismissDistance: SWIPE_DISMISS_PX,
  nextDistance: SWIPE_NEXT_PX,
};
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
  /** Paints one frame of a drag from `startX`/`startY` to the current pointer.
   *  Does nothing until the drag is big enough to have committed to an axis. */
  follow: (startX: number, startY: number, event: React.PointerEvent) => void;
  /** Settles a finished drag: commits it if it crossed its threshold, and puts
   *  the photo and wash back otherwise. Safe to call when no drag is active. */
  end: (deltaX: number, deltaY: number) => void;
  /** Settles a drag without letting it commit, for a release that turned out
   *  to be a tap, or a gesture cancelled by a lost pointer. */
  settleWithoutCommitting: () => void;
  /** Clears everything instantly, with no transition, for a photo change. */
  reset: () => void;
}

export function useDragFeedback({
  stageRef,
  scrimWashRef,
  reducedMotion,
  hasSiblings,
  onDragActive,
  onNext,
  onPrev,
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
  /** Whether the gallery holds more than this one photo. A sideways drag in a
   *  single-photo gallery has nowhere to go, so it settles back instead of
   *  committing a navigation that changes nothing and hard-cuts the photo. */
  hasSiblings: boolean;
  /** Fires true when a drag commits to an axis and false when it ends, so the
   *  shell can take the chrome out of the way of a photo that is moving. */
  onDragActive: (isDragging: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
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
  /** Held in a latest-value ref rather than read as a dependency. It changes
   *  when the gallery grows or shrinks, and a dependency here would give `end`
   *  a fresh identity, which would give the whole controller one, which would
   *  re-run `useZoomPan`'s photo-change layout effect and snap a member's zoom
   *  back to 1 the moment a second photo arrived in the thread. Read only
   *  inside a gesture, which is always after the effect below has run. */
  const hasSiblingsRef = useRef(hasSiblings);
  useEffect(() => {
    hasSiblingsRef.current = hasSiblings;
  });

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

  const follow = useCallback(
    (startX: number, startY: number, event: React.PointerEvent) => {
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      const axis = axisRef.current ?? lockDragAxis(deltaX, deltaY);
      if (!axis) return;
      // Recorded the instant it locks, whether or not this frame paints
      // anything: see the `axisRef` doc above.
      axisRef.current = axis;
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
    [write, onDragActive, reducedMotion],
  );

  const stop = useCallback((): DragAxis | null => {
    const axis = axisRef.current;
    if (axis === null) return null;
    axisRef.current = null;
    // Only announce the end of a drag that was actually announced started:
    // an axis that locked but never painted (a pure upward flick, released
    // before it ever reversed downward) must not emit an orphan `false`.
    if (hasAnnouncedRef.current) {
      hasAnnouncedRef.current = false;
      onDragActive(false);
    }
    return axis;
  }, [onDragActive]);

  const end = useCallback(
    (deltaX: number, deltaY: number) => {
      const axis = stop();
      if (!axis) return;
      // A committed drag resets its follow with no transition, because either
      // the photo is being replaced or the viewer is closing, and settling
      // something on its way out just animates a ghost.
      // The two axes are exclusive: a horizontal drag must never fall through
      // into the dismiss test, or an L-shaped drag that locked sideways and
      // then travelled down would close the viewer after promising a slide.
      if (axis === "horizontal") {
        // A single-photo gallery has nowhere to go, so it settles back rather
        // than committing a navigation that changes nothing and hard-cuts.
        if (hasSiblingsRef.current) {
          if (deltaX <= -SWIPE_NEXT_PX) {
            write(IDLE_DRAG, null);
            onNext();
            return;
          }
          if (deltaX >= SWIPE_NEXT_PX) {
            write(IDLE_DRAG, null);
            onPrev();
            return;
          }
        }
      } else if (deltaY >= SWIPE_DISMISS_PX) {
        // Resets before closing, exactly as the commit branches above do. The
        // viewer unmounts synchronously today so nothing would be seen either
        // way, but leaving the stage parked at its dragged, shrunk, faded pose
        // breaks this controller's own contract and would show the moment an
        // exit transition is added to the viewer.
        write(IDLE_DRAG, null);
        onDismiss();
        return;
      }
      write(IDLE_DRAG, settleMs);
    },
    [stop, write, settleMs, onNext, onPrev, onDismiss],
  );

  const settleWithoutCommitting = useCallback(() => {
    if (!stop()) return;
    write(IDLE_DRAG, settleMs);
  }, [stop, write, settleMs]);

  const reset = useCallback(() => {
    // Announces through the same path as every other exit. A photo change can
    // land while a drag is still being followed (an arrow key mid-drag does
    // exactly that), and without this the shell's dragging flag would stay
    // true and leave the chrome hidden with no way back.
    stop();
    write(IDLE_DRAG, null);
  }, [stop, write]);

  // Memoized on its own stable callbacks. The controller is a dependency of
  // `useZoomPan`'s photo-change layout effect, and a fresh object every render
  // would re-run that effect on every render: a single `setIsZoomed` at the
  // start of a pinch would then reset the zoom out from under the gesture.
  return useMemo(
    () => ({ isActive, follow, end, settleWithoutCommitting, reset }),
    [isActive, follow, end, settleWithoutCommitting, reset],
  );
}
