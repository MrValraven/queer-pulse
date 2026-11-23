import type { MemberRefDTO } from "../../shared/api/refs";
import type { CommunityOwnershipOfferDTO } from "./api/communityOwnershipOffers.api";

/** How long an offer stays open, matching the backend's 14-day TTL. */
export const OWNERSHIP_OFFER_TTL_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

/** The demo member who offers the demo viewer a community. */
const DEMO_OFFERING_OWNER: MemberRefDTO = {
  slug: "monica",
  firstName: "Mónica",
  lastName: "Resende",
  avatarUrl: null,
};

/**
 * The demo inbox: one open offer, sent five days ago, so the accept and
 * decline answers and the account-menu badge can all be seen without a
 * backend. Built per call so the dates stay relative to today.
 */
export function demoIncomingOwnershipOffers(
  now: Date = new Date(),
): CommunityOwnershipOfferDTO[] {
  const offeredAt = new Date(now.getTime() - 5 * DAY_MS);
  return [
    {
      id: "demo-ownership-offer-queer-runners",
      communitySlug: "queer-runners",
      communityName: "Queer Runners Lisboa",
      offeree: null,
      offeredBy: DEMO_OFFERING_OWNER,
      status: "offered",
      offeredAt: offeredAt.toISOString(),
      expiresAt: new Date(
        offeredAt.getTime() + OWNERSHIP_OFFER_TTL_DAYS * DAY_MS,
      ).toISOString(),
      respondedAt: null,
    },
  ];
}

/**
 * The open offer a demo owner just sent, shaped like the server's answer so
 * the panel renders the same pending line it does live.
 */
export function demoSentOwnershipOffer(
  communitySlug: string,
  offeree: MemberRefDTO,
  now: Date = new Date(),
): CommunityOwnershipOfferDTO {
  return {
    id: `demo-ownership-offer-${communitySlug}`,
    communitySlug,
    communityName: "",
    offeree,
    offeredBy: null,
    status: "offered",
    offeredAt: now.toISOString(),
    expiresAt: new Date(
      now.getTime() + OWNERSHIP_OFFER_TTL_DAYS * DAY_MS,
    ).toISOString(),
    respondedAt: null,
  };
}
