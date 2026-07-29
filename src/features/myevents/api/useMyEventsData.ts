import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getEventInvites,
  getEvents,
  type EventFilter,
} from "../../gatherings/api/events.api";
import type { MyEvent, Notif } from "../myEvents.types";
import { eventCardToMyEvent, eventInviteToMyEvent } from "./myEvents.adapters";

export interface MyEventsDataResult {
  events: MyEvent[];
  notifs: Notif[];
  /** True while the initial fetch is in flight (both modes resolve via the query). */
  loading: boolean;
}

/** What the query resolves to in either mode. */
interface MyEventsPayload {
  events: MyEvent[];
  notifs: Notif[];
}

/** Stable empty payload so the "no data yet" case doesn't churn identity every render. */
const EMPTY_PAYLOAD: MyEventsPayload = { events: [], notifs: [] };

/** Every category-bearing filter the dashboard needs — "upcoming" is a client-derived
 *  pill (see `inPill`), never fetched directly. */
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
 * Demo mode resolves the page's own `INITIAL_EVENTS` / `INITIAL_NOTIFS`
 * registries, but they're pulled in with a demoMode-gated dynamic `import()`
 * inside the query so the mock registry is code-split off the eager path
 * instead of being statically bundled here. The demo experience is unchanged:
 * the module resolves on a microtask, well before the dashboard's simulated
 * load-in beat clears its skeleton.
 *
 * Live mode calls GET /events once per category-bearing filter (they map 1:1 onto
 * the dashboard's `category` buckets — see `myEvents.adapters.ts`) plus
 * GET /event-invites for pending invitations, and merges everything into the
 * same flat `MyEvent[]` shape `useMyEventsState` already filters/mutates
 * locally. Notifications and "sent" (outgoing invites you sent) have no
 * backend contract yet; rather than pass the mock off as real, live mode
 * returns no notifications at all (empty "What's changed" + zero bell badge) —
 * a documented gap rather than a fake success.
 */
export function useMyEventsData(): MyEventsDataResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<MyEventsPayload>({
    queryKey: ["my-events", demoMode],
    queryFn: async () => {
      if (demoMode) {
        // Demo mock is code-split: the registry loads only when the demo
        // dashboard actually mounts, never on the eager import path.
        const { INITIAL_EVENTS, INITIAL_NOTIFS } = await import(
          "../myEvents.mock"
        );
        return { events: INITIAL_EVENTS, notifs: INITIAL_NOTIFS };
      }
      const [pages, invites] = await Promise.all([
        Promise.all(LIVE_FILTERS.map((filter) => getEvents({ filter }))),
        getEventInvites(),
      ]);
      const fromFilters = pages.flatMap((page, i) =>
        page.items.map((dto) => eventCardToMyEvent(dto, LIVE_FILTERS[i]!)),
      );
      const fromInvites = invites.map(eventInviteToMyEvent);
      // Notifications have no backend contract yet, so rather than surface the
      // mock "What's changed" list as if it were real, live mode returns none —
      // the panel renders its "all caught up" empty state and the bell reads zero.
      return { events: [...fromFilters, ...fromInvites], notifs: [] };
    },
  });

  const payload = query.data ?? EMPTY_PAYLOAD;
  return {
    events: payload.events,
    notifs: payload.notifs,
    loading: query.isPending,
  };
}
