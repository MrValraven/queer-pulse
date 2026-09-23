import { apiGet, apiPost } from "../../../shared/api/client";
import type { AccessTier } from "../../communities/api/communities.api";

export type AdminCommunitySpaceRequestStatus =
  "open" | "approved" | "declined" | "withdrawn";

/**
 * An owner/co-owner's "Request spaces" submission (filed from
 * `SpaceRequestPanel` in mod tools) as an admin triages it.
 */
export interface AdminCommunitySpaceRequestDTO {
  id: string;
  community: {
    slug: string;
    name: string;
    accessTier: AccessTier;
    avatarUrl: string | null;
  } | null;
  /** ABSENT for a reader holding only the `communities` grant. */
  requestedBy?: { slug: string; name: string; avatarUrl: string | null } | null;
  note: string | null;
  status: AdminCommunitySpaceRequestStatus;
  createdAt: string;
  decidedAt: string | null;
  declineReason: string | null;
}

export interface AdminCommunitySpaceRequestListDTO {
  items: AdminCommunitySpaceRequestDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/** GET /admin/community-space-requests. Admin plus the `communities` staff
 *  grant only, paginated and optionally filtered by status. */
export function getAdminCommunitySpaceRequests(params: {
  page?: number;
  status?: AdminCommunitySpaceRequestStatus;
}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.status) search.set("status", params.status);
  const querySuffix = search.toString();
  return apiGet<AdminCommunitySpaceRequestListDTO>(
    `/admin/community-space-requests${querySuffix ? `?${querySuffix}` : ""}`,
  );
}

/** POST /admin/community-space-requests/:id/approve. Admin plus the
 *  `communities` staff grant only. Flips the community's "Allow spaces"
 *  setting on and closes the request. */
export const approveCommunitySpaceRequest = (id: string) =>
  apiPost<AdminCommunitySpaceRequestDTO>(
    `/admin/community-space-requests/${id}/approve`,
    {},
  );

/** POST /admin/community-space-requests/:id/decline. Admin plus the
 *  `communities` staff grant only. `reason` is optional and, when given, is
 *  the message the requester reads. */
export const declineCommunitySpaceRequest = (id: string, reason?: string) =>
  apiPost<AdminCommunitySpaceRequestDTO>(
    `/admin/community-space-requests/${id}/decline`,
    reason ? { reason } : {},
  );
