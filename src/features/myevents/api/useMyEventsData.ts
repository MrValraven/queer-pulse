import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import {
  getEventInvites,
  getEvents,
  type EventFilter,
} from "../../gatherings/api/events.api";
import { getNotifications } from "../../notifications/api/notifications.api";
import type { MyEvent, Notif } from "../myEvents.types";
import {
  EVENT_PANEL_NOTIF_KINDS,
  eventInviteToMyEvent,
  eventNotificationToNotif,
  mergeEventPages,
} from "./myEvents.adapters";

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
 * locally. "Sent" (outgoing invites you sent) still has no backend contract and
 * is simply absent in live rather than faked.
 *
 * The "What's changed" panel is now live (tracker P2-7): the backend emits
 * event-change notifications (`event_updated` / `event_cancelled` /
 * `waitlist_promoted`) to members with a stake in the event, so live mode reads
 * GET /notifications, keeps only those event kinds (see
 * `EVENT_PANEL_NOTIF_KINDS`), and maps each into the local `Notif` shape via
 * `eventNotificationToNotif`. The copy is rendered through the shared
 * `formatNotification` i18n keys, which is why `language` is part of the
 * queryKey — a language switch must re-render the panel in the new language
 * rather than serve a stale cache entry. Demo mode is unchanged: it resolves the
 * page's own `INITIAL_NOTIFS` registry.
 */
export function useMyEventsData(options?: {
  enabled?: boolean;
}): MyEventsDataResult {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();

  const query = useQuery<MyEventsPayload>({
    queryKey: ["my-events", demoMode, language],
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      if (demoMode) {
        // Demo mock is code-split: the registry loads only when the demo
        // dashboard actually mounts, never on the eager import path.
        const { INITIAL_EVENTS, INITIAL_NOTIFS } = await import(
          "../myEvents.mock"
        );
        return { events: INITIAL_EVENTS, notifs: INITIAL_NOTIFS };
      }
      const [pages, invites, notifications] = await Promise.all([
        Promise.all(LIVE_FILTERS.map((filter) => getEvents({ filter }))),
        getEventInvites(),
        getNotifications(),
      ]);
      // A member who's both hosting an event and RSVP'd to it gets the same
      // slug back under two filters (e.g. "going" and "hosting") — merge
      // collapses that into one card instead of rendering it twice.
      const fromFilters = mergeEventPages(pages, LIVE_FILTERS, t);
      const fromInvites = invites.map(eventInviteToMyEvent);
      // Keep only the event-change kinds the "What's changed" panel is about;
      // every other notification stays in the main notifications centre.
      const notifs = notifications
        .filter((notification) => EVENT_PANEL_NOTIF_KINDS.has(notification.type))
        .map((notification) => eventNotificationToNotif(notification, t, fmt));
      return { events: [...fromFilters, ...fromInvites], notifs };
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
