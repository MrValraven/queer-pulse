import { memberRefDisplayName } from "../../shared/api/refs";
import type { TFunction } from "../../shared/i18n/types";
import type { CommunityOwnershipOfferDTO } from "./api/communityOwnershipOffers.api";

/** The name the inbox gives whoever made an ownership offer: the inactive
 *  label for the stand-in, and "The owner" once their account is erased. */
export function offeringOwnerName(
  offer: CommunityOwnershipOfferDTO,
  t: TFunction,
): string {
  return (
    memberRefDisplayName(offer.offeredBy, t) ||
    t("communities:ownershipOffer.ownerFallback")
  );
}
