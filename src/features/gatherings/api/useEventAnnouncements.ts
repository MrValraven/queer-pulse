import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createEventAnnouncement,
  getEventAnnouncements,
  type EventAnnouncementDTO,
} from "./events.api";
import { eventKeys } from "./eventKeys";

/**
 * A gathering's host announcements (LOC-06).
 *
 * "Message attendees" used to set a local boolean and draw a panel saying the
 * message had gone to N people. There was no request behind it, and live mode
 * hid the button entirely, which was honest and left a real host with no way
 * to say "we moved to the back room" or "here is the door code".
 *
 * DELIVERY IS IN-APP PLUS PUSH. QueerPulse sends no email and never will, so
 * no copy on this surface may describe one.
 *
 * Demo mode keeps the manage page's own mock message history, exactly as
 * before, and never touches the network.
 */
export function useEventAnnouncements(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<EventAnnouncementDTO[]>({
    queryKey: eventKeys.announcements(slug, demoMode),
    enabled: Boolean(slug) && !demoMode,
    queryFn: () => getEventAnnouncements(slug!),
  });
}

/** POST /events/:slug/announcements — host and co-host only. The server
 *  rate-limits this at ten a minute; a fan-out to everyone coming is a loud
 *  act and should stay one. */
export function useSendEventAnnouncement(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<EventAnnouncementDTO | void, Error, string>({
    // The composer surfaces its own failure, so the global duplicate toast
    // stays quiet.
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (demoMode) return;
      return createEventAnnouncement(slug, body);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: eventKeys.announcements(slug, demoMode),
      });
      // The gathering detail carries the same list, so an attendee reading the
      // page sees what was just sent without a reload.
      void queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot });
    },
  });
}
