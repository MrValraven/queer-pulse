import {
  LEAD_FOLLOW_UP_MAX,
  LEAD_FOLLOW_UP_MIN,
  LEAD_TIME_ZONE,
  OPEN_LEAD_STAGES,
  type LeadStage,
} from "./api/leads.types";

const DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const lisbonDayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: LEAD_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** The `YYYY-MM-DD` of `now` in Europe/Lisbon: the day a follow-up is read
 *  against, as the server reads it. */
export function lisbonLeadDay(now: Date = new Date()): string {
  const parts = lisbonDayFormat.formatToParts(now);
  const partOf = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${partOf("year")}-${partOf("month")}-${partOf("day")}`;
}

/** The UTC midnight of a `YYYY-MM-DD` day, or null when the text is no real
 *  calendar day (a 30 February rolls over, so it fails the round trip). */
function utcMidnightOf(day: string): number | null {
  const match = DAY_PATTERN.exec(day);
  if (match === null) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const dayOfMonth = Number(match[3]);
  const date = new Date(Date.UTC(year, monthIndex, dayOfMonth));
  const isRealDay =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === monthIndex &&
    date.getUTCDate() === dayOfMonth;
  return isRealDay ? date.getTime() : null;
}

/** The day `offsetDays` after `day` (negative goes back), by calendar
 *  arithmetic in UTC so no time zone shift can skip or repeat a day. */
export function shiftLeadDay(day: string, offsetDays: number): string {
  const match = DAY_PATTERN.exec(day);
  if (match === null) return day;
  const shifted = new Date(
    Date.UTC(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]) + offsetDays,
    ),
  );
  return shifted.toISOString().slice(0, 10);
}

/** A real `YYYY-MM-DD` day inside the follow-up range the server accepts. */
export function isLeadFollowUpDay(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (utcMidnightOf(value) === null) return false;
  return value >= LEAD_FOLLOW_UP_MIN && value <= LEAD_FOLLOW_UP_MAX;
}

/** A follow-up counts as due only in an open stage, on or before today. */
export function isLeadFollowUpDue(
  stage: LeadStage,
  followUpOn: string | null,
  today: string,
): boolean {
  if (followUpOn === null) return false;
  const isOpenStage = (OPEN_LEAD_STAGES as readonly LeadStage[]).includes(
    stage,
  );
  return isOpenStage && followUpOn <= today;
}
