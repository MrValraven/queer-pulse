const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

/** Whole seconds left, rounded up so the display reads 0:00 only at the target. */
export function vjCountdownSecondsLeft(remainingMs: number): number {
  if (!Number.isFinite(remainingMs) || remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / MS_PER_SECOND);
}

function twoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * The countdown digits: "m:ss" under an hour, "h:mm:ss" from an hour, and
 * "0:00" at or after the target.
 */
export function formatVjCountdown(remainingMs: number): string {
  const totalSeconds = vjCountdownSecondsLeft(remainingMs);
  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor(
    (totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE,
  );
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  if (hours > 0) {
    return `${hours}:${twoDigits(minutes)}:${twoDigits(seconds)}`;
  }
  return `${minutes}:${twoDigits(seconds)}`;
}
