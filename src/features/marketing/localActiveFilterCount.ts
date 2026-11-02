import { countListingFactFilters } from "./directoryListingFactFilters";
import type { LocalFilterFieldsProps } from "./LocalFilterFields";

/** The filter fields the active count reads. */
export type LocalActiveFilterCountFields = Pick<
  LocalFilterFieldsProps,
  | "listingFacts"
  | "access"
  | "categories"
  | "safeOnly"
  | "owned"
  | "openNow"
  | "isOutAndAbout"
  | "isOnlineScope"
  | "isAdultShown"
>;

/**
 * How many filters are narrowing the results right now, for the badge on a
 * control that hides them: the desktop "Filters" toggle beside the results,
 * and the "Refine" toggle on the full screen map's card. Every chosen place
 * type counts as one filter, the same way each fact chip and each access need
 * does, so the badge matches the chips applied.
 */
export function countActiveLocalFilters({
  listingFacts,
  access,
  categories,
  safeOnly,
  owned,
  openNow,
  isOutAndAbout,
  isOnlineScope = false,
  isAdultShown,
}: LocalActiveFilterCountFields): number {
  return (
    countListingFactFilters(listingFacts) +
    access.length +
    categories.length +
    (safeOnly ? 1 : 0) +
    owned.length +
    (openNow ? 1 : 0) +
    (!isOnlineScope && isOutAndAbout ? 1 : 0) +
    (isOnlineScope && isAdultShown ? 1 : 0)
  );
}
