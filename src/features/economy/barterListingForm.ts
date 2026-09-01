import { CATS, type Mode } from "./barter.data";
import type { BarterCategoryKey } from "./api/barter.api";

/**
 * The board's real categories. The leading `"all"` chip is a filter, never
 * something a listing can be posted or edited under.
 *
 * It lives here because the post strip and the edit form both need the same
 * vocabulary: a hand-kept second copy is exactly the kind of drift that lets
 * one surface offer a category the other cannot save.
 */
export const POSTABLE_CATEGORIES = CATS.filter(
  (category) => category.value !== "all",
);

/** What a swap says it is: something offered, something wanted, or both. */
export const BARTER_MODES: Mode[] = ["both", "offering", "seeking"];

/** The label each mode reads as, shared with the board's own badges. */
export const BARTER_MODE_LABEL_KEY: Record<Mode, string> = {
  offering: "economy:barter.badge.offering",
  seeking: "economy:barter.badge.seeking",
  both: "economy:barter.badge.both",
};

/** The editable shape of a swap. One object so a form owns a single piece of
 *  state and the submit path has nothing to reassemble. */
export interface BarterListingFormValues {
  category: BarterCategoryKey | null;
  mode: Mode;
  offer: string;
  want: string;
  offerDetail: string;
  wantDetail: string;
  /** Comma-separated while being typed; split on submit. */
  tags: string;
}

/** Splits the tag field into the array the API takes: trimmed, no blanks, no
 *  duplicates, capped at the eight the server accepts. */
export function parseBarterTags(raw: string): string[] {
  const cleaned = raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return [...new Set(cleaned)].slice(0, 8);
}
