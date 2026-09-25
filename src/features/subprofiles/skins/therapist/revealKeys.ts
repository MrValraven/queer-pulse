import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import { usePresence, type Transition } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";

/**
 * Stable React keys for a list of stored values: each value plus its
 * occurrence number among equal values, so `["a", "b", "a"]` keys as
 * `["a#0", "b#0", "a#1"]`. Keying by array index instead would hand a
 * removed middle item's key to the item after it, and AnimatePresence would
 * animate the wrong row out. With these keys, removing the middle `"b"`
 * leaves `"a#0"` and `"a#1"` where they were and only `"b#0"` exits.
 */
export function occurrenceKeys(values: string[]): string[] {
  const seenCounts = new Map<string, number>();
  return values.map((value) => {
    const occurrence = seenCounts.get(value) ?? 0;
    seenCounts.set(value, occurrence + 1);
    return `${value}#${occurrence}`;
  });
}

/** The editor chips' timing (0.2s on `--ease`), so a preview row keeps pace
 *  with the editor row the owner is changing. */
const REVEAL_DURATION_MS = 200;
const REVEAL_EASE = [0.22, 0.68, 0.16, 1] as const;
/** The same curve for the Web Animations API, which reads a plain string. */
const REVEAL_EASING = `cubic-bezier(${REVEAL_EASE.join(", ")})`;

/** The reveal animations' shared Motion timing: the editor chips' 0.2s on
 *  their curve, and instant under reduced motion. */
export function useRevealTransition(): Transition {
  const { reducedMotion } = useMotionPrefs();
  return useMemo(
    () => ({
      duration: reducedMotion ? 0 : REVEAL_DURATION_MS / 1000,
      ease: REVEAL_EASE,
    }),
    [reducedMotion],
  );
}

/** The row reveal's Web Animations timing. `fill` is set per animation. */
const ROW_TIMING: KeyframeAnimationOptions = {
  duration: REVEAL_DURATION_MS,
  easing: REVEAL_EASING,
};

/**
 * Set by `RevealList`: a ref that turns true once the list has mounted, so a
 * row can tell a later addition (animates in) from the list's first render
 * (appears as is). `null` outside a `RevealList`, where nothing animates on
 * mount: a chip or row there has no AnimatePresence to hold its first render
 * still.
 */
export const RevealListContext = createContext<RefObject<boolean> | null>(null);

export function useRevealList(): RefObject<boolean> | null {
  return useContext(RevealListContext);
}

/** The box properties a row grows from and collapses to. Every value is read
 *  from computed style, which reports CSS pixels whatever the page's `zoom`,
 *  unlike a measured rect. */
const ROW_BOX_PROPERTIES = [
  "height",
  "paddingTop",
  "paddingBottom",
  "marginTop",
  "marginBottom",
  "borderTopWidth",
  "borderBottomWidth",
  "opacity",
] as const;

/** The row's box as it renders right now, mid-animation included. */
function readRowBox(element: HTMLElement): Keyframe {
  const computedStyle = getComputedStyle(element);
  const box: Keyframe = { overflow: "hidden" };
  for (const property of ROW_BOX_PROPERTIES) {
    box[property] = computedStyle[property];
  }
  return box;
}

/** The row folded away: no height, no box, transparent. `parentGap` is the
 *  list's own gap, pulled back by the bottom margin so a folded row takes no
 *  room at all. */
function collapsedRowBox(parentGap: number): Keyframe {
  return {
    height: "0px",
    paddingTop: "0px",
    paddingBottom: "0px",
    marginTop: "0px",
    marginBottom: `${-parentGap}px`,
    borderTopWidth: "0px",
    borderBottomWidth: "0px",
    opacity: 0,
    overflow: "hidden",
  };
}

/** Grows a row in on a later addition and folds it away on removal, with the
 *  Web Animations API from computed-style values. Cancelling a running
 *  animation drops its effect at once, so a row that comes back mid-fold
 *  grows from where it was, and a finished grow hands back to the CSS. */
export function useRowReveal<ElementType extends HTMLElement>(
  parentGap: number,
): RefObject<ElementType | null> {
  const elementRef = useRef<ElementType | null>(null);
  const animationRef = useRef<Animation | null>(null);
  // The frame request that starts `animationRef`'s animation.
  const startFrameRef = useRef<number | null>(null);
  // Set when a reduced-motion removal is waiting for the passive effect.
  const isRemovalPendingRef = useRef(false);
  // The presence this effect last acted on: StrictMode's second run and a
  // re-render with no change are no-ops.
  const handledPresenceRef = useRef<boolean | null>(null);
  const [isPresent, safeToRemove] = usePresence();
  const listMountedRef = useRevealList();
  const { reducedMotion } = useMotionPrefs();

  useLayoutEffect(() => {
    const element = elementRef.current;
    const isFirstRun = handledPresenceRef.current === null;
    if (!element || handledPresenceRef.current === isPresent) return;
    handledPresenceRef.current = isPresent;
    isRemovalPendingRef.current = false;
    if (isFirstRun && !listMountedRef?.current) return;

    const runningAnimation = animationRef.current;
    const currentBox = runningAnimation ? readRowBox(element) : null;
    runningAnimation?.cancel();
    animationRef.current = null;
    if (startFrameRef.current !== null) {
      cancelAnimationFrame(startFrameRef.current);
      startFrameRef.current = null;
    }
    if (reducedMotion) {
      isRemovalPendingRef.current = !isPresent;
      return;
    }
    const foldedBox = collapsedRowBox(parentGap);
    const keyframes = isPresent
      ? [currentBox ?? foldedBox, readRowBox(element)]
      : [currentBox ?? readRowBox(element), foldedBox];
    // Both fill backwards, so a frame stamped before the start time shows the
    // first keyframe. A fold also holds its last frame until AnimatePresence
    // unmounts the row.
    const animation = element.animate(keyframes, {
      ...ROW_TIMING,
      fill: isPresent ? "backwards" : "both",
    });
    // Held on its first keyframe until the next frame starts it from the
    // clock. That frame's own timestamp, like the timeline's time, is the
    // vsync from before this commit, so after a long commit it would paint
    // the row most of the way through its move.
    animation.pause();
    animationRef.current = animation;
    startFrameRef.current = requestAnimationFrame(() => {
      startFrameRef.current = null;
      if (animationRef.current !== animation) return;
      animation.startTime = performance.now();
    });
    // A finish event already queued when the row came back belongs to a
    // cancelled fold, so only the current animation removes the row.
    animation.onfinish = () => {
      if (animationRef.current !== animation) return;
      animationRef.current = null;
      if (!isPresent) safeToRemove?.();
    };
  }, [isPresent, listMountedRef, parentGap, reducedMotion, safeToRemove]);

  // A reduced-motion removal is instant, but AnimatePresence registers the
  // exit in its own layout effect, which runs after this row's, and ignores
  // a removal it has not registered. Passive effects run after every layout
  // effect of the commit, and before any later render re-adds the row.
  useEffect(() => {
    if (isPresent || !isRemovalPendingRef.current) return;
    isRemovalPendingRef.current = false;
    safeToRemove?.();
  }, [isPresent, safeToRemove]);

  // No cancel on unmount: StrictMode's simulated unmount would cancel a new
  // row's grow in development, and a row that really unmounts takes its
  // animation with it.
  return elementRef;
}
