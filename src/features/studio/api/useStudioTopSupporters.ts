import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioTopSupporters } from "./studioDashboard.api";
import {
  toTopSupportersView,
  type StudioTopSupportersView,
} from "./studioDashboardPlays.adapters";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** The ranked supporters who chose to show themselves on one persona the
 *  member owns or co-owns. A persona the member does not own reads as not
 *  found. */
export function useStudioTopSupporters(
  subprofileId: string,
  isEnabled: boolean,
): {
  supporters: StudioTopSupportersView | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.topSupporters(demoMode, subprofileId),
    enabled: isEnabled && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toTopSupportersView(
          demoMode
            ? (
                await import("./studioDemoDashboardPlays")
              ).demoStudioTopSupporters(subprofileId)
            : await getStudioTopSupporters(subprofileId),
        ),
      ),
  });
  return {
    supporters: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
