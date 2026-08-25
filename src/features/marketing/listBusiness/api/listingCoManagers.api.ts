import { apiDelete, apiGet, apiPost } from "../../../../shared/api/client";
import type { MemberRefDTO } from "../../../../shared/api/refs";

/**
 * Co-managers: the people an owner has asked to help run their listing.
 *
 * Every endpoint here is member-gated and none of it is public. Nothing about
 * a co-manager appears on the listing's public page: this is about who can get
 * into the editor, and that is the owner's business and theirs.
 *
 * Reading the roster is open to the owner and to any co-manager, so everyone
 * helping can see who else is. Inviting and removing stay with the owner, as
 * does deleting the listing.
 */

/** How far along one person's place on the roster is. */
export type CoManagerStatus =
  "invited" | "active" | "declined" | "revoked" | "left";

/**
 * One row of a listing's roster. `member` is nullable for the same reason
 * every other `MemberRef` on this domain is: the account behind it may have
 * been deleted since.
 */
export interface ListingCoManagerDTO {
  id: string;
  member: MemberRefDTO | null;
  status: CoManagerStatus;
  invitedBy: MemberRefDTO | null;
  /** ISO 8601. */
  invitedAt: string;
  acceptedAt: string | null;
  endedAt: string | null;
}

/** One invitation as the invited member sees it, before they have answered. */
export interface ListingCoManagerInviteDTO {
  id: string;
  listingRef: string;
  listingSlug: string;
  listingName: string;
  invitedBy: MemberRefDTO | null;
  status: CoManagerStatus;
  /** ISO 8601. */
  invitedAt: string;
}

/**
 * How many people may hold a seat on one listing at once. Invited seats count
 * toward it, so a roster of two active co-managers and three outstanding
 * invitations is full. The API answers 409 past this; the editor says so
 * before anyone gets there.
 */
export const CO_MANAGER_SEAT_CAP = 5;

/** GET /listings/co-manager-invites: invitations waiting on the caller. */
export const getCoManagerInvites = () =>
  apiGet<ListingCoManagerInviteDTO[]>("/listings/co-manager-invites");

/** POST /listings/co-manager-invites/:id/accept */
export const acceptCoManagerInvite = (inviteId: string) =>
  apiPost<ListingCoManagerInviteDTO>(
    `/listings/co-manager-invites/${inviteId}/accept`,
    {},
  );

/** POST /listings/co-manager-invites/:id/decline */
export const declineCoManagerInvite = (inviteId: string) =>
  apiPost<ListingCoManagerInviteDTO>(
    `/listings/co-manager-invites/${inviteId}/decline`,
    {},
  );

/** GET /listings/:ref/co-managers: the roster. Owner or co-manager. */
export const getListingCoManagers = (listingRef: string) =>
  apiGet<ListingCoManagerDTO[]>(`/listings/${listingRef}/co-managers`);

/** POST /listings/:ref/co-managers: invite one member. Owner only. */
export const inviteListingCoManager = (
  listingRef: string,
  memberSlug: string,
) =>
  apiPost<ListingCoManagerDTO>(`/listings/${listingRef}/co-managers`, {
    memberSlug,
  });

/** DELETE /listings/:ref/co-managers/mine: step down from a listing yourself. */
export const leaveListingCoManagement = (listingRef: string) =>
  apiDelete<void>(`/listings/${listingRef}/co-managers/mine`);

/** DELETE /listings/:ref/co-managers/:memberSlug: owner only. */
export const removeListingCoManager = (
  listingRef: string,
  memberSlug: string,
) => apiDelete<void>(`/listings/${listingRef}/co-managers/${memberSlug}`);
