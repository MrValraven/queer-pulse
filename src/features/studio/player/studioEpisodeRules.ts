// Studio artist kinds: the listener rules for podcast episodes (spec 5.6,
// 5.7). Pure, so the player, the tracker and the rows share one reading.

export const STUDIO_EPISODE_SPEEDS = [0.8, 1, 1.25, 1.5, 2] as const;
export type StudioEpisodeSpeed = (typeof STUDIO_EPISODE_SPEEDS)[number];
export const DEFAULT_EPISODE_SPEED: StudioEpisodeSpeed = 1;

export const EPISODE_SKIP_BACK_SECONDS = 15;
export const EPISODE_SKIP_FORWARD_SECONDS = 30;
/** The media session's seek step for music. */
export const MUSIC_SEEK_SECONDS = 10;
export const EPISODE_SAVE_INTERVAL_SECONDS = 10;
export const EPISODE_RESUME_MIN_REMAINING_SECONDS = 30;
export const EPISODE_PLAYED_FRACTION = 0.9;
/** A load that starts before this second started from the top, so a saved
 *  place may take over; a `&t=` link starts at 1 s or later and wins. */
export const EPISODE_FRESH_START_SECONDS = 1;

const SPEEDS: readonly number[] = STUDIO_EPISODE_SPEEDS;

export function isStudioEpisodeSpeed(
  value: unknown,
): value is StudioEpisodeSpeed {
  return typeof value === "number" && SPEEDS.includes(value);
}

/** Where a fresh play of an episode should jump to, or null to stay put. */
export function resumeTargetSeconds(
  positionSeconds: number | undefined,
  durationSeconds: number | null,
  startedAtSeconds: number,
): number | null {
  if (
    positionSeconds === undefined ||
    !Number.isFinite(positionSeconds) ||
    positionSeconds <= 0
  )
    return null;
  if (startedAtSeconds >= EPISODE_FRESH_START_SECONDS) return null;
  if (
    durationSeconds !== null &&
    durationSeconds - positionSeconds < EPISODE_RESUME_MIN_REMAINING_SECONDS
  )
    return null;
  return positionSeconds;
}

export function hasReachedPlayed(
  currentTime: number,
  durationSeconds: number | null,
): boolean {
  return (
    durationSeconds !== null &&
    durationSeconds > 0 &&
    currentTime >= durationSeconds * EPISODE_PLAYED_FRACTION
  );
}

/** Whole minutes left, rounded up, for "12 min left"; null with nothing
 *  saved or nothing left. */
export function minutesLeft(
  positionSeconds: number | undefined,
  durationSeconds: number | null,
): number | null {
  if (positionSeconds === undefined || durationSeconds === null) return null;
  const remainingSeconds = durationSeconds - positionSeconds;
  if (remainingSeconds <= 0) return null;
  return Math.max(1, Math.ceil(remainingSeconds / 60));
}

/** Skip back 15 s or forward 30 s, kept inside the episode. */
export function skipTargetSeconds(
  currentTime: number,
  direction: "back" | "forward",
  durationSeconds: number | null,
): number {
  const target =
    direction === "back"
      ? currentTime - EPISODE_SKIP_BACK_SECONDS
      : currentTime + EPISODE_SKIP_FORWARD_SECONDS;
  const ceiling = durationSeconds ?? Number.POSITIVE_INFINITY;
  return Math.min(Math.max(0, target), ceiling);
}
