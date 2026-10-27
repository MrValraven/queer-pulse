import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioArtistStats } from "./studio.api";
import {
  toDashboardStatsView,
  type StudioDashboardStatsView,
} from "./studioDashboard.adapters";
import {
  STUDIO_NOT_FOUND_STATE,
  studioLoadStateOf,
  type StudioLoadState,
} from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** "Your numbers" for one persona the member owns or co-owns. The read
 *  carries the totals, the new followers per week, each release's checklist,
 *  the plays per release and track, and the next scheduled release; the
 *  server still withholds every count from 1 to 4. */
export function useStudioArtistStats(subprofileId: string | null): {
  stats: StudioDashboardStatsView | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.stats(demoMode, subprofileId ?? ""),
    enabled: subprofileId !== null && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toDashboardStatsView(
          demoMode
            ? (await import("./studioDemoStats")).demoStudioArtistStats(
                subprofileId ?? "",
              )
            : await getStudioArtistStats(subprofileId ?? ""),
        ),
      ),
  });
  if (subprofileId === null)
    return { stats: null, loadState: STUDIO_NOT_FOUND_STATE };
  return {
    stats: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
