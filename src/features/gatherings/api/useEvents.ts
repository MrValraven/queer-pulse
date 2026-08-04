import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getEvents, type EventFilter, type EventsPage } from "./events.api";
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
export function useEvents(params: { filter?: EventFilter } = {}): EventsResult {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<EventsPageVM>({
    queryKey: eventKeys.list(params.filter, demoMode),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        return {
          items: calendarEvents,
          total: calendarEvents.length,
          page: 1,
        };
      }
      const res: EventsPage = await getEvents({
        filter: params.filter,
        page: pageParam as number,
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
