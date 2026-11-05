import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { VjPackDTO } from "../../../shared/contracts/vj";
import { getVjPacks } from "./vj.api";
import { vjKeys } from "./vjKeys";

export const VJ_LIVE_STALE_MS = 30_000;

/** The packs in position order. Demo reads the shared demo library, which only
 *  a write changes, so it never goes stale there. */
export function useVjPacks(): UseQueryResult<VjPackDTO[], Error> {
  const { demoMode } = useDemoMode();
  return useQuery<VjPackDTO[], Error>({
    queryKey: vjKeys.packs(demoMode),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : VJ_LIVE_STALE_MS,
    // The app turns focus refetch off; live reads again when the admin comes
    // back to the tab, so another admin's edit shows. Demo follows other tabs
    // through `useVjDemoLibrarySync`.
    refetchOnWindowFocus: !demoMode,
    // Opening the page always reads the library again, so a pack another admin
    // renamed or deleted since the last visit shows right away.
    refetchOnMount: "always",
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoGetVjPacks } = await import("../demo/vjDemoStore");
        return demoGetVjPacks().items;
      }
      return (await getVjPacks(signal)).items;
    },
  });
}
