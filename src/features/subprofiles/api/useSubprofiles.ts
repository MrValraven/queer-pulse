import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getMySubprofiles } from "./subprofiles.api";
import { subprofileToView, type SubprofileView } from "./subprofiles.adapters";

/** The current owner's subprofiles (all statuses) for the dashboard. Demo returns
 *  the mock registry entries for the signed-in user; live calls GET /subprofiles/mine.
 *
 *  `enabled` (default `true`) lets a caller that only sometimes owns the view
 *  it's rendering — e.g. the main-profile section, viewed by self or by a
 *  visitor — gate this query off entirely rather than calling it
 *  unconditionally: a visitor/logged-out viewer must never hit
 *  GET /subprofiles/mine. The hook itself is still called every render either
 *  way (Rules of Hooks); only the network/demo-mock work is skipped. */
export function useSubprofiles(options: { enabled?: boolean } = {}) {
  const { demoMode } = useDemoMode();
  return useQuery<SubprofileView[]>({
    queryKey: ["subprofiles", "mine", demoMode],
    enabled: options.enabled ?? true,
    queryFn: async () => {
      if (!demoMode) {
        const dtos = await getMySubprofiles();
        return dtos.map(subprofileToView);
      }
      const { mockMineSubprofiles } = await import("../data/subprofiles.data");
      return mockMineSubprofiles().map(subprofileToView);
    },
  });
}
