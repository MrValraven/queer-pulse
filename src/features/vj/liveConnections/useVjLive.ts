import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { VjLiveDTO } from "../../../shared/contracts/vj";
import { getVjLive } from "../api/vj.api";
import { vjKeys } from "../api/vjKeys";

/** How often the library reads the live connections while the tab is in view. */
export const VJ_LIVE_POLL_MS = 5_000;

/**
 * The screens and remotes connected right now, read every five seconds while
 * the tab is in view (react-query pauses the interval in a hidden tab). Demo
 * asks the demo server over the demo channel, and reads nothing connected
 * while no demo screen or remote is open.
 */
export function useVjLive(): UseQueryResult<VjLiveDTO, Error> {
  const { demoMode } = useDemoMode();
  return useQuery<VjLiveDTO, Error>({
    queryKey: vjKeys.live(demoMode),
    refetchInterval: VJ_LIVE_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoGetVjLive } = await import("../demo/vjDemoLive");
        return demoGetVjLive();
      }
      return getVjLive(signal);
    },
  });
}
