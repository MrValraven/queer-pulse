import { routes } from "../../app/routeMap";
import { ADULT_LISTING_CATEGORY_SLUG } from "../marketing/localCategories";
import { blankDraft } from "../marketing/listBusiness/listingFormDraft";
import { healRetiredOnlineTags } from "../marketing/listBusiness/listingRetiredTags";
import {
  OWNER_PERSONAL_FIELDS,
  type ListingDraft,
} from "../marketing/listBusiness/listBusiness.data";
import { BLANK_OWNER_PERSONAL_FIELDS } from "../marketing/listBusiness/ownerPersonalFields";
import { healListingDraft } from "../marketing/listBusiness/editor/restoreDiff/healListingDraft";

/** The `/admin/listings/new` query parameter that opens the form on a
 *  member's unfinished draft (`ListingDraftRows`' "Finish as a team listing"). */
export const FROM_DRAFT_PARAM = "fromDraft";

/** Where "Finish as a team listing" goes for one draft. */
export function teamListingFromDraftPath(draftId: string): string {
  return `${routes.adminListingNew}?${FROM_DRAFT_PARAM}=${encodeURIComponent(draftId)}`;
}

/**
 * The wizard opens on the one path that describes what staff are doing here.
 *
 * Seeding it is load-bearing twice over. `useListingFormMissing` blocks step 0
 * while `draft.path` is empty and `blankDraft()` leaves it so, and clicking
 * the card to fill it runs `pickPath`, which writes a `rel` the admin create
 * body has no room for. Seeding means that handler never runs. "suggest" is
 * also the truthful value: "claim" means "this is my business", which an
 * admin never is.
 */
export function staffAuthoredDraft(): ListingDraft {
  return { ...blankDraft(), isStaffAuthored: true, path: "suggest" };
}

/**
 * Every key of a member's draft that is the member's own answer rather than a
 * fact about the business, so it never crosses into a team listing.
 *
 * The eight owner-personal fields, plus five the list does not cover:
 * - `ownerRole`, which the admin create body omits;
 * - `affirmingBaselineAccepted`, the pledge, which only the person who will
 *   hold the listing can take;
 * - `adultTermsAccepted`, the member's own acknowledgement of the 18+ rules,
 *   which staff give for themselves;
 * - `badge` and `evidence`: a queer-owned claim says the owner is queer, an
 *   outing risk exactly like `ownedBy`, and the member never confirmed it.
 *   The admin can still pick a badge on purpose, as on any team listing.
 * And the draft-only state a team draft sets for itself: `path`,
 * `managementRole` and `isStaffAuthored`.
 */
export const MEMBER_ONLY_DRAFT_KEYS: readonly (keyof ListingDraft)[] = [
  ...OWNER_PERSONAL_FIELDS,
  "ownerRole",
  "affirmingBaselineAccepted",
  "adultTermsAccepted",
  "badge",
  "evidence",
  "path",
  "managementRole",
  "isStaffAuthored",
];

/**
 * A member's unfinished draft, turned into the starting point of a team
 * listing: the business details they wrote, none of their own answers.
 *
 * The server already leaves the member-only keys out of the payload; they are
 * deleted here again by name so a server that sent one could still not get it
 * onto a listing. What is left is laid over a staff-authored blank and healed,
 * so a payload from an older wizard (a missing field, a mangled slot, a tag
 * that is now an online field) opens as a complete draft: every step renders
 * and the create goes through.
 */
export function teamDraftFromMemberDraft(
  payload: Partial<ListingDraft>,
): ListingDraft {
  const businessHalf = { ...payload } as Record<string, unknown>;
  for (const key of MEMBER_ONLY_DRAFT_KEYS) delete businessHalf[key];
  return withoutAdultCategory(
    healRetiredOnlineTags(
      healListingDraft({
        ...staffAuthoredDraft(),
        ...(businessHalf as Partial<ListingDraft>),
        ...BLANK_OWNER_PERSONAL_FIELDS,
        ownerRole: "",
        affirmingBaselineAccepted: false,
        adultTermsAccepted: false,
        badge: "",
        evidence: "",
        isStaffAuthored: true,
        path: "suggest",
        // The blank above starts unanswered. A member draft from before "Where do
        // people find it?" has no key, and its `online` flag already answers it.
        isWhereFoundAnswered: payload.isWhereFoundAnswered ?? true,
      }),
    ),
  );
}

/**
 * The 18+ category leaves a team draft, under either kind. Staff can never
 * accept the 18+ rules for a business, so a team create is never offered it,
 * and a category the form does not offer would only hold the save back.
 */
function withoutAdultCategory(draft: ListingDraft): ListingDraft {
  const isOffered = (category: string) =>
    category !== ADULT_LISTING_CATEGORY_SLUG;
  return {
    ...draft,
    cats: draft.cats.filter(isOffered),
    ...(draft.inactiveModeCats
      ? { inactiveModeCats: draft.inactiveModeCats.filter(isOffered) }
      : {}),
  };
}
