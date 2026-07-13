import type { PendingListing } from "../listBusiness.data";
import type { ListingDTO } from "./listings.api";

/**
 * Map a backend ListingDTO onto the PendingListing view-model the profile /
 * review surfaces render. The DTO already carries every ListingDraft field
 * (it extends CreateListingDto = ListingDraft), so we spread those through and
 * flatten `submittedBy` from a MemberRef down to the member's slug string.
 */
export function listingDtoToPending(dto: ListingDTO): PendingListing {
  return {
    ...dto,
    ref: dto.ref,
    slug: dto.slug,
    status: dto.status,
    submittedBy: dto.submittedBy.slug,
  };
}
