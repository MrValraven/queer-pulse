import type { PendingListing, PhotoKey } from "../listBusiness.data";
import type { ListingDTO } from "./listings.api";

const PHOTO_KEYS: PhotoKey[] = ["wide", "d1", "d2", "vibe"];

/**
 * Map a backend ListingDTO onto the PendingListing view-model the profile /
 * review surfaces render. The DTO already carries every ListingDraft field
 * (it extends CreateListingDto = ListingDraft), so we spread those through and
 * flatten `submittedBy` from a MemberRef down to the member's slug string.
 *
 * `photos` needs its own pass: the DTO's `photos` is `Record<PhotoKey, string
 * | null>` (the backend's `toImageUrl` maps an absent image to `null`), but
 * `PendingListing`/`ListingDraft` declare `photos: Record<PhotoKey, string>`
 * to match what the wizard always writes locally (`''` for an unset slot).
 * Coercing `null` back to `''` here keeps that single non-null contract
 * everywhere `PendingListing.photos` is read, exactly like the wizard's own
 * "empty means absent" convention.
 */
export function listingDtoToPending(dto: ListingDTO): PendingListing {
  return {
    ...dto,
    ref: dto.ref,
    slug: dto.slug,
    status: dto.status,
    submittedBy: dto.submittedBy.slug,
    photos: Object.fromEntries(
      PHOTO_KEYS.map((photoKey) => [photoKey, dto.photos[photoKey] ?? ""]),
    ) as Record<PhotoKey, string>,
  };
}
