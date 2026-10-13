import { queryOptions, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { DEMO_DEFAULT_PLAYLIST_ID } from "../studioCollection.data";
import { toPlaylistView, type StudioPlaylistView } from "./studio.adapters";
import {
  STUDIO_NOT_FOUND_STATE,
  studioLoadStateOf,
  type StudioLoadState,
} from "./studioLoadState";
import { getStudioPlaylist } from "./studioPlaylists.api";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** Shared with the writes, which read the cached view before patching it. */
export function studioPlaylistQueryOptions(
  demoMode: boolean,
  playlistId: string,
) {
  return queryOptions({
    queryKey: studioKeys.playlist(demoMode, playlistId),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    queryFn: ({ client }): Promise<StudioPlaylistView> =>
      readStudio(client, async () =>
        toPlaylistView(
          demoMode
            ? (await import("./studioDemoPlaylists")).demoStudioPlaylist(
                playlistId,
              )
            : await getStudioPlaylist(playlistId),
        ),
      ),
  });
}

/** One playlist. A playlist the viewer may not see answers 404, which reads
 *  as the Studio not-found state and never says whether it exists. */
export function useStudioPlaylist(playlistId: string | null): {
  playlist: StudioPlaylistView | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const resolvedId = playlistId ?? (demoMode ? DEMO_DEFAULT_PLAYLIST_ID : null);
  const query = useQuery({
    ...studioPlaylistQueryOptions(demoMode, resolvedId ?? ""),
    enabled: resolvedId !== null && (demoMode || hasAccess),
  });
  if (resolvedId === null)
    return { playlist: null, loadState: STUDIO_NOT_FOUND_STATE };
  return {
    playlist: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
