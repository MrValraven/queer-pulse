import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getPlatformStatus,
  type PlatformStatusDTO,
} from "./platformStatus.api";
import { DEMO_PLATFORM_STATUS } from "./platformStatus.data";

export const PLATFORM_STATUS_KEY = "platform-status";

/** Background poll. Matches the cadence the page promises in its own copy. */
const STATUS_POLL_MS = 60_000;

/**
 * The live platform status. Polls in the background so a member who leaves the
 * page open during an outage sees it recover without touching anything, and
 * exposes `refetch` for the manual "Check again" control.
 *
 * `retry: 1` rather than the usual ladder: a member on this page is already
 * suspecting the platform is broken, and making them wait through four backoffs
 * before being told the status endpoint itself is unreachable is the opposite
 * of what they came for. One retry covers a blip; anything more is answered by
 * the button.
 */
export function usePlatformStatus() {
  const { demoMode } = useDemoMode();
  return useQuery<PlatformStatusDTO>({
    queryKey: [PLATFORM_STATUS_KEY, demoMode],
    queryFn: () =>
      demoMode ? Promise.resolve(DEMO_PLATFORM_STATUS) : getPlatformStatus(),
    refetchInterval: STATUS_POLL_MS,
    staleTime: 15_000,
    retry: 1,
  });
}
