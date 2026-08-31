import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import { toItemsPage, type ItemsPage } from "../../../shared/api/pagination";
import type { HousingCoopDTO } from "../../economy/api/housingCoop.api";

/**
 * Admin housing panel (`/admin/housing`, admin-only). Reuses the public
 * `HousingCoopDTO` (from the economy feature) as-is rather than redeclaring
 * an admin-only shape — the admin surface reads/writes the same coop record,
 * just via admin-only endpoints that also expose unpublished coops.
 */
export type CoopJoinRequestStatus = "pending" | "accepted" | "declined";

export interface AdminJoinRequestDTO {
  id: string;
  name: string;
  householdSize: string;
  note: string | null;
  status: CoopJoinRequestStatus;
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

export interface AdminJoinRequestsParameters {
  page?: number;
  /** Omitted returns every status. The console asks for `pending`. */
  status?: CoopJoinRequestStatus;
  /** A co-op slug to narrow to. */
  coop?: string;
}

/**
 * GET /admin/housing/join-requests?page&status&coop, one page of the cross-co-op
 * join-request triage queue, newest first.
 *
 * This route used to answer with a flat array of the newest 200 requests in
 * EVERY status, and this console filtered to the pending ones in the browser
 * (ENG-41). So a platform carrying 200 already-decided requests newer than one
 * pending request showed an admin an empty queue while somebody waited. The
 * status filter now lives in the query, and the response is the
 * `{ items, total, page, pageSize }` envelope with `total` counting the whole
 * filtered queue. Wrapped in `toItemsPage` so a deploy where the backend is
 * still on the old array shape reads as one full page instead of throwing on
 * `.items`. Mirrors `getAdminGroupJoinRequests` for the sibling housing-groups
 * queue.
 */
export const getAdminJoinRequests = async (
  parameters: AdminJoinRequestsParameters = {},
) => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.status) searchParams.set("status", parameters.status);
  if (parameters.coop) searchParams.set("coop", parameters.coop);
  const querySuffix = searchParams.toString();
  const response = await apiGet<
    AdminJoinRequestDTO[] | ItemsPage<AdminJoinRequestDTO>
  >(`/admin/housing/join-requests${querySuffix ? `?${querySuffix}` : ""}`);
  return toItemsPage(response);
};

export const triageAdminJoinRequest = (
  id: string,
  action: "accepted" | "declined",
) =>
  apiPatch<AdminJoinRequestDTO>(`/admin/housing/join-requests/${id}`, {
    action,
  });
