import { listingCategoriesFor, normalizeCategory } from "../localCategories";
import type { ListingDraft } from "./listBusiness.data";
import { applyCategoryPricingDefault } from "./listingMenu.data";
import { isBlankShopItem } from "./listingShop.data";

/**
 * Switch a draft between a place and an online-only listing.
 *
 * Nothing typed for the other kind is lost. The address, pin, neighbourhood
 * and hours stay in the draft as they always have, and the categories picked
 * under the kind being left move to `inactiveModeCats`, so switching back
 * brings them back. The new kind's categories come from that stash when it
 * holds any, else from the current picks the new kind also offers (`food` is
 * in both, so it carries across even after an empty stash). `cats` therefore
 * always holds the ACTIVE kind's categories, and `draftToDto` sends only the
 * active kind's fields.
 *
 * Leaving online for a place keeps the selling block: when the draft holds a
 * main link or a started shop item, "We also sell online" is ticked, so a
 * save keeps the online answers. The owner can untick it on purpose.
 */
export function withListingKind(
  draft: ListingDraft,
  isOnline: boolean,
): ListingDraft {
  if (draft.online === isOnline) return draft;
  const offered = new Set(listingCategoriesFor(isOnline));
  const isOffered = (category: string) =>
    offered.has(normalizeCategory(category));
  const stashed = draft.inactiveModeCats?.length
    ? draft.inactiveModeCats
    : draft.cats;
  const restored = stashed.filter(isOffered).slice(0, 2);
  const shouldKeepSellingOnline = !isOnline && hasOnlineSellingContent(draft);
  return applyCategoryPricingDefault(draft, {
    ...draft,
    online: isOnline,
    cats: restored,
    inactiveModeCats: draft.cats,
    ...(shouldKeepSellingOnline ? { hasOnlineShop: true } : {}),
  });
}

/** A main link or any started shop item: what an online listing would lose
 *  if it became a place that sells nothing online. */
function hasOnlineSellingContent(draft: ListingDraft): boolean {
  const hasMainLink = (draft.onlineDetails?.mainLink.url.trim() ?? "") !== "";
  const hasShopItem = (draft.shopItems ?? []).some(
    (item) => !isBlankShopItem(item),
  );
  return hasMainLink || hasShopItem;
}

/** The Path step's "Where do people find it?" answer. */
export type WhereFoundChoice = "place" | "online";

/** Each answer's title, as the review step's recap names it. */
export const WHERE_FOUND_TITLE_KEYS: Record<WhereFoundChoice, string> = {
  place: "marketing:listBusiness.step0.whereFound.place.title",
  online: "marketing:listBusiness.step0.whereFound.online.title",
};

/** `""` only for a brand-new draft; a draft from before the question (no
 *  key at all) reads as answered by its `online` flag. */
export function whereFoundChoiceOf(draft: ListingDraft): WhereFoundChoice | "" {
  if (draft.isWhereFoundAnswered === false) return "";
  return draft.online ? "online" : "place";
}

export function withWhereFoundChoice(
  draft: ListingDraft,
  choice: WhereFoundChoice,
): ListingDraft {
  return {
    ...withListingKind(draft, choice === "online"),
    isWhereFoundAnswered: true,
  };
}
