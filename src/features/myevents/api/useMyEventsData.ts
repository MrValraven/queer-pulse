import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getEventInvites,
  getEvents,
  type EventFilter,
} from "../../gatherings/api/events.api";
import { INITIAL_EVENTS, INITIAL_NOTIFS } from "../myEvents.data";
import type { MyEvent, Notif } from "../myEvents.types";
import { eventCardToMyEvent, eventInviteToMyEvent } from "./myEvents.adapters";

export interface MyEventsDataResult {
  events: MyEvent[];
  notifs: Notif[];
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
}

/** Stable empty arrays so the "no data yet" case doesn't churn identity every render. */
const EMPTY_EVENTS: MyEvent[] = [];
const EMPTY_NOTIFS: Notif[] = [];

/** Every cat-bearing filter the dashboard needs — "upcoming" is a client-derived
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
 * Demo mode returns the page's own `INITIAL_EVENTS` / `INITIAL_NOTIFS`
 * registries unchanged — the demo experience stays byte-for-byte the same and
 * never touches the network.
 *
 * Live mode calls GET /events once per cat-bearing filter (they map 1:1 onto
 * the dashboard's `cat` buckets — see `myEvents.adapters.ts`) plus
 * GET /event-invites for pending invitations, and merges everything into the
 * same flat `MyEvent[]` shape `useMyEventsState` already filters/mutates
 * locally. Notifications and "sent" (outgoing invites you sent) have no
 * backend contract yet; rather than pass the mock off as real, live mode
 * returns no notifications at all (empty "What's changed" + zero bell badge) —
 * a documented gap rather than a fake success.
 */
export function useMyEventsData(): MyEventsDataResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<MyEvent[]>({
    queryKey: ["my-events", demoMode],
    enabled: !demoMode,
    queryFn: async () => {
      const [pages, invites] = await Promise.all([
        Promise.all(LIVE_FILTERS.map((filter) => getEvents({ filter }))),
        getEventInvites(),
      ]);
      const fromFilters = pages.flatMap((page, i) =>
        page.items.map((dto) => eventCardToMyEvent(dto, LIVE_FILTERS[i]!)),
      );
      const fromInvites = invites.map(eventInviteToMyEvent);
      return [...fromFilters, ...fromInvites];
    },
  });

  if (demoMode) {
    return { events: INITIAL_EVENTS, notifs: INITIAL_NOTIFS, loading: false };
  }
  // Notifications have no backend contract yet, so rather than surface the mock
  // "What's changed" list as if it were real, live mode shows none — the panel
  // renders its "all caught up" empty state and the bell badge reads zero.
  return {
    events: query.data ?? EMPTY_EVENTS,
    notifs: EMPTY_NOTIFS,
    loading: query.isPending,
  };
}
