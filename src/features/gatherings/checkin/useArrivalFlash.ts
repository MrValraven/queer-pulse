import { useEffect, useState } from "react";

const FLASH_MS = 300;

/**
 * True for a moment after a row's arrival stamp goes from empty to set while
 * the row is on screen, so the host sees the tap land. A row that mounts
 * already arrived never flashes, a server restamp (one date to another) leaves
 * a running flash alone, and an undo (a date back to empty) ends it.
 */
export function useArrivalFlash(arrivedAtTime: number | null): boolean {
  const [previousArrivedAtTime, setPreviousArrivedAtTime] =
    useState(arrivedAtTime);
  const [isFlashing, setIsFlashing] = useState(false);
  if (previousArrivedAtTime !== arrivedAtTime) {
    setPreviousArrivedAtTime(arrivedAtTime);
    if (previousArrivedAtTime === null && arrivedAtTime !== null) {
      setIsFlashing(true);
    } else if (arrivedAtTime === null) {
      setIsFlashing(false);
    }
  }
  useEffect(() => {
    if (!isFlashing) return;
    const timeoutId = window.setTimeout(() => setIsFlashing(false), FLASH_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isFlashing]);
  return isFlashing;
}
