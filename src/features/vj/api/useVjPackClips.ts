import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { VjPackClipsDTO } from "../../../shared/contracts/vj";
import { getVjPackClips } from "./vj.api";
import { vjKeys } from "./vjKeys";
import { VJ_LIVE_STALE_MS } from "./useVjPacks";

/** One pack with its clips in pack order. Idle while `packId` is null (the
 *  All clips view reads `useVjClips` instead). */
export function useVjPackClips(
  packId: string | null,
): UseQueryResult<VjPackClipsDTO, Error> {
  const { demoMode } = useDemoMode();
  return useQuery<VjPackClipsDTO, Error>({
    queryKey: vjKeys.packClips(packId ?? "", demoMode),
    enabled: packId !== null,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : VJ_LIVE_STALE_MS,
    // The app turns focus refetch off; live reads again when the admin comes
    // back to the tab, so another admin's edit shows. Demo follows other tabs
    // through `useVjDemoLibrarySync`.
    refetchOnWindowFocus: !demoMode,
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (packId === null) throw new Error("No pack selected");
      if (demoMode) {
        const { demoGetVjPackClips } = await import("../demo/vjDemoStore");
        return demoGetVjPackClips(packId);
      }
      return getVjPackClips(packId, signal);
    },
  });
}
