import { useCallback, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { isEventSection, parseEventDate } from "../eventDates";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "../api/subprofiles.adapters";

/** The query param that names the open event by its item id. */
export const EVENT_PARAM = "event";

/** Stamped on the history entry `openEvent` pushes, so closing knows it can
 *  step Back to the page instead of leaving a second copy of it behind. */
const OPENED_HERE_STATE = { isEventSheetEntry: true } as const;

function isOpenedHereState(state: unknown): boolean {
  return (
    typeof state === "object" &&
    state !== null &&
    (state as { isEventSheetEntry?: unknown }).isEventSheetEntry === true
  );
}

export interface EventDeepLink {
  /** The event the sheet is open on, or null when it is closed. */
  eventItem: SubprofileItemView | null;
  /** Open the sheet on `item`: pushes `?event=<id>`, so Back closes it. */
  openEvent: (item: SubprofileItemView) => void;
  /** Close the sheet and drop the param. */
  closeEvent: () => void;
  /** The open event's whole section, featured event included, oldest to
   *  newest: undated events first in their stored order, then by date. */
  events: SubprofileItemView[];
  /** Where the open event sits in `events`, or -1 (which hides the pager). */
  eventIndex: number;
  /** Swap the sheet to `events[index]`, replacing the param in place. */
  goTo: (index: number) => void;
}

/** The event the param names, searched across the event sections. */
function findEvent(
  sections: SubprofileSectionView[] | undefined,
  eventId: string | null,
): SubprofileItemView | null {
  if (!sections || !eventId) return null;
  for (const section of sections) {
    if (!isEventSection(section.section)) continue;
    const match = section.items.find((item) => item.id === eventId);
    if (match) return match;
  }
  return null;
}

/** A year written inside a free-text date ("Spring 2025"). */
const FREE_TEXT_YEAR_PATTERN = /\b(19|20)\d{2}\b/;

/** A sortable number for an event's date, or null when it has none the
 *  pager can place. A month-only date sorts at the end of its month (day 32,
 *  after every day date), the way the page's own list sorts it. A free-text
 *  date that names a year sorts at the start of that year. */
function pagerSortKey(value: string | null | undefined): number | null {
  const parts = parseEventDate(value);
  if (parts) return parts.year * 10000 + parts.month * 100 + (parts.day ?? 32);
  const yearMatch = FREE_TEXT_YEAR_PATTERN.exec(value ?? "");
  return yearMatch ? Number(yearMatch[0]) * 10000 : null;
}

/** The open event's whole section in time order, so Previous is earlier and
 *  Next is later. The featured event stays in: the sheet walks the full
 *  listing, so the count and the neighbours never shift with the open event.
 *  Events with no date the pager can place lead, in their stored order. */
function orderSectionEvents(
  sections: SubprofileSectionView[] | undefined,
  eventItem: SubprofileItemView | null,
): SubprofileItemView[] {
  if (!sections || !eventItem) return [];
  const section = sections.find(
    (candidate) => candidate.section === eventItem.section,
  );
  if (!section) return [];
  const undatedItems: SubprofileItemView[] = [];
  const datedEntries: { item: SubprofileItemView; sortKey: number }[] = [];
  for (const item of section.items) {
    const sortKey = pagerSortKey(item.date);
    if (sortKey === null) undatedItems.push(item);
    else datedEntries.push({ item, sortKey });
  }
  // Array sort is stable, so events on the same date keep their stored order.
  datedEntries.sort((first, second) => first.sortKey - second.sortKey);
  return [...undatedItems, ...datedEntries.map((entry) => entry.item)];
}

/**
 * `?event=<id>` sheet state for a Poster (collective) persona page, mirroring
 * `usePoemDeepLink`. The open event is read from the URL on every render, so
 * a shared link opens the sheet, Back and Forward open and close it, and a
 * param that names no event is a silent no-op. Ids are unique where poem
 * slugs are not, so no "which one did we just open" ref is needed.
 *
 * `isEnabled` is false on every other skin, which ignores the param. The
 * featured event pages like any other.
 */
export function useEventDeepLink(
  sections: SubprofileSectionView[] | undefined,
  { isEnabled }: { isEnabled: boolean },
): EventDeepLink {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const eventIdParam = isEnabled ? searchParams.get(EVENT_PARAM) : null;

  const eventItem = useMemo(
    () => findEvent(sections, eventIdParam),
    [sections, eventIdParam],
  );
  const events = useMemo(
    () => orderSectionEvents(sections, eventItem),
    [sections, eventItem],
  );
  const eventIndex = eventItem
    ? events.findIndex((item) => item.id === eventItem.id)
    : -1;

  const setEventParam = useCallback(
    (eventId: string | null, shouldReplace: boolean, state: unknown) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (eventId) next.set(EVENT_PARAM, eventId);
          else next.delete(EVENT_PARAM);
          return next;
        },
        { replace: shouldReplace, state },
      );
    },
    [setSearchParams],
  );

  const openEvent = useCallback(
    (item: SubprofileItemView) =>
      setEventParam(item.id, false, OPENED_HERE_STATE),
    [setEventParam],
  );

  const isOpenedHere = isOpenedHereState(location.state);
  const closeEvent = useCallback(() => {
    // Opened from a row: step Back to the entry the row was tapped on. Landed
    // on from a shared link: drop the param in place.
    if (isOpenedHere) void navigate(-1);
    else setEventParam(null, true, null);
  }, [isOpenedHere, navigate, setEventParam]);

  const goTo = useCallback(
    (index: number) => {
      const targetEvent = events[index];
      // Paging replaces the entry and keeps its marker, so one Back still
      // closes the sheet however many events were paged through.
      if (targetEvent) setEventParam(targetEvent.id, true, location.state);
    },
    [events, location.state, setEventParam],
  );

  return { eventItem, openEvent, closeEvent, events, eventIndex, goTo };
}
