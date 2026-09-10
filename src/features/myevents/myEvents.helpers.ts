import type { MyEvent, Pill } from "./myEvents.types";
import type { TFunction } from "../../shared/i18n/types";
import { TODAY, NOW } from "./myEvents.data";
import { zonedWallTimeToUtc } from "../../shared/lib/zonedTime";
import { MAX_GATHERING_SPAN_DAYS } from "../gatherings/createGathering.data";

/** Categories that count as a committed RSVP (used for conflicts + soon bar). */
export const COMMITTED: Record<string, boolean> = {
  going: true,
  hosting: true,
  waitlisted: true,
};

/** Parse a YYYY-MM-DD string into a local Date. */
export function parseDate(s: string): Date {
  const [y = 0, m = 0, d = 0] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function ymd(dt: Date): string {
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

const MILLISECONDS_PER_DAY = 86400000;

/** Whole calendar days from `from` to `to`, negative when `to` is earlier. */
export function daysBetween(from: Date, to: Date): number {
  const startOfFrom = new Date(from);
  startOfFrom.setHours(0, 0, 0, 0);
  const startOfTo = new Date(to);
  startOfTo.setHours(0, 0, 0, 0);
  return Math.round(
    (startOfTo.getTime() - startOfFrom.getTime()) / MILLISECONDS_PER_DAY,
  );
}

/** Whole-day difference from TODAY (0 = today, >0 = future). */
export function dayDiff(dt: Date): number {
  return daysBetween(TODAY, dt);
}

/**
 * The calendar day a gathering ends on.
 *
 * `MyEvent` carries its schedule as display strings, and until spans existed it
 * kept only the end's clock time. Every surface then read the end against the
 * START day, so a 23:00 to 04:00 party ended nineteen hours before it began.
 * `endDate` carries the end's own day beside `end`. Absent, the gathering ends
 * on the day it starts, which is what every event authored before spans meant.
 * A gathering with no stated end at all ends at its start, matching
 * `gatheringHasEnded` and the backend's `hasEnded`.
 */
export function endDateOf(ev: MyEvent): string {
  return ev.end && ev.endDate ? ev.endDate : ev.date;
}

/**
 * Every `YYYY-MM-DD` day the gathering touches, its start day first. One entry
 * on a single day, three across a three-day festival, so a calendar can put it
 * in every cell it actually runs through.
 *
 * Capped at `MAX_GATHERING_SPAN_DAYS`, the span the create wizard and the
 * backend both enforce. A row with a corrupt end date would otherwise build an
 * unbounded array on every render.
 */
export function eventDays(ev: MyEvent): string[] {
  if (!ev.date) return [];
  const startDay = parseDate(ev.date);
  if (Number.isNaN(startDay.getTime())) return [];
  const endDay = parseDate(endDateOf(ev));
  const spanDays = Number.isNaN(endDay.getTime())
    ? 0
    : Math.min(
        Math.max(daysBetween(startDay, endDay), 0),
        MAX_GATHERING_SPAN_DAYS,
      );
  const days: string[] = [];
  for (let offset = 0; offset <= spanDays; offset += 1) {
    const day = new Date(startDay);
    day.setDate(day.getDate() + offset);
    days.push(ymd(day));
  }
  return days;
}

/**
 * Whether the gathering is running on `day` (a `YYYY-MM-DD` string). A
 * multi-day gathering is on every day from its start through its end, so a
 * festival still counts as on today on days two and three.
 */
export function isOnDay(ev: MyEvent, day: string): boolean {
  if (!ev.date) return false;
  return day >= ev.date && day <= endDateOf(ev);
}

export function mondayOf(dt: Date): Date {
  const x = new Date(dt);
  x.setHours(0, 0, 0, 0);
  const off = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - off);
  return x;
}

export function timeStr(ev: MyEvent): string {
  return ev.start + (ev.end ? ` – ${ev.end}` : "");
}

/** The real instant a gathering's start (or end) stands for. The end resolves
 *  against its OWN day, so an overnight end lands after the start. */
export function atTime(ev: MyEvent, which: "start" | "end"): Date {
  const dt = parseDate(which === "end" ? endDateOf(ev) : ev.date);
  const [h = 0, m = 0] = (ev[which] || ev.start).split(":").map(Number);
  if (ev.timezone) {
    return zonedWallTimeToUtc(
      dt.getFullYear(),
      dt.getMonth(),
      dt.getDate(),
      h,
      m,
      ev.timezone,
    );
  }
  dt.setHours(h, m, 0, 0);
  return dt;
}

/** Whether the gathering's own interval covers today. The day-of affordances
 *  (check in, the join link, the ticket, the day-of panel) hang off this, so a
 *  member keeps them for as long as the gathering is actually running. */
export function isToday(ev: MyEvent): boolean {
  return isOnDay(ev, ymd(TODAY));
}

/**
 * Whether any day the gathering runs falls in the given month.
 *
 * A festival opening on 29 September and closing on 2 October belongs to BOTH
 * months. Bucketing it on its opening day alone dropped it out of the agenda
 * entirely for a member browsing October, and left the year overview showing a
 * dot in one month for something that ran through two.
 */
export function isInMonth(
  ev: MyEvent,
  year: number,
  monthIndex: number,
): boolean {
  const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}-`;
  return eventDays(ev).some((day) => day.startsWith(monthPrefix));
}

/**
 * Whether the day-of detail (the run sheet, the door code, what to bring) is
 * still worth putting on screen.
 *
 * `isToday` answers at day granularity, so an overnight party that ended at
 * 04:00 held its run sheet and its ticket until 23:59 that night. A ticket to
 * something that finished this morning helps nobody. A gathering with no
 * stated end has no known finish, so it holds the whole day exactly as it did
 * before spans existed.
 */
export function shouldShowDayOf(ev: MyEvent, now: Date = NOW): boolean {
  if (!isToday(ev)) return false;
  if (!ev.end) return true;
  return atTime(ev, "end") >= now;
}

export function isOnline(ev: MyEvent): boolean {
  return !!ev.online || /online/i.test(ev.venue);
}

/**
 * "Starts in 2h", "Happening now", or null when not imminent. Chrome — the
 * phrase is platform copy, so it resolves through `t()` at call sites (all
 * within components, so `t` is always in scope there).
 */
export function soonLabel(
  ev: MyEvent,
  t: TFunction,
  now: Date = NOW,
): string | null {
  const s = atTime(ev, "start");
  const e = atTime(ev, "end");
  if (now >= s && now <= e) return t("myevents:soon.happeningNow");
  const mins = Math.round((s.getTime() - now.getTime()) / 60000);
  if (mins < 0) return null;
  if (mins < 60) return t("myevents:soon.startsInMins", { mins });
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m
    ? t("myevents:soon.startsInHoursMins", { hours: h, mins: m })
    : t("myevents:soon.startsInHours", { hours: h });
}

/**
 * How many days apart two gatherings' stored day ranges may sit and still have
 * overlapping instants, once differing time zones are allowed for.
 *
 * TWO, and do not shave it to one. Zone offsets run from UTC-12 to UTC+14, a
 * 26-hour spread, so ONE instant carries wall-clock day labels two calendar
 * days apart at the extremes. A gathering at 00:00 on 3 Jan in
 * `Pacific/Kiritimati` and one at 22:00 on 1 Jan in `Etc/GMT+12` are the same
 * morning: 10:00Z either way. A cushion of one skips the second, and telling a
 * member they are free when they are not is the exact bug this whole file was
 * changed to kill.
 */
const OVERLAP_DAY_CUSHION = 2;

/**
 * Another committed event whose interval overlaps this one, if any.
 *
 * Compared as real instants rather than same-day clock times: an overnight
 * party that runs past midnight clashes with the brunch a member said yes to
 * the next morning, and the old same-day test could never see it.
 */
export function conflictFor(ev: MyEvent, events: MyEvent[]): MyEvent | null {
  if (!COMMITTED[ev.category] || ev.cancelled) return null;
  const s = atTime(ev, "start");
  const e = atTime(ev, "end");
  const startDay = parseDate(ev.date);
  const endDay = parseDate(endDateOf(ev));
  for (const o of events) {
    if (o.id === ev.id || !COMMITTED[o.category] || o.cancelled) continue;
    // Day-level prefilter on the stored date strings, before any instant is
    // resolved: `atTime` builds an `Intl` formatter for a zoned gathering, and
    // this runs for every card against every other event. It only ever skips a
    // pair that CANNOT touch, so read `OVERLAP_DAY_CUSHION` before changing it.
    if (
      daysBetween(parseDate(endDateOf(o)), startDay) > OVERLAP_DAY_CUSHION ||
      daysBetween(endDay, parseDate(o.date)) > OVERLAP_DAY_CUSHION
    )
      continue;
    if (s < atTime(o, "end") && atTime(o, "start") < e) return o;
  }
  return null;
}

/** Whether an event belongs to a given pill bucket. */
export function inPill(ev: MyEvent, p: Pill): boolean {
  // Judged on the day the gathering ENDS, so a festival that began yesterday
  // stays in the member's upcoming list while it is still running. Day
  // granularity on purpose: a gathering holds its place for the whole of its
  // closing day, which is what these pills did before spans existed.
  const isStillAhead = dayDiff(parseDate(endDateOf(ev))) >= 0;
  switch (p) {
    case "upcoming":
      return (
        (ev.category === "going" ||
          ev.category === "hosting" ||
          ev.category === "waitlisted") &&
        isStillAhead
      );
    case "going":
      return ev.category === "going" && isStillAhead;
    case "hosting":
      return ev.category === "hosting";
    case "waitlisted":
      return ev.category === "waitlisted";
    case "past":
      return ev.category === "past";
    case "saved":
      return (
        ev.category === "saved" ||
        ev.category === "invite" ||
        ev.category === "sent"
      );
    default:
      return false;
  }
}

export interface YearInsights {
  /** The calendar year these figures cover. */
  year: number;
  /** Gatherings you actually turned up to this year. */
  attended: number;
  /** Gatherings you're hosting this year. */
  hosted: number;
  /** Consecutive months (ending at your most recent one) with a gathering. */
  streak: number;
  /** The community you showed up for most this year, or null. */
  topCircle: string | null;
}

/**
 * Derive the "Your year so far" figures straight from the event list — so the
 * card reflects real activity (populated demo data, or a live account) instead
 * of a hardcoded tally. An empty list yields all-zero, which the card renders
 * as an empty state rather than fake numbers.
 */
export function yearInsights(events: MyEvent[]): YearInsights {
  const year = TODAY.getFullYear();
  const attendedEvents = events.filter(
    (ev) =>
      ev.category === "past" &&
      !ev.noShow &&
      parseDate(ev.date).getFullYear() === year,
  );
  const hosted = events.filter(
    (ev) =>
      ev.category === "hosting" && parseDate(ev.date).getFullYear() === year,
  ).length;

  // Top circle: the community you attended most often this year.
  const tally = new Map<string, number>();
  for (const ev of attendedEvents) {
    if (!ev.community) continue;
    tally.set(ev.community, (tally.get(ev.community) ?? 0) + 1);
  }
  let topCircle: string | null = null;
  let bestCount = 0;
  for (const [circle, count] of tally) {
    if (count > bestCount) {
      bestCount = count;
      topCircle = circle;
    }
  }

  // Streak: consecutive months with a gathering, counting back from the most
  // recent active month (so it reads as an ongoing run, not zero once a
  // fallow month passes).
  const activeMonths = new Set(
    attendedEvents.map((ev) => {
      const dt = parseDate(ev.date);
      return dt.getFullYear() * 12 + dt.getMonth();
    }),
  );
  let streak = 0;
  if (activeMonths.size) {
    let cursor = Math.max(...activeMonths);
    while (activeMonths.has(cursor)) {
      streak += 1;
      cursor -= 1;
    }
  }

  return { year, attended: attendedEvents.length, hosted, streak, topCircle };
}

/** Dot class for a calendar cell, by category. */
export function dotClass(category: string): string {
  return category === "going"
    ? "going"
    : category === "hosting"
      ? "hosting"
      : category === "past"
        ? "past"
        : "pending";
}
