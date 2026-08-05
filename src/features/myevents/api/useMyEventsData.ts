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
  /** True once the live fetch has failed — so the dashboard can surface a
   *  distinct error/retry state instead of collapsing to a false "no events". */
  hasError: boolean;
  /** Re-run the query (bound to the header/agenda retry affordance). */
  retry: () => void;
}

/** What the query resolves to in either mode. */
interface MyEventsPayload {
  events: MyEvent[];
  notifs: Notif[];
}

/** Stable empty payload so the "no data yet" case doesn't churn identity every render. */
const EMPTY_PAYLOAD: MyEventsPayload = { events: [], notifs: [] };

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
 *
 * DEFERRED(Phase 2, myevents "What's changed" panel): because this panel has no
 * dedicated contract, the consumer hides the header bell + "What's changed"
 * panel entirely in live (see `MyEventsHeader` / `notificationsEnabled`) so a
 * permanently-empty panel isn't surfaced as if it were a working feature.
 *
 * TODO(P2-7 follow-up): event-change notifications now DO exist end-to-end — the
 * backend emits an `event_updated` notification (start-time / location edits) to
 * RSVP'd + invited members and it already renders in the MAIN notifications
 * centre (`formatNotification` → category "events"). To re-light this panel,
 * feed it the member's `event_updated` (and `event_cancelled` / `waitlist_promoted`)
 * rows from `GET /notifications`, mapping them into the local `Notif` shape and
 * flipping `notificationsEnabled` on in live. Deliberately left for a dedicated
 * pass — mapping the notifications feed into this bespoke panel + re-enabling the
 * bell is more than this feature's scope.
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
    hasError: query.isError,
    retry: () => void query.refetch(),
  };
}
