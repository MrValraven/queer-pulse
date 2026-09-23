import {
  apiDelete,
  apiGet,
  apiGetNullable,
  apiPost,
} from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";
import type {
  CoManagerStatus,
  ListingCoManagerDTO,
} from "../../marketing/listBusiness/api/listingCoManagers.api";

export type { CoManagerStatus, ListingCoManagerDTO };

/**
 * DELEGATION: the admin-only view of who is going to run a listing's page.
 *
 * Every route here is `@StaffRoles()` + `@Roles(Admin)` on
 * `AdminListingsController`, so a `directory_moderator` grant holder gets a
 * 403 from all of them. `ListingPreviewDrawer` gates the whole section on
 * `isAdmin` for that reason.
 *
 * Three facts make up the view:
 *
 * 1. THE OWNER. Carried on the listing itself as `submittedBy`, which the
 *    backend maps from `listing.owner_id`, so the drawer passes it straight
 *    in and this module leaves it alone.
 * 2. THE OPEN OFFER. A listing carries at most one, enforced by a unique
 *    index. Offering to a second member means withdrawing the first, and an
 *    offer can only be extended on a listing that has no owner.
 * 3. THE CO-MANAGER SEATS. Invitations and accepted seats, live rows only.
 *
 * All three are read from the server on every open, so the panel describes
 * the listing as it stands right now for anybody looking at it. An offer made
 * in another session, accepted, declined, or withdrawn by another admin is
 * reflected as soon as the drawer opens or the query refetches.
 */

/** Where one ownership offer stands. Mirrors `ListingOwnerOfferStatus`. */
export type ListingOwnerOfferStatus =
  "offered" | "accepted" | "declined" | "revoked";

/**
 * One ownership offer, mirroring the backend's `ListingOwnerOfferDTO`.
 *
 * `offeree` and `offeredBy` are nullable for the reason every `MemberRef` on
 * this domain is: the account behind either may have been erased since, and
 * the offer row survives that.
 */
export interface ListingOwnerOfferDTO {
  id: string;
  listingRef: string;
  listingSlug: string;
  listingName: string;
  offeree: MemberRefDTO | null;
  offeredBy: MemberRefDTO | null;
  note: string | null;
  status: ListingOwnerOfferStatus;
  /** ISO 8601. */
  offeredAt: string;
  /** ISO 8601, or `null` while the offer is still open. */
  respondedAt: string | null;
}

/** The whole delegation picture for one listing, as the panel reads it. */
export interface AdminListingDelegationDTO {
  /** Live seats: accepted ones and unanswered invitations. Ended seats are
   *  excluded by the server. */
  coManagers: ListingCoManagerDTO[];
  /** The offer standing open on this listing, or `null` when it carries
   *  none. Server truth on every read. */
  openOffer: ListingOwnerOfferDTO | null;
}

/** `POST /admin/listings/:ref/owner-offer` body. */
export interface OfferListingOwnershipBody {
  /** The member being offered the listing, by public profile slug. */
  memberSlug: string;
  /** The admin's message to them. Member-facing, capped at 1000 characters. */
  note?: string;
}

/** `POST /admin/listings/:ref/co-managers` body. */
export interface InviteListingCoManagerBody {
  memberSlug: string;
}

/**
 * Read the whole delegation picture: `GET /admin/listings/:ref/owner-offer`
 * and `GET /admin/listings/:ref/co-managers`, issued together.
 *
 * The offer route answers 200 with `null` for the common case of a listing
 * carrying no open offer, and Nest sends an empty body for a `null` return, so
 * it goes through `apiGetNullable`. Its 404 is reserved for a `ref` that does
 * not exist, which surfaces as the panel's load error.
 */
export const getListingDelegation = async (
  listingRef: string,
): Promise<AdminListingDelegationDTO> => {
  const [openOffer, coManagers] = await Promise.all([
    apiGetNullable<ListingOwnerOfferDTO>(
      `/admin/listings/${listingRef}/owner-offer`,
    ),
    apiGet<ListingCoManagerDTO[]>(`/admin/listings/${listingRef}/co-managers`),
  ]);
  return { openOffer, coManagers };
};

/**
 * `POST /admin/listings/:ref/owner-offer`: nominate a member as owner of a
 * listing that has none. 409 when the listing already has an owner or already
 * carries an open offer; 404 when no active member answers to the slug.
 */
export const offerListingOwnership = (
  listingRef: string,
  body: OfferListingOwnershipBody,
) =>
  apiPost<ListingOwnerOfferDTO>(
    `/admin/listings/${listingRef}/owner-offer`,
    body,
  );

/**
 * `DELETE /admin/listings/:ref/owner-offer`: withdraw the open offer, which is
 * also the first half of re-offering the listing to somebody else. Resolves
 * with the withdrawn offer. 404 when no offer is open.
 */
export const revokeListingOwnershipOffer = (listingRef: string) =>
  apiDelete<ListingOwnerOfferDTO>(`/admin/listings/${listingRef}/owner-offer`);

/**
 * `POST /admin/listings/:ref/co-managers`: seat a member. The seat starts
 * `invited` and grants nothing until the member accepts. A seat opened while
 * the listing is unowned is stamped staff-attached server-side and survives
 * the handover to a new owner; one opened on an already-owned listing leaves
 * with that owner.
 */
export const inviteListingCoManager = (
  listingRef: string,
  body: InviteListingCoManagerBody,
) =>
  apiPost<ListingCoManagerDTO>(
    `/admin/listings/${listingRef}/co-managers`,
    body,
  );

/**
 * `DELETE /admin/listings/:ref/co-managers/:memberSlug`: take a seat back,
 * accepted or still unanswered. 204, so nothing comes back.
 */
export const revokeListingCoManager = (
  listingRef: string,
  memberSlug: string,
) => apiDelete<void>(`/admin/listings/${listingRef}/co-managers/${memberSlug}`);

/** A 409 from either write path: the seat or the offer moved on. */
export const isDelegationConflictError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as { status?: number }).status === 409;

/** A 404 from either write path: usually an unrecognised member slug. */
export const isDelegationNotFoundError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as { status?: number }).status === 404;
