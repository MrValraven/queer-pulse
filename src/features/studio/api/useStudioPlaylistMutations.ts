import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { toPlaylistView, type StudioPlaylistView } from "./studio.adapters";
import { studioErrorCodeOf } from "./studio.api";
import type {
  CreateStudioPlaylistBody,
  UpdateStudioPlaylistBody,
} from "./studio.types";
import {
  dropPlaylist,
  refreshPlaylistLists,
  storePlaylist,
  withEntryOrder,
  withoutEntry,
} from "./studioPlaylistCache";
import {
  addStudioPlaylistTracks,
  createStudioPlaylist,
  deleteStudioPlaylist,
  getStudioPlaylist,
  putStudioPlaylistOrder,
  removeStudioPlaylistEntry,
  updateStudioPlaylist,
} from "./studioPlaylists.api";
import { studioKeys } from "./studioQueryKeys";

// The server answers each write by the caller's seat: editors add, remove,
// reorder and rename; visibility, the credit and deleting stay with the
// owner (a 403 `studio_playlist_owner_only` for an editor); a member without
// a seat gets a 404. Each caller says what went wrong in its own
// words, so the global toast stays off.
const SILENT = { silentError: true } as const;

const demoStore = () => import("./studioDemoPlaylists");

export interface StudioPlaylistAddResult {
  playlist: StudioPlaylistView;
  /** How many of the asked-for tracks were new to the playlist. */
  addedCount: number;
}

function useStore() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const keep = (playlist: StudioPlaylistView) => {
    storePlaylist(queryClient, demoMode, playlist);
    refreshPlaylistLists(queryClient, demoMode, playlist, playlist.id);
  };
  return { demoMode, queryClient, keep };
}

export function useCreateStudioPlaylist() {
  const { demoMode, keep } = useStore();
  return useMutation<StudioPlaylistView, Error, CreateStudioPlaylistBody>({
    meta: SILENT,
    mutationFn: async (body) =>
      toPlaylistView(
        demoMode
          ? (await demoStore()).demoCreatePlaylist(body)
          : await createStudioPlaylist(body),
      ),
    onSuccess: keep,
  });
}

/** A credit change can end editor seats and moves where co-owner
 *  candidates come from, so the editors list and the co-owner checklist
 *  read again. */
