/** Add-to-calendar helpers for the directory detail page's "Upcoming here"
 * card. Small and generic on purpose: given a local floating ISO datetime
 * (no timezone offset — the same wall-clock string the directory API and
 * demo fixtures already carry as `upcoming[].startAt`), build a Google
 * Calendar template link and a downloadable .ics file. Reuses the RFC5545
 * text-escaping already written for "My events" (`myEvents.ics.ts`) instead
 * of re-implementing it. */

import { escapeText } from "../myevents/myEvents.ics";

export interface CalendarEventInput {
  title: string;
  /** Local floating ISO datetime, e.g. "2026-06-21T20:00:00" (no `Z`/offset). */
  startISO: string;
  /** Defaults to `startISO` + 2h when omitted. */
  endISO?: string;
  location?: string;
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

function resolveEnd(start: Date, endISO?: string): Date {
  return endISO ? new Date(endISO) : new Date(start.getTime() + TWO_HOURS_MS);
}

/** Format a Date using its LOCAL getters (not UTC) into the basic
 * `YYYYMMDDTHHMMSS` form both Google Calendar and ICS expect for a floating
 * (timezone-less) timestamp — mirrors `startAt`'s own local-floating
 * convention, so no spurious timezone shift is introduced. */
function formatFloating(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

/** Build a "Google Calendar · add event" template URL. Opens in a new tab —
 * the user reviews and saves it themselves, no account access needed. */
export function buildGoogleCalendarUrl({
  title,
  startISO,
  endISO,
  location,
}: CalendarEventInput): string {
  const start = new Date(startISO);
  const end = resolveEnd(start, endISO);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatFloating(start)}/${formatFloating(end)}`,
    // Pin the wall-clock time to Lisbon rather than letting Google render it
    // in the viewer's own timezone — `startISO` is a Lisbon-local floating
    // timestamp (no offset), and this is a Lisbon directory.
    ctz: "Europe/Lisbon",
  });
  if (location) params.set("location", location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Build a minimal, valid VCALENDAR/VEVENT string for a single event. */
export function buildIcs({
  title,
  startISO,
  endISO,
  location,
}: CalendarEventInput): string {
  const start = new Date(startISO);
  const end = resolveEnd(start, endISO);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//QueerPulse//Directory//EN",
    "BEGIN:VEVENT",
    `UID:${formatFloating(start)}-${Math.random().toString(36).slice(2)}@queerpulse`,
    `DTSTART:${formatFloating(start)}`,
    `DTEND:${formatFloating(end)}`,
    `SUMMARY:${escapeText(title)}`,
    ...(location ? [`LOCATION:${escapeText(location)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

/** Trigger a client-side download of the .ics built from `input`. */
export function downloadUpcomingIcs(
  input: CalendarEventInput,
  filename: string,
): void {
  const blob = new Blob([buildIcs(input)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
