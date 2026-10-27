import { queryOptions, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import { getStudioMilestoneCard } from "./studioDashboard.api";
import {
  toMilestoneCardView,
  type StudioMilestoneCardView,
} from "./studioDashboard.adapters";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** The card a shared milestone link reads. A card the adapter cannot read
 *  (an unknown kind, an unparseable date) takes the one 404 path, so it shows
 *  the same unavailable state as a milestone the reader may not see. */
export function studioMilestoneCardQueryOptions(
  demoMode: boolean,
  milestoneId: string,
) {
  return queryOptions({
    queryKey: studioKeys.milestoneCard(demoMode, milestoneId),
    // The demo fixture never changes.
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    queryFn: ({ client }): Promise<StudioMilestoneCardView> =>
      readStudio(client, async () => {
        const card = toMilestoneCardView(
          demoMode
            ? (await import("./studioDemoDashboard")).demoStudioMilestoneCard(
                milestoneId,
              )
            : await getStudioMilestoneCard(milestoneId),
        );
        if (card === null) {
          throw new ApiError(404, "This milestone is not available to you.", {
            statusCode: 404,
            code: "studio_milestone_not_found",
          });
        }
        return card;
      }),
  });
}

export function useStudioMilestoneCard(milestoneId: string): {
  card: StudioMilestoneCardView | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    ...studioMilestoneCardQueryOptions(demoMode, milestoneId),
    enabled: demoMode || hasAccess,
  });
  return {
    card: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
