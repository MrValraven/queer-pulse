import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import type { HousingCoopDTO } from "../../economy/api/housingCoop.api";

/**
 * Admin housing panel (`/admin/housing`, admin-only). Reuses the public
 * `HousingCoopDTO` (from the economy feature) as-is rather than redeclaring
 * an admin-only shape — the admin surface reads/writes the same coop record,
 * just via admin-only endpoints that also expose unpublished coops.
 */
export interface AdminJoinRequestDTO {
  id: string;
  name: string;
  householdSize: string;
  note: string | null;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  coop: { slug: string; name: string } | null;
}

// `operatorVerified` is a separate admin marker (set via the verification flow,
// optional on the backend create/update DTOs), not something the coop create/
// edit form manages — so it's optional here rather than required on every write.
export type CoopWriteBody = Omit<HousingCoopDTO, "id" | "operatorVerified"> & {
  operatorVerified?: boolean;
};

/** Every housing coop on the platform, published or not. Admin-only — 403s otherwise. */
export const getAdminCoops = () =>
  apiGet<HousingCoopDTO[]>("/admin/housing/coops");

export const createAdminCoop = (body: CoopWriteBody) =>
  apiPost<HousingCoopDTO>("/admin/housing/coops", body);

export const updateAdminCoop = (id: string, body: Partial<CoopWriteBody>) =>
  apiPatch<HousingCoopDTO>(`/admin/housing/coops/${id}`, body);

export const deleteAdminCoop = (id: string) =>
  apiDelete<void>(`/admin/housing/coops/${id}`);

/** Every join request across all coops, for the admin triage queue. */
export const getAdminJoinRequests = () =>
  apiGet<AdminJoinRequestDTO[]>("/admin/housing/join-requests");

export const triageAdminJoinRequest = (
  id: string,
  action: "accepted" | "declined",
) =>
  apiPatch<AdminJoinRequestDTO>(`/admin/housing/join-requests/${id}`, {
    action,
  });
