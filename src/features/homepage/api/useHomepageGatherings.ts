import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { getEvents } from "../../gatherings/api/events.api";
import { cardToCalendarEvent } from "../../gatherings/api/events.adapters";
import type { CalendarEvent } from "../../gatherings/data";
import {
  calendarEventToGatheringRow,
  landingGatheringToGatheringRow,
  type HomepageGatheringRow,
} from "../sections/liveGatherings.adapters";
import { useLandingFeaturesPublic } from "./useLandingFeatures";

/** How many gatherings the homepage teaser row shows, matching the demo one. */
export const HOMEPAGE_GATHERING_LIMIT = 4;

export interface HomepageGatheringsResult {
  rows: HomepageGatheringRow[];
  isLoading: boolean;
  /** True when the request failed. The row renders nothing either way, so this
   *  exists to keep "no gatherings on the board" and "the request fell over"
   *  from being the same fact to a caller (DES-22). */
  isError: boolean;
  /** Re-runs the failed request, for a caller that chooses to offer a retry. */
  refetch: () => void;
}

/**
 * The gatherings for the homepage's live "what's on" row, from one of two
 * sources depending on who is looking:
 *
 * - **Signed-in member**: the next few real gatherings on the board
 *   (`GET /events?filter=upcoming`), soonest first. That endpoint sits behind
 *   `ActiveMemberGuard`, so only a session can read it.
 * - **Signed-out visitor**: the admin-curated gathering slice of the public
 *   `GET /landing/features`, in the order the admin set. The backend re-checks
 *   every curated gathering on each read (public, published, upcoming, clear
 *   of any moderator takedown) and ships the area-level place only, so this
 *   never fires a 403 from the public page. The response is CDN-cached, so a
 *   gathering that stops qualifying leaves the row within a few minutes.
 *   Nothing curated: the row renders nothing.
 *
 * While the session check is still running neither source is chosen and the
 * row stays empty, so a member never sees the curated row flash first.
 *
 * Demo mode never calls this: `HomePage` renders the static `Gatherings`
 * section there instead, so the board query stays disabled and no mock can
 * leak into the live path.
 */
export function useHomepageGatherings(): HomepageGatheringsResult {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking } = useAuth();
  const { t } = useTranslation();
  const isMemberSource = !demoMode && loggedIn && !checking;
  const isCuratedSource = !demoMode && !loggedIn && !checking;

  const boardQuery = useQuery<CalendarEvent[]>({
    queryKey: ["homepage-gatherings"],
    enabled: isMemberSource,
    queryFn: async () => {
      const page = await getEvents({ filter: "upcoming", page: 1 });
      return page.items.map((card) => cardToCalendarEvent(card, t));
    },
  });
  // Shares its query key with every other `Live*` section on the page, so
  // this adds no request of its own.
  const curated = useLandingFeaturesPublic();

  if (isCuratedSource) {
    return {
      rows: curated.gatherings
        .slice(0, HOMEPAGE_GATHERING_LIMIT)
        .map((feature) => landingGatheringToGatheringRow(feature, t)),
      isLoading: curated.isLoading,
      isError: curated.isError,
      refetch: curated.refetch,
    };
  }

  const rows = [...(boardQuery.data ?? [])]
    .sort((first, second) => first.date.getTime() - second.date.getTime())
    .slice(0, HOMEPAGE_GATHERING_LIMIT)
    .map(calendarEventToGatheringRow);

  return {
    rows,
    isLoading: isMemberSource && boardQuery.isPending,
    isError: isMemberSource && boardQuery.isError,
    refetch: () => void boardQuery.refetch(),
  };
}
