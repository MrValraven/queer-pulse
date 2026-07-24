import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ADMIN_ORG_TIERS_DEMO } from "../adminOrgTiers.data";
import {
  type OrgTierAdminDTO,
  getAdminOrgTiers,
} from "../../marketing/api/adminOrgTiers.api";

export const ADMIN_ORG_TIERS_KEY = "admin-org-tiers";

/**
 * Every partnership tier on the platform, for the admin tiers panel. Demo
 * mode returns the colocated (empty) fixture and never hits the network — this
 * is an admin-only endpoint that 403s for anyone else.
 */
export function useAdminOrgTiers() {
  const { demoMode } = useDemoMode();
  return useQuery<OrgTierAdminDTO[]>({
    queryKey: [ADMIN_ORG_TIERS_KEY, demoMode],
    initialData: demoMode ? ADMIN_ORG_TIERS_DEMO : undefined,
    queryFn: () => (demoMode ? ADMIN_ORG_TIERS_DEMO : getAdminOrgTiers()),
  });
}
