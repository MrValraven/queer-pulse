import {
  escapeIcsText,
  icsTimestamp,
} from "../../../shared/lib/calendarExport";
import { mentionNameKey } from "../../../shared/mentions/mentionNameKey";
import { parseMentions } from "../../../shared/mentions/parseMentions";
import {
  gatheringOccurrences,
  type GatheringOccurrenceInput,
} from "../gatheringOccurrences";
import type { GatheringForm } from "../useGatheringForm";
import { CALENDAR_PRODUCT_ID, CALENDAR_UID_DOMAIN } from "./shareKit.data";

/**
 * The "Add to calendar" file for a just-published gathering: one VEVENT per
 * date, so a weekly series lands in the host's calendar as every date it
 * publishes. `shared/lib/calendarExport` builds a single event only, so the
 * multi-event file is assembled here on its `icsTimestamp` helper.
 */

/** The form fields the calendar file is built from. */
export type GatheringCalendarInput = GatheringOccurrenceInput &
  Pick<GatheringForm, "title" | "description" | "endDate" | "endTime">;

export interface ShareCalendarEvent {
  uid: string;
  title: string;
  start: Date;
  /** Null when the host gave no end time. */
  end: Date | null;
  location: string;
  description: string;
  url: string;
}

/** No resolved names: every mention reads as its bare slug. */
const NO_MENTION_NAMES: ReadonlyMap<string, string> = new Map();

/** The start time the payload builder falls back to. */
const FALLBACK_START_TIME = "19:00";

/** A `"YYYY-MM-DD"` day and an `"HH:MM"` clock as a local instant, or null. */
export function localDateTime(date: string, time: string): Date | null {
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeParts = /^(\d{2}):(\d{2})/.exec(time);
  if (!dateParts || !timeParts) return null;
  const instant = new Date(
    Number(dateParts[1]),
    Number(dateParts[2]) - 1,
    Number(dateParts[3]),
    Number(timeParts[1]),
    Number(timeParts[2]),
  );
  return Number.isNaN(instant.getTime()) ? null : instant;
}

/**
 * How long one date runs, in milliseconds, or null without an end time.
 *
 * Follows the payload builder's `combineEndDateTime`: the host's end date when
 * there is one, else the start day, rolled forward a calendar day with
 * `setDate` when the end clock is at or before the start clock (an evening
 * that runs past midnight). A clock change that night keeps the end on the
 * host's wall clock, so that night runs an hour longer or shorter.
 */
export function gatheringDurationMs(
  input: Pick<GatheringCalendarInput, "date" | "time" | "endDate" | "endTime">,
): number | null {
  if (!input.endTime) return null;
  const startAt = localDateTime(input.date, input.time || FALLBACK_START_TIME);
  if (!startAt) return null;
  const endAt = localDateTime(input.endDate || input.date, input.endTime);
  if (!endAt) return null;
  if (!input.endDate && endAt.getTime() <= startAt.getTime()) {
    endAt.setDate(endAt.getDate() + 1);
  }
  const durationMs = endAt.getTime() - startAt.getTime();
  return durationMs > 0 ? durationMs : null;
}

/**
 * A description's mention tokens as words a calendar app can show. Each one
 * reads as the name it points at when `mentionNames` holds it (keyed
 * `kind:slug`, as the mention renderers key theirs), and as its slug with the
 * sigil dropped otherwise, so `@ana-lopes` reads `ana-lopes`. A `#topic` keeps
 * its hash, the way the gathering page shows it.
 */
export function readableMentionText(
  text: string,
  mentionNames: ReadonlyMap<string, string> = NO_MENTION_NAMES,
): string {
  return parseMentions(text)
    .map((segment) => {
      if (segment.kind === "text") return segment.value;
      if (segment.kind === "topic") return `#${segment.slug}`;
      return (
        mentionNames.get(mentionNameKey(segment.kind, segment.slug)) ??
        segment.slug
      );
    })
    .join("");
}

/**
 * Every date of the gathering as a calendar event, earliest first.
 *
 * `slug` is the first date's slug, and every UID is built on it with the
 * date's position, so each UID stays unique. `occurrenceSlugs` is every saved
 * date's slug in series order, as the backend returns them. When it holds one
 * slug per date listed here, each event links to its own date's page. Any
 * other length links every event to the first date.
 *
 * `mentionNames` is optional: a caller holding resolved mention names passes
 * them so the description names people and places in full.
 */
export function buildGatheringCalendarEvents({
  form,
  slug,
  occurrenceSlugs,
  urlForSlug,
  location,
  mentionNames,
}: {
  form: GatheringCalendarInput;
  slug: string;
  occurrenceSlugs: readonly string[];
  urlForSlug: (occurrenceSlug: string) => string;
  location: string;
  mentionNames?: ReadonlyMap<string, string>;
}): ShareCalendarEvent[] {
  const occurrences = gatheringOccurrences(form);
  const hasSlugPerDate = occurrenceSlugs.length === occurrences.length;
  const durationMs = gatheringDurationMs(form);
  const trimmedDescription = readableMentionText(
    form.description.trim(),
    mentionNames,
  );
  return occurrences.map((start, index) => {
    const occurrenceSlug = hasSlugPerDate
      ? (occurrenceSlugs[index] ?? slug)
      : slug;
    const url = urlForSlug(occurrenceSlug);
    return {
      uid: `${slug}-${index + 1}@${CALENDAR_UID_DOMAIN}`,
      title: form.title.trim(),
      start,
      end: durationMs === null ? null : new Date(start.getTime() + durationMs),
      location,
      description: [trimmedDescription, url].filter(Boolean).join("\n\n"),
      url,
    };
  });
}

/** A VCALENDAR holding one VEVENT per event, every instant in UTC. */
export function buildMultiEventIcs(
  events: readonly ShareCalendarEvent[],
  stampedAt: Date = new Date(),
): string {
  const stamp = icsTimestamp(stampedAt);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    `PRODID:${CALENDAR_PRODUCT_ID}`,
  ];
  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${icsTimestamp(event.start)}`,
    );
    if (event.end) lines.push(`DTEND:${icsTimestamp(event.end)}`);
    lines.push(`SUMMARY:${escapeIcsText(event.title)}`);
    if (event.location) {
      lines.push(`LOCATION:${escapeIcsText(event.location)}`);
    }
    if (event.description) {
      lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
    }
    // A URI value, written as it is: TEXT escaping would corrupt the link.
    lines.push(`URL:${event.url}`, "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
