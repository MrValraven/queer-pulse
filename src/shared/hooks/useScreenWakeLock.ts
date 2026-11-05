import { useEffect } from "react";

/**
 * Keeps the screen awake while `isActive` is true. Requests a Screen Wake Lock
 * on activation, requests again when the page becomes visible (the browser
 * drops the lock when the tab is hidden), releases the previous sentinel when
 * a new one arrives, and releases on deactivate and on unmount. Every
 * rejection is swallowed, and a browser without `navigator.wakeLock` does
 * nothing.
 */
export function useScreenWakeLock(isActive: boolean): void {
  useEffect(() => {
    if (!isActive || !("wakeLock" in navigator)) return;
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
  }, [isActive]);
}
