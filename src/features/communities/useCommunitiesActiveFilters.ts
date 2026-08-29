import { useMemo, type Dispatch, type SetStateAction } from "react";
import type { ActiveFilter } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CommunityType } from "../homepage/data/types";
import { COMMUNITY_TAGS } from "./communityTags.data";
import { FILTERS, type DiscoverSort } from "./communitiesDiscover.data";

/**
 * Everything currently narrowing the communities grid, as removable chips.
 *
 * Every refinement is here, the search term included, because the whole point
 * is that a shut "Refine" drawer never hides what is applied.
 *
 * Sort is in here too, as a chip whenever it is off its "Newest" default. It
 * is an ordering rather than a narrowing, so it deliberately does NOT count
 * towards `useDiscoverCommunities`'s `hasActiveRefinement` (the featured card
 * and the suggestions band still belong on a re-sorted directory). The chip
 * exists because the toolbar keeps sort inside the Refine drawer, and a shut
 * drawer must never be the only place a member can see how the list is
 * ordered. Removing it puts the order back to Newest.
 */
export function useCommunitiesActiveFilters({
  searchInput,
  setSearchInput,
  filter,
  setFilter,
  isOpenOnly,
  setIsOpenOnly,
  isBusyOnly,
  setIsBusyOnly,
  tagIds,
  setTagIds,
  sort,
  setSort,
}: {
  searchInput: string;
  setSearchInput: Dispatch<SetStateAction<string>>;
  filter: "all" | CommunityType;
  setFilter: Dispatch<SetStateAction<"all" | CommunityType>>;
  isOpenOnly: boolean;
  setIsOpenOnly: Dispatch<SetStateAction<boolean>>;
  isBusyOnly: boolean;
  setIsBusyOnly: Dispatch<SetStateAction<boolean>>;
  tagIds: string[];
  setTagIds: Dispatch<SetStateAction<string[]>>;
  sort: DiscoverSort;
  setSort: Dispatch<SetStateAction<DiscoverSort>>;
}): ActiveFilter[] {
  const { t } = useTranslation();

  return useMemo(() => {
    const list: ActiveFilter[] = [];

    if (filter !== "all") {
      const option = FILTERS.find((entry) => entry.value === filter);
      list.push({
        key: `type:${filter}`,
        label: option ? t(option.labelKey) : filter,
        onRemove: () => setFilter("all"),
      });
    }
    if (isOpenOnly) {
      list.push({
        key: "open",
        label: t("communities:discover.toggle.openOnly"),
        onRemove: () => setIsOpenOnly(false),
      });
    }
    if (isBusyOnly) {
      list.push({
        key: "busy",
        label: t("communities:discover.toggle.busyOnly"),
        onRemove: () => setIsBusyOnly(false),
      });
    }
    tagIds.forEach((tagId) => {
      // A tag id from the URL may not be in the curated vocabulary any more;
      // it still shows, under its own id, so it can always be taken off.
      const tag = COMMUNITY_TAGS.find((entry) => entry.id === tagId);
      list.push({
        key: `tag:${tagId}`,
        label: tag ? t(tag.labelKey) : tagId,
        onRemove: () =>
          setTagIds((current) => current.filter((entry) => entry !== tagId)),
      });
    });
    if (searchInput.trim()) {
      list.push({
        key: "q",
        label: `"${searchInput.trim()}"`,
        onRemove: () => setSearchInput(""),
      });
    }
    if (sort !== "newest") {
      list.push({
        key: `sort:${sort}`,
        label: t("communities:discover.sort.chip", {
          label: t(`communities:discover.sort.${sort}`),
        }),
        onRemove: () => setSort("newest"),
      });
    }

    return list;
  }, [
    filter,
    isOpenOnly,
    isBusyOnly,
    tagIds,
    searchInput,
    sort,
    t,
    setFilter,
    setIsOpenOnly,
    setIsBusyOnly,
    setTagIds,
    setSearchInput,
    setSort,
  ]);
}
