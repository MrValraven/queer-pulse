import {
  normalizeHours,
  normalizeHoursExceptions,
  PHOTO_KEYS,
  type ListingDraft,
  type PhotoKey,
} from "./listBusiness.data";
import { normalizeAccessibilityDraft } from "./listingAccessibility.data";
import { toServiceRows } from "./listingServices.data";
import type { ManagedListingDTO } from "./api/listings.api";
import { ownerPersonalFieldsFrom } from "./ownerPersonalFields";
import { normalizeCategory } from "../localCategories";

/**
 * Convert a `ManagedListingDTO` into a clean `ListingDraft` for seeding the
 * edit wizard. Explicitly lists every draft field so the server-only extras
 * (ref/slug/status/submittedBy/createdAt) never ride along into the PATCH body
 * (the backend rejects unknown fields). Photos are coerced null to "".
 *
 * The owner's eight personal fields come through `ownerPersonalFieldsFrom`,
 * which reads them when the caller owns the listing and blanks them when they
 * only co-manage it (where they never arrived in the first place). The blanks
 * are inert: `managementRole` travels on the draft, and `draftToUpdateDto`
 * reads it and builds a body that never names those keys, so a blank cannot
 * reach the API as an empty string.
 */
export function dtoToDraft(dto: ManagedListingDTO): ListingDraft {
  const photos = Object.fromEntries(
    PHOTO_KEYS.map((photoKey) => [photoKey, dto.photos[photoKey] ?? ""]),
  ) as Record<PhotoKey, string>;

  return {
    path: dto.path,
    name: dto.name,
    // Canonicalize legacy display-string categories to slugs so the wizard chip
    // pre-selects, and a re-save writes the slug (fully healing the stored row).
    cats: dto.cats.map(normalizeCategory),
    hood: dto.hood,
    badge: dto.badge,
    evidence: dto.evidence,
    price: dto.price,
    blurb: dto.blurb,
    tagline: dto.tagline,
    whatItIs: dto.whatItIs,
    tags: dto.tags,
    goodFor: dto.goodFor,
    // Wire shape to editable shape: the note loses its null, and every service
    // row gains the client-only key that keeps React keys stable across a
    // reorder or a removal from the middle of the list.
    accessibility: normalizeAccessibilityDraft(dto.accessibility),
    services: toServiceRows(dto.services),
    langs: dto.langs,
    // Legacy rows predate the flag; treat a missing value as a physical listing.
    online: dto.online ?? false,
    address: dto.address,
    geocoded: dto.geocoded,
    latitude: dto.latitude,
    longitude: dto.longitude,
    // Heal legacy `{ open, from, to }` rows into the interval shape so a resumed
    // edit renders and re-saves in the new format.
    hours: normalizeHours(dto.hours),
    hoursNote: dto.hoursNote,
    // Heal each stored override the same way the weekly grid is healed, so a
    // legacy or partial row renders and re-saves in the shape the API accepts.
    hoursExceptions: normalizeHoursExceptions(dto.hoursExceptions),
    social: dto.social,
    photos,
    alt: dto.alt,
    // The role printed on the public listing belongs to the business, so it
    // arrives for a co-manager too and stays editable by them.
    ownerRole: dto.ownerRole,
    // The owner's own eight fields, or inert blanks when this member only
    // co-manages the listing and never received them.
    ...ownerPersonalFieldsFrom(dto),
    // The listing exists, so the baseline was agreed to when it was created.
    // Create-only: `draftToUpdateDto` never puts it in a PATCH.
    affirmingBaselineAccepted: true,
    // Read back out by the payload mapper, never sent.
    managementRole: dto.managementRole ?? "owner",
  };
}
