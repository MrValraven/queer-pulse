import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioLatestEpisodes } from "./studio.api";
import {
  toLatestEpisodeViews,
  type StudioLatestEpisodeView,
} from "./studio.adapters";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** One shelf's worth: the home shelf shows them and never pages. */
export const LATEST_EPISODES_LIMIT = 12;
const LATEST_EPISODES_STALE_MS = 60_000;

/** The New episodes shelf (spec 5.1): newest published episodes across
 *  listenable shows. It hides on a failure, so no toast. */
export function useStudioLatestEpisodes(): {
  episodes: StudioLatestEpisodeView[];
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.latestEpisodes(demoMode),
    enabled: demoMode || hasAccess,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : LATEST_EPISODES_STALE_MS,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async () => {
        const page = demoMode
          ? (await import("./studioDemoApi")).demoStudioLatestEpisodes(
              LATEST_EPISODES_LIMIT,
            )
          : await getStudioLatestEpisodes(LATEST_EPISODES_LIMIT);
        return toLatestEpisodeViews(page.items);
      }),
  });
  return {
    episodes: query.data ?? [],
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
