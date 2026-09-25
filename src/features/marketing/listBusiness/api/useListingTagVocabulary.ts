import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import {
  LISTING_TAG_GROUPS,
  type ListingTagGroupShape,
} from "../listingTags.data";
import { getDirectoryTags, type DirectoryTagGroup } from "./listings.api";

/** The vocabulary changes with a release at most, so one read an hour is
 *  plenty. */
const TAG_VOCABULARY_STALE_TIME_MS = 60 * 60 * 1000;

/**
 * The curated tag vocabulary for the wizard's tag picker, grouped and in
 * display order. Live mode reads `GET /directory/tags`; demo mode reads the
 * local copy. While the read is pending, or after it fails, the local copy
 * stands in so the list always shows and a failure needs no UI of its own.
 */
export function useListingTagVocabulary(): readonly ListingTagGroupShape[] {
  const { demoMode } = useDemoMode();
  const query = useQuery<DirectoryTagGroup[]>({
    queryKey: ["listings", "tags"],
    enabled: !demoMode,
    staleTime: TAG_VOCABULARY_STALE_TIME_MS,
    queryFn: getDirectoryTags,
  });
  if (demoMode) return LISTING_TAG_GROUPS;
  const serverGroups = query.data;
  return serverGroups && serverGroups.length > 0
    ? serverGroups
    : LISTING_TAG_GROUPS;
}
