import { useCallback, useRef, useState, type PointerEvent } from "react";
import { useMotionValue, type MotionValue } from "motion/react";

// ── Pull-to-refresh ──────────────────────────────────────────────────────────
// Reusable drag-down-to-refresh gesture for a scrollable feed. Mirrors the
// repo's gesture standard (`useMessageGestures`): the continuous drag value
// is written OFF React state (here via a `MotionValue`, motion's own
// direct-write mechanism, rather than a manual ref+style write) so a drag
// never re-renders this hook's consumer per pointermove; `refreshing` is the
// one coarse React-state flag, flipping at most twice per cycle (armed on
// release past threshold, cleared once `onRefresh()` settles).

/** Hard ceiling on how far the pull can visually travel, in px — independent
 *  of how far past it the finger keeps moving. */
export const PULL_MAX_PX = 96;

/** Resistance scale for the saturating ease curve in `resolvePull`: the raw
 *  pull-to-finger ratio starts near 1:1 at rest and falls off as the drag
 *  grows, asymptoting toward this value well before `PULL_MAX_PX` hard-clamps
 *  it. Larger = less resistance (pull tracks the finger longer). */
const PULL_RESISTANCE_PX = 260;

/** Default eased-pull distance (px) that arms a refresh on release. */
export const DEFAULT_THRESHOLD_PX = 80;

/**
 * Pure pull-distance math, split out so it's unit-testable without touching
 * the DOM. `deltaY` is the raw vertical pointer travel since the drag
 * started (down = positive). An upward drag never pulls. A downward drag
 * eases through a saturating curve — `pull` tracks the finger closely at
 * first and increasingly resists as the drag grows, so `pull` never exceeds
 * `deltaY` — then hard-clamps at `PULL_MAX_PX` so the indicator never
 * travels past a sane distance no matter how far the finger goes.
 */
export function resolvePull(
  deltaY: number,
  threshold: number,
): { pull: number; shouldRefresh: boolean } {
  if (deltaY <= 0) return { pull: 0, shouldRefresh: false };
  const eased = deltaY / (1 + deltaY / PULL_RESISTANCE_PX);
  const pull = Math.min(PULL_MAX_PX, eased);
  return { pull, shouldRefresh: pull >= threshold };
}

export interface PullToRefreshBind {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
}

export interface UsePullToRefreshOptions {
  /** Called on release past the threshold; the gesture stays "refreshing"
   *  until this resolves (or rejects — a failed refresh still releases). */
  onRefresh: () => Promise<unknown>;
  /** Eased-pull distance (px) that arms a refresh. @default DEFAULT_THRESHOLD_PX */
  threshold?: number;
  /** Disables the gesture entirely (e.g. while a composer input is focused
   *  elsewhere on the page) without unmounting the wrapper. */
  disabled?: boolean;
}

export interface UsePullToRefreshResult {
  /** Eased pull distance in px, live-updated off React render — bind directly
   *  to an `m.*` `style` prop (e.g. `{ y: pull }`) in the consumer. */
  pull: MotionValue<number>;
  /** Coarse flag: true from the moment a threshold-crossing release fires
   *  `onRefresh` until it settles. */
  refreshing: boolean;
  /** Pointer handlers to spread on the scroll container itself. The gesture
   *  arms only at the top of the EFFECTIVE scroller — both the bound
   *  element's own `scrollTop` and the window's — so it works whether the
   *  page scrolls the bound container (e.g. Messages' `fullHeight` layout)
   *  or the window (most feed pages, where the bound element's `scrollTop`
   *  is permanently 0). See `atScrollTop`. */
  bind: PullToRefreshBind;
}

interface DragState {
  pointerId: number;
  startY: number;
}

/** True when the EFFECTIVE scroll position is at the top — the bound
 *  element's own `scrollTop` AND the window's. Most feed pages are window-
 *  scrolled (the bound element's `scrollTop` is permanently 0, so `windowTop`
 *  alone gates them); a `fullHeight`-style internally-scrolled container (no
 *  window scroll) is gated by `containerTop` alone, exactly as before. Both
 *  must hold, so neither scroll mode can arm the gesture mid-page. */
function atScrollTop(el: HTMLElement): boolean {
  const containerTop = el.scrollTop <= 0;
  const windowTop = (window.scrollY || document.documentElement.scrollTop || 0) <= 0;
  return containerTop && windowTop;
}

export function usePullToRefresh({
  onRefresh,
  threshold = DEFAULT_THRESHOLD_PX,
  disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshResult {
  const pull = useMotionValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const dragRef = useRef<DragState | null>(null);
  // Ref mirror of `refreshing` so pointer handlers (memoized once, closed
  // over at mount) always see the latest value without needing `refreshing`
  // itself in their dependency arrays.
  const refreshingRef = useRef(false);

  const reset = useCallback(() => {
    dragRef.current = null;
    pull.set(0);
  }, [pull]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (disabled || refreshingRef.current) return;
      // Only arm at the top of the effective scroller — the bound container
      // AND the window, since most feed pages scroll the window rather than
      // an internal container. Anywhere else, a downward drag is just a
      // native scroll.
      if (!atScrollTop(event.currentTarget)) return;
      dragRef.current = { pointerId: event.pointerId, startY: event.clientY };
    },
    [disabled],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId || refreshingRef.current) return;
      if (disabled || !atScrollTop(event.currentTarget)) {
        // Disabled mid-drag, or the effective scroller (container or window)
        // moved away from the top — hand back to native scroll and drop the
        // gesture.
        reset();
        return;
      }
      const deltaY = event.clientY - drag.startY;
      pull.set(resolvePull(deltaY, threshold).pull);
    },
    [disabled, pull, threshold, reset],
  );

  const release = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (disabled) {
        pull.set(0);
        return;
      }
      const { shouldRefresh } = resolvePull(event.clientY - drag.startY, threshold);
      if (!shouldRefresh) {
        pull.set(0);
        return;
      }
      refreshingRef.current = true;
      setRefreshing(true);
      // A failed refresh still releases the gesture — the caller owns
      // surfacing the error (e.g. a toast), this hook only owns the gesture
      // lifecycle.
      void Promise.resolve(onRefresh())
        .catch(() => undefined)
        .finally(() => {
          refreshingRef.current = false;
          setRefreshing(false);
          pull.set(0);
        });
    },
    [disabled, onRefresh, pull, threshold],
  );

  const onPointerCancel = useCallback(() => reset(), [reset]);

  return {
    pull,
    refreshing,
    bind: { onPointerDown, onPointerMove, onPointerUp: release, onPointerCancel },
  };
}
