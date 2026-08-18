/**
 * Generic calendar-event export: an .ics file (opens in Apple Calendar,
 * Outlook, and most other calendar apps) or a pre-filled Google Calendar
 * "create event" link. Pure client-side generation, no backend involved, so
 * it behaves identically in demo and live mode.
 */
import { downloadBlob } from "./downloadBlob";

export interface CalendarEventInput {
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
}

export function icsTimestamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function icsEscape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

/** Generate an event UID, falling back when crypto.randomUUID is unavailable. */
function uid(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function buildIcs(input: CalendarEventInput): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//QueerPulse//Events//EN",
    "BEGIN:VEVENT",
    `UID:${uid()}@queerpulse.app`,
    `DTSTAMP:${icsTimestamp(new Date())}`,
    `DTSTART:${icsTimestamp(input.start)}`,
    `DTEND:${icsTimestamp(input.end)}`,
    `SUMMARY:${icsEscape(input.title)}`,
    input.location ? `LOCATION:${icsEscape(input.location)}` : "",
    input.description ? `DESCRIPTION:${icsEscape(input.description)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

/** Build and download an .ics file for `input` under `filename`. */
export function downloadIcsFile(filename: string, input: CalendarEventInput): void {
  downloadBlob(filename, buildIcs(input), "text/calendar");
}

/** A pre-filled Google Calendar "create event" link. */
export function googleCalendarUrl(input: CalendarEventInput): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${icsTimestamp(input.start)}/${icsTimestamp(input.end)}`,
  });
  if (input.description) params.set("details", input.description);
  if (input.location) params.set("location", input.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** A pre-filled Outlook Web "add event" deep link. */
export function outlookCalendarUrl(input: CalendarEventInput): string {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: input.title,
    startdt: input.start.toISOString(),
    enddt: input.end.toISOString(),
  });
  if (input.location) params.set("location", input.location);
  if (input.description) params.set("body", input.description);
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/** A pre-filled Yahoo Calendar "add event" link. */
export function yahooCalendarUrl(input: CalendarEventInput): string {
  const durationMinutes = Math.max(
    0,
    Math.round((input.end.getTime() - input.start.getTime()) / 60000),
  );
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const dur = `${String(hours).padStart(2, "0")}${String(minutes).padStart(2, "0")}`;
  const params = new URLSearchParams({
    v: "60",
    view: "d",
    type: "20",
    title: input.title,
    st: icsTimestamp(input.start),
    dur,
  });
  if (input.location) params.set("in_loc", input.location);
  if (input.description) params.set("desc", input.description);
  return `https://calendar.yahoo.com/?${params.toString()}`;
}
