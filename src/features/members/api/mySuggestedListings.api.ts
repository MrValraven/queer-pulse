import { apiGet } from "../../../shared/api/client";
import { toItemsPage, type ItemsPage } from "../../../shared/api/pagination";

/**
 * PRD-434. Where a suggested place stands, in the suggester's words: waiting
 * for a moderator, sent back with a question, or published. `with_business`
 * is a place another business has claimed and that is not public: its review
 * state belongs to that business, so the suggester learns only who has it. A
 * suggestion a moderator declined has no row: the listing is deleted and the
 * member hears through the `listing_suggestion_removed` bell row instead.
 */
export type MySuggestedListingState =
  "in_review" | "needs_info" | "published" | "with_business";

/** Who holds the listing now: the platform, the member themself after a
 *  claim, or the business that claimed it. */
export type MySuggestedListingHolder =
  "platform" | "claimed_by_you" | "claimed";

/**
 * One place the member suggested for the directory. Mirrors the backend's
 * hand-mapped `MySuggestedListingDTO`, which carries nothing about the owner:
 * a suggestion grants its member nothing on the listing.
 */
export interface MySuggestedListingDTO {
  ref: string;
  name: string;
  city: string;
  state: MySuggestedListingState;
  holder: MySuggestedListingHolder;
  /** Set only while the public page opens (live, and showing in the directory). */
  publicSlug: string | null;
  /** The business reported it shut for good; the page still opens. */
  isPermanentlyClosed: boolean;
  /** ISO 8601, when the member sent the suggestion. */
  suggestedAt: string;
}

/** GET /listings/suggestions/mine?page=: the places the caller suggested,
 *  newest first, 20 to a page. */
export async function getMySuggestedListings(
  page = 1,
): Promise<ItemsPage<MySuggestedListingDTO>> {
  const response = await apiGet<
    MySuggestedListingDTO[] | ItemsPage<MySuggestedListingDTO>
  >(`/listings/suggestions/mine?page=${page}`);
  return toItemsPage(response);
}
