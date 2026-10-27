import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioArtistPlacements } from "./studioDashboard.api";
import {
  placementsPageOf,
  toPlacementView,
  type StudioPlacementView,
} from "./studioDashboard.adapters";
import { studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";
import {
  useStudioCursorPages,
  type StudioCursorPagesResult,
} from "./useStudioCursorPages";

/** "Where your music lives": the public playlists holding one persona's
 *  tracks, a page at a time behind "Show more". The read counts nothing. */
export function useStudioPlacements(
  subprofileId: string,
): StudioCursorPagesResult<StudioPlacementView> {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  return useStudioCursorPages({
    queryKey: studioKeys.placements(demoMode, subprofileId),
    enabled: demoMode || hasAccess,
    read: async (cursor) =>
      placementsPageOf(
        demoMode
          ? (await import("./studioDemoDashboard")).demoStudioArtistPlacements(
              subprofileId,
              cursor,
            )
          : await getStudioArtistPlacements(subprofileId, cursor),
      ),
    toView: toPlacementView,
  });
}
