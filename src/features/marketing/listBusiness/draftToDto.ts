import {
  hoursForPayload,
  normalizeHoursExceptions,
  type ListingDraft,
  type OwnerPersonalField,
} from "./listBusiness.data";
import { normalizeAccessibilityDraft } from "./listingAccessibility.data";
import { servicesForPayload } from "./listingServices.data";
import { stripOwnerPersonalFields } from "./ownerPersonalFields";
import type {
  CoManagerUpdateListingDto,
  CreateListingDto,
  UpdateListingDto,
} from "./api/listings.api";

/**
 * Build the create/patch payload from a wizard draft (item #12).
 *
 * Historically the whole `ListingDraft` was POSTed verbatim (`CreateListingDto =
 * ListingDraft`), which worked only because every draft field happened to be a
 * persisted one and UI-only state (blob previews) was deliberately kept in a
 * SEPARATE `photoPreviews` map. That's fragile: the day someone adds a
 * scratch/derived field to `ListingDraft`, it silently ships to the API. This
 * mapper makes the payload an explicit allow-list instead. The compiler still
 * checks the shape against `CreateListingDto`, but the object is built field by
 * field, so a new draft-only field is a no-op here until deliberately added.
 *
 * It also NORMALISES hours to the interval shape on the way out, so a resumed
 * legacy draft can never POST the old `{ open, from, to }` form, and empties a
 * closed day's intervals (`hoursForPayload`), which the API requires and the
 * editor's own state deliberately does not. Services get the same treatment:
 * blank rows are dropped and the client-only React key is stripped.
 */

/**
 * Everything about the BUSINESS: the payload a co-manager is allowed to send,
 * and the bulk of the owner's.
 *
 * Its return type is `CoManagerUpdateListingDto`, which is `UpdateListingDto`
 * with the eight owner-personal keys removed. Because this returns an object
 * literal, TypeScript's excess-property check makes adding one of those keys
 * back here a compile error, so the co-manager's body cannot silently regain a
 * field the API answers 403 to.
 */
function businessPayload(draft: ListingDraft): CoManagerUpdateListingDto {
  const accessibility = normalizeAccessibilityDraft(draft.accessibility);
  return {
    path: draft.path,
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
    accessibility: {
      answers: accessibility.answers,
      note: accessibility.note.trim(),
    },
    services: servicesForPayload(draft.services ?? []),
    langs: draft.langs,
    online: draft.online,
    // An online-only listing carries no location: never ship a stale address or
    // pin the member typed before switching the toggle on.
    address: draft.online ? "" : draft.address.trim(),
    geocoded: draft.online ? false : draft.geocoded,
    latitude: draft.online ? null : draft.latitude,
    longitude: draft.online ? null : draft.longitude,
    hours: hoursForPayload(draft.hours),
    hoursNote: draft.hoursNote.trim(),
    hoursExceptions: normalizeHoursExceptions(draft.hoursExceptions),
    social: draft.social,
    photos: draft.photos,
    alt: draft.alt,
    // The role shown on the public listing describes the business, so it
    // belongs here alongside the rest of the business fields.
    ownerRole: draft.ownerRole.trim(),
  };
}

/** The owner's own eight fields. Only ever spread into an OWNER's payload. */
function ownerPersonalPayload(
  draft: ListingDraft,
): Pick<UpdateListingDto, OwnerPersonalField> {
  return {
    rel: draft.rel,
    ownerName: draft.ownerName.trim(),
    ownerBio: draft.ownerBio.trim(),
    visibility: draft.visibility,
    linkToProfile: draft.linkToProfile,
    contactEmail: draft.contactEmail.trim(),
    consentOuting: draft.consentOuting,
    consentGuide: draft.consentGuide,
  };
}

function listingPayload(draft: ListingDraft): UpdateListingDto {
  return { ...businessPayload(draft), ...ownerPersonalPayload(draft) };
}

/**
 * The POST body. Adds the one create-only field: the submitter's agreement to
 * the affirming baseline, which is the condition of appearing in the directory
 * at all. Creating is always the owner's own act, so it always carries the
 * full payload.
 */
export function draftToDto(draft: ListingDraft): CreateListingDto {
  return {
    ...listingPayload(draft),
    affirmingBaselineAccepted: draft.affirmingBaselineAccepted,
  };
}

/**
 * The PATCH body: the same payload WITHOUT the baseline agreement.
 *
 * There is no edit that un-agrees to a baseline the listing only exists
 * because of, so the API omits the field from its update DTO entirely and its
 * strict whitelist rejects a PATCH that carries it. Leaving it out here is
 * what keeps an ordinary save from being refused.
 *
 * A CO-MANAGER's save gets `businessPayload` alone, run through
 * `stripOwnerPersonalFields` on the way out. The allow-list is what makes the
 * body correct; the strip is what makes it guaranteed, including against a
 * future edit that spreads a whole draft in here. One of those eight keys in
 * the body 403s the whole save.
 */
export function draftToUpdateDto(
  draft: ListingDraft,
): UpdateListingDto | CoManagerUpdateListingDto {
  if (draft.managementRole === "co_manager") {
    return stripOwnerPersonalFields(businessPayload(draft));
  }
  return listingPayload(draft);
}
