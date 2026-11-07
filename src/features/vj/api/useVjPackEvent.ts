import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { VjPackEventDTO } from "../../../shared/contracts/vj";
import { getVjPackEvent } from "./vj.api";
import { vjKeys } from "./vjKeys";
import { VJ_LIVE_STALE_MS } from "./useVjPacks";

/** The one event card query (contract 6.2 "Pack event card", key 9.3
 *  `vjKeys.packEvent`). A screen reads the card as `.data?.card ?? null`; the
 *  library reads `unavailableReason` for its warning line. Waits while
 *  `packId` is null. */
export function useVjPackEvent(
  packId: string | null,
  options?: { isEnabled?: boolean },
): UseQueryResult<VjPackEventDTO, Error> {
  const { demoMode } = useDemoMode();
  return useQuery<VjPackEventDTO, Error>({
    // The disabled branch never runs, so its placeholder id never asks anyone.
    queryKey: vjKeys.packEvent(packId ?? "", demoMode),
    enabled: packId !== null && options?.isEnabled !== false,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : VJ_LIVE_STALE_MS,
    refetchOnWindowFocus: !demoMode,
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (packId === null) throw new Error("VJ_PACK_NOT_FOUND");
      if (demoMode) {
        const { demoGetVjPackEvent } = await import("../demo/vjDemoStore");
        return demoGetVjPackEvent(packId);
      }
      return getVjPackEvent(packId, signal);
    },
  });
}
