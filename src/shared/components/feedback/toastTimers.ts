import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import type { ToastItem } from "./toastDeck";

/** The live auto-dismiss timer for one toast, tracked so hovering can pause it.
 *  `remaining` is banked on pause; `endAt` is when the running timer fires. */
export interface ToastTimer {
  timeoutId: number | null;
  endAt: number;
  remaining: number;
  isPaused: boolean;
}

/**
 * The provider's pending timeouts: one countdown per toast showing, and one
 * removal per toast playing its exit. Unmounting clears every one of them, so
 * none fires into a provider that is gone.
 */
export function useToastTimerStore() {
  const timersRef = useRef<Map<number, ToastTimer>>(new Map());
  const removalTimeoutIdsRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    const timerMap = timersRef.current;
    const removalIds = removalTimeoutIdsRef.current;
    return () => {
      for (const timer of timerMap.values()) {
        if (timer.timeoutId !== null) window.clearTimeout(timer.timeoutId);
      }
      timerMap.clear();
      for (const timeoutId of removalIds) window.clearTimeout(timeoutId);
      removalIds.clear();
    };
  }, []);
  return { timersRef, removalTimeoutIdsRef };
}

/**
 * A countdown holds while the pointer holds the stack (see useToastDeckHold),
 * and while keyboard focus is inside that toast. Holding banks what is left;
 * letting go rearms the timer from that remainder. The hairline reads the
 * same two signals through `data-paused`, and this runs before paint, so the
 * bar and the timer stop and start in the same frame. A toast already leaving
 * has no timer entry, so it is skipped.
 */
export function useCountdownHolds(
  timersRef: RefObject<Map<number, ToastTimer>>,
  isPointerHolding: boolean,
  focusedToastId: number | null,
  toasts: readonly ToastItem[],
  startTimer: (id: number, durationMs: number) => void,
) {
  useLayoutEffect(() => {
    for (const [id, timer] of timersRef.current) {
      const shouldPause = isPointerHolding || focusedToastId === id;
      if (shouldPause === timer.isPaused) continue;
      if (!shouldPause) {
        startTimer(id, timer.remaining);
        continue;
      }
      if (timer.timeoutId !== null) window.clearTimeout(timer.timeoutId);
      timersRef.current.set(id, {
        timeoutId: null,
        endAt: timer.endAt,
        remaining: Math.max(0, timer.endAt - Date.now()),
        isPaused: true,
      });
    }
  }, [timersRef, isPointerHolding, focusedToastId, toasts, startTimer]);
}
