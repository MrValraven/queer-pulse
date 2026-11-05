import { isEventSection, splitEvents } from "../eventDates";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "../api/subprofiles.adapters";
import type { SubprofileKind } from "../api/subprofiles.api";
import type { EventDateLabels } from "../eventDateLabels";

/** Every item in a Poster persona's events and nights sections, featured
 *  one included, in the persona's own order. */
export function posterEventItems(
  sections: SubprofileSectionView[],
): SubprofileItemView[] {
  return sections
    .filter((section) => isEventSection(section.section))
    .flatMap((section) => section.items);
}

/** The soonest upcoming event across the events and nights sections, or null
 *  when nothing is coming up. The NEXT band in the hero reads it. */
export function soonestUpcomingEvent(
  sections: SubprofileSectionView[],
  now: Date = new Date(),
): SubprofileItemView | null {
  return splitEvents(posterEventItems(sections), now).upcoming[0] ?? null;
}

/** Does the persona list any events or nights at all, past ones included?
 *  Counts items, so the owner's empty section and the public view (which
 *  drops empty sections) agree. */
export function hasPosterEventSection(
  sections: SubprofileSectionView[],
): boolean {
  return sections.some(
    (section) => isEventSection(section.section) && section.items.length > 0,
  );
}

/** The kinds whose foot reads "producing since"; the organiser and activist
 *  read "organising since". */
const PRODUCING_KINDS: ReadonlySet<SubprofileKind> = new Set([
  "event_producer",
  "promoter",
]);

export function isProducingKind(kind: SubprofileKind): boolean {
  return PRODUCING_KINDS.has(kind);
}

/** A short one-line date for the NEXT band: "Sat 14 Nov", or "Nov" for a
 *  month-only date, with the year added when it is not this one, the way the
 *  timeline rows and the spotlight print it. */
export function shortEventDate(labels: EventDateLabels): string {
  const isThisYear = labels.year === new Date().getFullYear();
  if (labels.isMonthOnly) {
    return isThisYear ? labels.month : `${labels.month} ${labels.year}`;
  }
  return [labels.weekday, labels.day, labels.month, !isThisYear && labels.year]
    .filter(Boolean)
    .join(" ");
}
