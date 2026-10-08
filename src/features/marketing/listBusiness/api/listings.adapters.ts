import type { PendingListing, PhotoKey } from "../listBusiness.data";
import { normalizeAccessibilityDraft } from "../listingAccessibility.data";
import { pricingModeOf, toMenuDraft } from "../listingMenu.data";
import { hasMeetingPoint, normalizeMobileDetails } from "../listingMobile.data";
import { normalizeOnlineDetails } from "../listingOnline.data";
import { toServiceRows } from "../listingServices.data";
import { toShopItemRows } from "../listingShop.data";
import { ownerPersonalFieldsFrom } from "../ownerPersonalFields";
import type { ManagedListingDTO } from "./listings.api";

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
export function listingDtoToPending(dto: ManagedListingDTO): PendingListing {
  return {
    ...dto,
    // What the reader is to this listing, and (for a co-manager) inert blanks
    // in place of the owner's eight personal fields, which never arrived.
    // `PendingListing` declares them all, and the card/preview adapters read
    // them, so they have to be present even when they mean nothing.
    ...ownerPersonalFieldsFrom(dto),
    managementRole: dto.managementRole ?? "owner",
    ref: dto.ref,
    slug: dto.slug,
    status: dto.status,
    submittedBy: dto.submittedBy?.slug ?? "",
    photos: Object.fromEntries(
      PHOTO_KEYS.map((photoKey) => [photoKey, dto.photos[photoKey] ?? ""]),
    ) as Record<PhotoKey, string>,
    // Both structured blocks arrive in their WIRE shape and are adopted into
    // the editable one: the note loses its null and each service row gains the
    // client-only key its React list needs.
    accessibility: normalizeAccessibilityDraft(dto.accessibility),
    services: toServiceRows(dto.services),
    pricingMode: pricingModeOf({
      pricingMode: dto.pricingMode,
      cats: dto.cats,
      online: dto.online ?? false,
    }),
    menu: toMenuDraft(dto.menu),
    // The online block, the shop and "Based in" arrive in their wire shapes
    // through the spread above; these replace them with the editable ones.
    // A place's stored city never seeds "Based in".
    city: dto.online ? (dto.city ?? "") : "",
    hasOnlineShop: dto.hasOnlineShop ?? false,
    onlineDetails: normalizeOnlineDetails(dto.onlineDetails),
    shopItems: toShopItemRows(dto.shopItems),
    // Stamped by the server once accepted, and never asked again.
    adultTermsAccepted: Boolean(dto.onlineDetails?.adultTermsAcceptedAt),
    // Out and about. The meeting point box reads as ticked exactly when the
    // listing stores both coordinates: a mobile listing without one stores
    // them blank (contract).
    mobile: dto.mobile === true && dto.online !== true,
    mobileDetails: normalizeMobileDetails(dto.mobileDetails),
    hasMeetingPoint: hasMeetingPoint(dto),
    // The listing exists, so its submitter agreed. Nothing can un-agree.
    affirmingBaselineAccepted: true,
  };
}
