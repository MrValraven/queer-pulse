import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  getEventInvites,
  getEvents,
  type EventCardDTO,
  type EventFilter,
} from "../../gatherings/api/events.api";
import type { MyEvent } from "../myEvents.types";
import { eventInviteToMyEvent, mergeEventPages } from "./myEvents.adapters";

export interface MyEventsDataResult {
  events: MyEvent[];
  /** True while the initial fetch is in flight (both modes resolve via the query). */
  loading: boolean;
  /** True once the live fetch has failed — so the dashboard can surface a
   *  distinct error/retry state instead of collapsing to a false "no events". */
  hasError: boolean;
  /** Re-run the query (bound to the header/agenda retry affordance). */
  retry: () => void;
  /** True once `events` holds every one of the member's events: the demo
   *  registry, or every live bucket read to its last page. Filter counts are
   *  drawn only then, since a count over part of the list under-reports. */
  isComplete: boolean;
}

/** What the query resolves to in either mode. */
interface MyEventsPayload {
  events: MyEvent[];
  isComplete: boolean;
}

/** Stable empty payload so the "no data yet" case doesn't churn identity every render. */
const EMPTY_PAYLOAD: MyEventsPayload = { events: [], isComplete: false };

/** The backend's `PAGE_SIZE` for GET /events. A page shorter than this is the
 *  bucket's last one. */
const LIVE_PAGE_SIZE = 20;

/** How deep one bucket is read before the dashboard stops asking: 500 events,
 *  far past a member's own list. A bucket cut off here marks the whole set
 *  incomplete, and the counts stay undrawn until a full read. */
const MAX_PAGES_PER_FILTER = 25;

/** One bucket's events across every page, and whether its last page arrived. */
interface FilterResult {
  items: EventCardDTO[];
  isComplete: boolean;
}

/**
 * Reads one `GET /events?filter=…` bucket page by page until a short page
 * says it is done. The pages run in order because each one only exists once
 * the previous came back full. A slug repeated across two pages (a row moving
 * while the pages are read) collapses in `mergeEventPages`.
 */
async function fetchWholeFilter(filter: EventFilter): Promise<FilterResult> {
  const items: EventCardDTO[] = [];
  for (let page = 1; page <= MAX_PAGES_PER_FILTER; page += 1) {
    const response = await getEvents({ filter, page });
    items.push(...response.items);
    if (response.items.length < LIVE_PAGE_SIZE) {
      return { items, isComplete: true };
    }
  }
  return { items, isComplete: false };
}

/** Every category-bearing filter the dashboard needs — "upcoming" is a client-derived
 *  pill (see `inPill`), never fetched directly.
 *
 *  "saved" fetches the member's real bookmarked events (backend BE-3 —
 *  `GET /events?filter=saved`, now backed by the `event_bookmarks` table). It
 *  populates the "Saved" tab alongside the pending event invites merged in from
 *  `getEventInvites()` below. Members bookmark events from the gathering detail's
 *  "Save" toggle. */
const LIVE_FILTERS: EventFilter[] = [
  "going",
  "hosting",
  "waitlisted",
  "past",
  "saved",
];

/**
 * Data source for the My Events dashboard.
 *
 * Demo mode resolves the page's own `INITIAL_EVENTS` registry, but it's pulled
 * in with a demoMode-gated dynamic `import()` inside the query so the mock
 * registry is code-split off the eager path instead of being statically
 * bundled here. The demo experience is unchanged:
 * the module resolves on a microtask, well before the dashboard's simulated
 * load-in beat clears its skeleton.
 *
 * Live mode reads GET /events to its last page for each category-bearing
 * filter (they map 1:1 onto the dashboard's `category` buckets, see
 * `myEvents.adapters.ts`) plus GET /event-invites for pending invitations,
 * so the counts and the filters below work over the whole list. Page one
 * alone held 20 rows per bucket, and `going` sorts oldest first, so a member
 * with a long history saw none of what was ahead. It merges everything into the
 * same flat `MyEvent[]` shape `useMyEventsState` already filters/mutates
 * locally. "Sent" (outgoing invites you sent) still has no backend contract and
 * is simply absent in live rather than faked.
 *
 * `language` is part of the queryKey because the adapters translate a few
 * fields (an online gathering's venue label, an invite with no event summary),
 * so a language switch must refetch rather than serve a stale cache entry.
 */
export function useMyEventsData(options?: {
  enabled?: boolean;
}): MyEventsDataResult {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();

  const query = useQuery<MyEventsPayload>({
    queryKey: ["my-events", demoMode, language],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      if (demoMode) {
        // Demo mock is code-split: the registry loads only when the demo
        // dashboard actually mounts, never on the eager import path.
        // A demo month of events joins the hosting cards for the tab's session.
        const [{ INITIAL_EVENTS }, { demoBatchHostingEvents }] =
          await Promise.all([
            import("../myEvents.mock"),
            import("../../gatherings/addMonth/eventBatchDemo"),
          ]);
        return {
          events: [...INITIAL_EVENTS, ...demoBatchHostingEvents()],
          isComplete: true,
        };
      }
      // GET /event-invites is unpaginated, so it always arrives whole.
      const [pages, invites] = await Promise.all([
        Promise.all(LIVE_FILTERS.map((filter) => fetchWholeFilter(filter))),
        getEventInvites(),
      ]);
      // A member who's both hosting an event and RSVP'd to it gets the same
      // slug back under two filters (e.g. "going" and "hosting") — merge
      // collapses that into one card instead of rendering it twice.
      const fromFilters = mergeEventPages(pages, LIVE_FILTERS, t);
      const fromInvites = invites.map((invite) =>
        eventInviteToMyEvent(invite, t),
      );
      return {
        events: [...fromFilters, ...fromInvites],
        isComplete: pages.every((page) => page.isComplete),
      };
    },
  });

  const payload = query.data ?? EMPTY_PAYLOAD;
  return {
    events: payload.events,
    loading: query.isPending,
    hasError: query.isError,
    retry: () => void query.refetch(),
    isComplete: payload.isComplete,
  };
}
