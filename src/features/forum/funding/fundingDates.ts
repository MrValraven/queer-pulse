import type { Formatters } from "../../../shared/i18n/format";
import { DAY_MS, LISBON_TIME_ZONE } from "./funding.data";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const WALL_CLOCK = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;
const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Minutes a zone is ahead of UTC at one instant (negative when behind). */
function zoneOffsetMinutes(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((entry) => entry.type === type)?.value ?? "0");
  const asUtc = Date.UTC(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour"),
    part("minute"),
    part("second"),
  );
  return Math.round((asUtc - utcMs) / MINUTE_MS);
}

/** "yyyy-mm-ddThh:mm" read as Lisbon time, as an ISO instant. Two passes, so
 *  a time beside the March or October change settles on the right offset. */
export function lisbonWallClockToIso(wallClock: string): string | null {
  const match = WALL_CLOCK.exec(wallClock);
  if (!match) return null;
  const naiveUtc = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
  );
  if (Number.isNaN(naiveUtc)) return null;
  const isInRange =
    Number(match[2]) >= 1 &&
    Number(match[2]) <= 12 &&
    Number(match[3]) >= 1 &&
    Number(match[4]) <= 23 &&
    Number(match[5]) <= 59 &&
    new Date(naiveUtc).getUTCDate() === Number(match[3]);
  if (!isInRange) return null;
  const firstGuess =
    naiveUtc - zoneOffsetMinutes(naiveUtc, LISBON_TIME_ZONE) * MINUTE_MS;
  const settled =
    naiveUtc - zoneOffsetMinutes(firstGuess, LISBON_TIME_ZONE) * MINUTE_MS;
  return new Date(settled).toISOString();
}

/** An ISO instant as the Lisbon "yyyy-mm-ddThh:mm" a date-time field holds. */
export function isoToLisbonWallClock(iso: string): string | null {
  const instant = Date.parse(iso);
  if (Number.isNaN(instant)) return null;
  const shifted = new Date(
    instant + zoneOffsetMinutes(instant, LISBON_TIME_ZONE) * MINUTE_MS,
  );
  return shifted.toISOString().slice(0, 16);
}

/** The last minute of a Lisbon calendar day ("yyyy-mm-dd"), as an instant. */
export function lisbonEndOfDayIso(date: string): string | null {
  return CALENDAR_DATE.test(date)
    ? lisbonWallClockToIso(`${date}T23:59`)
    : null;
}

export type DeadlineCountdown =
  | { kind: "closed" }
  | { kind: "withinHour" }
  | { kind: "hours"; count: number }
  | { kind: "days"; count: number };

/** Time left, independent of any time zone. */
export function deadlineCountdown(
  deadlineIso: string,
  nowMs: number,
): DeadlineCountdown {
  const remainingMs = Date.parse(deadlineIso) - nowMs;
  if (Number.isNaN(remainingMs) || remainingMs <= 0) return { kind: "closed" };
  if (remainingMs < HOUR_MS) return { kind: "withinHour" };
  if (remainingMs < DAY_MS) {
    return { kind: "hours", count: Math.floor(remainingMs / HOUR_MS) };
  }
  return { kind: "days", count: Math.floor(remainingMs / DAY_MS) };
}

const DEADLINE_PARTS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
};

export function formatLisbonDeadline(fmt: Formatters, iso: string): string {
  return fmt.date(new Date(iso), {
    ...DEADLINE_PARTS,
    timeZone: LISBON_TIME_ZONE,
  });
}

export function formatViewerDeadline(
  fmt: Formatters,
  iso: string,
  viewerTimeZone: string,
): string {
  return fmt.date(new Date(iso), {
    ...DEADLINE_PARTS,
    timeZone: viewerTimeZone,
  });
}

export function defaultViewerTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** True when the viewer's clock reads differently from Lisbon's at that
 *  instant, which is when "Your time" earns a line of its own. */
export function isViewerOffsetFromLisbon(
  iso: string,
  viewerTimeZone: string,
): boolean {
  const instant = Date.parse(iso);
  if (Number.isNaN(instant)) return false;
  return (
    zoneOffsetMinutes(instant, viewerTimeZone) !==
    zoneOffsetMinutes(instant, LISBON_TIME_ZONE)
  );
}
