import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type RefObject,
} from "react";
import {
  SETTLE_EASE,
  settleDurationMs,
  trackTransform,
  type SwipeDirection,
} from "./chatImageZoom";

/**
 * The swipe track's moving parts, below the decisions `useSwipeTrack` makes:
 * writing the transform, animating it to a target, noticing it has landed,
 * asking the gallery to change photo, and putting everything back at zero.
 * Split out so the gesture logic and the motion plumbing each stay readable.
 */

/** Extra time a settle waits for `transitionend` before it is treated as
 *  finished anyway. The event never fires when the transition is interrupted
 *  by a style change or a hidden tab. */
const SETTLE_TIMEOUT_SLACK_MS = 80;
/** How long a committed swipe waits for the gallery to change photo before
 *  the track is put back by force. Only reached if the cursor did not move
 *  (the gallery changed under the swipe), so the viewer never strands a
 *  half-slid track. */
const COMMIT_FALLBACK_MS = 400;

export type TrackPhase = "idle" | "dragging" | "settling" | "committed";

/** What the motion hook needs from the gesture hook's latest props. */
export interface TrackCallbacks {
  onNext: () => void;
  onPrev: () => void;
}

/** Drops any zoom a slide that is now beside the screen still carries from
 *  when it was the current one, so a neighbour never slides in zoomed. */
function clearNeighbourZoom(trackNode: HTMLElement | null): void {
  trackNode
    ?.querySelectorAll<HTMLElement>(
      '[data-slide="prev"] img, [data-slide="next"] img',
    )
    .forEach((imageNode) => {
      imageNode.style.transition = "";
      imageNode.style.transform = "";
    });
}

/**
 * Calls `onLanded` once the track's own `transform` transition ends, or after
 * `timeoutMs` if the event never comes. Returns a cancel that guarantees
 * `onLanded` never runs afterwards.
 */
function whenTransformLands(
  trackNode: HTMLElement,
  timeoutMs: number,
  onLanded: () => void,
): () => void {
  const abort = new AbortController();
  const timer = { id: 0 };
  const cancel = () => {
    abort.abort();
    window.clearTimeout(timer.id);
  };
  trackNode.addEventListener(
    "transitionend",
    (event) => {
      // The slides' photos run their own transform transitions (a zoom
      // settling) and those bubble up to here, so only the track's own counts.
      if (event.target !== trackNode || event.propertyName !== "transform")
        return;
      cancel();
      onLanded();
    },
    { signal: abort.signal },
  );
  timer.id = window.setTimeout(() => {
    cancel();
    onLanded();
  }, timeoutMs);
  return cancel;
}

export function useTrackMotion({
  trackRef,
  callbacksRef,
  phaseRef,
  offsetRef,
}: {
  trackRef: RefObject<HTMLDivElement | null>;
  callbacksRef: MutableRefObject<TrackCallbacks>;
  /** Which part of a swipe the track is in. Owned by the gesture hook, which
   *  reads it as often as this one writes it. */
  phaseRef: MutableRefObject<TrackPhase>;
  /** Where the track was last written, in CSS pixels. Written by `write`. */
  offsetRef: MutableRefObject<number>;
}) {
  const cancelSettleRef = useRef<(() => void) | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);

  const write = useCallback(
    (offset: number, transition: string | null) => {
      offsetRef.current = offset;
      const trackNode = trackRef.current;
      if (!trackNode) return;
      trackNode.style.transition = transition ?? "none";
      trackNode.style.transform = trackTransform(offset);
    },
    [trackRef, offsetRef],
  );

  /** Marks the span in which the neighbours show and the track is promoted to
   *  its own layer; the stylesheet reads `data-paging`. */
  const setIsPaging = useCallback(
    (isPaging: boolean) => {
      const trackNode = trackRef.current;
      if (!trackNode) return;
      if (isPaging) trackNode.dataset.paging = "true";
      else delete trackNode.dataset.paging;
    },
    [trackRef],
  );

  /** Stops a settle in flight and the forced-reset timer, leaving the track
   *  wherever it is. Their callbacks never run afterwards. */
  const cancelPending = useCallback(() => {
    cancelSettleRef.current?.();
    cancelSettleRef.current = null;
    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  /** Puts the track back at zero instantly, with no transition. This is the
   *  identity-change reset: run from the viewer's photo-change layout effect,
   *  in the same commit that re-keys the slides, before paint. */
  const reset = useCallback(() => {
    cancelPending();
    phaseRef.current = "idle";
    write(0, null);
    setIsPaging(false);
    clearNeighbourZoom(trackRef.current);
  }, [cancelPending, write, setIsPaging, trackRef, phaseRef]);

  /** Animates the track to `target` and calls `onDone` when it lands. */
  const animateTo = useCallback(
    (target: number, speedPxPerMs: number, onDone: () => void) => {
      const trackNode = trackRef.current;
      cancelPending();
      phaseRef.current = "settling";
      // Nothing to animate when the track is already there: no transition
      // would run, so no `transitionend` would come and the settle would wait
      // out its timer for nothing.
      if (!trackNode || Math.abs(target - offsetRef.current) < 0.5) {
        write(target, null);
        onDone();
        return;
      }
      const durationMs = settleDurationMs(
        target - offsetRef.current,
        speedPxPerMs,
      );
      cancelSettleRef.current = whenTransformLands(
        trackNode,
        durationMs + SETTLE_TIMEOUT_SLACK_MS,
        () => {
          cancelSettleRef.current = null;
          onDone();
        },
      );
      // Flush the style the track is currently at, so the transition below
      // runs from it even when it was written earlier in this same task.
      trackNode.getBoundingClientRect();
      write(target, `transform ${durationMs}ms ${SETTLE_EASE}`);
    },
    [trackRef, cancelPending, write, phaseRef, offsetRef],
  );

  /** Asks the gallery to move, and arms the forced reset in case it does not
   *  change photo. Armed BEFORE the call: the photo-change layout effect can
   *  run synchronously inside it and must find a timer to clear. */
  const requestPhotoChange = useCallback(
    (direction: SwipeDirection) => {
      phaseRef.current = "committed";
      fallbackTimerRef.current = window.setTimeout(reset, COMMIT_FALLBACK_MS);
      if (direction === "next") callbacksRef.current.onNext();
      else callbacksRef.current.onPrev();
    },
    [reset, callbacksRef, phaseRef],
  );

  useEffect(() => cancelPending, [cancelPending]);

  return useMemo(
    () => ({
      write,
      setIsPaging,
      cancelPending,
      reset,
      animateTo,
      requestPhotoChange,
    }),
    [write, setIsPaging, cancelPending, reset, animateTo, requestPhotoChange],
  );
}
