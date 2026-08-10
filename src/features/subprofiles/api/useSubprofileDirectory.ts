import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getSubprofileDirectory, type SubprofileCardDTO } from "./subprofiles.api";

/**
 * The full standalone (unlinked + published + open) persona set, fetched once
 * per demo/live mode. Personas redesign Phase 4 (design plan Decision §2):
 * the directory page filters by skin family, tags, free-text search, and
 * open-to-collabs entirely CLIENT-SIDE over this set, so the fetch itself
 * takes no `kind`/`query` network param and never needs to re-run as filters
 * change — demo filters nothing out of the mock registry, live calls the
 * directory endpoint with no query string (the backend already returns the
 * whole capped result set when both params are omitted).
 */
export function useSubprofileDirectory() {
  const { demoMode } = useDemoMode();
  return useQuery<SubprofileCardDTO[]>({
    queryKey: ["subprofiles", "directory", demoMode],
    queryFn: async () => {
      if (demoMode) {
        const { mockDirectory } = await import("../data/subprofiles.data");
        return mockDirectory();
      }
      const res = await getSubprofileDirectory();
      return res.items;
    },
  });
}
