import { normalizeHours, type ListingDraft } from "./listBusiness.data";
import type { CreateListingDto } from "./api/listings.api";

/**
 * Build the create/patch payload from a wizard draft (item #12).
 *
 * Historically the whole `ListingDraft` was POSTed verbatim (`CreateListingDto =
 * ListingDraft`), which worked only because every draft field happened to be a
 * persisted one and UI-only state (blob previews) was deliberately kept in a
 * SEPARATE `photoPreviews` map. That's fragile: the day someone adds a
 * scratch/derived field to `ListingDraft`, it silently ships to the API. This
 * mapper makes the payload an explicit allow-list instead — the compiler still
 * checks the shape against `CreateListingDto`, but the object is built field by
 * field, so a new draft-only field is a no-op here until deliberately added.
 *
 * It also NORMALISES hours to the interval shape on the way out, so a resumed
 * legacy draft can never POST the old `{ open, from, to }` form.
 */
export function draftToDto(draft: ListingDraft): CreateListingDto {
  return {
    path: draft.path,
    verify: draft.verify,
    name: draft.name.trim(),
    cats: draft.cats,
    hood: draft.hood,
    badge: draft.badge,
    evidence: draft.evidence.trim(),
    price: draft.price,
    blurb: draft.blurb.trim(),
    tagline: draft.tagline.trim(),
    whatItIs: draft.whatItIs,
    tags: draft.tags,
    goodFor: draft.goodFor,
    langs: draft.langs,
    online: draft.online,
    // An online-only listing carries no location: never ship a stale address or
    // pin the member typed before switching the toggle on.
    address: draft.online ? "" : draft.address.trim(),
    geocoded: draft.online ? false : draft.geocoded,
    latitude: draft.online ? null : draft.latitude,
    longitude: draft.online ? null : draft.longitude,
    hours: normalizeHours(draft.hours),
    hoursNote: draft.hoursNote.trim(),
    social: draft.social,
    photos: draft.photos,
    alt: draft.alt,
    rel: draft.rel,
    ownerName: draft.ownerName.trim(),
    ownerRole: draft.ownerRole.trim(),
    ownerBio: draft.ownerBio.trim(),
    visibility: draft.visibility,
    linkToProfile: draft.linkToProfile,
    contactEmail: draft.contactEmail.trim(),
    notify: draft.notify,
    consentOuting: draft.consentOuting,
    consentGuide: draft.consentGuide,
  };
}
