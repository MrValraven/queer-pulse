import { ApiError } from "../../../shared/api/client";
import {
  STUDIO_PLAYLIST_FOLDER_LIMITS,
  type StudioPlaylistFolderDTO,
  type StudioPlaylistFolderErrorCode,
  type StudioPlaylistFoldersDTO,
  type UpdateStudioPlaylistFolderBody,
} from "./useStudioPlaylistFolders.api";

/** The demo member's folders when a session starts: one folder holding two
 *  of their rail playlists (one they edit, one of their own), so the rail
 *  shows a folder from the first visit. */
const DEMO_FOLDER_SEEDS: readonly StudioPlaylistFolderDTO[] = [
  {
    id: "demo-folder-late-nights",
    name: "Late nights",
    position: 0,
    createdAt: "2026-10-01T22:00:00.000Z",
    playlistIds: [
      "demo-playlist-tour-diary",
      "demo-playlist-cartas-que-voltam",
    ],
  },
];

/** In-memory for the session, like the demo playlists: a reload starts
 *  from the seeds again and nothing is written anywhere. */
let folders: StudioPlaylistFolderDTO[] = [];
let createdCount = 0;

export function resetDemoPlaylistFolders(): void {
  folders = DEMO_FOLDER_SEEDS.map((seed) => ({
    ...seed,
    playlistIds: [...seed.playlistIds],
  }));
  createdCount = 0;
}
resetDemoPlaylistFolders();

const refusal = (status: number, code: StudioPlaylistFolderErrorCode) =>
  new ApiError(status, code, { statusCode: status, code, message: code });

const copyOf = (folder: StudioPlaylistFolderDTO): StudioPlaylistFolderDTO => ({
  ...folder,
  playlistIds: [...folder.playlistIds],
});

function folderOrThrow(folderId: string): StudioPlaylistFolderDTO {
  const folder = folders.find((candidate) => candidate.id === folderId);
  if (!folder) throw refusal(404, "studio_playlist_folder_not_found");
  return folder;
}

export function demoPlaylistFolders(): StudioPlaylistFoldersDTO {
  return {
    items: [...folders]
      .sort((first, second) => first.position - second.position)
      .map(copyOf),
  };
}

/** With `playlistId`, files it in the new folder in the same step. */
export function demoCreatePlaylistFolder(
  name: string,
  playlistId?: string,
): StudioPlaylistFolderDTO {
  if (folders.length >= STUDIO_PLAYLIST_FOLDER_LIMITS.foldersMax)
    throw refusal(409, "studio_playlist_folder_limit");
  createdCount += 1;
  const folder: StudioPlaylistFolderDTO = {
    id: `demo-folder-new-${createdCount}`,
    name: name.trim(),
    position:
      folders.reduce((highest, item) => Math.max(highest, item.position), -1) +
      1,
    createdAt: new Date().toISOString(),
    playlistIds: [],
  };
  folders = [...folders, folder];
  if (playlistId) demoMovePlaylistToFolder(playlistId, folder.id);
  return copyOf(folderOrThrow(folder.id));
}

export function demoUpdatePlaylistFolder(
  folderId: string,
  body: UpdateStudioPlaylistFolderBody,
): StudioPlaylistFolderDTO {
  const folder = folderOrThrow(folderId);
  if (body.name !== undefined) folder.name = body.name.trim();
  if (body.position !== undefined) {
    const others = demoPlaylistFolders().items.filter(
      (item) => item.id !== folderId,
    );
    const index = Math.min(body.position, others.length);
    const ordered = [...others.slice(0, index), folder, ...others.slice(index)];
    folders = ordered.map((item, position) => ({
      ...(item.id === folderId ? folder : folderOrThrow(item.id)),
      position,
    }));
  }
  return copyOf(folderOrThrow(folderId));
}

export function demoDeletePlaylistFolder(folderId: string): void {
  folderOrThrow(folderId);
  folders = folders.filter((folder) => folder.id !== folderId);
}

/** Files the playlist in one folder (out of any other), or with `null`
 *  puts it back at the top level. */
export function demoMovePlaylistToFolder(
  playlistId: string,
  folderId: string | null,
): void {
  if (folderId !== null) folderOrThrow(folderId);
  folders = folders.map((folder) => {
    const remaining = folder.playlistIds.filter((id) => id !== playlistId);
    return {
      ...folder,
      playlistIds:
        folder.id === folderId ? [...remaining, playlistId] : remaining,
    };
  });
}
