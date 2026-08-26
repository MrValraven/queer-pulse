import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { PLATFORM_STATUS_KEY } from "../../system/api/usePlatformStatus";
import {
  type AdminStatusIncidentDTO,
  type StatusIncidentWriteBody,
  createStatusIncident,
  resolveStatusIncident,
  updateStatusIncident,
} from "./adminStatusIncidents.api";
import { ADMIN_STATUS_INCIDENTS_KEY } from "./useAdminStatusIncidents";
import { useDemoAwareMutation } from "./demoAwareMutation";

/**
 * Every write here also invalidates the PUBLIC status query, so an operator who
 * publishes an incident and then opens `/system/status` in the same session
 * sees it immediately. The endpoint's CDN window is 15s, and its browser-facing
 * `Cache-Control` carries no stale window at all precisely so this refetch
 * cannot be answered out of the browser cache.
 */
function useInvalidateStatus() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({
      queryKey: [ADMIN_STATUS_INCIDENTS_KEY],
    });
    void queryClient.invalidateQueries({ queryKey: [PLATFORM_STATUS_KEY] });
  };
}

export function useCreateStatusIncident() {
  const { demoMode } = useDemoMode();
  const invalidate = useInvalidateStatus();
  return useDemoAwareMutation<
    AdminStatusIncidentDTO | undefined,
    Error,
    StatusIncidentWriteBody
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // AdminStatusIncidentForm toasts locally
    demoResult: () => undefined,
    live: (body) => createStatusIncident(body),
    onLiveSuccess: invalidate,
  });
}

export interface UpdateStatusIncidentVars {
  id: string;
  body: Partial<StatusIncidentWriteBody>;
}

export function useUpdateStatusIncident() {
  const { demoMode } = useDemoMode();
  const invalidate = useInvalidateStatus();
  return useDemoAwareMutation<
    AdminStatusIncidentDTO | undefined,
    Error,
    UpdateStatusIncidentVars
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // the form and the page toast locally
    demoResult: () => undefined,
    live: ({ id, body }) => updateStatusIncident(id, body),
    onLiveSuccess: invalidate,
  });
}

export function useResolveStatusIncident() {
  const { demoMode } = useDemoMode();
  const invalidate = useInvalidateStatus();
  return useDemoAwareMutation<
    AdminStatusIncidentDTO | undefined,
    Error,
    string
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // AdminStatusIncidentsPage toasts locally
    demoResult: () => undefined,
    live: (id) => resolveStatusIncident(id),
    onLiveSuccess: invalidate,
  });
}
