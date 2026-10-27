import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioArtistMilestones } from "./studioDashboard.api";
import {
  toMilestoneViews,
  type StudioMilestoneView,
} from "./studioDashboard.adapters";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** The milestones one persona the member owns or co-owns has reached,
 *  newest first. A persona the member does not own reads as not found. */
export function useStudioMilestones(subprofileId: string): {
  milestones: StudioMilestoneView[] | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.milestones(demoMode, subprofileId),
    enabled: demoMode || hasAccess,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toMilestoneViews(
          demoMode
            ? (
                await import("./studioDemoDashboard")
              ).demoStudioArtistMilestones(subprofileId)
            : await getStudioArtistMilestones(subprofileId),
        ),
      ),
  });
  return {
    milestones: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
