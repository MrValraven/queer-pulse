import {
  OWNER_PERSONAL_FIELDS,
  type ListingDraft,
  type ManagementRole,
  type OwnerPersonalField,
} from "./listBusiness.data";
import type { ManagedListingDTO } from "./api/listings.api";

/**
 * The one place the client handles the owner's eight personal fields.
 *
 * The API leaves those keys OUT of a co-manager's response entirely and
 * answers 403 to a PATCH that carries any of them, so a co-manager's save has
 * to be built without them or their whole edit fails. Three helpers cover
 * every direction that matters:
 *
 * - `ownerPersonalFieldsFrom` reads them off a listing, blanking them when the
 *   listing came back co-managed, so a draft is always complete enough for the
 *   form to render.
 * - `stripOwnerPersonalFields` is the last gate before a request leaves: it
 *   deletes the keys by name, so even a future spread cannot smuggle one back.
 * - `isCoManaged` is the single predicate the UI branches on.
 */
export type OwnerPersonalDraftFields = Pick<ListingDraft, OwnerPersonalField>;

/**
 * What a co-manager's draft holds in place of the owner's details: neutral,
 * inert values that render an empty form field and mean nothing.
 *
 * `linkToProfile` is false and `visibility` is "public" only because the
 * types demand a value. Neither is ever shown to a co-manager and neither is
 * ever sent, so neither can overwrite what the owner chose.
 */
export const BLANK_OWNER_PERSONAL_FIELDS: OwnerPersonalDraftFields = {
  rel: "",
  ownerName: "",
  ownerBio: "",
  visibility: "public",
  linkToProfile: false,
  contactEmail: "",
  consentOuting: false,
  consentGuide: false,
};

/** True when the signed-in member is helping run somebody else's listing. */
export function isCoManaged(subject: {
  managementRole?: ManagementRole;
}): boolean {
  return subject.managementRole === "co_manager";
}

/**
 * The owner's eight fields as a draft carries them. Narrowing on
 * `managementRole` is what lets this read them at all: on the co-managed arm
 * of `ManagedListingDTO` those keys do not exist, so the compiler would refuse.
 */
export function ownerPersonalFieldsFrom(
  listing: ManagedListingDTO,
): OwnerPersonalDraftFields {
  if (listing.managementRole === "co_manager") {
    return { ...BLANK_OWNER_PERSONAL_FIELDS };
  }
  return {
    rel: listing.rel,
    ownerName: listing.ownerName,
    ownerBio: listing.ownerBio,
    visibility: listing.visibility,
    linkToProfile: listing.linkToProfile,
    contactEmail: listing.contactEmail,
    consentOuting: listing.consentOuting,
    consentGuide: listing.consentGuide,
  };
}

/**
 * Delete every owner-personal key from an outgoing payload, by name.
 *
 * The co-manager payload is already built by an allow-list that never mentions
 * these keys, so in a correct build this removes nothing. It runs anyway
 * because the cost of being wrong is the member's entire save being refused:
 * this is the guarantee that holds even if somebody later spreads a whole
 * draft into the body.
 */
export function stripOwnerPersonalFields<Payload extends object>(
  payload: Payload,
): Payload {
  const guarded = { ...payload } as Record<string, unknown>;
  for (const field of OWNER_PERSONAL_FIELDS) delete guarded[field];
  return guarded as Payload;
}
