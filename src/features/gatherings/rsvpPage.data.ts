import type { IconType } from "react-icons";
import { FiCalendar, FiMapPin, FiUser } from "react-icons/fi";
import { memberName } from "../members/data/members";
import { downloadBlob } from "../../shared/lib/downloadBlob";

/**
 * `value` is either plain organizer-authored content (location, host name —
 * leave English) or a `Date` for the one row that's a timestamp, so
 * `RsvpPage` can format it with `useFormat()` instead of a baked
 * "Sunday 22 June · 7:00 PM" string.
 */
export const RSVP_DETAILS: {
  icon: IconType;
  background: string;
  labelKey: string;
  value: string | Date;
}[] = [
  {
    icon: FiCalendar,
    background: "rgba(232,119,90,.1)",
    labelKey: "gatherings:rsvp.details.dateTime",
    value: new Date(2026, 5, 22, 19, 0),
  },
  {
    icon: FiMapPin,
    background: "rgba(74,140,111,.1)",
    labelKey: "gatherings:rsvp.details.location",
    value: "Mouraria Community Centre",
  },
  {
    icon: FiUser,
    background: "rgba(45,27,61,.07)",
    labelKey: "gatherings:rsvp.details.host",
    value: memberName("mariana"),
  },
];

/** Reading-group organiser's first name — used to fill the Code of Care copy. */
export const RSVP_HOST_NAME = memberName("mariana");

/** Fictional attendees + the organiser's own words — organizer/member content,
 *  left in English; held as constants (not inline JSX text) so the page's
 *  copy has a single source. */
export const RSVP_ATTENDEE_NAMES = "Sofia, Tomás, Beatriz, Jonas";
export const RSVP_HOST_QUOTE =
  "\"So glad you're coming. We'll be reading chapters 10–14 this week. Bring your thoughts on Shevek's theory of time and simultaneity — it's a good one. The kitchen opens from 6:45 if you'd like to arrive early and settle in.\"";

export const GATHERING_TITLE = "The Dispossessed — Reading Group #8";
const GATHERING_LOCATION = "Mouraria Community Centre";
const GATHERING_DETAILS_TEXT =
  "Reading group #8 — chapters 10–14 of The Dispossessed. The kitchen opens from 6:45 PM if you'd like to arrive early. RSVP'd via QueerPulse.";
// 22 June 2026, 19:00–21:00 UTC, in Google Calendar's compact UTC format.
const GATHERING_START = "20260622T190000Z";
const GATHERING_END = "20260622T210000Z";

export function googleCalendarUrl() {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: GATHERING_TITLE,
    dates: `${GATHERING_START}/${GATHERING_END}`,
    details: GATHERING_DETAILS_TEXT,
    location: GATHERING_LOCATION,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Escape commas, semicolons, and newlines per the iCalendar (RFC 5545) spec. */
function icsEscape(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Build a VCALENDAR document, wrap it in a Blob, and trigger a download. */
export function downloadIcs() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//QueerPulse//Gatherings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${GATHERING_START}-queerpulse@queerpulse.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${GATHERING_START}`,
    `DTEND:${GATHERING_END}`,
    `SUMMARY:${icsEscape(GATHERING_TITLE)}`,
    `DESCRIPTION:${icsEscape(GATHERING_DETAILS_TEXT)}`,
    `LOCATION:${icsEscape(GATHERING_LOCATION)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  downloadBlob(
    "queerpulse-reading-group-8.ics",
    lines.join("\r\n"),
    "text/calendar;charset=utf-8",
  );
}

/**
 * Code of Care items shown on the confirmation page. `strongKey`/`restKey` are
 * platform chrome (the same safety framing appears on every RSVP), reused
 * verbatim; the organiser item interpolates the host's name so it stays
 * correct if the array is ever reused for a different gathering.
 */
export const RSVP_COC: {
  id: string;
  strongKey: string;
  restKey: string;
  restValues?: Record<string, string>;
}[] = [
  {
    id: "affirming",
    strongKey: "gatherings:rsvp.coc.affirming.strong",
    restKey: "gatherings:rsvp.coc.affirming.rest",
  },
  {
    id: "consent",
    strongKey: "gatherings:rsvp.coc.consent.strong",
    restKey: "gatherings:rsvp.coc.consent.rest",
  },
  {
    id: "privacy",
    strongKey: "gatherings:rsvp.coc.privacy.strong",
    restKey: "gatherings:rsvp.coc.privacy.rest",
  },
  {
    id: "organiser",
    strongKey: "gatherings:rsvp.coc.organiser.strong",
    restKey: "gatherings:rsvp.coc.organiser.rest",
    restValues: { host: RSVP_HOST_NAME },
  },
];
