/** A committed seek the bar keeps showing until the clock catches up. */
export interface StudioSeekHold {
  targetSeconds: number;
  /** The clock when the seek was committed. */
  originSeconds: number;
  startedAtMs: number;
  /** The clock's seek count once this seek has landed. A higher count
   *  means another control seeked since. */
  expectedSeekCount: number;
}

/** The clock as the hold reads it. */
export interface StudioSeekHoldClock {
  clockSeconds: number;
  clockSeekCount: number;
  isPlaying: boolean;
}

/** A hold that the clock never confirms lets go after this long. */
export const SEEK_HOLD_TIMEOUT_MS = 1500;

/** The clock this close to the target means the seek landed. */
const LANDED_SECONDS = 0.5;
/** The clock this far from the origin, away from the target, means another
 *  seek landed elsewhere. */
const MOVED_ON_SECONDS = 2;
/** While playing, the announced time follows the clock in steps this big. */
const ANNOUNCE_STEP_SECONDS = 5;
/** A move back further than this is announced at once. */
const ANNOUNCE_BACK_SECONDS = 0.5;

/** Whether the hold lets go. Another control's seek (the clock's seek
 *  count passed this seek's) lets go at once. player.seek ticks exactly
 *  onto the target, so while playing the hold waits for the next real
 *  tick. A clock far from both ends (a jump the count does not see, such
 *  as a remote device) lets go too. A stale tick near the origin keeps
 *  the hold. */
export function shouldReleaseSeekHold(
  hold: StudioSeekHold,
  { clockSeconds, clockSeekCount, isPlaying }: StudioSeekHoldClock,
): boolean {
  if (clockSeekCount > hold.expectedSeekCount) return true;
  const distanceFromTarget = Math.abs(clockSeconds - hold.targetSeconds);
  if (distanceFromTarget <= LANDED_SECONDS)
    return !isPlaying || clockSeconds !== hold.targetSeconds;
  return Math.abs(clockSeconds - hold.originSeconds) > MOVED_ON_SECONDS;
}

/** Whether the slider's spoken value moves to `nextSeconds`. Exact moves
 *  (a drag, a key, a pause) always speak; steady playback speaks every
 *  five seconds and on any jump back. */
export function shouldAnnounceSeek(
  previousSeconds: number,
  nextSeconds: number,
  isExact: boolean,
): boolean {
  if (isExact) return !Object.is(nextSeconds, previousSeconds);
  return (
    Math.abs(nextSeconds - previousSeconds) >= ANNOUNCE_STEP_SECONDS ||
    nextSeconds < previousSeconds - ANNOUNCE_BACK_SECONDS
  );
}
