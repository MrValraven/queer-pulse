import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getResourceIndex, type ResourceIndexEntryDTO } from "./resources.api";

export interface GuideIndexResult {
  entries: ResourceIndexEntryDTO[];
  isLoading: boolean;
  /** True when the index request failed. The page must say so rather than
   *  reuse the editorial-gate empty copy, which claims something different
   *  and untrue: that no guide has been reviewed yet. */
  isError: boolean;
  /** Re-runs the failed request. Wire it to `LoadErrorState`'s `onRetry`. */
  refetch: () => void;
}

/** Stable empty array so the "no data yet" case keeps its identity across
 *  renders and the page's grouping `useMemo` isn't invalidated every time. */
const EMPTY_ENTRIES: ResourceIndexEntryDTO[] = [];

/**
 * Data source for the guide index (CON-10).
 *
 * Live mode calls GET /resources/index once — every published guide,
 * unpaginated, because an index that stops at page one is the problem it was
 * built to fix. Demo mode returns the local manifest, code-split out of the
 * live bundle through a demo-gated dynamic import, so the index still lists
 * every guide route for a reviewer browsing the demo.
 *
 * An empty `entries` array is a real, correct answer here: guides stay hidden
 * until an editor stamps `last_reviewed_on`, so "nothing reviewed yet" is
 * something the index is meant to be able to say. That is exactly why
 * `isError` is separate. A failed request is not an editorial state, and the
 * page has to be able to tell the two apart (DES-22).
 */
export function useGuideIndex(): GuideIndexResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<ResourceIndexEntryDTO[]>({
    queryKey: ["resources", "guide-index", demoMode],
    queryFn: async () => {
      if (demoMode) {
        const { GUIDE_INDEX_DEMO } = await import("../guideIndex.data");
        return GUIDE_INDEX_DEMO;
      }
      return getResourceIndex();
    },
  });

  return {
    entries: query.data ?? EMPTY_ENTRIES,
    isLoading: query.isPending,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
