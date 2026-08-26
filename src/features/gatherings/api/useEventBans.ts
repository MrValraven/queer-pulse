import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  banFromEvent,
  getEventBans,
  liftEventBan,
  type EventBanDTO,
} from "./events.api";
import { eventKeys } from "./eventKeys";

/**
 * The host's own door (LOC-08).
 *
 * Before this, a host afraid of one person had two tools: remove them, and
 * watch them RSVP again a second later, or cancel the whole gathering. A bar
 * is checked in the same guard the audience tiers go through, so it holds on
 * every path back onto the roster.
 *
 * The barred member is not notified, and the organiser's `reason` never leaves
 * the organisers' own list: a host has to be able to write down why without it
 * becoming a message to the person it is about.
 *
 * Demo mode never fetches, and never writes: the barred list is a real
 * safety record, and a mock one would be a lie in the one place it matters.
 */
export function useEventBans(slug: string | undefined, enabled = true) {
  const { demoMode } = useDemoMode();
  return useQuery<EventBanDTO[]>({
    queryKey: eventKeys.bans(slug, demoMode),
    enabled: Boolean(slug) && !demoMode && enabled,
    queryFn: () => getEventBans(slug!),
  });
}

/** POST /events/:slug/bans — bar a member. Cancels any RSVP they hold in the
 *  same call, so the guest list and the door agree. */
export function useBanFromEvent(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    EventBanDTO | void,
    Error,
    { memberSlug: string; reason?: string }
  >({
    meta: { silentError: true },
    mutationFn: async ({ memberSlug, reason }) => {
      if (demoMode) return;
      return banFromEvent(slug, memberSlug, reason);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: eventKeys.bans(slug, demoMode),
      });
      // Barring removes their RSVP too, so the roster is stale the moment
      // this resolves.
      void queryClient.invalidateQueries({
        queryKey: eventKeys.attendees(slug, demoMode),
      });
      void queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot });
    },
  });
}

/** DELETE /events/:slug/bans/:memberSlug — lift a bar. Lifting does not put
 *  them back on the guest list: they choose whether to come back. */
export function useLiftEventBan(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    meta: { silentError: true },
    mutationFn: async (memberSlug) => {
      if (demoMode) return;
      await liftEventBan(slug, memberSlug);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: eventKeys.bans(slug, demoMode),
      });
    },
  });
}
