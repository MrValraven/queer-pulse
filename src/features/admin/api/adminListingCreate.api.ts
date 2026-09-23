import { apiPost } from "../../../shared/api/client";
import { businessPayload } from "../../marketing/listBusiness/draftToDto";
import {
  OWNER_PERSONAL_FIELDS,
  type ListingDraft,
} from "../../marketing/listBusiness/listBusiness.data";
import type {
  CreateListingDto,
  ListingDTO,
} from "../../marketing/listBusiness/api/listings.api";

/** Publish straight away, or send the listing to the moderation queue. */
export type ListingPublishState = "review" | "live";

/** The nomination an admin can make in the same form as the create. */
export interface AdminListingOwnerOfferInput {
  /** The member being offered the listing, by public profile slug. */
  memberSlug: string;
  /** The admin's member-facing message. */
  note?: string;
}

/**
 * The admin create body, mirroring `AdminCreateListingDto` on the server.
 *
 * NINE keys are absent by construction, the same nine the server drops with
 * `OmitType`: `affirmingBaselineAccepted`, `ownerName`, `ownerRole`,
 * `ownerBio`, `visibility`, `linkToProfile`, `contactEmail`, `consentOuting`
 * and `consentGuide`. Each belongs to whoever ends up holding the listing, and
 * an admin cannot answer any of them on a business's behalf.
 *
 * Omission is the enforcement. The global ValidationPipe runs `whitelist:
 * true` with `forbidNonWhitelisted: true`, so a body carrying one of the nine
 * is answered 400. A staff-authored draft still CARRIES all nine (the wizard
 * suppresses the inputs without changing the draft shape, and `blankDraft()`
 * fills `visibility` and `linkToProfile` regardless), which is why the body is
 * built by the allow-list in `adminDraftToDto` below and then run through a
 * named-key delete. A spread would carry every one of them.
 *
 * TWO more are omitted here that the server would accept, because the console
 * has nothing truthful to put in either:
 * - `rel` is the submitter's own connection to the place ("I run it", "I go
 *   there all the time"). Staff authoring for a business that has not joined
 *   yet stand in none of those.
 * - `isStaffAuthored` is draft-only state the payload mappers read on the way
 *   out. `UpdateListingDto` inherits it from `ListingDraft`, so naming it here
 *   keeps an unknown key out of the body.
 */
export type AdminCreateListingDto = Omit<
  CreateListingDto,
  | "affirmingBaselineAccepted"
  | "ownerName"
  | "ownerRole"
  | "ownerBio"
  | "visibility"
  | "linkToProfile"
  | "contactEmail"
  | "consentOuting"
  | "consentGuide"
  | "rel"
  | "isStaffAuthored"
> & {
  publishState: ListingPublishState;
  ownerOffer?: AdminListingOwnerOfferInput;
};

/** What the console adds to the wizard's own fields. */
export interface AdminListingCreateExtras {
  publishState: ListingPublishState;
  /** Left out when the admin named nobody. */
  ownerOffer?: AdminListingOwnerOfferInput;
}

/** The business half of the body: everything except what the console adds. */
type AdminListingBusinessPayload = Omit<
  AdminCreateListingDto,
  "publishState" | "ownerOffer"
>;

/**
 * Every key this body may not carry, named so it can be deleted by name.
 *
 * The eight owner-personal ones come from the canonical list, so this stays in
 * step with it. Three more are named here: `affirmingBaselineAccepted`, which
 * `draftToDto` adds on the member create; `ownerRole`, which belongs to the
 * business (hence its absence from `OWNER_PERSONAL_FIELDS`) while the server's
 * admin DTO still omits it; and `isStaffAuthored`, draft-only state that
 * `UpdateListingDto` inherits from `ListingDraft`.
 */
const ADMIN_CREATE_EXCLUDED_KEYS: readonly string[] = [
  ...OWNER_PERSONAL_FIELDS,
  "affirmingBaselineAccepted",
  "ownerRole",
  "isStaffAuthored",
];

/**
 * Delete every excluded key from an outgoing admin create body, by name.
 *
 * `businessPayload` is built by an allow-list that names only one of them
 * (`ownerRole`), so in a correct build this removes a single key. It runs
 * anyway because the cost of being wrong is the whole create being refused
 * with a 400, and because the type system will NOT catch the regression:
 * TypeScript applies no excess-property check to spread properties, so
 * swapping this call for a bare `...businessPayload(draft)` would compile
 * cleanly and fail at runtime. This is the same guarantee, for the same
 * reason, as `stripOwnerPersonalFields` on the member side.
 */
function stripAdminExcludedKeys(payload: object): AdminListingBusinessPayload {
  const guarded = { ...payload } as Record<string, unknown>;
  for (const field of ADMIN_CREATE_EXCLUDED_KEYS) delete guarded[field];
  return guarded as AdminListingBusinessPayload;
}

/**
 * Build the admin POST body from a finished wizard draft.
 *
 * The business half comes straight from `businessPayload`, the shared
 * derivation the member create and the co-manager save already use, so hours
 * normalisation, the online-only address blanking and the service-row cleanup
 * all behave identically here. `ownerRole` is the one key that half carries
 * which this body may not: it is printed on the public listing, so it belongs
 * to the business, while the server's admin DTO omits it and answers 400.
 */
export function adminDraftToDto(
  draft: ListingDraft,
  { publishState, ownerOffer }: AdminListingCreateExtras,
): AdminCreateListingDto {
  return {
    ...stripAdminExcludedKeys(businessPayload(draft)),
    publishState,
    ...(ownerOffer ? { ownerOffer } : {}),
  };
}

/**
 * `POST /admin/listings`. Admin only on the server (`@StaffRoles()` with
 * `@Roles(Admin)`), so a `directory_moderator` grant holder is answered 403
 * even though the rest of the controller admits them.
 *
 * The nomination in `ownerOffer` is best-effort after the insert, so a
 * created listing whose offer failed still resolves here.
 */
export function adminCreateListing(
  body: AdminCreateListingDto,
): Promise<ListingDTO> {
  return apiPost<ListingDTO>("/admin/listings", body);
}
