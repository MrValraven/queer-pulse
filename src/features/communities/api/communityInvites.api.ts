import { apiPost } from "../../../shared/api/client";

/** How many members one `POST /communities/:slug/invites` call may name. */
export const MAX_INVITES_PER_CALL = 25;

/**
 * Why one named member was passed over. Reported back per slug rather than
 * failing the whole call, so a batch of ten is not rejected because one of them
 * joined yesterday. Mirrors the backend's `CommunityInviteSkipReason`.
 */
export type CommunityInviteSkipReason =
  | "unknown_member"
  | "self"
  | "system_account"
  | "already_member"
  | "pending_request"
  | "banned";

export interface CommunityInviteSkipDTO {
  slug: string;
  reason: CommunityInviteSkipReason;
}

/**
 * What the call actually did. `invited` holds the profile slugs that were sent
 * an invitation; `skipped` names everyone else with the reason. An invite is an
 * invitation: nobody named here is added to the roster.
 */
export interface CommunityInvitesResponseDTO {
  invited: string[];
  skipped: CommunityInviteSkipDTO[];
  invitedCount: number;
  skippedCount: number;
}

export const inviteCommunityMembers = (slug: string, memberSlugs: string[]) =>
  apiPost<CommunityInvitesResponseDTO>(`/communities/${slug}/invites`, {
    memberSlugs,
  });
