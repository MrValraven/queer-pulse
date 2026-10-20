import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { studioErrorCodeOf } from "./studio.api";
import {
  toPlaylistEditorViews,
  toPlaylistView,
  type StudioPlaylistCandidateView,
  type StudioPlaylistEditorView,
  type StudioPlaylistView,
} from "./studio.adapters";
import type { StudioPlaylistInviteResponse } from "./studio.types";
import { dropPlaylist, storePlaylist } from "./studioPlaylistCache";
import {
  inviteStudioPlaylistEditors,
  leaveStudioPlaylist,
  removeStudioPlaylistEditor,
  respondStudioPlaylistInvite,
} from "./studioPlaylistEditors.api";
import { studioKeys } from "./studioQueryKeys";

// Each caller says what went wrong in its own words, so the global toast
// stays off. Caches change in onSuccess: a confirm that asked lives beside
// the list, and nothing moves before the server agrees.
const SILENT = { silentError: true } as const;

const demoEditors = () => import("./studioDemoPlaylistEditors");

function useEditorCaches() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  /** The co-owner checklist ticks the moment the server agrees. */
  const markCandidates = (
    playlistId: string,
    memberSlugs: string[],
    isEditor: boolean,
  ) => {
    queryClient.setQueriesData<StudioPlaylistCandidateView[]>(
      {
        queryKey: studioKeys.playlistEditorCandidatesAll(demoMode, playlistId),
      },
      (candidates) =>
        candidates?.map((candidate) =>
          memberSlugs.includes(candidate.person.slug)
            ? { ...candidate, isEditor }
            : candidate,
        ),
    );
  };
  /** What an editor change moves: the playlist's editor count and "added
   *  by" lines, its card in "your playlists", and the co-owner checklist. */
  const refreshPlaylist = (playlistId: string) => {
    for (const queryKey of [
      studioKeys.playlist(demoMode, playlistId),
      studioKeys.myPlaylists(demoMode),
      studioKeys.playlistEditorCandidatesAll(demoMode, playlistId),
    ])
      void queryClient.invalidateQueries({ queryKey });
  };
  return { demoMode, queryClient, markCandidates, refreshPlaylist };
}

export function useInviteStudioPlaylistEditors() {
  const { demoMode, queryClient, markCandidates, refreshPlaylist } =
    useEditorCaches();
  return useMutation<
    StudioPlaylistEditorView[],
    Error,
    { playlistId: string; memberSlugs: string[] }
  >({
    meta: SILENT,
    mutationFn: async ({ playlistId, memberSlugs }) =>
      toPlaylistEditorViews(
        demoMode
          ? (await demoEditors()).demoInvitePlaylistEditors(
              playlistId,
              memberSlugs,
            )
          : await inviteStudioPlaylistEditors(playlistId, memberSlugs),
      ),
    onSuccess: (editors, { playlistId, memberSlugs }) => {
      queryClient.setQueryData(
        studioKeys.playlistEditors(demoMode, playlistId),
        editors,
      );
      markCandidates(playlistId, memberSlugs, true);
      refreshPlaylist(playlistId);
    },
  });
}

/** Revokes an active editor or cancels an invite, by row id. `memberSlug`
 *  ("" for a member without a profile row) only unticks the co-owner
 *  checklist. A row that ended already (another tab, or the member left)
 *  answers 204 live. A 404 `studio_playlist_editor_not_found` means the
 *  server knows no such row id; the row is gone from the list either way,
 *  so both settle as a removal. */
export function useRemoveStudioPlaylistEditor() {
  const { demoMode, queryClient, markCandidates, refreshPlaylist } =
    useEditorCaches();
  return useMutation<
    void,
    Error,
    { playlistId: string; editorId: string; memberSlug: string }
  >({
    meta: SILENT,
    mutationFn: async ({ playlistId, editorId }) => {
      try {
        if (demoMode)
          (await demoEditors()).demoRemovePlaylistEditor(playlistId, editorId);
        else await removeStudioPlaylistEditor(playlistId, editorId);
      } catch (error) {
        if (studioErrorCodeOf(error) !== "studio_playlist_editor_not_found")
          throw error;
      }
    },
    onSuccess: (_result, { playlistId, editorId, memberSlug }) => {
      queryClient.setQueryData<StudioPlaylistEditorView[]>(
        studioKeys.playlistEditors(demoMode, playlistId),
        (editors) => editors?.filter((editor) => editor.editorId !== editorId),
      );
      if (memberSlug) markCandidates(playlistId, [memberSlug], false);
      refreshPlaylist(playlistId);
    },
  });
}

/** Seat-ended answers to a leave: the owner revoked the seat meanwhile
 *  (`studio_playlist_owner_only`), or the playlist closed to this member
 *  (`studio_playlist_not_found`). Either way the member has left. */
const LEFT_ALREADY_CODES: ReadonlySet<string> = new Set([
  "studio_playlist_owner_only",
  "studio_playlist_not_found",
]);

/** The editor stops editing. The page leaves for the library in the
 *  caller's onSuccess, before any render reads the playlist again. A seat
 *  that ended meanwhile settles as left. */
export function useLeaveStudioPlaylist() {
  const { demoMode, queryClient } = useEditorCaches();
  return useMutation<void, Error, { playlistId: string }>({
    meta: SILENT,
    mutationFn: async ({ playlistId }) => {
      try {
        if (demoMode) (await demoEditors()).demoLeavePlaylist(playlistId);
        else await leaveStudioPlaylist(playlistId);
      } catch (error) {
        const code = studioErrorCodeOf(error);
        if (code === null || !LEFT_ALREADY_CODES.has(code)) throw error;
      }
    },
    onSuccess: (_result, { playlistId }) => {
      dropPlaylist(queryClient, demoMode, playlistId);
      queryClient.removeQueries({
        queryKey: studioKeys.playlistEditors(demoMode, playlistId),
      });
    },
  });
}

/** Accept answers the playlist as its new editor sees it, which joins "your
 *  playlists"; decline drops it, and the page leaves for the library in the
 *  caller's onSuccess. An invite gone meanwhile reads the playlist again. */
export function useRespondStudioPlaylistInvite() {
  const { demoMode, queryClient } = useEditorCaches();
  return useMutation<
    StudioPlaylistView | null,
    Error,
    { playlistId: string; response: StudioPlaylistInviteResponse }
  >({
    meta: SILENT,
    mutationFn: async ({ playlistId, response }) => {
      const answer = demoMode
        ? (await demoEditors()).demoRespondPlaylistInvite(playlistId, response)
        : await respondStudioPlaylistInvite(playlistId, response);
      return answer ? toPlaylistView(answer) : null;
    },
    onSuccess: (playlist, { playlistId }) => {
      if (playlist) storePlaylist(queryClient, demoMode, playlist);
      else dropPlaylist(queryClient, demoMode, playlistId);
    },
    onError: (error, { playlistId }) => {
      const code = studioErrorCodeOf(error);
      if (
        code === "studio_playlist_invite_unavailable" ||
        code === "studio_playlist_invite_not_found"
      )
        void queryClient.invalidateQueries({
          queryKey: studioKeys.playlist(demoMode, playlistId),
        });
    },
  });
}
