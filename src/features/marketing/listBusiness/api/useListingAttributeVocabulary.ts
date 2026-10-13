import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import {
  LOCAL_ATTRIBUTE_VOCABULARY,
  normalizeAttributeVocabulary,
  type ListingAttributeVocabulary,
} from "../listingAttributes.data";
import { getListingAttributeVocabulary } from "./listings.api";

/** The vocabulary changes with a release at most, so one read an hour is
 *  plenty. */
const ATTRIBUTE_VOCABULARY_STALE_TIME_MS = 60 * 60 * 1000;

/** Kept outside the `directory` prefix: every listing save invalidates that
 *  prefix, which would refetch the vocabulary and defeat its stale time. */
export const LISTING_ATTRIBUTE_VOCABULARY_QUERY_KEY = [
  "listings",
  "attributes",
] as const;

/**
 * The attribute vocabulary for the owner's picker, the detail page's groups
 * and the directory's "More filters". Live mode reads
 * `GET /directory/attributes`; demo mode reads the local copy. While the read
 * is pending, after it fails, or when the body cannot be read, the local copy
 * stands in, so every reader always has groups and a failure needs no UI of
 * its own.
 */
export function useListingAttributeVocabulary(): ListingAttributeVocabulary {
  const { demoMode } = useDemoMode();
  const query = useQuery<unknown>({
    queryKey: LISTING_ATTRIBUTE_VOCABULARY_QUERY_KEY,
    enabled: !demoMode,
    staleTime: ATTRIBUTE_VOCABULARY_STALE_TIME_MS,
    queryFn: getListingAttributeVocabulary,
  });
  const serverBody = demoMode ? undefined : query.data;
  return useMemo(
    () =>
      (serverBody === undefined
        ? null
        : normalizeAttributeVocabulary(serverBody)) ??
      LOCAL_ATTRIBUTE_VOCABULARY,
    [serverBody],
  );
}
