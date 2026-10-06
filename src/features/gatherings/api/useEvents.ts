import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { foldForSearch } from "../../../shared/lib/foldForSearch";
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
  /** ENG-501: the latest next-page fetch failed. react-query also sets
   *  `isError` then, so a view keeps the rows already loaded and lets its
   *  footer retry the page. Demo's single synthetic page never sets it. */
  isFetchNextPageError: boolean;
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
 * upcoming|going|hosting|waitlisted|past|saved dimension. In demo mode only
 * `upcoming` and `past` are applied (see `filterDemoEvents`); the others
 * return the whole registry, since a demo row carries no RSVP, host or
 * bookmark standing to split on.
 */
export function useEvents(
  params: { filter?: EventFilter; browse?: EventBrowseFilters } = {},
): EventsResult {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const browse = params.browse;
  const query = useInfiniteQuery<EventsPageVM>({
    queryKey: eventKeys.list(params.filter, demoMode, browse),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const items = filterDemoEvents(
          calendarEvents,
          params.filter,
          browse,
          new Date(),
        );
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
        items: res.items.map((card) => cardToCalendarEvent(card, t)),
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
    isFetchNextPageError: query.isFetchNextPageError,
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
 * price. `family` and `type` match `gatheringFamily` and `eventType`, which
 * every `calendarEvents` row carries: each was backfilled from the
 * `gatheringDetails` entry with the same slug, so a demo row and its detail
 * page agree, and every stored key is a real `GATHERING_FORMATS` key whose
 * family matches its row. A demo row that ever loses them drops out of a
 * family- or format-filtered board rather than leaking into it.
 *
 * The time `filter` is honoured the way live honours it, so the one past demo
 * row (the June Pride Brunch, there for the create flow's "Same as last
 * time?" strip) stays off every upcoming surface. `upcoming` keeps a row that
 * starts on or after the start of today, which stands in for "still running"
 * on demo rows with no end (tonight's supper club stays on the board after
 * its doors open), and a row with an `endAt` while that end is still ahead.
 * `past` is the complement. Every other filter value returns the registry
 * unsplit, as before.
 */
function filterDemoEvents(
  events: CalendarEvent[],
  filter: EventFilter | undefined,
  browse: EventBrowseFilters | undefined,
  now: Date,
): CalendarEvent[] {
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const isStillAhead = (event: CalendarEvent) =>
    event.endAt
      ? event.endAt.getTime() > now.getTime()
      : event.date.getTime() >= startOfToday;
  const timed =
    filter === "upcoming"
      ? events.filter(isStillAhead)
      : filter === "past"
        ? events.filter((event) => !isStillAhead(event))
        : events;
  if (!browse) return timed;
  return timed.filter((event) => matchesDemoBrowse(event, browse));
}

/** One demo row against the browse filters (date range, place, kind, cost,
 *  free text). */
function matchesDemoBrowse(
  event: CalendarEvent,
  browse: EventBrowseFilters,
): boolean {
  const term = foldForSearch(browse.q?.trim() ?? "");
  const from = browse.from ? new Date(browse.from).getTime() : null;
  const to = browse.to ? new Date(browse.to).getTime() : null;
  const startedAt = event.date.getTime();
  if (from !== null && startedAt < from) return false;
  if (to !== null && startedAt > to) return false;
  if (browse.hood && event.hood.toLowerCase() !== browse.hood.toLowerCase()) {
    return false;
  }
  if (browse.family && event.gatheringFamily !== browse.family) return false;
  if (
    browse.type &&
    (event.eventType ?? "").toLowerCase() !== browse.type.toLowerCase()
  ) {
    return false;
  }
  if (browse.cost === "free" && event.ticketed) return false;
  if (browse.cost === "paid" && !event.ticketed) return false;
  if (
    term &&
    !foldForSearch(event.title).includes(term) &&
    !foldForSearch(event.hood).includes(term) &&
    !foldForSearch(event.org).includes(term)
  ) {
    return false;
  }
  return true;
}
