import { apiDelete, apiGet, apiPost } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";
import type { CommunityCardDTO } from "./communities.api";

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
  | "banned"
  // PRD-140. They already hold a pending invitation here, so re-inviting
  // writes no second row and sends no second bell. Only meaningful since an
  // invitation became a durable record rather than a notification.
  | "already_invited";

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

/**
 * One standing invitation as its INVITEE sees it (`GET /me/community-invites`).
 *
 * The community rides along as the ordinary `CommunityCardDTO` the discover
 * grid already renders, so the shelf shows the same card the rest of the app
 * does. This is the only place a `private` community's card reaches somebody
 * who is not on its roster, and a pending invitation is exactly the standing
 * that earns it.
 *
 * `invitedBy` is null when the moderator who sent it has since erased their
 * account: the invitation still stands, it just no longer names a person.
 */
export interface MyCommunityInviteDTO {
  id: string;
  community: CommunityCardDTO;
  invitedBy: MemberRefDTO | null;
  createdAt: string;
}

export const inviteCommunityMembers = (slug: string, memberSlugs: string[]) =>
  apiPost<CommunityInvitesResponseDTO>(`/communities/${slug}/invites`, {
    memberSlugs,
  });

/**
 * `GET /me/community-invites` — every invitation still waiting on the caller,
 * newest first. Never answers null (an empty shelf is `{ items: [] }`), so a
 * plain `apiGet` is correct here.
 *
 * Until this endpoint existed an invitation was a bell and nothing else, so a
 * member who scrolled past it had no way back to it, and for a `private`
 * community there was nothing else to find.
 */
export const getMyCommunityInvites = () =>
  apiGet<{ items: MyCommunityInviteDTO[] }>("/me/community-invites");

/**
 * `DELETE /me/community-invites/:id` — decline one standing invitation.
 *
 * The community is not notified, deliberately: saying no to a survivors' or
 * coming-out group is the invitee's own business, and a bell announcing it
 * would be a pressure nobody invited. Do not "fix" this by adding one.
 *
 * ACCEPTING is not here. The invitee accepts through the ordinary front door,
 * `POST /communities/:slug/join`, which is what keeps the house rules and
 * every other gate between them and the room.
 */
export const declineMyCommunityInvite = (id: string) =>
  apiDelete<void>(`/me/community-invites/${id}`);

/**
 * One standing invitation as the community's OWN STAFF see it
 * (`GET /communities/:slug/invites`).
 *
 * Pending only, and deliberately so. An answered invitation is the invitee's
 * business, and surfacing "she declined you" to a room's moderators is a
 * pressure nobody invited, so the server never lists one.
 *
 * `invitedBy` is null when the moderator who sent it has since erased their
 * account: the invitation still stands, it just no longer names a person.
 */
export interface CommunityPendingInviteDTO {
  id: string;
  member: MemberRefDTO;
  invitedBy: MemberRefDTO | null;
  createdAt: string;
}

/**
 * `GET /communities/:slug/invites` — every invitation this community is still
 * waiting on an answer to, newest first.
 *
 * Owner, co-owner or moderator only: the server answers anybody else with a
 * 403, so the caller gates the request on the detail DTO's `myRole` rather
 * than firing it and reading the refusal. Until this existed a moderator could
 * send an invitation and then never see it again, which mattered most in
 * exactly the case the invite tier exists for.
 *
 * Never answers null (a community with nothing out is `{ items: [] }`), so a
 * plain `apiGet` is right here.
 */
export const getCommunityPendingInvites = (slug: string) =>
  apiGet<{ items: CommunityPendingInviteDTO[] }>(
    `/communities/${slug}/invites`,
  );

/**
 * `DELETE /communities/:slug/invites/:id` — withdraw a standing invitation.
 *
 * WITHDRAWING IS SILENT. No notification reaches the invitee and none ever
 * should: the invitation simply stops working. Telling somebody they have been
 * uninvited from a survivors' or coming-out group is worse than saying
 * nothing, and there is no wording of that message that reads as anything but
 * a rejection they never asked to hear about. The confirm step says exactly
 * that to the moderator, so nobody withdraws one believing a note goes out.
 * Please do not "fix" this by adding a bell.
 */
export const revokeCommunityInvite = (slug: string, inviteId: string) =>
  apiDelete<void>(`/communities/${slug}/invites/${inviteId}`);
