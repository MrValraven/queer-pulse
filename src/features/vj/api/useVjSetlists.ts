import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { VjSetlistDTO } from "../../../shared/contracts/vj";
import { getVjSetlists } from "./vj.api";
import { vjKeys } from "./vjKeys";
import { VJ_LIVE_STALE_MS } from "./useVjPacks";

/** Every set list of the library with its items, in position order (contract
 *  6.2 "Set lists", keys 9.3). The key holds the demo flag only, so set list
 *  names never reach a query key. */
export function useVjSetlists(options?: {
  isEnabled?: boolean;
}): UseQueryResult<VjSetlistDTO[], Error> {
  const { demoMode } = useDemoMode();
  return useQuery<VjSetlistDTO[], Error>({
    queryKey: vjKeys.setlists(demoMode),
    enabled: options?.isEnabled ?? true,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : VJ_LIVE_STALE_MS,
    // Live reads again when the admin comes back to the tab (v1 call 15); demo
    // follows other tabs through `useVjDemoLibrarySync`.
    refetchOnWindowFocus: !demoMode,
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoGetVjSetlists } = await import("../demo/vjDemoStore");
        return demoGetVjSetlists().items;
      }
      return (await getVjSetlists(signal)).items;
    },
  });
}
