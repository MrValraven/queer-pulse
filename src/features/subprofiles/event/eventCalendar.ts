import { safeHref } from "../../../shared/lib/safeHref";
import { slugify } from "../poem/poemModel";
import { parseEventDate } from "../eventDates";
import type { SubprofileItemView } from "../api/subprofiles.adapters";

/** RFC 5545 section 3.1: content lines end in CRLF. */
const LINE_BREAK = "\r\n";
/** RFC 5545 section 3.1: a content line is at most 75 octets before folding. */
const MAX_LINE_OCTETS = 75;
/** The doors time an owner stores (`HH:mm`, a single-digit hour allowed). */
const DOORS_PATTERN = /^(\d{1,2}):(\d{2})$/;

const textEncoder = new TextEncoder();

function padNumber(value: number, length = 2): string {
  return String(value).padStart(length, "0");
}

function formatDateValue(year: number, month: number, day: number): string {
  return `${padNumber(year, 4)}${padNumber(month)}${padNumber(day)}`;
}

/** `DTSTAMP` must be a UTC date-time: `yyyymmddThhmmssZ`. */
function formatUtcStamp(moment: Date): string {
  return (
    formatDateValue(
      moment.getUTCFullYear(),
      moment.getUTCMonth() + 1,
      moment.getUTCDate(),
    ) +
    `T${padNumber(moment.getUTCHours())}${padNumber(moment.getUTCMinutes())}` +
    `${padNumber(moment.getUTCSeconds())}Z`
  );
}

/** Escape a TEXT value (RFC 5545 section 3.3.11): backslash, semicolon and
 *  comma take a backslash, and every line break becomes a literal `\n`. */
export function escapeCalendarText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/** Fold one content line into 75-octet pieces, each continuation starting
 *  with a single space (which counts toward its 75). Splits between whole
 *  characters, so a multi-byte letter such as "é" is never cut in half. */
export function foldCalendarLine(line: string): string {
  if (textEncoder.encode(line).length <= MAX_LINE_OCTETS) return line;
  const pieces: string[] = [];
  let currentPiece = "";
  let currentOctets = 0;
  for (const character of line) {
    const characterOctets = textEncoder.encode(character).length;
    // The first piece has the full 75; every later one gives an octet to its
    // leading space.
    const pieceLimit =
      pieces.length === 0 ? MAX_LINE_OCTETS : MAX_LINE_OCTETS - 1;
    if (currentOctets + characterOctets > pieceLimit) {
      pieces.push(currentPiece);
      currentPiece = "";
      currentOctets = 0;
    }
    currentPiece += character;
    currentOctets += characterOctets;
  }
  pieces.push(currentPiece);
  return pieces.join(`${LINE_BREAK} `);
}

/** Where the event happens: the venue, or the subtitle when the owner put
 *  the place there instead. Shared by the sheet and the calendar file so
 *  both name the same place. */
export function eventPlace(item: SubprofileItemView): string {
  return (item.venue ?? "").trim() || item.subtitle.trim();
}

/** The `HH:mm` doors time as hours and minutes, or null when unset or
 *  unreadable. */
export function parseDoorsTime(
  doors: string | null,
): { hours: number; minutes: number } | null {
  const match = DOORS_PATTERN.exec((doors ?? "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

/**
 * The `.ics` text for one event, or null when its date names no single day
 * (a month-only or unreadable date has no day a calendar could hold).
 *
 * A day date becomes an all-day event (`DTSTART;VALUE=DATE` with `DTEND` on
 * the next day). With a doors time it starts at that time as local floating
 * time, which every calendar reads in the visitor's own zone; the persona
 * stores no end time, so no `DTEND` is invented and the entry marks the
 * moment the doors open.
 */
export function buildEventCalendar(
  item: SubprofileItemView,
  now: Date = new Date(),
): string | null {
  const dateParts = parseEventDate(item.date);
  if (!dateParts || dateParts.day === null) return null;
  const { year, month, day } = dateParts;
  const doorsTime = parseDoorsTime(item.doors);

  const timingLines: string[] = [];
  if (doorsTime) {
    timingLines.push(
      `DTSTART:${formatDateValue(year, month, day)}T${padNumber(doorsTime.hours)}${padNumber(doorsTime.minutes)}00`,
    );
  } else {
    // `Date` rolls the 32nd of a month over into the next one.
    const nextDay = new Date(year, month - 1, day + 1);
    timingLines.push(
      `DTSTART;VALUE=DATE:${formatDateValue(year, month, day)}`,
      `DTEND;VALUE=DATE:${formatDateValue(nextDay.getFullYear(), nextDay.getMonth() + 1, nextDay.getDate())}`,
    );
  }

  const place = eventPlace(item);
  const details = [item.description.trim(), item.meta.trim()]
    .filter(Boolean)
    .join("\n\n");
  const eventUrl = safeHref(item.url);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//QueerPulse//Event sheet//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeCalendarText(item.id)}@queerpulse`,
    `DTSTAMP:${formatUtcStamp(now)}`,
    ...timingLines,
    `SUMMARY:${escapeCalendarText(item.title)}`,
    ...(place ? [`LOCATION:${escapeCalendarText(place)}`] : []),
    ...(details ? [`DESCRIPTION:${escapeCalendarText(details)}`] : []),
    ...(eventUrl ? [`URL:${eventUrl}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldCalendarLine).join(LINE_BREAK) + LINE_BREAK;
}

/** The download's file name: the slugified title, `event.ics` when the title
 *  has no letters or digits left to slug. */
export function calendarFileName(title: string): string {
  return `${slugify(title) || "event"}.ics`;
}
