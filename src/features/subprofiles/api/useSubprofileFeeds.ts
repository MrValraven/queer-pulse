import { queryOptions, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  listFeedEntries,
  listSubprofileFeeds,
  type FeedEntryDTO,
  type FeedEntryStatus,
  type SubprofileFeedDTO,
} from "./subprofileFeeds.api";

/** Query keys for podcast feed import. `demoMode` rides in every key (as
 *  `useSubprofile` does) so flipping the toggle never serves one mode's cache
 *  to the other. Every key of one persona starts with `forPersona`, so a
 *  disconnect can drop the lot. */
export const feedQueryKeys = {
  forPersona: (demoMode: boolean, subprofileId: string) =>
    ["subprofile-feeds", demoMode, subprofileId] as const,
  list: (demoMode: boolean, subprofileId: string) =>
    ["subprofile-feeds", demoMode, subprofileId, "list"] as const,
  entriesOfFeed: (demoMode: boolean, subprofileId: string, feedId: string) =>
    ["subprofile-feeds", demoMode, subprofileId, "entries", feedId] as const,
  entries: (
    demoMode: boolean,
    subprofileId: string,
    feedId: string,
    status: FeedEntryStatus,
  ) =>
    [
      "subprofile-feeds",
      demoMode,
      subprofileId,
      "entries",
      feedId,
      status,
    ] as const,
};

/** The demo backend for feeds, loaded on first use so it stays out of live bundles. */
export const loadDemoFeeds = () => import("../data/subprofileFeedsDemo");

/** One persona's connected feeds. Shared by the editor's Import pane and the
 *  dashboard's review nudge, so both read the same cache entry. */
export function subprofileFeedsQueryOptions(
  demoMode: boolean,
  subprofileId: string,
) {
  return queryOptions<SubprofileFeedDTO[]>({
    queryKey: feedQueryKeys.list(demoMode, subprofileId),
    // The pane and the dashboard nudge both own a failure (an error panel, or
    // no nudge), so the global toast would only repeat it once per persona.
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoListFeeds } = await loadDemoFeeds();
        return demoListFeeds(subprofileId);
      }
      return listSubprofileFeeds(subprofileId, signal);
    },
  });
}

/** The feeds connected to a persona. Demo reads the in-memory demo feeds;
 *  live calls GET /subprofiles/:id/feeds. */
export function useSubprofileFeeds(subprofileId: string) {
  const { demoMode } = useDemoMode();
  return useQuery(subprofileFeedsQueryOptions(demoMode, subprofileId));
}

/** One feed's entries in one state, newest first. The review queue reads
 *  `pending`; its Dismissed view reads `dismissed`. */
export function useFeedEntries(
  subprofileId: string,
  feedId: string,
  status: FeedEntryStatus,
) {
  const { demoMode } = useDemoMode();
  return useQuery<FeedEntryDTO[]>({
    queryKey: feedQueryKeys.entries(demoMode, subprofileId, feedId, status),
    // The review queue shows its own load-error panel with a retry.
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoListEntries } = await loadDemoFeeds();
        return demoListEntries(subprofileId, feedId, status);
      }
      return listFeedEntries(subprofileId, feedId, status, signal);
    },
  });
}
