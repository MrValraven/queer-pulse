import { apiGet, apiPatch, apiPost } from "../../../shared/api/client";
import type {
  PlatformIncidentSeverity,
  PlatformIncidentState,
  PlatformStatusComponentId,
} from "../../system/api/platformStatus.api";

/**
 * `/admin/status/incidents` — the operator side of the public status page
 * (ID-16), mirrored from `AdminStatusIncidentDTO`
 * (queerpulse-backend/src/admin-status/admin-status-response.ts).
 *
 * A strict superset of the public `PlatformStatusIncidentDTO`: it adds the
 * author snapshot and `createdAt`, neither of which the public read exposes.
 * Guarded `@Roles(Moderator, Admin)` on the backend.
 */
export interface AdminStatusIncidentDTO {
  id: string;
  title: string;
  body: string;
  affectedComponents: PlatformStatusComponentId[];
  severity: PlatformIncidentSeverity;
  status: PlatformIncidentState;
  startedAt: string;
  resolvedAt: string | null;
  authoredByLabel: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusIncidentWriteBody {
  title: string;
  body: string;
  affectedComponents: PlatformStatusComponentId[];
  severity: PlatformIncidentSeverity;
  status: PlatformIncidentState;
  startedAt: string;
}

export function getAdminStatusIncidents(): Promise<AdminStatusIncidentDTO[]> {
  return apiGet<AdminStatusIncidentDTO[]>("/admin/status/incidents");
}

export function createStatusIncident(
  body: StatusIncidentWriteBody,
): Promise<AdminStatusIncidentDTO> {
  return apiPost<AdminStatusIncidentDTO>("/admin/status/incidents", body);
}

export function updateStatusIncident(
  id: string,
  body: Partial<StatusIncidentWriteBody>,
): Promise<AdminStatusIncidentDTO> {
  return apiPatch<AdminStatusIncidentDTO>(
    `/admin/status/incidents/${id}`,
    body,
  );
}

export function resolveStatusIncident(
  id: string,
): Promise<AdminStatusIncidentDTO> {
  return apiPost<AdminStatusIncidentDTO>(
    `/admin/status/incidents/${id}/resolve`,
  );
}
