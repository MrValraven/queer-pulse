import { useEffect, useState } from "react";

/** The projector hides the cursor after this long with no pointer or key activity. */
export const VJ_CURSOR_IDLE_MS = 2000;

const ACTIVITY_EVENTS = ["pointermove", "pointerdown", "keydown"] as const;

/**
 * True once `idleMs` has passed with no pointermove, pointerdown or keydown
 * on the window; any of those turns it false again and restarts the wait.
 */
export function useIsPointerIdle(idleMs: number): boolean {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let idleTimerId = window.setTimeout(() => setIsIdle(true), idleMs);
    const handleActivity = (): void => {
      setIsIdle(false);
      window.clearTimeout(idleTimerId);
      idleTimerId = window.setTimeout(() => setIsIdle(true), idleMs);
    };
    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, handleActivity, { passive: true });
    }
    return () => {
      window.clearTimeout(idleTimerId);
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, handleActivity);
      }
    };
  }, [idleMs]);

  return isIdle;
}
