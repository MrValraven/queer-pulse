/**
 * Tap tempo: the bpm is the average gap between the last taps, clamped to the
 * contract's 60..200 and rounded to one decimal place.
 */
import { VJ_LIMITS } from "../../../shared/contracts/vj";

/** A pause this long between two taps starts a new count. */
export const VJ_TAP_RESET_GAP_MS = 2000;
/** How many recent taps the average reads. */
export const VJ_TAP_MEMORY = 8;

function clampAndRoundBpm(bpm: number): number {
  const clampedBpm = Math.min(
    VJ_LIMITS.bpmMax,
    Math.max(VJ_LIMITS.bpmMin, bpm),
  );
  return Math.round(clampedBpm * 10) / 10;
}

export function registerVjTap(
  tapTimes: readonly number[],
  now: number,
): { tapTimes: number[]; bpm: number | null } {
  const previousTapTime = tapTimes.at(-1);
  const shouldStartOver =
    previousTapTime === undefined ||
    now < previousTapTime ||
    now - previousTapTime > VJ_TAP_RESET_GAP_MS;
  const nextTapTimes = shouldStartOver
    ? [now]
    : [...tapTimes, now].slice(-VJ_TAP_MEMORY);
  const firstTapTime = nextTapTimes[0];
  if (nextTapTimes.length < 2 || firstTapTime === undefined) {
    return { tapTimes: nextTapTimes, bpm: null };
  }
  const averageGapMs = (now - firstTapTime) / (nextTapTimes.length - 1);
  const bpm = averageGapMs > 0 ? 60000 / averageGapMs : VJ_LIMITS.bpmMax;
  return { tapTimes: nextTapTimes, bpm: clampAndRoundBpm(bpm) };
}
