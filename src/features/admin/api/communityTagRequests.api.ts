import { apiGet, apiPatch } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";

export type CommunityTagRequestStatus = "pending" | "resolved";

/**
 * An owner/mod's "Suggest a tag" request from `SuggestCommunityTagModal`
 * (`POST /communities/:slug/tag-requests`, `communities/api/communities.api.ts`),
 * as an admin triages it. `requestedBy` is nullable — the member who filed it
 * may have since been deleted/anonymised — same shape as other admin queues'
 * submitter refs.
 */
export interface AdminCommunityTagRequestDTO {
  id: string;
  communitySlug: string;
  communityName: string;
  label: string;
  note: string | null;
  status: CommunityTagRequestStatus;
  /** ABSENT (not null) for a reader holding the `communities` staff grant
   *  without the Moderator/Admin tier: deciding a tag is a decision about a
   *  word, so the requester is not named. `null` means their account is gone. */
  requestedBy?: MemberRefDTO | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface AdminCommunityTagRequestListDTO {
  items: AdminCommunityTagRequestDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/** GET /admin/community-tag-requests — Moderator/Admin only, paginated and
 *  optionally filtered by status. */
export const getAdminCommunityTagRequests = (parameters: {
  page?: number;
  status?: CommunityTagRequestStatus;
}) => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.status) searchParams.set("status", parameters.status);
  const querySuffix = searchParams.toString();
  return apiGet<AdminCommunityTagRequestListDTO>(
    `/admin/community-tag-requests${querySuffix ? `?${querySuffix}` : ""}`,
  );
};

/** PATCH /admin/community-tag-requests/:id/resolve — Moderator/Admin only.
 *  Marks a pending request resolved (the requester is notified through the
 *  existing platform notification system, not anything this call renders). */
export const resolveCommunityTagRequest = (id: string) =>
  apiPatch<AdminCommunityTagRequestDTO>(
    `/admin/community-tag-requests/${id}/resolve`,
    {},
  );
