import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getEvent, type RsvpDetailsDTO } from "./events.api";
import { eventKeys } from "./eventKeys";

/**
 * The caller's own RSVP details ("Anything we should know?" — guest count,
 * access/dietary needs, visibility) for one event, read via `GET
 * /events/:slug` (`EventDetail.myRsvpDetails` rides free on the detail fetch —
 * see `RsvpService.updateRsvpDetails`'s doc for why there's no dedicated GET).
 * `null` means either the event has no active RSVP for the caller, or (in
 * demo mode) there is nothing real to load — `RsvpDetailsModal` keeps its own
 * local starting state there instead.
 *
 * Unlike `useEvent`, `slug` here is the REAL backend slug (`MyEvent.slug`),
 * never the `<slug>-<shortId>` route-param composite `useEvent` strips — the
 * modal that calls this is opened from a My Events card, not the gathering
 * detail route, so there is no composite param to unwrap.
 */
export function useRsvpDetails(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<RsvpDetailsDTO | null>({
    queryKey: eventKeys.rsvpDetails(slug, demoMode),
    enabled: !demoMode && Boolean(slug),
    queryFn: async () => {
      if (!slug) return null;
      const dto = await getEvent(slug);
      return dto.myRsvpDetails ?? null;
    },
  });
}
