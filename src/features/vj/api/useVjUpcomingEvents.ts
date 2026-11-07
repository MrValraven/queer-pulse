import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { VjEventOptionDTO } from "../../../shared/contracts/vj";
import { getVjUpcomingEvents } from "./vj.api";
import { vjKeys } from "./vjKeys";

/** Upcoming events change slowly, so live keeps them a minute. */
const VJ_UPCOMING_EVENTS_STALE_MS = 60_000;

/** The events a pack may link, soonest first (contract 6.2 "Upcoming events",
 *  key 9.3). Feeds the pack event picker. */
export function useVjUpcomingEvents(options?: {
  isEnabled?: boolean;
}): UseQueryResult<VjEventOptionDTO[], Error> {
  const { demoMode } = useDemoMode();
  return useQuery<VjEventOptionDTO[], Error>({
    queryKey: vjKeys.upcomingEvents(demoMode),
    enabled: options?.isEnabled ?? true,
    staleTime: demoMode
      ? Number.POSITIVE_INFINITY
      : VJ_UPCOMING_EVENTS_STALE_MS,
    refetchOnWindowFocus: !demoMode,
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoGetVjUpcomingEvents } = await import("../demo/vjDemoStore");
        return demoGetVjUpcomingEvents().items;
      }
      return (await getVjUpcomingEvents(signal)).items;
    },
  });
}
