import type { Formatters } from "../../shared/i18n/format";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * "3 minutes ago" / "há 3 minutos" for an ISO timestamp, through
 * `Intl.RelativeTimeFormat` so the phrasing is the locale's, not ours.
 *
 * Rounds toward the coarser unit at each threshold rather than reporting
 * "90 seconds ago": on this page the number is a reassurance that the answer is
 * current, and precision beyond the minute is noise. Anything under a minute
 * reads as "just now" (`numeric: "auto"` renders a 0-second offset that way).
 */
export function relativeFromNow(
  isoTimestamp: string,
  format: Formatters,
  now: number = Date.now(),
): string {
  const then = new Date(isoTimestamp).getTime();
  if (Number.isNaN(then)) return "";
  const elapsedMs = now - then;

  if (elapsedMs < MINUTE_MS) return format.relativeTime(0, "second");
  if (elapsedMs < HOUR_MS) {
    return format.relativeTime(-Math.round(elapsedMs / MINUTE_MS), "minute");
  }
  if (elapsedMs < DAY_MS) {
    return format.relativeTime(-Math.round(elapsedMs / HOUR_MS), "hour");
  }
  return format.relativeTime(-Math.round(elapsedMs / DAY_MS), "day");
}
