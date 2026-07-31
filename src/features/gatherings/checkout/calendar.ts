/* Calendar helpers for the confirmation step.
   No user-facing chrome lives here except the ICS `description` param, which
   callers build with `t()` — this stays a plain function so it's easy to test
   without an i18n context. */

import { downloadBlob } from "../../../shared/lib/downloadBlob";

export function googleCalendarUrl(): string {
  return (
    "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" +
    encodeURIComponent("Queer Supper Club #13") +
    "&dates=20260628T193000/20260628T220000&location=" +
    encodeURIComponent("Mouraria, Lisbon")
  );
}

export function downloadIcs(description: string): void {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "DTSTART:20260628T193000",
    "DTEND:20260628T220000",
    "SUMMARY:Queer Supper Club #13",
    "LOCATION:Mouraria, Lisbon",
    "DESCRIPTION:" + description,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  downloadBlob("supper-club-13.ics", ics, "text/calendar");
}
