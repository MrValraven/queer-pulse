import type { Formatters } from "../../shared/i18n/format";
import {
  STUDIO_SCHEDULE_MAX_LEAD_DAYS,
  STUDIO_SCHEDULE_MIN_LEAD_MINUTES,
} from "./api/studio.types";

/** What the two inputs hold: "YYYY-MM-DD" and "HH:MM", in the member's zone. */
export interface ScheduleFormValues {
  date: string;
  time: string;
}

export type ScheduleProblem = "incomplete" | "tooSoon" | "tooFar";

export const SCHEDULE_PROBLEM_KEY: Record<ScheduleProblem, string> = {
  incomplete: "studio:schedule.form.incomplete",
  tooSoon: "studio:schedule.form.tooSoon",
  tooFar: "studio:schedule.form.tooFar",
};

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;
const pad = (value: number) => String(value).padStart(2, "0");

/** The member's own calendar date and clock time of an instant. */
export function localParts(instant: Date): ScheduleFormValues {
  return {
    date: `${instant.getFullYear()}-${pad(instant.getMonth() + 1)}-${pad(instant.getDate())}`,
    time: `${pad(instant.getHours())}:${pad(instant.getMinutes())}`,
  };
}

/** Tomorrow at 18:00 in the member's zone. */
export function defaultScheduleValues(
  now: Date = new Date(),
): ScheduleFormValues {
  return localParts(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 18, 0),
  );
}

/** The picked date and time as one instant; null when a field is empty, the
 *  date does not exist (30 February) or the clock skips that time in the
 *  member's zone (01:30 on Lisbon's spring-forward night reads as 02:30). */
export function instantFromValues(values: ScheduleFormValues): Date | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(values.date);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(values.time);
  if (!dateMatch || !timeMatch) return null;
  const year = Number(dateMatch[1]);
  const monthIndex = Number(dateMatch[2]) - 1;
  const day = Number(dateMatch[3]);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const instant = new Date(year, monthIndex, day, hours, minutes);
  if (
    Number.isNaN(instant.getTime()) ||
    instant.getFullYear() !== year ||
    instant.getMonth() !== monthIndex ||
    instant.getDate() !== day ||
    instant.getHours() !== hours ||
    instant.getMinutes() !== minutes
  )
    return null;
  return instant;
}

/** The server's window: at least 15 minutes and at most 365 days ahead. */
export function scheduleProblemOf(
  instant: Date | null,
  now: Date = new Date(),
): ScheduleProblem | null {
  if (!instant) return "incomplete";
  const leadMs = instant.getTime() - now.getTime();
  if (leadMs < STUDIO_SCHEDULE_MIN_LEAD_MINUTES * MINUTE_MS) return "tooSoon";
  if (leadMs > STUDIO_SCHEDULE_MAX_LEAD_DAYS * DAY_MS) return "tooFar";
  return null;
}

/** min and max for the date input. */
export function scheduleInputBounds(now: Date = new Date()): {
  min: string;
  max: string;
} {
  return {
    min: localParts(
      new Date(now.getTime() + STUDIO_SCHEDULE_MIN_LEAD_MINUTES * MINUTE_MS),
    ).date,
    max: localParts(
      new Date(now.getTime() + STUDIO_SCHEDULE_MAX_LEAD_DAYS * DAY_MS),
    ).date,
  };
}

/** "Tue, Oct 20" (or "Tue 20 Oct") and "18:00", in the member's locale
 *  and zone, on a 24-hour clock. */
export function scheduleReadback(
  instant: Date,
  formatters: Formatters,
): { date: string; time: string } {
  return {
    date: formatters.date(instant, {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
    time: formatters.time(instant, {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }),
  };
}
