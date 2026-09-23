import { apiGet, apiPost } from "../../../../shared/api/client";
import type { MemberRefDTO } from "../../../../shared/api/refs";

/**
 * Owner offers: a listing an admin wrote and put in a member's name, waiting
 * on that member to say yes.
 *
 * An admin-authored listing has no owner while the offer is open. Ownership is
 * written only when the person named accepts, so nobody's name reaches a
 * public listing without them agreeing to it first.
 *
 * All three routes are member-gated and scoped to the caller. The list answers
 * with the caller's open offers only; the server filters answered, revoked and
 * declined rows out, so nothing here needs a second pass over `status`.
 */

/** How far along one offer is. Only `offered` is ever listed to a member. */
export type ListingOwnerOfferStatus =
  "offered" | "accepted" | "declined" | "revoked";

/**
 * One offer as the member it names sees it.
 *
 * `listingRef` is the ownership key every listing mutation takes and the
 * segment the editor route is built from; `listingSlug` is what the public
 * detail page answers to. Both are denormalized onto the row so the inbox
 * needs no second lookup.
 *
 * `offeredBy` is null once the offering admin's account has been erased. The
 * offer survives that, so the row copy has a form that names nobody.
 */
export interface ListingOwnerOfferDTO {
  id: string;
  listingRef: string;
  listingSlug: string;
  listingName: string;
  offeree: MemberRefDTO | null;
  offeredBy: MemberRefDTO | null;
  /** A line the admin wrote to the member, or null. */
  note: string | null;
  status: ListingOwnerOfferStatus;
  /** ISO 8601. */
  offeredAt: string;
  /** ISO 8601, or null while the offer is still open. */
  respondedAt: string | null;
}

/** GET /listings/owner-offers: the open offers waiting on the caller. */
export const getOwnerOffers = () =>
  apiGet<ListingOwnerOfferDTO[]>("/listings/owner-offers");

/**
 * POST /listings/owner-offers/:id/accept
 *
 * The body is required and the server rejects any other value. An
 * admin-authored listing carries no affirming-baseline acceptance until this
 * lands, and the stamp it writes names the person accepting, so this flag may
 * only be sent once that person has read the pledge and agreed to it. The UI
 * that calls this asks first.
 */
export const acceptOwnerOffer = (offerId: string) =>
  apiPost<ListingOwnerOfferDTO>(`/listings/owner-offers/${offerId}/accept`, {
    affirmingBaselineAccepted: true,
  });

/**
 * POST /listings/owner-offers/:id/decline
 *
 * Carries no fields, because there is nothing to agree to. Declining is always
 * allowed, including once the listing has been claimed by somebody else, so a
 * member can always clear a dead offer off their list.
 */
export const declineOwnerOffer = (offerId: string) =>
  apiPost<ListingOwnerOfferDTO>(
    `/listings/owner-offers/${offerId}/decline`,
    {},
  );
