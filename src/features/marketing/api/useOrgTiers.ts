import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getOrgTiers } from "./orgTiers.api";
import { dtoToOrgTier } from "./orgTiers.adapters";
import type { OrgTier } from "../orgTiers.data";

export interface OrgTiersResult {
  tiers: OrgTier[];
  isLoading: boolean;
}

/** Partnership tiers for the For Organisations page. Demo → ORG_TIERS_DEMO;
 *  live → GET /org-tiers, adapted. */
export function useOrgTiers(): OrgTiersResult {
  const { demoMode } = useDemoMode();
  const query = useQuery<OrgTier[]>({
    queryKey: ["org-tiers", demoMode],
    queryFn: async () => {
      if (demoMode) {
        const { ORG_TIERS_DEMO } = await import("../orgTiers.data");
        return ORG_TIERS_DEMO;
      }
      const dtos = await getOrgTiers();
      return dtos.map(dtoToOrgTier);
    },
  });
  return { tiers: query.data ?? [], isLoading: query.isLoading };
}
