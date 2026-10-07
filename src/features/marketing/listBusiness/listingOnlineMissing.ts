import {
  isAdultCategoryPicked,
  listingCategoriesFor,
  normalizeCategory,
} from "../localCategories";
import {
  ANCHOR,
  type ListingDraft,
  type MissingField,
} from "./listBusiness.data";
import {
  canAcceptAdultTerms,
  isAdultCategoryOffered,
  isOnlineLinkValid,
  isSellingOnline,
  normalizeOnlineDetails,
  shouldAskRegistration,
  shouldAskSessionFormats,
} from "./listingOnline.data";
import { effectivePricingMode, shopItemsValid } from "./listingShop.data";

const KEY = "marketing:listBusiness.missing";

function field(name: string, anchor: string): MissingField {
  return { labelKey: `${KEY}.${name}`, anchor };
}

export interface OnlineMissingFields {
  step0: MissingField[];
  step1: MissingField[];
  step3: MissingField[];
}

/**
 * What the online fields still need, per wizard step. Kept apart from
 * `useListingFormMissing` so the hook stays one list of rules per step and
 * these stay testable without React.
 *
 * - Step 0: "Where do people find it?" on a brand-new draft.
 * - Step 1: a category the kind does not offer (a draft from before the
 *   online vocabulary, or `intimacy` on a create by someone who cannot accept
 *   the 18+ rules), the 18+ rules while `intimacy` is picked by someone who
 *   can, and a shop item with a problem while the shop is the priced list.
 * - Step 3: a main link on every listing that sells online, on both paths
 *   (spec); extra links with a platform and a valid link; a registration
 *   number once a body is picked; and, on a CLAIMED online-only listing, how
 *   people get it. Contract amendment 1: a session format answers that too,
 *   if the categories ask for one. A suggestion and a staff draft (always a
 *   suggestion) are exempt, exactly like the claim-path hours rule.
 */
export function onlineMissingFields(draft: ListingDraft): OnlineMissingFields {
  const step0: MissingField[] = [];
  const step1: MissingField[] = [];
  const step3: MissingField[] = [];

  if (draft.isWhereFoundAnswered === false) {
    step0.push(field("whereFound", ANCHOR.whereFound));
  }

  const offered = new Set(listingCategoriesFor(draft.online));
  const isAdultPicked = isAdultCategoryPicked(draft.cats);
  // Staff, and a member suggesting a business on a create, can never accept
  // the 18+ rules, so the category is not theirs to pick: the form offers it
  // only on an edit of a listing that already holds the stamp.
  const isAdultUnoffered = isAdultPicked && !isAdultCategoryOffered(draft);
  if (
    isAdultUnoffered ||
    draft.cats.some((category) => !offered.has(normalizeCategory(category)))
  ) {
    step1.push(field("catsOffered", ANCHOR.cats));
  }
  if (
    isAdultPicked &&
    draft.adultTermsAccepted !== true &&
    canAcceptAdultTerms(draft)
  ) {
    step1.push(field("adultTerms", ANCHOR.adultTerms));
  }
  if (
    effectivePricingMode(draft) === "shop" &&
    !shopItemsValid(draft.shopItems ?? [])
  ) {
    step1.push(field("shopItems", ANCHOR.services));
  }

  if (!isSellingOnline(draft)) return { step0, step1, step3 };

  const details = normalizeOnlineDetails(draft.onlineDetails);
  const mainLinkUrl = details.mainLink.url.trim();
  if (mainLinkUrl === "") step3.push(field("mainLink", ANCHOR.mainLink));
  else if (!isOnlineLinkValid(mainLinkUrl)) {
    step3.push(field("onlineLinkFormat", ANCHOR.mainLink));
  }
  const hasBrokenExtraLink = details.moreLinks.some((row) => {
    const isStarted = row.url.trim() !== "" || row.platform !== "";
    const isComplete = row.url.trim() !== "" && row.platform !== "";
    return isStarted && (!isComplete || !isOnlineLinkValid(row.url));
  });
  if (hasBrokenExtraLink) step3.push(field("moreLinks", ANCHOR.moreLinks));

  const isSessionAsked = shouldAskSessionFormats(draft.cats);
  const isAnswered =
    details.fulfilment.length > 0 ||
    (isSessionAsked && details.sessionFormats.length > 0);
  if (draft.online && draft.path === "claim" && !isAnswered) {
    step3.push(field("fulfilment", ANCHOR.fulfilment));
  }
  if (
    shouldAskRegistration(draft.cats) &&
    details.registration.body !== "" &&
    details.registration.number.trim() === ""
  ) {
    step3.push(field("registrationNumber", ANCHOR.registration));
  }
  return { step0, step1, step3 };
}
