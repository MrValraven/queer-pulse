// The next release countdown, read as whole days and hours.

export type CountdownParts =
  | { kind: "daysAndHours"; days: number; hours: number }
  | { kind: "underAnHour" }
  | { kind: "now" };

const HOUR_IN_MILLISECONDS = 3_600_000;
const HOURS_IN_A_DAY = 24;

/** A publish time at or before now reads as going live now (the publish
 *  job can run a little late), so the countdown never shows a negative. */
export function countdownPartsOf(publishAt: Date, now: Date): CountdownParts {
  const remainingMilliseconds = publishAt.getTime() - now.getTime();
  if (!(remainingMilliseconds > 0)) return { kind: "now" };
  if (remainingMilliseconds < HOUR_IN_MILLISECONDS)
    return { kind: "underAnHour" };
  const wholeHours = Math.floor(remainingMilliseconds / HOUR_IN_MILLISECONDS);
  return {
    kind: "daysAndHours",
    days: Math.floor(wholeHours / HOURS_IN_A_DAY),
    hours: wholeHours % HOURS_IN_A_DAY,
  };
}
