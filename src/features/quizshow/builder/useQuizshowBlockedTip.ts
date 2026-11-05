import { useCallback, useEffect, useRef, useState } from "react";

/** How long a tapped, blocked button keeps its reason up (a phone has no hover). */
const PINNED_TIP_MS = 4_000;

/**
 * State for the studio's blocked-reason tooltip (see `QuizshowBlockedTip`).
 * It shows on hover and keyboard focus through CSS and, for a tap on a phone,
 * for a few seconds after `pin()`. `dismiss()` is Escape: it hides the tip
 * until the pointer or focus leaves (`reset()`) or the next `pin()`.
 */
export function useQuizshowBlockedTip() {
  const [isPinned, setIsPinned] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const timerRef = useRef<number | null>(null);
  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);
  const pin = useCallback(() => {
    clearTimer();
    setIsDismissed(false);
    setIsPinned(true);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setIsPinned(false);
    }, PINNED_TIP_MS);
  }, [clearTimer]);
  const dismiss = useCallback(() => {
    clearTimer();
    setIsPinned(false);
    setIsDismissed(true);
  }, [clearTimer]);
  const reset = useCallback(() => setIsDismissed(false), []);
  useEffect(() => clearTimer, [clearTimer]);
  return { isPinned, isDismissed, pin, dismiss, reset };
}
