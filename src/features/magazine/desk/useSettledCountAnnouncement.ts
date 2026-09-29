import { useEffect, useRef, useState } from "react";

/** How long the count must hold still before it is announced: long enough
 *  to let a typed search finish, short enough to follow a chip press. */
export const COUNT_SETTLE_DELAY_MS = 700;

/**
 * The count to announce in a polite live region once it has settled, or
 * null before there is anything to say. The first value it sees is the
 * baseline and is never announced, so loading the desk stays quiet. After
 * that each change waits for `COUNT_SETTLE_DELAY_MS` without a further
 * change; a burst that lands back on the last announced count says nothing.
 */
export function useSettledCountAnnouncement(count: number): number | null {
  const [announcedCount, setAnnouncedCount] = useState<number | null>(null);
  const lastSettledCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (lastSettledCountRef.current === null) {
      lastSettledCountRef.current = count;
      return undefined;
    }
    if (count === lastSettledCountRef.current) return undefined;
    const timeoutId = window.setTimeout(() => {
      lastSettledCountRef.current = count;
      setAnnouncedCount(count);
    }, COUNT_SETTLE_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, [count]);

  return announcedCount;
}
