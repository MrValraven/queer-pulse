import {
  ApiError,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "../../../shared/api/client";

// Playlist folders: one raw call per endpoint. Folders are private to the
// member and every path sits under /studio/playlists/, which the server keeps
// out of its request log. Nothing here records listening.

/** One of the member's folders, as the server sends it. */
export interface StudioPlaylistFolderDTO {
  id: string;
  name: string;
  /** Its place among the member's folders, lowest first. */
  position: number;
  createdAt: string;
  /** Playlists filed in it, earliest filed first: only ones the member
   *  owns, edits or saved. */
  playlistIds: string[];
}

export interface StudioPlaylistFoldersDTO {
  items: StudioPlaylistFolderDTO[];
}

export interface UpdateStudioPlaylistFolderBody {
  name?: string;
  position?: number;
}

/** The server's folder refusals, each named in the copy. */
export type StudioPlaylistFolderErrorCode =
  | "studio_playlist_folder_not_found"
  | "studio_playlist_folder_limit"
  | "studio_playlist_folder_playlist_unavailable";

export const STUDIO_PLAYLIST_FOLDER_LIMITS = {
  nameMax: 80,
  foldersMax: 50,
} as const;

const FOLDER_ERROR_CODES: ReadonlySet<string> = new Set([
  "studio_playlist_folder_not_found",
  "studio_playlist_folder_limit",
  "studio_playlist_folder_playlist_unavailable",
] satisfies StudioPlaylistFolderErrorCode[]);

/** The folder code a refused request carries, or null for anything else. */
export function studioPlaylistFolderErrorCodeOf(
  error: unknown,
): StudioPlaylistFolderErrorCode | null {
  if (!(error instanceof ApiError)) return null;
  const body = error.data;
  if (!body || typeof body !== "object" || !("code" in body)) return null;
  const code = (body as { code?: unknown }).code;
  return typeof code === "string" && FOLDER_ERROR_CODES.has(code)
    ? (code as StudioPlaylistFolderErrorCode)
    : null;
}

const segment = (id: string) => encodeURIComponent(id);

export const getStudioPlaylistFolders = () =>
  apiGet<StudioPlaylistFoldersDTO>("/studio/playlists/folders");

/** With `playlistId` the playlist is filed in the new folder in the same
 *  request; a playlist that cannot be filed refuses it all, so no empty
 *  folder is left behind. */
export const createStudioPlaylistFolder = (name: string, playlistId?: string) =>
  apiPost<StudioPlaylistFolderDTO>(
    "/studio/playlists/folders",
    playlistId ? { name, playlistId } : { name },
  );

export const updateStudioPlaylistFolder = (
  folderId: string,
  body: UpdateStudioPlaylistFolderBody,
) =>
  apiPatch<StudioPlaylistFolderDTO>(
    `/studio/playlists/folders/${segment(folderId)}`,
    body,
  );

export const deleteStudioPlaylistFolder = (folderId: string) =>
  apiDelete<void>(`/studio/playlists/folders/${segment(folderId)}`);

/** `folderId: null` puts the playlist back at the top level. */
export const moveStudioPlaylistToFolder = (
  playlistId: string,
  folderId: string | null,
) =>
  apiPut<void>(`/studio/playlists/${segment(playlistId)}/folder`, {
    folderId,
  });
