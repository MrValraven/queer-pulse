import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import {
  horizontalTrackOffset,
  releaseVelocity,
  swipeDecision,
  translateXFromTransform,
  type PointerSample,
  type SwipeDirection,
} from "./chatImageZoom";
import { useTrackMotion, type TrackPhase } from "./useTrackMotion";

/**
 * The horizontal slide between photos. The stage renders a track of three
 * slides (previous, current, next) side by side, and this hook is the only
 * thing that moves it: a drag at scale 1 moves the whole track with the
 * finger, a release either commits to the neighbour or springs back, and the
 * arrow buttons and keys play the same settle with no finger.
 *
 * The commit is two steps on purpose. The track first animates to a full slide
 * (the neighbour is now centred on screen), and only then is `onNext` or
 * `onPrev` called. The gallery's cursor moves, React re-renders the three
 * slides around the new photo (the DOM nodes are keyed by photo, so the
 * neighbour that was beside the screen simply becomes the centre slide), and
 * `reset`, run from the viewer's photo-change layout effect before paint,
 * puts the track back at zero with no transition. Slides and track move in the
 * same frame, so nothing is visible to jump.
 *
 * Like the rest of the viewer, every frame is written straight to the DOM and
 * never through React state. `data-paging` on the track is the one flag the
 * stylesheet reads: while it is set the neighbours are visible and the track
 * is promoted to its own layer, and at rest neither is true.
 */

/** Pointer samples kept for the release velocity. Far more than the sample
 *  window ever holds, but bounded so a long drag cannot grow without limit. */
const MAX_SAMPLES = 12;

export interface SwipeTrackController {
  /** Moves the track to follow a horizontal drag of `deltaX` from where the
   *  finger went down. `time` is the pointer event's timestamp. */
  follow: (deltaX: number, time: number) => void;
  /** Ends a followed drag: commits to a neighbour if the distance or the
   *  velocity says so, springs back otherwise. `onSettled` runs once the track
   *  is at rest (or the photo change has been requested). */
  release: (deltaX: number, time: number, onSettled: () => void) => void;
  /** Ends a followed drag without letting it commit. */
  cancel: (onSettled: () => void) => void;
  /** Pages by one photo with no finger: the same settle, from the centre.
   *  Changes photo instantly under reduced motion, while a finger is down, or
   *  when there is no layout to slide across. */
  slideBy: (delta: 1 | -1) => void;
  /** Puts the track back at zero instantly, with no transition. */
  reset: () => void;
}

/** The slide a direction moves toward, found by the role the stage stamps on
 *  each slide, and how far the track has to travel to centre it. Read from
 *  layout (the slide's own offset, which includes the gap between slides) and
 *  falling back to the stage width where there is none. */
function travelPx(
  trackNode: HTMLElement | null,
  stageNode: HTMLElement | null,
  direction: SwipeDirection,
): number {
  const slide = trackNode?.querySelector<HTMLElement>(
    `[data-slide="${direction}"]`,
  );
  return Math.abs(slide?.offsetLeft ?? 0) || (stageNode?.offsetWidth ?? 0);
}

/** Where the track visibly is right now, which mid-transition is not what its
 *  inline style says. */
function liveOffset(trackNode: HTMLElement, fallback: number): number {
  const computed = window.getComputedStyle(trackNode).transform;
  return computed ? translateXFromTransform(computed) : fallback;
}

