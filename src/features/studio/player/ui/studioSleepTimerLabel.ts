import type { StudioSleepTimerState } from "../studioPlayerContext";

/** Whole seconds left on a minutes timer, rounded up; null for end of track. */
export function remainingSeconds(
  timer: NonNullable<StudioSleepTimerState>,
  now: number,
): number | null {
  if (timer.kind !== "minutes") return null;
  return Math.max(0, Math.ceil((timer.endsAt - now) / 1000));
}
