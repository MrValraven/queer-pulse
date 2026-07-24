import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminPartners,
  type PartnerApplicationDTO,
} from "../../marketing/api/partners.api";

export const ADMIN_PARTNERS_KEY = "admin-partners";

/** Approved partners for the admin featured/testimonial editor. Demo mode
 *  returns an empty list (admin demo shows the honest empty state); live mode
 *  calls GET /admin/partners (admin-only, 403s otherwise). */
export function useAdminPartners() {
  const { demoMode } = useDemoMode();
  return useQuery<PartnerApplicationDTO[]>({
    queryKey: [ADMIN_PARTNERS_KEY, demoMode],
    initialData: demoMode ? [] : undefined,
    queryFn: () => (demoMode ? [] : getAdminPartners()),
  });
}
