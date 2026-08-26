import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getAttendees } from "./events.api";
import { eventKeys } from "./eventKeys";
import { attendeeToRow, type AttendeeRow } from "./events.adapters";

/**
 * NOTE on shape: `going`/`waitlist`/`goingCount`/`waitlistCount`/`capacity`
 * are read AND optimistically patched by `useEventMutations.ts`'s
 * `useRsvp`/`useUnrsvp` (`queryClient.setQueryData(eventKeys.attendees(...),
 * { ...prev, goingCount: prev.goingCount + 1 })`) — kept exactly as they were
 * so that cache-patch keeps working unchanged. `*Page`/`hasMore*` are
 * additive: each RSVP status (`going`/`waitlisted`) is fetched a bounded
 * `PAGE_SIZE` page at a time server-side, replacing what used to be one
 * unbounded `GET /events/:slug/attendees` fetch of the entire guest list —
 * `loadMoreGoing`/`loadMoreWaitlist` below fetch and append further pages.
 */
export interface AttendeesResult {
  going: AttendeeRow[];
  waitlist: AttendeeRow[];
  goingCount: number;
  waitlistCount: number;
  capacity?: number;
  /**
   * Seats the going RSVPs actually occupy: one per going member plus every
   * extra guest they declared (LOC-07). This is the number capacity is
   * measured against. It used to be the row count, so a 20-seat gathering
   * where ten people each brought a plus-one reported ten free seats while
   * thirty arrived.
   */
  seatsTaken: number;
  /** How many going members have been checked in at the door (LOC-03). */
  checkedInCount: number;
  goingPage: number;
  hasMoreGoing: boolean;
  waitlistPage: number;
  hasMoreWaitlist: boolean;
}

/** Shape the mock manage-page attendee arrays into the shared AttendeeRow.
 *  The mock registry is loaded lazily so live-mode bundles never pull it in. */
async function mockRows(): Promise<AttendeesResult> {
  const { GOING_ATTENDEES, WAITLIST_ATTENDEES } =
    await import("../manageGathering.data");
  const going: AttendeeRow[] = GOING_ATTENDEES.map((a) => ({
    ...a,
    slug: a.id,
  }));
  const waitlist: AttendeeRow[] = WAITLIST_ATTENDEES.map((a) => ({
    ...a,
    slug: a.id,
  }));
  return {
    going,
    waitlist,
    goingCount: going.length,
    waitlistCount: waitlist.length,
    capacity: 20,
    // The demo roster declares no guests and nobody has walked through a
    // demo door, so seats equal rows and the door count starts at zero.
    seatsTaken: going.length,
    checkedInCount: 0,
    goingPage: 1,
    hasMoreGoing: false,
    waitlistPage: 1,
    hasMoreWaitlist: false,
  };
}

/**
 * Attendee list for the manage / day-of dashboard. Demo mode returns the
 * page's own mock rosters; live mode fetches a bounded first page per RSVP
 * status (`going`/`waitlisted`) and exposes `loadMoreGoing`/`loadMoreWaitlist`
 * to append further pages, patching the SAME cached query the RSVP
 * mutations' optimistic head-count already targets (`eventKeys.attendees`) —
 * see the shape note on `AttendeesResult`.
 */
export function useAttendees(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const key = eventKeys.attendees(slug, demoMode);

  const query = useQuery<AttendeesResult>({
    queryKey: key,
    enabled: Boolean(slug),
    queryFn: async () => {
      if (demoMode || !slug) return await mockRows();
      // The live endpoint is paginated per status, so fetch the "going" and
      // "waitlisted" first pages in parallel and assemble the dashboard shape.
      const [goingPage, waitlistPage] = await Promise.all([
        getAttendees(slug, "going", 1),
        getAttendees(slug, "waitlisted", 1),
      ]);
      return {
        going: goingPage.items.map(attendeeToRow),
        waitlist: waitlistPage.items.map(attendeeToRow),
        goingCount: goingPage.goingCount ?? goingPage.total,
        waitlistCount: waitlistPage.waitlistCount ?? waitlistPage.total,
        capacity: goingPage.capacity ?? undefined,
        // Falls back to the head count only when an older server sends no
        // seat tally, which reads exactly as this did before LOC-07 rather
        // than silently reporting zero seats taken.
        seatsTaken: goingPage.seatsTaken ?? goingPage.total,
        checkedInCount: goingPage.checkedInCount ?? 0,
        goingPage: 1,
        hasMoreGoing: goingPage.items.length < goingPage.total,
        waitlistPage: 1,
        hasMoreWaitlist: waitlistPage.items.length < waitlistPage.total,
      };
    },
  });

  const loadMore = async (status: "going" | "waitlisted") => {
    if (!slug || demoMode) return;
    const prev = queryClient.getQueryData<AttendeesResult>(key);
    if (!prev) return;
    const nextPage =
      (status === "going" ? prev.goingPage : prev.waitlistPage) + 1;
    const page = await getAttendees(slug, status, nextPage);
    const rows = page.items.map(attendeeToRow);
    queryClient.setQueryData<AttendeesResult>(key, (current) => {
      if (!current) return current;
      return status === "going"
        ? {
            ...current,
            going: [...current.going, ...rows],
            goingPage: nextPage,
            hasMoreGoing: current.going.length + rows.length < page.total,
          }
        : {
            ...current,
            waitlist: [...current.waitlist, ...rows],
            waitlistPage: nextPage,
            hasMoreWaitlist: current.waitlist.length + rows.length < page.total,
          };
    });
  };

  return {
    ...query,
    loadMoreGoing: () => loadMore("going"),
    loadMoreWaitlist: () => loadMore("waitlisted"),
  };
}
