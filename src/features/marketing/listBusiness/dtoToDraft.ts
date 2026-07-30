import type { ListingDraft, PhotoKey } from "./listBusiness.data";
import type { ListingDTO } from "./api/listings.api";
import { normalizeCategory } from "../localPlaces";

const PHOTO_KEYS: PhotoKey[] = ["wide", "d1", "d2", "vibe"];

/**
 * Convert an owner's `ListingDTO` into a clean `ListingDraft` for seeding the
 * edit wizard. Explicitly lists every draft field so the server-only extras
 * (ref/slug/status/submittedBy/createdAt) never ride along into the PATCH body
 * (the backend rejects unknown fields). Photos are coerced null → "".
 */
export function dtoToDraft(dto: ListingDTO): ListingDraft {
  const photos = Object.fromEntries(
    PHOTO_KEYS.map((photoKey) => [photoKey, dto.photos[photoKey] ?? ""]),
  ) as Record<PhotoKey, string>;

  return {
    path: dto.path,
    verify: dto.verify,
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
    langs: dto.langs,
    address: dto.address,
    geocoded: dto.geocoded,
    latitude: dto.latitude,
    longitude: dto.longitude,
    hours: dto.hours,
    hoursNote: dto.hoursNote,
    social: dto.social,
    photos,
    alt: dto.alt,
    rel: dto.rel,
    ownerName: dto.ownerName,
    ownerRole: dto.ownerRole,
    ownerBio: dto.ownerBio,
    visibility: dto.visibility,
    linkToProfile: dto.linkToProfile,
    contactEmail: dto.contactEmail,
    notify: dto.notify,
    consentOuting: dto.consentOuting,
    consentGuide: dto.consentGuide,
  };
}
