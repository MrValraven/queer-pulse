import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

/** Stamped on the entry for devtools; ownership is tracked by ref. */
const BACK_DISMISS_STATE = { queerPulseBackDismissSentinel: true };

/**
 * Makes Back (the Android gesture, the browser button) close a full-screen
 * overlay. Opening pushes one entry carrying the current URL and React
 * Router's fields with `idx` one higher (see NavDrawerProvider for why the
 * index matters); Back consumes it and calls `onBack`; any other close pops
 * it. A link inside the overlay navigates with `replace` and calls
 * `markNavigated` first, so the close that follows pops nothing.
 */
export function useHistoryBackDismiss(isOpen: boolean, onBack: () => void) {
  const hasEntryRef = useRef(false);
  const closedByBackRef = useRef(false);
  const isMountedRef = useRef(false);
  const onBackRef = useRef(onBack);
  useLayoutEffect(() => {
    onBackRef.current = onBack;
  });

  useEffect(() => {
    if (!isOpen || hasEntryRef.current) return;
    hasEntryRef.current = true;
    const current = window.history.state as {
      usr?: unknown;
      key?: string;
      idx?: number;
    } | null;
    const currentIndex = typeof current?.idx === "number" ? current.idx : 0;
    window.history.pushState(
      {
        usr: current?.usr ?? null,
        key: current?.key,
        idx: currentIndex + 1,
        ...BACK_DISMISS_STATE,
      },
      "",
    );
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onPopState = () => {
      hasEntryRef.current = false;
      closedByBackRef.current = true;
      onBackRef.current();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    if (closedByBackRef.current) {
      closedByBackRef.current = false;
      return;
    }
    if (!hasEntryRef.current) return;
    hasEntryRef.current = false;
    window.history.back();
  }, [isOpen]);

  // Unmounted while open (the bar left because the queue emptied): pop too.
  // The pop waits a microtask so StrictMode's simulated unmount, which
  // remounts synchronously, keeps its entry and never queues a Back.
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      queueMicrotask(() => {
        if (isMountedRef.current || !hasEntryRef.current) return;
        hasEntryRef.current = false;
        window.history.back();
      });
    };
  }, []);

  const markNavigated = useCallback(() => {
    hasEntryRef.current = false;
  }, []);
  return { markNavigated };
}
