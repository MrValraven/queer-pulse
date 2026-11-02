import type { DirectoryListingFactFilters } from "./directoryListingFactFilters";
import { useListingAttributeVocabulary } from "./listBusiness/api/useListingAttributeVocabulary";
import {
  filterableAttributeGroupsFor,
  OTHER_ATTRIBUTE_GROUP_ID,
} from "./listBusiness/listingAttributes.data";

/** One group of attribute chips: its id and the attribute slugs in it. */
export interface MoreFilterGroup {
  id: string;
  attributes: readonly string[];
}

/**
 * The attribute groups "More filters" offers: those of the chosen place types
 * first, then "Around the place" and "Pricing" underneath (with none chosen,
 * those two alone; the online equivalents on the Online tab), each once and
 * none of them sensitive (`filterableAttributeGroupsFor`). A chosen attribute
 * the current place types no longer offer stays listed under "Other", so it
 * can be turned off.
 */
export function useMoreFilterGroups({
  listingFacts,
  isOnlineScope,
  categories,
}: {
  listingFacts: DirectoryListingFactFilters;
  isOnlineScope: boolean;
  categories: readonly string[];
}): MoreFilterGroup[] {
  const vocabulary = useListingAttributeVocabulary();
  const groups = filterableAttributeGroupsFor(vocabulary, {
    categories,
    isOnlineScope,
  });
  const shown = new Set(groups.flatMap((group) => group.attributes));
  const strays = listingFacts.attributes.filter((slug) => !shown.has(slug));
  return strays.length > 0
    ? [...groups, { id: OTHER_ATTRIBUTE_GROUP_ID, attributes: strays }]
    : groups;
}
