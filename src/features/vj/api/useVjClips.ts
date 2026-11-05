import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import { getVjClips } from "./vj.api";
import { vjKeys } from "./vjKeys";
import { VJ_LIVE_STALE_MS } from "./useVjPacks";

/** Every clip of the library, newest first (the All clips view and the pack
 *  membership checks). */
export function useVjClips(options?: {
  isEnabled?: boolean;
}): UseQueryResult<VjClipDTO[], Error> {
  const { demoMode } = useDemoMode();
  return useQuery<VjClipDTO[], Error>({
    queryKey: vjKeys.clips(demoMode),
    enabled: options?.isEnabled ?? true,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : VJ_LIVE_STALE_MS,
    // The app turns focus refetch off; live reads again when the admin comes
    // back to the tab, so another admin's edit shows. Demo follows other tabs
    // through `useVjDemoLibrarySync`.
    refetchOnWindowFocus: !demoMode,
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoGetVjClips } = await import("../demo/vjDemoStore");
        return demoGetVjClips().items;
      }
      return (await getVjClips(signal)).items;
    },
  });
}
