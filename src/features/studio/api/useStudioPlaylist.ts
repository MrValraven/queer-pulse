import { queryOptions, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { DEMO_DEFAULT_PLAYLIST_ID } from "../studioCollection.data";
import { toPlaylistView, type StudioPlaylistView } from "./studio.adapters";
import { isStudioNotFound } from "./studio.api";
import { STUDIO_PLAYLIST_LIMITS } from "./studio.types";
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

/** How often an open playlist reads itself again: every 30 seconds while
 *  someone else may be editing it, else never. */
export function playlistRefreshIntervalOf(
  playlist: StudioPlaylistView | undefined,
): number | false {
  return playlist?.isCollaborative
    ? STUDIO_PLAYLIST_LIMITS.collaborativeRefreshMs
    : false;
}

/** One playlist. A playlist the viewer may not see answers 404, which reads
 *  as the Studio not-found state and never says whether it exists. A
 *  collaborative playlist stays fresh without sockets: it reads itself again
 *  on window focus and every 30 seconds while the tab is visible (React
 *  Query holds the interval while the tab is hidden). The demo store is the
 *  truth in demo, so only live mode polls. A loaded playlist whose latest
 *  read answered 404 (deleted, made private, the seat ended, or its owner
 *  paused) shows the not-found state and stops polling. */
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
    refetchInterval: demoMode
      ? false
      : (current) =>
          isStudioNotFound(current.state.error)
            ? false
            : playlistRefreshIntervalOf(current.state.data),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: demoMode
      ? false
      : (current) =>
          !isStudioNotFound(current.state.error) &&
          current.state.data?.isCollaborative === true
            ? "always"
            : false,
  });
  if (resolvedId === null)
    return { playlist: null, loadState: STUDIO_NOT_FOUND_STATE };
  const isGone =
    query.data !== undefined &&
    isStudioNotFound(query.error) &&
    query.errorUpdatedAt > query.dataUpdatedAt;
  if (isGone) return { playlist: null, loadState: STUDIO_NOT_FOUND_STATE };
  return {
    playlist: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
