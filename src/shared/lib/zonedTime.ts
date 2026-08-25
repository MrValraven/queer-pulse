/** Wall-clock date+time in `timeZone`, converted to the correct UTC instant. */
export function zonedWallTimeToUtc(
  year: number,
  monthIndex0: number,
  day: number,
  hours: number,
  minutes: number,
  timeZone: string,
): Date {
  const guess = Date.UTC(year, monthIndex0, day, hours, minutes);
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(new Date(guess));
    const get = (type: string) =>
      Number(parts.find((p) => p.type === type)?.value);
    // Reconstruct the UTC millis those formatted wall-clock parts would represent,
    // then correct the guess by the delta. One pass only — doesn't resolve
    // DST-ambiguous/skipped hours (e.g. the repeated or missing hour at a DST changeover).
    const asIfUtc = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour"),
      get("minute"),
      get("second"),
    );
    const delta = asIfUtc - guess;
    return new Date(guess - delta);
  } catch {
    // Invalid IANA zone name (unvalidated external/mock data): fall back to
    // naive local-time interpretation, matching prior behavior.
    return new Date(year, monthIndex0, day, hours, minutes);
  }
}
