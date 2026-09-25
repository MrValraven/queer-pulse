import { useEffect, useState } from "react";

/**
 * Seconds left in the take-it-back window, measured against the wall clock so
 * a backgrounded tab (where timers are throttled) comes back telling the truth
 * instead of counting down from where it fell asleep.
 */
export function useUnpublishCountdown(
  totalSeconds: number,
  isActive: boolean,
): number {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    if (!isActive) return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsedSeconds);
      setSecondsLeft(remaining);
      if (remaining === 0) window.clearInterval(timer);
    }, 250);
    return () => window.clearInterval(timer);
  }, [isActive, totalSeconds]);

  return secondsLeft;
}
