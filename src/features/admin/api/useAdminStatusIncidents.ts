import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ADMIN_STATUS_INCIDENTS_DEMO } from "../adminStatusIncidents.data";
import {
  type AdminStatusIncidentDTO,
  getAdminStatusIncidents,
} from "./adminStatusIncidents.api";

export const ADMIN_STATUS_INCIDENTS_KEY = "admin-status-incidents";

/**
 * Every status incident, newest first, for the authoring desk. Demo mode
 * returns the colocated (empty) fixture and never hits the network: this
 * endpoint 403s for anyone who is not staff.
 */
export function useAdminStatusIncidents() {
  const { demoMode } = useDemoMode();
  return useQuery<AdminStatusIncidentDTO[]>({
    queryKey: [ADMIN_STATUS_INCIDENTS_KEY, demoMode],
    initialData: demoMode ? ADMIN_STATUS_INCIDENTS_DEMO : undefined,
    queryFn: () =>
      demoMode ? ADMIN_STATUS_INCIDENTS_DEMO : getAdminStatusIncidents(),
  });
}
