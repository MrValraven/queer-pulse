import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import {
  LISTING_TAG_GROUPS,
  normalizeServerTagGroups,
  tagGroupsForAudience,
  type ListingTagAudienceGroup,
} from "../listingTags.data";
import { getDirectoryTags, type DirectoryTagGroup } from "./listings.api";

/** The vocabulary changes with a release at most, so one read an hour is
 *  plenty. */
const TAG_VOCABULARY_STALE_TIME_MS = 60 * 60 * 1000;

/**
 * The curated tag vocabulary for the wizard's tag picker, grouped, in display
 * order and narrowed to the listing's audience (`isOnline` picks each group's
 * online list). Live mode reads `GET /directory/tags`; demo mode reads the
 * local copy. While the read is pending, or after it fails, the local copy
 * stands in so the list always shows and a failure needs no UI of its own.
 */
export function useListingTagVocabulary(
  isOnline: boolean,
): readonly ListingTagAudienceGroup[] {
  const { demoMode } = useDemoMode();
  const query = useQuery<DirectoryTagGroup[]>({
    queryKey: ["listings", "tags"],
    enabled: !demoMode,
    staleTime: TAG_VOCABULARY_STALE_TIME_MS,
    queryFn: getDirectoryTags,
  });
  const serverGroups = demoMode ? undefined : query.data;
  return useMemo(() => {
    const groups =
      serverGroups && serverGroups.length > 0
        ? normalizeServerTagGroups(serverGroups)
        : LISTING_TAG_GROUPS;
    return tagGroupsForAudience(groups, isOnline);
  }, [serverGroups, isOnline]);
}
