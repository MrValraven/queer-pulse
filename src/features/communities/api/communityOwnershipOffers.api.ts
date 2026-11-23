import {
  apiDelete,
  apiGet,
  apiGetNullable,
  apiPost,
} from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";

/**
 * PRD-514. Community ownership moves by offer: the owner offers it to a member
 * of the roster, and nothing changes until that member accepts. Mirrors the
 * backend's `CommunityOwnershipOfferDTO` (`community-ownership-offer-response.ts`).
 */
export type CommunityOwnershipOfferStatus =
  "offered" | "accepted" | "declined" | "cancelled" | "expired";

/**
 * One ownership offer, as both the owner's panel and the offered member's
 * inbox read it. `offeredBy` is null once the offering account is erased, and
 * either ref can be the inactive member's stand-in (`isInactiveMember`).
 */
export interface CommunityOwnershipOfferDTO {
  id: string;
  communitySlug: string;
  communityName: string;
  offeree: MemberRefDTO | null;
  offeredBy: MemberRefDTO | null;
  status: CommunityOwnershipOfferStatus;
  /** ISO 8601. */
  offeredAt: string;
  /** ISO 8601. An `offered` row past this reads as `expired`. */
  expiresAt: string;
  /** ISO 8601, or null while the offer is open. */
  respondedAt: string | null;
}

/** Every refusal code the offer routes send. The client maps each to its own
 *  copy line (`OWNERSHIP_OFFER_ERROR_KEYS` in `communityErrors.ts`). */
export const OWNERSHIP_OFFER_CODES = [
  "OWNERSHIP_OFFER_OPEN",
  "OWNERSHIP_OFFER_NOT_FOUND",
  "OWNERSHIP_OFFER_ANSWERED",
  "OWNERSHIP_OFFER_EXPIRED",
  "OWNERSHIP_OFFER_CANCELLED",
  "OWNERSHIP_OFFER_OWNER_CHANGED",
  "OWNERSHIP_OFFER_RECIPIENT_NOT_MEMBER",
  "OWNERSHIP_OFFER_SELF",
  "OWNERSHIP_OFFER_ALREADY_OWNER",
  "OWNERSHIP_OFFER_HOUSE_ACCOUNT",
  "OWNERSHIP_OFFER_MEMBER_NOT_FOUND",
] as const;

export type OwnershipOfferCode = (typeof OWNERSHIP_OFFER_CODES)[number];

/** `POST /communities/:slug/ownership-offer` (owner only). */
export const offerCommunityOwnership = (slug: string, memberSlug: string) =>
  apiPost<CommunityOwnershipOfferDTO>(
    `/communities/${encodeURIComponent(slug)}/ownership-offer`,
    { memberSlug },
  );

/** `GET /communities/:slug/ownership-offer` (owner only): the open offer, or
 *  null when the community has none (Nest sends that null as an empty body,
 *  which `apiGetNullable` reads back as null). */
export const getCommunityOwnershipOffer = (slug: string) =>
  apiGetNullable<CommunityOwnershipOfferDTO>(
    `/communities/${encodeURIComponent(slug)}/ownership-offer`,
  );

/** `DELETE /communities/:slug/ownership-offer` (owner only). The member it was
 *  offered to is not told. */
export const cancelCommunityOwnershipOffer = (slug: string) =>
  apiDelete<CommunityOwnershipOfferDTO>(
    `/communities/${encodeURIComponent(slug)}/ownership-offer`,
  );

/** `GET /me/community-ownership-offers`: the open offers addressed to the
 *  caller, newest first. */
export const getMyCommunityOwnershipOffers = () =>
  apiGet<CommunityOwnershipOfferDTO[]>("/me/community-ownership-offers");

/** `POST /me/community-ownership-offers/:offerId/accept|decline`. */
export const respondToCommunityOwnershipOffer = (
  offerId: string,
  answer: "accept" | "decline",
) =>
  apiPost<CommunityOwnershipOfferDTO>(
    `/me/community-ownership-offers/${encodeURIComponent(offerId)}/${answer}`,
  );
