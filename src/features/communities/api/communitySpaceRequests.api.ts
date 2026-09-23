import { apiDelete, apiGet, apiPost } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";

/**
 * A community's request to platform staff to switch spaces on. One sub-resource
 * per file, like `communityTagRequests.api.ts`.
 */
export type SpaceRequestStatus = "open" | "approved" | "declined" | "withdrawn";

export interface SpaceRequestDTO {
  id: string;
  status: SpaceRequestStatus;
  note: string | null;
  createdAt: string;
  decidedAt: string | null;
  declineReason: string | null;
  requestedBy: MemberRefDTO | null;
}

export interface LatestSpaceRequestDTO {
  request: SpaceRequestDTO | null;
}

export interface CreateSpaceRequestBody {
  note?: string;
}

/** Staff only (owner, co-owner, mod). */
export const getLatestSpaceRequest = (slug: string) =>
  apiGet<LatestSpaceRequestDTO>(`/communities/${slug}/space-requests/latest`);

/** Owner or co-owner. 409 `SPACE_REQUEST_ALREADY_OPEN` / `SPACES_ALREADY_ALLOWED` / `SUBCOMMUNITIES_NOT_ALLOWED`. */
export const createSpaceRequest = (
  slug: string,
  body: CreateSpaceRequestBody,
) => apiPost<SpaceRequestDTO>(`/communities/${slug}/space-requests`, body);

/** Owner or co-owner. 404 when nothing is open. */
export const withdrawSpaceRequest = (slug: string) =>
  apiDelete<SpaceRequestDTO>(`/communities/${slug}/space-requests/open`);
