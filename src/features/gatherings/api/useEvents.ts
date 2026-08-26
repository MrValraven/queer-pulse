import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getEvents,
  type EventBrowseFilters,
  type EventFilter,
  type EventsPage,
} from "./events.api";
import { eventKeys } from "./eventKeys";
import { cardToCalendarEvent } from "./events.adapters";
import { calendarEvents, type CalendarEvent } from "../data";

export interface EventsResult {
  /** All events fetched so far, flattened across loaded pages. */
  items: CalendarEvent[];
  /** Server-reported total across all pages. */
  total: number;
  /** True when another page is available to fetch. */
  hasNextPage: boolean;
  /** Fetch the next page and append it. */
  fetchNextPage: () => void;
  /** True while a subsequent page is loading. */
  isFetchingNextPage: boolean;
  /** True during the very first fetch. */
  isLoading: boolean;
  /** True when the (live) fetch failed — the page shows an error state, not
   *  an empty "nothing in Lisbon". Demo mode never errors. */
  isError: boolean;
  /** Re-run the query — wired to the error state's "Try again" action. */
  refetch: () => void;
}

interface EventsPageVM {
  items: CalendarEvent[];
  total: number;
  page: number;
}

/**
 * Events list source, paginated. Demo mode returns the page's own
 * `calendarEvents` registry as a single synthetic page (full fidelity for the
 * "this season" board + filters); live mode calls GET /events?filter=&page= and
 * appends each page, stopping once the loaded count reaches the server `total`.
 *
 * The `filter` maps the EventsPage / My-Events tabs onto the backend's
 * upcoming|going|hosting|waitlisted|past|saved dimension. In demo mode the
 * filter is ignored (the page's own category chips do the client-side split).
 */
export function useEvents(
  params: { filter?: EventFilter; browse?: EventBrowseFilters } = {},
): EventsResult {
  const { demoMode } = useDemoMode();
  const browse = params.browse;
  const query = useInfiniteQuery<EventsPageVM>({
    queryKey: eventKeys.list(params.filter, demoMode, browse),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const items = filterDemoEvents(calendarEvents, browse);
        // `total` is the FILTERED length, so `getNextPageParam` never asks the
        // synthetic single page for a page 2 that does not exist.
        return { items, total: items.length, page: 1 };
      }
      const res: EventsPage = await getEvents({
        filter: params.filter,
        page: pageParam as number,
        ...browse,
      });
      return {
        items: res.items.map(cardToCalendarEvent),
        total: res.total,
        page: res.page,
      };
    },
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });

  const pages = query.data?.pages ?? [];
  return {
    items: pages.flatMap((p) => p.items),
    total: pages[0]?.total ?? 0,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/**
 * The demo registry has no server to narrow it, so the browse filters are
 * applied here to the static `calendarEvents` set. Live mode never runs this:
 * the server already did the work in SQL, and re-filtering client-side would
 * drop a row it matched on a field the mock shape does not carry (a
 * description, an address).
 *
 * `hood` matches the mock's own neighbourhood string; `cost` reads the mock's
 * `ticketed` flag, which is the closest thing the registry has to a door
 * price. Demo `type` is not modelled, so a type filter simply passes
 * everything through rather than silently emptying the board.
 */
function filterDemoEvents(
  events: CalendarEvent[],
  browse: EventBrowseFilters | undefined,
): CalendarEvent[] {
  if (!browse) return events;
  const term = browse.q?.trim().toLowerCase() ?? "";
  const from = browse.from ? new Date(browse.from).getTime() : null;
  const to = browse.to ? new Date(browse.to).getTime() : null;
  return events.filter((event) => {
    const startedAt = event.date.getTime();
    if (from !== null && startedAt < from) return false;
    if (to !== null && startedAt > to) return false;
    if (browse.hood && event.hood.toLowerCase() !== browse.hood.toLowerCase()) {
      return false;
    }
    if (browse.cost === "free" && event.ticketed) return false;
    if (browse.cost === "paid" && !event.ticketed) return false;
    if (
      term &&
      !event.title.toLowerCase().includes(term) &&
      !event.hood.toLowerCase().includes(term) &&
      !event.org.toLowerCase().includes(term)
    ) {
      return false;
    }
    return true;
  });
}
