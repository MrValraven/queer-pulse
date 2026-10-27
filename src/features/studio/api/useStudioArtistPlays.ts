import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioArtistPlays } from "./studioDashboard.api";
import {
  toArtistPlaysView,
  type StudioArtistPlaysView,
} from "./studioDashboardPlays.adapters";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** The last 28 days of plays for one persona the member owns or co-owns,
 *  today last. A persona the member does not own reads as not found. */
export function useStudioArtistPlays(
  subprofileId: string,
  isEnabled: boolean,
): {
  plays: StudioArtistPlaysView | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.artistPlays(demoMode, subprofileId),
    enabled: isEnabled && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toArtistPlaysView(
          demoMode
            ? (
                await import("./studioDemoDashboardPlays")
              ).demoStudioArtistPlays(subprofileId)
            : await getStudioArtistPlays(subprofileId),
        ),
      ),
  });
  return {
    plays: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
