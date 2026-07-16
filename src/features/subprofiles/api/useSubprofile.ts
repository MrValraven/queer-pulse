import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getSubprofile } from "./subprofiles.api";
import { subprofileToView, type SubprofileView } from "./subprofiles.adapters";
import { mockSubprofileById } from "../data/subprofiles.data";

/** A single owned subprofile for the editor. Demo reads the mock registry by id;
 *  live calls GET /subprofiles/:id (owner-scoped). */
export function useSubprofile(id: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<SubprofileView | null>({
    queryKey: ["subprofile", demoMode, id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) return null;
      if (demoMode) {
        const dto = mockSubprofileById(id);
        return dto ? subprofileToView(dto) : null;
      }
      return subprofileToView(await getSubprofile(id));
    },
  });
}
