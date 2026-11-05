import type { SubprofileItemView } from "./api/subprofiles.adapters";

/** A stored event date the timeline can place: `yyyy-mm` or `yyyy-mm-dd`,
 *  optionally followed by an ISO time. */
const EVENT_DATE_PATTERN = /^(\d{4})-(\d{2})(?:-(\d{2}))?(?:T.*)?$/;

export interface EventDateParts {
  year: number;
  /** 1 to 12. */
  month: number;
  /** Null when the editor stored a month only (`yyyy-mm`). */
  day: number | null;
}

/** The year, month and (when stored) day of an event's `date`, or null for
 *  anything else (empty, free text, a bare year). */
export function parseEventDate(
  value: string | null | undefined,
): EventDateParts | null {
  const match = EVENT_DATE_PATTERN.exec(value ?? "");
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = match[3] ? Number(match[3]) : null;
  if (month < 1 || month > 12) return null;
  if (day !== null && (day < 1 || day > 31)) return null;
  return { year, month, day };
}

/** The local moment an event stops being upcoming: the end of its day, or
 *  the end of its month when only a month was stored. */
function eventEndTime(parts: EventDateParts): number {
  if (parts.day === null) {
    // Day 0 of the next month is the last day of this one.
    return new Date(parts.year, parts.month, 0, 23, 59, 59, 999).getTime();
  }
  return new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    23,
    59,
    59,
    999,
  ).getTime();
}

/** Is this event still ahead? A month-only date stays upcoming for its
 *  whole month, and a day date until that day ends. Undated is never
 *  upcoming. */
export function isEventUpcoming(
  value: string | null | undefined,
  now: Date = new Date(),
): boolean {
  const parts = parseEventDate(value);
  if (!parts) return false;
  return eventEndTime(parts) > now.getTime();
}

/** A sortable number for a dated event: a month-only date sorts as the
 *  end of its month (day 32), since it stays upcoming until that month ends.
 *  Soonest first, a known day in that month comes before it, so the NEXT
 *  band and the spotlight name the same next event. */
function eventSortKey(parts: EventDateParts): number {
  return parts.year * 10000 + parts.month * 100 + (parts.day ?? 32);
}

/** A year written inside free text ("Summer 2019", "NYE 2024"). */
const FREE_TEXT_YEAR_PATTERN = /\b(19|20)\d{2}\b/;

/** The year a free-text event date names, or null when it names none. */
function freeTextEventYear(value: string | null | undefined): number | null {
  const match = FREE_TEXT_YEAR_PATTERN.exec(value ?? "");
  return match ? Number(match[0]) : null;
}

/** The year an event belongs to: its stored date's year, or failing that a
 *  year written in its free text, or null when it carries no year at all. */
function eventYear(value: string | null | undefined): number | null {
  return parseEventDate(value)?.year ?? freeTextEventYear(value);
}

export interface SplitEvents {
  /** Soonest first. */
  upcoming: SubprofileItemView[];
  /** Newest first; a free-text date with a year ("Summer 2019") sits after
   *  that year's dated events, and events with no year at all come last, in
   *  the persona's own order. */
  past: SubprofileItemView[];
}

/** An events section split for the page timeline: what is coming up, soonest
 *  first, then the archive, newest first. */
export function splitEvents(
  items: SubprofileItemView[],
  now: Date = new Date(),
): SplitEvents {
  const upcoming: { item: SubprofileItemView; key: number }[] = [];
  const pastDated: { item: SubprofileItemView; key: number }[] = [];
  const undated: SubprofileItemView[] = [];
  for (const item of items) {
    const parts = parseEventDate(item.date);
    if (!parts) {
      // A free-text year files the event at the start of that year, which
      // newest first is after every dated event of the same year.
      const year = freeTextEventYear(item.date);
      if (year === null) undated.push(item);
      else pastDated.push({ item, key: year * 10000 });
      continue;
    }
    const entry = { item, key: eventSortKey(parts) };
    if (eventEndTime(parts) > now.getTime()) upcoming.push(entry);
    else pastDated.push(entry);
  }
  upcoming.sort((first, second) => first.key - second.key);
  pastDated.sort((first, second) => second.key - first.key);
  return {
    upcoming: upcoming.map((entry) => entry.item),
    past: [...pastDated.map((entry) => entry.item), ...undated],
  };
}

/** The sections whose items are events on a Poster (collective) page. */
export const EVENT_SECTIONS = ["events", "nights"] as const;

export function isEventSection(section: string): boolean {
  return (EVENT_SECTIONS as readonly string[]).includes(section);
}

export interface PastEventYearGroup {
  /** Null for the undated group, always the last one. */
  year: number | null;
  items: SubprofileItemView[];
}

/** The past events (already newest first, as `splitEvents` returns them)
 *  grouped under their year for the archive, keeping that order. A free-text
 *  date that names a year ("Summer 2019") files under that year. Events with
 *  no year at all gather in one last group with no year. */
export function groupPastEventsByYear(
  past: SubprofileItemView[],
): PastEventYearGroup[] {
  const groups: PastEventYearGroup[] = [];
  const undatedItems: SubprofileItemView[] = [];
  for (const item of past) {
    const year = eventYear(item.date);
    if (year === null) {
      undatedItems.push(item);
      continue;
    }
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.year === year) lastGroup.items.push(item);
    else groups.push({ year, items: [item] });
  }
  return undatedItems.length > 0
    ? [...groups, { year: null, items: undatedItems }]
    : groups;
}

/** The earliest year any of these events carries, a free-text year
 *  ("Summer 2019") included, or null when none names a year. The events
 *  caption reads it as "since 2025". */
export function earliestEventYear(items: SubprofileItemView[]): number | null {
  const years = items
    .map((item) => eventYear(item.date))
    .filter((year): year is number => year !== null);
  return years.length > 0 ? Math.min(...years) : null;
}
