/** Static event details used to build the .ics calendar file. Mock data. */
export interface IcsEvent {
  title: string;
  description: string;
  location: string;
  /** Start/end in UTC, formatted YYYYMMDDTHHMMSSZ. */
  start: string;
  end: string;
}

export const EVENT_ICS: IcsEvent = {
  title: "QueerPulse Gathering · Shared dinner",
  description:
    "A bilingual (PT/EN) shared dinner and gathering. Doors open 6:45pm. You can cancel up to 48 hours before.",
  location: "Casa do Alentejo, Rua das Portas de Santo Antão 58, Lisbon",
  start: "20260614T180000Z",
  end: "20260614T213000Z",
};

/** Whether the event has sold out — drives the waitlist path. */
export const EVENT_IS_FULL = false;

/** Total capacity, for spots/waitlist copy. */
export const EVENT_CAPACITY = 26;

/** Escape text per RFC 5545 (commas, semicolons, newlines, backslashes). */
function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Build a minimal, valid VCALENDAR/VEVENT string for download. */
export function buildIcs(event: IcsEvent): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const uid = `${event.start}-${Math.random().toString(36).slice(2)}@queerpulse`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//QueerPulse//Gatherings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${event.start}`,
    `DTEND:${event.end}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.description)}`,
    `LOCATION:${escapeIcs(event.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Trigger a client-side download of the .ics file. */
export function downloadIcs(
  event: IcsEvent,
  filename = "queerpulse-event.ics",
) {
  const blob = new Blob([buildIcs(event)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
