import { useLayoutEffect, useState } from "react";
import type { VjClockReader } from "../../engine/vjEngineLook";

/**
 * True once the synced clock has passed `deadlineServerMs` (server epoch ms).
 * Arms one timeout at `clock.toLocalTime(deadline)`; a deadline already past
 * on mount resolves before the first paint, so a stale line never shows.
 * Null never passes. A new deadline starts over.
 */
export function useVjServerDeadline(
  deadlineServerMs: number | null,
  clock: VjClockReader,
): boolean {
  const [passedDeadline, setPassedDeadline] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (deadlineServerMs === null) return undefined;
    let isCancelled = false;
    const markPassed = (): void => {
      if (!isCancelled) setPassedDeadline(deadlineServerMs);
    };
    const delayMs = clock.toLocalTime(deadlineServerMs) - performance.now();
    if (delayMs <= 0) {
      queueMicrotask(markPassed);
      return () => {
        isCancelled = true;
      };
    }
    const timeoutId = window.setTimeout(markPassed, Math.ceil(delayMs));
    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [deadlineServerMs, clock]);

  return deadlineServerMs !== null && passedDeadline === deadlineServerMs;
}