export function useUpdateStudioPlaylist() {
  const { demoMode, queryClient, keep } = useStore();
  return useMutation<
    StudioPlaylistView,
    Error,
    { playlistId: string; body: UpdateStudioPlaylistBody }
  >({
    meta: SILENT,
    mutationFn: async ({ playlistId, body }) =>
      toPlaylistView(
        demoMode
          ? (await demoStore()).demoUpdatePlaylist(playlistId, body)
          : await updateStudioPlaylist(playlistId, body),
      ),
    onSuccess: (playlist, { playlistId, body }) => {
      keep(playlist);
      if (body.creditSubprofileId === undefined) return;
      for (const queryKey of [
        studioKeys.playlistEditors(demoMode, playlistId),
        studioKeys.playlistEditorCandidatesAll(demoMode, playlistId),
      ])
        void queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useDeleteStudioPlaylist() {
  const { demoMode, queryClient } = useStore();
  return useMutation<void, Error, { playlistId: string }>({
    meta: SILENT,
    mutationFn: async ({ playlistId }) => {
      if (demoMode) (await demoStore()).demoDeletePlaylist(playlistId);
      else await deleteStudioPlaylist(playlistId);
    },
    onSuccess: (_result, { playlistId }) => {
      dropPlaylist(queryClient, demoMode, playlistId);
      refreshPlaylistLists(queryClient, demoMode, null, playlistId);
    },
  });
}

/** Counts the entries the add created: entry ids in the answer that the
 *  playlist did not hold before. An entry that became unavailable meanwhile
 *  keeps its id, so it never offsets a new one. With no earlier entry list
 *  to compare (a playlist never opened in this session), the track count
 *  difference is the best estimate. */
export function addedEntryCountOf(
  entryIdsBefore: ReadonlySet<string> | null,
  playlist: StudioPlaylistView,
  previousTrackCount: number,
): number {
  if (!entryIdsBefore)
    return Math.max(0, playlist.trackCount - previousTrackCount);
  return playlist.entries.filter((entry) => !entryIdsBefore.has(entry.entryId))
    .length;
}

export function useAddStudioPlaylistTracks() {
  const { demoMode, queryClient, keep } = useStore();
  return useMutation<
    StudioPlaylistAddResult,
    Error,
    { playlistId: string; trackIds: string[]; previousTrackCount: number }
  >({
    meta: SILENT,
    mutationFn: async ({ playlistId, trackIds, previousTrackCount }) => {
      // Read the earlier entries before the request: the demo store is the
      // source of truth there; live has the owner's cached playlist view
      // when the playlist was opened.
      const store = demoMode ? await demoStore() : null;
      const entriesBefore = store
        ? store.demoStudioPlaylist(playlistId).entries
        : queryClient.getQueryData<StudioPlaylistView>(
            studioKeys.playlist(demoMode, playlistId),
          )?.entries;
      const entryIdsBefore = entriesBefore
        ? new Set(entriesBefore.map((entry) => entry.entryId))
        : null;
      const playlist = toPlaylistView(
        store
          ? store.demoAddPlaylistTracks(playlistId, trackIds)
          : await addStudioPlaylistTracks(playlistId, trackIds),
      );
      return {
        playlist,
        addedCount: addedEntryCountOf(
          entryIdsBefore,
          playlist,
          previousTrackCount,
        ),
      };
    },
    onSuccess: ({ playlist }) => keep(playlist),
  });
}

export function useRemoveStudioPlaylistEntry() {
  const { demoMode, queryClient, keep } = useStore();
  return useMutation<
    StudioPlaylistView,
    Error,
    { playlistId: string; entryId: string }
  >({
    meta: SILENT,
    mutationFn: async ({ playlistId, entryId }) => {
      const store = demoMode ? await demoStore() : null;
      const readNow = async () =>
        toPlaylistView(
          store
            ? store.demoStudioPlaylist(playlistId)
            : await getStudioPlaylist(playlistId),
        );
      try {
        if (store) store.demoRemovePlaylistEntry(playlistId, entryId);
        else await removeStudioPlaylistEntry(playlistId, entryId);
      } catch (error) {
        // Another editor removed it first: the row is gone either way, so
        // read the playlist as it is now and settle as a removal (spec 3.6).
        if (studioErrorCodeOf(error) !== "studio_playlist_entry_not_found")
          throw error;
        return readNow();
      }
      if (store) return readNow();
      // 204: the server recompacted the positions; the cached view does the
      // same without a round trip, and reads the playlist only when absent.
      // The server also moved updatedAt to now, which puts the card first in
      // "your playlists", so the patched view carries the same time.
      const cached = queryClient.getQueryData<StudioPlaylistView>(
        studioKeys.playlist(demoMode, playlistId),
      );
      return cached
        ? {
            ...withoutEntry(cached, entryId),
            updatedAt: new Date().toISOString(),
          }
        : readNow();
    },
    onSuccess: keep,
  });
}

/** Rows move the moment Move is pressed; a refused order puts them back.
 *  The page blocks a second move while one saves, so no order goes out
 *  built on a list the server has not confirmed. */
export function useReorderStudioPlaylist() {
  const { demoMode, queryClient, keep } = useStore();
  return useMutation<
    StudioPlaylistView,
    Error,
    { playlistId: string; entryIds: string[] },
    { previous: StudioPlaylistView | undefined }
  >({
    meta: SILENT,
    onMutate: async ({ playlistId, entryIds }) => {
      const key = studioKeys.playlist(demoMode, playlistId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<StudioPlaylistView>(key);
      if (previous)
        queryClient.setQueryData(key, withEntryOrder(previous, entryIds));
      return { previous };
    },
    mutationFn: async ({ playlistId, entryIds }) =>
      toPlaylistView(
        demoMode
          ? (await demoStore()).demoReorderPlaylist(playlistId, entryIds)
          : await putStudioPlaylistOrder(playlistId, entryIds),
      ),
    onError: (_error, { playlistId }, context) => {
      const key = studioKeys.playlist(demoMode, playlistId);
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      // A refused order can mean the list changed while the move saved (an
      // entry removed here, or added in another tab), so the snapshot may
      // hold a row that is gone. Both modes read the playlist again: live
      // from the server, demo from the in-memory store.
      void queryClient.invalidateQueries({ queryKey: key });
    },
    onSuccess: keep,
  });
}
