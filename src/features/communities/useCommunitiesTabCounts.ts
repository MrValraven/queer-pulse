import { useCommunities } from "./api/useCommunities";

/** How many communities sit behind each `/communities` tab. `null` for a count
 *  that hasn't landed yet, so the tab shows its label alone rather than a
 *  wrong number (same rule as the filter counts). */
export interface CommunitiesTabCounts {
  mine: number | null;
  discover: number | null;
}

/**
 * The counts beside the "My communities" / "Discover" tab labels.
 *
 * Each is one server total from the list endpoint, read from a query the tab
 * bodies already mount: `useCommunities({ filter: "mine" })` and
 * `useCommunities({})` are the unfiltered grid keys of "My communities" and
 * Discover. So landing on either tab costs at most one extra bounded page (the
 * one for the tab you are NOT looking at), and switching tabs costs nothing,
 * because react-query already holds both.
 *
 * Demo mode resolves both locally (the membership store over the demo
 * directory, and the static registry), with no network at all.
 */
export function useCommunitiesTabCounts(): CommunitiesTabCounts {
  const mine = useCommunities({ filter: "mine" });
  const discover = useCommunities({});

  return {
    mine: mine.isLoading ? null : mine.total,
    discover: discover.isLoading ? null : discover.total,
  };
}
