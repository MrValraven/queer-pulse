import { useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { studioErrorMessageKeyOf } from "../studioErrors.data";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";
import {
  createStudioPlaylistFolder,
  deleteStudioPlaylistFolder,
  getStudioPlaylistFolders,
  moveStudioPlaylistToFolder,
  studioPlaylistFolderErrorCodeOf,
  updateStudioPlaylistFolder,
  type StudioPlaylistFolderDTO,
  type StudioPlaylistFolderErrorCode,
  type StudioPlaylistFoldersDTO,
} from "./useStudioPlaylistFolders.api";

export type StudioPlaylistFolderView = StudioPlaylistFolderDTO;

/** Starts with "studio", so Quick Exit, sign-out and a lost grant clear it
 *  with every other Studio read. */
export const studioPlaylistFoldersKey = (demoMode: boolean) =>
  ["studio", "playlistFolders", demoMode] as const;

const demoStore = () => import("./useStudioPlaylistFolders.data");

// Each caller names what went wrong itself, so the global toast stays off.
const SILENT = { silentError: true } as const;

const FOLDER_ERROR_KEY: Record<StudioPlaylistFolderErrorCode, string> = {
  studio_playlist_folder_not_found: "studio:playlistFolders.errors.notFound",
  studio_playlist_folder_limit: "studio:playlistFolders.errors.limit",
  studio_playlist_folder_playlist_unavailable:
    "studio:playlistFolders.errors.playlistUnavailable",
};

/** A refused folder write as a catalog key: the folder code's own line,
 *  else the Studio rule for the failure's reason. */
export function studioPlaylistFolderErrorKeyOf(error: unknown): string {
  const code = studioPlaylistFolderErrorCodeOf(error);
  return code ? FOLDER_ERROR_KEY[code] : studioErrorMessageKeyOf(error);
}

export interface StudioPlaylistFoldersResult {
  folders: StudioPlaylistFolderView[];
  /** The folder each filed playlist sits in, by playlist id. */
  folderIdByPlaylistId: ReadonlyMap<string, string>;
  loadState: StudioLoadState;
}

/** The member's folders, in their order. Demo mode reads the session's
 *  in-memory folders. */
export function useStudioPlaylistFolders(): StudioPlaylistFoldersResult {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioPlaylistFoldersKey(demoMode),
    enabled: demoMode || hasAccess,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    meta: SILENT,
    queryFn: ({ client }): Promise<StudioPlaylistFoldersDTO> =>
      readStudio(client, async () =>
        demoMode
          ? (await demoStore()).demoPlaylistFolders()
          : await getStudioPlaylistFolders(),
      ),
  });
  const folders = useMemo(() => query.data?.items ?? [], [query.data]);
  const folderIdByPlaylistId = useMemo(() => {
    const byPlaylist = new Map<string, string>();
    for (const folder of folders)
      for (const playlistId of folder.playlistIds)
        byPlaylist.set(playlistId, folder.id);
    return byPlaylist;
  }, [folders]);
  return {
    folders,
    folderIdByPlaylistId,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}

type FoldersPatch = (
  folders: StudioPlaylistFolderView[],
) => StudioPlaylistFolderView[];

/** Patches the cached folders at once and hands back an undo for a write
 *  the server refuses. */
function patchFolders(
  queryClient: QueryClient,
  demoMode: boolean,
  patch: FoldersPatch,
): () => void {
  const key = studioPlaylistFoldersKey(demoMode);
  void queryClient.cancelQueries({ queryKey: key });
  const before = queryClient.getQueryData<StudioPlaylistFoldersDTO>(key);
  if (before) queryClient.setQueryData(key, { items: patch(before.items) });
  return () => {
    if (before) queryClient.setQueryData(key, before);
  };
}

const withPlaylistIn = (
  playlistId: string,
  folderId: string | null,
): FoldersPatch => {
  return (folders) =>
    folders.map((folder) => {
      const remaining = folder.playlistIds.filter((id) => id !== playlistId);
      return {
        ...folder,
        playlistIds:
          folder.id === folderId ? [...remaining, playlistId] : remaining,
      };
    });
};

function useFolderStore() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const settle = () =>
    queryClient.invalidateQueries({
      queryKey: studioPlaylistFoldersKey(demoMode),
    });
  return { demoMode, queryClient, settle };
}

/** Creates a folder, placed last; with `playlistId` it files that playlist
 *  in it in the same request ("Move to new folder"), so a refusal leaves no
 *  folder behind. */
export function useCreateStudioPlaylistFolder() {
  const { demoMode, queryClient, settle } = useFolderStore();
  return useMutation<
    StudioPlaylistFolderView,
    Error,
    { name: string; playlistId?: string }
  >({
    meta: SILENT,
    mutationFn: async ({ name, playlistId }) =>
      demoMode
        ? (await demoStore()).demoCreatePlaylistFolder(name, playlistId)
        : await createStudioPlaylistFolder(name, playlistId),
    onSuccess: (folder, { playlistId }) => {
      patchFolders(queryClient, demoMode, (folders) => [
        ...(playlistId ? withPlaylistIn(playlistId, null)(folders) : folders),
        folder,
      ]);
    },
    onSettled: settle,
  });
}

export function useRenameStudioPlaylistFolder() {
  const { demoMode, queryClient, settle } = useFolderStore();
  return useMutation<
    StudioPlaylistFolderView,
    Error,
    { folderId: string; name: string },
    () => void
  >({
    meta: SILENT,
    onMutate: ({ folderId, name }) =>
      patchFolders(queryClient, demoMode, (folders) =>
        folders.map((folder) =>
          folder.id === folderId ? { ...folder, name } : folder,
        ),
      ),
    mutationFn: async ({ folderId, name }) =>
      demoMode
        ? (await demoStore()).demoUpdatePlaylistFolder(folderId, { name })
        : await updateStudioPlaylistFolder(folderId, { name }),
    onError: (_error, _variables, undo) => undo?.(),
    onSettled: settle,
  });
}

/** Deletes a folder; its playlists go back to the top level. */
export function useDeleteStudioPlaylistFolder() {
  const { demoMode, queryClient, settle } = useFolderStore();
  return useMutation<void, Error, { folderId: string }, () => void>({
    meta: SILENT,
    onMutate: ({ folderId }) =>
      patchFolders(queryClient, demoMode, (folders) =>
        folders.filter((folder) => folder.id !== folderId),
      ),
    mutationFn: async ({ folderId }) => {
      if (demoMode) (await demoStore()).demoDeletePlaylistFolder(folderId);
      else await deleteStudioPlaylistFolder(folderId);
    },
    onError: (_error, _variables, undo) => undo?.(),
    onSettled: settle,
  });
}

/** Files a playlist in a folder, or with `folderId: null` takes it out.
 *  The rail moves the row at once; a refusal puts it back. */
export function useMoveStudioPlaylistToFolder() {
  const { demoMode, queryClient, settle } = useFolderStore();
  return useMutation<
    void,
    Error,
    { playlistId: string; folderId: string | null },
    () => void
  >({
    meta: SILENT,
    onMutate: ({ playlistId, folderId }) =>
      patchFolders(queryClient, demoMode, withPlaylistIn(playlistId, folderId)),
    mutationFn: async ({ playlistId, folderId }) => {
      if (demoMode)
        (await demoStore()).demoMovePlaylistToFolder(playlistId, folderId);
      else await moveStudioPlaylistToFolder(playlistId, folderId);
    },
    onError: (_error, _variables, undo) => undo?.(),
    onSettled: settle,
  });
}
