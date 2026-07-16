import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getAttendees } from "./events.api";
import { attendeeToRow, type AttendeeRow } from "./events.adapters";
import { GOING_ATTENDEES, WAITLIST_ATTENDEES } from "../manageGathering.data";

export interface AttendeesResult {
  going: AttendeeRow[];
  waitlist: AttendeeRow[];
  goingCount: number;
  waitlistCount: number;
  capacity?: number;
}

/** Shape the mock manage-page attendee arrays into the shared AttendeeRow. */
function mockRows(): AttendeesResult {
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
  };
}

/**
 * Attendee list for the manage / day-of dashboard. Demo mode returns the
 * page's own mock rosters; live mode calls GET /events/:slug/attendees and
 * adapts each attendee to the same row shape.
 */
export function useAttendees(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<AttendeesResult>({
    queryKey: ["attendees", demoMode, slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      if (demoMode || !slug) return mockRows();
      const res = await getAttendees(slug);
      return {
        going: res.going.map(attendeeToRow),
        waitlist: res.waitlist.map(attendeeToRow),
        goingCount: res.goingCount,
        waitlistCount: res.waitlistCount,
        capacity: res.capacity,
      };
    },
  });
}
