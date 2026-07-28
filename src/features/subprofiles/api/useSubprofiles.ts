import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getMySubprofiles } from "./subprofiles.api";
import { subprofileToView, type SubprofileView } from "./subprofiles.adapters";

/** The current owner's subprofiles (all statuses) for the dashboard. Demo returns
 *  the mock registry entries for the signed-in user; live calls GET /subprofiles/mine. */
export function useSubprofiles() {
  const { demoMode } = useDemoMode();
  return useQuery<SubprofileView[]>({
    queryKey: ["subprofiles", "mine", demoMode],
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
