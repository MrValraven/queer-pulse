import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  ADMIN_COOPS_DEMO,
  ADMIN_JOIN_REQUESTS_DEMO,
} from "../adminHousing.data";
import {
  type AdminJoinRequestDTO,
  getAdminCoops,
  getAdminJoinRequests,
} from "./adminHousing.api";
import type { HousingCoopDTO } from "../../economy/api/housingCoop.api";

export const ADMIN_HOUSING_COOPS_KEY = "admin-housing-coops";
export const ADMIN_HOUSING_JOIN_REQUESTS_KEY = "admin-housing-join-requests";

/**
 * Every housing coop on the platform, for the admin housing panel. Demo mode
 * returns the colocated (empty) fixture and never hits the network — this is
 * an admin-only endpoint that 403s for anyone else.
 */
export function useAdminHousingCoops() {
  const { demoMode } = useDemoMode();
  return useQuery<HousingCoopDTO[]>({
    queryKey: [ADMIN_HOUSING_COOPS_KEY, demoMode],
    initialData: demoMode ? ADMIN_COOPS_DEMO : undefined,
    queryFn: () => (demoMode ? ADMIN_COOPS_DEMO : getAdminCoops()),
  });
}

/**
 * Every join request across all coops, for the admin triage queue. Same
 * demo/live split as `useAdminHousingCoops`.
 */
export function useAdminJoinRequests() {
  const { demoMode } = useDemoMode();
  return useQuery<AdminJoinRequestDTO[]>({
    queryKey: [ADMIN_HOUSING_JOIN_REQUESTS_KEY, demoMode],
    initialData: demoMode ? ADMIN_JOIN_REQUESTS_DEMO : undefined,
    queryFn: () =>
      demoMode ? ADMIN_JOIN_REQUESTS_DEMO : getAdminJoinRequests(),
  });
}
