import type { MyEvent, Pill } from "./myEvents.types";
import type { TFunction } from "../../shared/i18n/types";
import { TODAY, NOW } from "./myEvents.data";

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

/** Whole-day difference from TODAY (0 = today, >0 = future). */
export function dayDiff(dt: Date): number {
  const a = new Date(dt);
  a.setHours(0, 0, 0, 0);
  return Math.round((a.getTime() - TODAY.getTime()) / 86400000);
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

export function atTime(ev: MyEvent, which: "start" | "end"): Date {
  const dt = parseDate(ev.date);
  const [h = 0, m = 0] = (ev[which] || ev.start).split(":").map(Number);
  dt.setHours(h, m, 0, 0);
  return dt;
}

export function isToday(ev: MyEvent): boolean {
  return dayDiff(parseDate(ev.date)) === 0;
}

export function isOnline(ev: MyEvent): boolean {
  return !!ev.online || /online/i.test(ev.venue);
}

/**
 * "Starts in 2h", "Happening now", or null when not imminent. Chrome — the
 * phrase is platform copy, so it resolves through `t()` at call sites (all
 * within components, so `t` is always in scope there).
 */
export function soonLabel(ev: MyEvent, t: TFunction): string | null {
  const s = atTime(ev, "start");
  const e = atTime(ev, "end");
  if (NOW >= s && NOW <= e) return t("myevents:soon.happeningNow");
  const mins = Math.round((s.getTime() - NOW.getTime()) / 60000);
  if (mins < 0) return null;
  if (mins < 60) return t("myevents:soon.startsInMins", { mins });
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m
    ? t("myevents:soon.startsInHoursMins", { hours: h, mins: m })
    : t("myevents:soon.startsInHours", { hours: h });
}

/** Another committed event overlapping this one on the same day, if any. */
export function conflictFor(ev: MyEvent, events: MyEvent[]): MyEvent | null {
  if (!COMMITTED[ev.category] || ev.cancelled) return null;
  const s = atTime(ev, "start");
  const e = atTime(ev, "end");
  for (const o of events) {
    if (
      o.id === ev.id ||
      !COMMITTED[o.category] ||
      o.cancelled ||
      o.date !== ev.date
    )
      continue;
    if (s < atTime(o, "end") && atTime(o, "start") < e) return o;
  }
  return null;
}

/** Whether an event belongs to a given pill bucket. */
export function inPill(ev: MyEvent, p: Pill): boolean {
  const future = dayDiff(parseDate(ev.date)) >= 0;
  switch (p) {
    case "upcoming":
      return (
        (ev.category === "going" ||
          ev.category === "hosting" ||
          ev.category === "waitlisted") &&
        future
      );
    case "going":
      return ev.category === "going" && future;
    case "hosting":
      return ev.category === "hosting";
    case "waitlisted":
      return ev.category === "waitlisted";
    case "past":
      return ev.category === "past";
    case "saved":
      return ev.category === "saved" || ev.category === "invite" || ev.category === "sent";
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
    (ev) => ev.category === "hosting" && parseDate(ev.date).getFullYear() === year,
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
