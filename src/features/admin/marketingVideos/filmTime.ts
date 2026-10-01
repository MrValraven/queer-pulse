/** "1:05" for 64.8 seconds: a film's length or position, as players show it. */
export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * Seconds left in a render, from how long the frames so far took. `null`
 * until enough frames are done for the estimate to mean anything.
 */
export function secondsLeft(
  done: number,
  total: number,
  elapsedSeconds: number,
): number | null {
  if (done < 10 || elapsedSeconds <= 0) return null;
  return ((total - done) / done) * elapsedSeconds;
}
