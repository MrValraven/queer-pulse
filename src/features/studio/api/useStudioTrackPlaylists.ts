import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  toPlaylistCardView,
  type StudioPlaylistCardView,
} from "./studio.adapters";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { getStudioTrackPlaylists } from "./studioPlaylists.api";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

const NO_PLAYLISTS: StudioPlaylistCardView[] = [];

/** "In these playlists" on a track page: up to six public playlists. The
 *  section hides itself on a failure, so no toast. */
export function useStudioTrackPlaylists(trackId: string | null): {
  playlists: StudioPlaylistCardView[];
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.trackPlaylists(demoMode, trackId ?? ""),
    enabled: trackId !== null && (demoMode || hasAccess),
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async () => {
        const answer = demoMode
          ? (await import("./studioDemoPlaylists")).demoTrackPlaylists(
              trackId ?? "",
            )
          : await getStudioTrackPlaylists(trackId ?? "");
        return answer.items.map(toPlaylistCardView);
      }),
  });
  return {
    playlists: query.data ?? NO_PLAYLISTS,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
