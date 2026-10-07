import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CHECKIN_FOCUS_PARAM } from "../gatheringPaths";

const FOCUS_ON_VALUE = "1";

/**
 * Focus mode for the Check-in tab. The flag lives in the URL (`?focus=1`) so a
 * reload or a shared link keeps the door view. While on, Escape leaves it
 * (unless a dialog such as the scanner owns the key, or a handler already spent
 * it, as the check-in search field does when it clears its text) and the
 * screen stays awake.
 */
export function useFocusMode(): {
  isFocusMode: boolean;
  enterFocusMode: () => void;
  exitFocusMode: () => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const isFocusMode = searchParams.get(CHECKIN_FOCUS_PARAM) === FOCUS_ON_VALUE;

  const enterFocusMode = useCallback(() => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set(CHECKIN_FOCUS_PARAM, FOCUS_ON_VALUE);
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const exitFocusMode = useCallback(() => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete(CHECKIN_FOCUS_PARAM);
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  useEffect(() => {
    if (!isFocusMode) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      // A filled check-in search field clears itself on Escape and calls
      // preventDefault (see CheckinToolbar), so the guard above lets that be
      // all. On an empty field the key reaches this line.
      exitFocusMode();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode, exitFocusMode]);

  useEffect(() => {
    if (!isFocusMode || !("wakeLock" in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let isCancelled = false;

    function requestWakeLock() {
      navigator.wakeLock
        .request("screen")
        .then((acquired) => {
          if (isCancelled) {
            acquired.release().catch(() => undefined);
            return;
          }
          sentinel?.release().catch(() => undefined);
          sentinel = acquired;
        })
        .catch(() => undefined);
    }
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") requestWakeLock();
    }

    requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      isCancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      sentinel?.release().catch(() => undefined);
    };
  }, [isFocusMode]);

  return { isFocusMode, enterFocusMode, exitFocusMode };
}
