import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { getEvents } from "../../gatherings/api/events.api";
import { cardToCalendarEvent } from "../../gatherings/api/events.adapters";
import type { CalendarEvent } from "../../gatherings/data";

/** How many gatherings the homepage teaser row shows, matching the demo one. */
const HOMEPAGE_GATHERING_LIMIT = 4;

export interface HomepageGatheringsResult {
  gatherings: CalendarEvent[];
  isLoading: boolean;
}

/**
 * The next few real gatherings, for the homepage's live "what's on" row.
 *
 * There is no PUBLIC upcoming-events endpoint: `GET /events` sits behind
 * `ActiveMemberGuard`, and `GET /landing/features` (the feed every other
 * `Live*` homepage section reads) only carries members, communities and
 * changemakers — it has no gatherings slice. So this hook is deliberately
 * gated on a signed-in session: a signed-in member who lands on the marketing
 * homepage sees the real board, and a signed-out visitor sees the section not
 * render at all rather than a 403 fired from a public page. Curating
 * gatherings into `/landing/features` is what would open this to everyone.
 *
 * Demo mode never calls this — `HomePage` renders the static `Gatherings`
 * section there instead, so the query stays disabled and no mock can leak
 * into the live path.
 */
export function useHomepageGatherings(): HomepageGatheringsResult {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking } = useAuth();
  const isEnabled = !demoMode && loggedIn && !checking;

  const query = useQuery<CalendarEvent[]>({
    queryKey: ["homepage-gatherings"],
    enabled: isEnabled,
    queryFn: async () => {
      const page = await getEvents({ filter: "upcoming", page: 1 });
      return page.items.map(cardToCalendarEvent);
    },
  });

  const gatherings = [...(query.data ?? [])]
    .sort((first, second) => first.date.getTime() - second.date.getTime())
    .slice(0, HOMEPAGE_GATHERING_LIMIT);

  return { gatherings, isLoading: isEnabled && query.isPending };
}
