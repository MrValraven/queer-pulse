import { routes } from "../../app/routeMap";
import type { TFunction } from "../../shared/i18n/types";
import { downloadBlob } from "../../shared/lib/downloadBlob";
import { icsTimestamp } from "../../shared/lib/calendarExport";
import { gatheringPath } from "../gatherings/data";
import { atTime } from "./myEvents.helpers";
import type { MyEvent } from "./myEvents.types";

/** RFC5545 text escaping: backslash, comma, semicolon, and newlines. */
export function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/**
 * The real instant a card's start (or end) stands for, or null when the event
 * has no end at all.
 *
 * A card's `date`/`start`/`end` strings are display values: in live mode
 * they're the API instant already rendered in the BROWSER's zone
 * (`splitIso`, myEvents.adapters.ts), so writing them back out as a floating
 * `YYYYMMDDTHHMMSS` handed the importing calendar a different moment whenever
 * the reader's device zone differed from the event's. So the raw ISO instant
 * the API sent wins whenever it's there, and everything is exported as UTC.
 *
 * Demo mode has no raw ISO (its mock authors wall-clock times directly), so it
 * falls back to `atTime`, which already resolves a wall-clock time against the
 * event's own `timezone` when that is a real IANA zone and interprets it
 * locally otherwise. A `TZID` parameter would be the other route, but a TZID
 * has to name a `VTIMEZONE` component carried in the same file, and the demo
 * fixture's zone is a display abbreviation ("WEST") rather than a zone id —
 * so a resolved UTC instant is both more correct and more portable.
 */
function instantFor(ev: MyEvent, which: "start" | "end"): Date | null {
  const iso = which === "start" ? ev.startAtIso : ev.endAtIso;
  if (iso) {
    const parsed = new Date(iso);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  if (which === "end" && !ev.end) return null;
  // An event with no date at all (a stub invite row whose event summary the
  // API left out) can't make a valid VEVENT — DTSTART is required — so it is
  // left out of the file rather than exported at a nonsense instant.
  if (!ev.date) return null;
  const derived = atTime(ev, which);
  return Number.isNaN(derived.getTime()) ? null : derived;
}

/** Absolute URL of the event's own page, for the `URL:`/`DESCRIPTION:` lines. */
function eventUrl(ev: MyEvent): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return origin + (ev.slug ? gatheringPath(ev.slug) : routes.gatherings);
}

/**
 * Build a valid VCALENDAR string from a list of events, every instant written
 * in UTC. `t` renders the `DESCRIPTION` line, so the exported entry reads in
 * the member's own language.
 */
export function toICS(events: MyEvent[], t: TFunction): string {
  // RFC 5545 §3.6.1 requires DTSTAMP on every VEVENT — when the entry was
  // generated, which for a client-side export is now.
  const stamp = icsTimestamp(new Date());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "PRODID:-//QueerPulse//My Events//EN",
  ];
  for (const ev of events) {
    const start = instantFor(ev, "start");
    if (!start) continue;
    const end = instantFor(ev, "end");
    const url = eventUrl(ev);
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.id}@queerpulse`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART:${icsTimestamp(start)}`);
    if (end) lines.push(`DTEND:${icsTimestamp(end)}`);
    lines.push(`SUMMARY:${escapeText(ev.title)}`);
    lines.push(`LOCATION:${escapeText(ev.venue)}`);
    const description = t("myevents:ics.description", { url });
    lines.push(`DESCRIPTION:${escapeText(description)}`);
    // A URI value, so it is NOT TEXT-escaped (escaping would corrupt the link).
    lines.push(`URL:${url}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/** Trigger a client-side download of an .ics file for the given events. */
export function downloadICS(
  filename: string,
  events: MyEvent[],
  t: TFunction,
): void {
  downloadBlob(filename, toICS(events, t), "text/calendar;charset=utf-8");
}
