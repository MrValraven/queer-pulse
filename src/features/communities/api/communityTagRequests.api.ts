import { apiGet } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";

/**
 * Where one tag suggestion stands. Mirrors the backend's
 * `CommunityTagRequestStatus`.
 *
 * `resolved` means somebody on the platform team has READ the suggestion. It
 * never means the tag now exists: `COMMUNITY_TAGS` is a hardcoded,
 * code-reviewed array by deliberate product decision, and resolving a request
 * writes to neither it nor `Community.tags`. Any surface rendering this must
 * say so plainly rather than let a community read "resolved" as "approved and
 * live", which is exactly the guessing this endpoint exists to end.
 */
export type CommunityTagRequestStatus = "pending" | "resolved";

/**
 * One row of a community's own tag-suggestion log
 * (`GET /communities/:slug/tag-requests`, PRD-150).
 *
 * `requestedBy` names the member who filed it, and the backend sends the name
 * on purpose here: this reader is the community's own staff, the requester is
 * by construction one of them (filing is owner/co-owner/mod gated), and the
 * two already know each other from the roster. It is what lets an owner tell
 * their own suggestion from a co-moderator's instead of filing a second one.
 * Null only when the profile cannot be resolved.
 *
 * `resolvedAt` is null while the suggestion is still pending, and there is
 * deliberately no resolving admin: which platform person read it is nobody
 * this community needs named.
 */
export interface CommunityTagRequestDTO {
  id: string;
  label: string;
  note: string | null;
  status: CommunityTagRequestStatus;
  createdAt: string;
  resolvedAt: string | null;
  requestedBy: MemberRefDTO | null;
}

/** The whole log, newest first, capped at 200 rows by the backend. */
export interface CommunityTagRequestsResponseDTO {
  items: CommunityTagRequestDTO[];
}

/**
 * `GET /communities/:slug/tag-requests` — every tag this community has
 * suggested and where each one stands. Owner, co-owner or moderator only: the
 * endpoint 403s anybody else, so gate the call on the viewer's roster role
 * rather than firing it and reading the failure.
 *
 * Never answers null (an empty log is `{ items: [] }`), so a plain `apiGet` is
 * correct here.
 *
 * It lives in its own module rather than in `communities.api.ts` for the same
 * reason `communityInvites.api.ts` and `communityBans.api.ts` do: one file per
 * sub-resource keeps the shared surface small.
 */
export const getCommunityTagRequests = (slug: string) =>
  apiGet<CommunityTagRequestsResponseDTO>(`/communities/${slug}/tag-requests`);
