import type { FilterKey, MyEvent, Pill } from "./myEvents.types";
import { inPill, isInMonth, isOnDay, isOnline } from "./myEvents.helpers";
import { MY_EVENTS_PILLS, TOOLBAR_FILTERS } from "./myEvents.filters";

/**
 * The question each filter chip answers. Chips in one group widen each other
 * (In person and Online together list both), and the groups narrow one
 * another, so Online with Free lists the free online events.
 */
type FilterGroup = "location" | "price" | "month";

const FILTER_GROUPS: Record<FilterKey, FilterGroup> = {
  inperson: "location",
  online: "location",
  free: "price",
  paid: "price",
  month: "month",
};

/** Everything past the bucket that narrows the agenda: the search field, the
 *  chips, and the calendar month the "This month" chip reads. */
export interface SecondaryFilterState {
  searchTerm: string;
  activeFilters: Record<FilterKey, boolean>;
  viewY: number;
  viewM: number;
}

function matchesSearch(event: MyEvent, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  return `${event.title} ${event.venue} ${event.community || ""}`
    .toLowerCase()
    .includes(normalizedQuery);
}

function matchesFilter(
  event: MyEvent,
  filterKey: FilterKey,
  state: SecondaryFilterState,
): boolean {
  switch (filterKey) {
    case "online":
      return isOnline(event);
    case "inperson":
      return !isOnline(event);
    case "free":
      return !event.paid;
    case "paid":
      return !!event.paid;
    case "month":
      // Any day the event RUNS puts it in the viewed month. Matching on its
      // opening day alone filtered a festival that ran 29 September to 2
      // October out of the agenda for a member looking at October, so their
      // own running event vanished from their own list.
      return isInMonth(event, state.viewY, state.viewM);
  }
}

/**
 * Whether the event survives the search and every chip group, leaving out
 * `liftedGroup` when one is named. Lifting a group is how a chip's own count
 * is taken: with its siblings switched off, only the other questions apply.
 */
export function matchesSecondary(
  event: MyEvent,
  state: SecondaryFilterState,
  liftedGroup?: FilterGroup,
): boolean {
  if (!matchesSearch(event, state.searchTerm.trim().toLowerCase())) {
    return false;
  }
  const activeByGroup = new Map<FilterGroup, FilterKey[]>();
  TOOLBAR_FILTERS.forEach(({ key }) => {
    const group = FILTER_GROUPS[key];
    if (!state.activeFilters[key] || group === liftedGroup) return;
    activeByGroup.set(group, [...(activeByGroup.get(group) ?? []), key]);
  });
  for (const activeKeys of activeByGroup.values()) {
    if (!activeKeys.some((key) => matchesFilter(event, key, state))) {
      return false;
    }
  }
  return true;
}

/**
 * The events the agenda starts from before any search or chip: a picked
 * calendar day shows everything RUNNING that day, so day two of a festival
 * lists it, and otherwise the bucket decides.
 */
export function agendaBase(
  events: MyEvent[],
  pill: Pill,
  selectedDate: string | null,
): MyEvent[] {
  return selectedDate
    ? events.filter((event) => isOnDay(event, selectedDate))
    : events.filter((event) => inPill(event, pill));
}

/**
 * How many events each bucket pill would list with the search and the chips
 * as they stand. Picking a pill clears the calendar day, so the day plays no
 * part here. The count holds everything the bucket lists, its trailing
 * "Already happened" group included, so a bucket with only history left
 * still reads as somewhere to go.
 */
export function countPillFacets(
  events: MyEvent[],
  state: SecondaryFilterState,
): Record<Pill, number> {
  const narrowed = events.filter((event) => matchesSecondary(event, state));
  const counts = {} as Record<Pill, number>;
  MY_EVENTS_PILLS.forEach(({ key }) => {
    counts[key] = narrowed.filter((event) => inPill(event, key)).length;
  });
  return counts;
}

/**
 * How many events each filter chip matches inside the agenda as it stands
 * (bucket or day, search, the other chip groups), with the chip's own group
 * lifted. For a chip whose sibling is off, that is exactly what switching it
 * on would list; with its sibling on, it is what the chip adds.
 */
export function countFilterFacets(
  events: MyEvent[],
  pill: Pill,
  selectedDate: string | null,
  state: SecondaryFilterState,
): Record<FilterKey, number> {
  const base = agendaBase(events, pill, selectedDate);
  const counts = {} as Record<FilterKey, number>;
  TOOLBAR_FILTERS.forEach(({ key }) => {
    counts[key] = base.filter(
      (event) =>
        matchesSecondary(event, state, FILTER_GROUPS[key]) &&
        matchesFilter(event, key, state),
    ).length;
  });
  return counts;
}