export function useSwipeTrack({
  trackRef,
  stageRef,
  hasNeighbours,
  reducedMotion,
  onNext,
  onPrev,
}: {
  /** The node that carries the three slides and the transform. */
  trackRef: RefObject<HTMLDivElement | null>;
  /** The clipping stage, whose width the commit distance is a share of. */
  stageRef: RefObject<HTMLDivElement | null>;
  /** Whether there is another photo to page to. False in a single-photo
   *  gallery, where a drag resists and always springs back. */
  hasNeighbours: boolean;
  reducedMotion: boolean;
  onNext: () => void;
  onPrev: () => void;
}): SwipeTrackController {
  // Latest-value ref. The controller must keep one identity for the life of
  // the viewer, because it is a dependency of the photo-change layout effect
  // and a fresh object would re-run it and reset the zoom mid-gesture.
  const latestRef = useRef({ hasNeighbours, reducedMotion, onNext, onPrev });
  useEffect(() => {
    latestRef.current = { hasNeighbours, reducedMotion, onNext, onPrev };
  });
  const phaseRef = useRef<TrackPhase>("idle");
  const offsetRef = useRef(0);
  const {
    write,
    setIsPaging,
    cancelPending,
    reset,
    animateTo,
    requestPhotoChange,
  } = useTrackMotion({
    trackRef,
    callbacksRef: latestRef,
    phaseRef,
    offsetRef,
  });
  /** The offset the current drag started from, and the finger delta at that
   *  moment. Both are zero for a drag from rest. A drag that grabs a settle in
   *  flight starts from where the track visibly is, and counts finger travel
   *  from the moment it grabbed. */
  const dragOriginRef = useRef({ base: 0, anchor: 0 });
  const samplesRef = useRef<PointerSample[]>([]);

  const springBack = useCallback(
    (onSettled: () => void) => {
      const rest = () => {
        phaseRef.current = "idle";
        write(0, null);
        setIsPaging(false);
        onSettled();
      };
      if (latestRef.current.reducedMotion) rest();
      else animateTo(0, 0, rest);
    },
    [animateTo, write, setIsPaging],
  );

  const commit = useCallback(
    (
      direction: SwipeDirection,
      speedPxPerMs: number,
      onSettled: () => void,
    ) => {
      const distance = travelPx(trackRef.current, stageRef.current, direction);
      const target = direction === "next" ? -distance : distance;
      const land = () => {
        requestPhotoChange(direction);
        onSettled();
      };
      if (latestRef.current.reducedMotion || distance <= 0) {
        // Direct manipulation ends here: park the neighbour in the centre at
        // once, so the photo change that follows swaps it for the identical
        // centre slide with no slide in between.
        if (distance > 0) write(target, null);
        land();
        return;
      }
      animateTo(target, speedPxPerMs, land);
    },
    [trackRef, stageRef, animateTo, write, requestPhotoChange],
  );

  /** Starts following a drag, picking up from the track's visible position
   *  when a settle is still running. */
  const begin = useCallback(
    (deltaX: number) => {
      const trackNode = trackRef.current;
      const isGrabbingSettle = phaseRef.current === "settling";
      const grabbedOffset =
        isGrabbingSettle && trackNode
          ? liveOffset(trackNode, offsetRef.current)
          : 0;
      cancelPending();
      if (isGrabbingSettle) write(grabbedOffset, null);
      dragOriginRef.current = isGrabbingSettle
        ? { base: grabbedOffset, anchor: deltaX }
        : { base: 0, anchor: 0 };
      samplesRef.current = [];
      phaseRef.current = "dragging";
      setIsPaging(true);
    },
    [trackRef, cancelPending, write, setIsPaging],
  );

  const follow = useCallback(
    (deltaX: number, time: number) => {
      if (phaseRef.current === "committed") return;
      if (phaseRef.current !== "dragging") begin(deltaX);
      samplesRef.current = [
        ...samplesRef.current.slice(1 - MAX_SAMPLES),
        { x: deltaX, time },
      ];
      const { base, anchor } = dragOriginRef.current;
      write(
        horizontalTrackOffset(
          base + deltaX - anchor,
          latestRef.current.hasNeighbours,
        ),
        null,
      );
    },
    [begin, write],
  );

  const release = useCallback(
    (deltaX: number, time: number, onSettled: () => void) => {
      if (phaseRef.current !== "dragging") {
        onSettled();
        return;
      }
      const samples = [...samplesRef.current, { x: deltaX, time }];
      const velocity = releaseVelocity(samples, time);
      const direction = latestRef.current.hasNeighbours
        ? swipeDecision({
            offset: offsetRef.current,
            velocity,
            width: stageRef.current?.offsetWidth ?? 0,
          })
        : null;
      if (direction) commit(direction, Math.abs(velocity), onSettled);
      else springBack(onSettled);
    },
    [stageRef, commit, springBack],
  );

  const cancel = useCallback(
    (onSettled: () => void) => {
      if (phaseRef.current !== "dragging") {
        onSettled();
        return;
      }
      springBack(onSettled);
    },
    [springBack],
  );

  const slideBy = useCallback(
    (delta: 1 | -1) => {
      const { hasNeighbours: hasOthers, reducedMotion: isReduced } =
        latestRef.current;
      const phase = phaseRef.current;
      // A slide or a pending photo change is already under way; a second one
      // stacked on it would skip a photo.
      if (!hasOthers || phase === "settling" || phase === "committed") return;
      const direction: SwipeDirection = delta > 0 ? "next" : "prev";
      const distance = travelPx(trackRef.current, stageRef.current, direction);
      if (phase === "dragging" || isReduced || distance <= 0) {
        requestPhotoChange(direction);
        return;
      }
      setIsPaging(true);
      animateTo(delta > 0 ? -distance : distance, 0, () =>
        requestPhotoChange(direction),
      );
    },
    [trackRef, stageRef, animateTo, setIsPaging, requestPhotoChange],
  );

  return useMemo(
    () => ({ follow, release, cancel, slideBy, reset }),
    [follow, release, cancel, slideBy, reset],
  );
}
