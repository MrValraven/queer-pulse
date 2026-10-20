import { linkToPath } from "../../app/routeMap";
import {
  isSavedItemUnavailable,
  type SavedItem,
} from "../../app/providers/useSaved";
import type { StudioPlaylistCardView } from "./api/studio.adapters";
import { SAVED_ID_PREFIX } from "./studioRailPlaylists.data";

/** One playlist row in the Studio rail. */
export interface StudioRailPlaylistRowModel {
  /** The saved id: "studio_playlist:<id>". */
  key: string;
  playlistId: string;
  name: string;
  /** Router path, via linkToPath for saves. */
  href: string;
  /** The credit name, or `SavedItem.meta` for a save. */
  ownerName: string | null;
  isCollaborative: boolean;
  isSaved: boolean;
}

/**
 * The rail's playlist rows: the member's own and collaborative playlists in
 * server order, then the playlists they saved, in saved-store order. A
 * pending invite stays out until the member accepts it (the invite lives in
 * their Library). A save that can no longer be opened, that has no link, or
 * that is already one of the member's own playlists is left out.
 */
export function toRailPlaylistRows(
  ownPlaylists: StudioPlaylistCardView[],
  savedItems: SavedItem[],
): StudioRailPlaylistRowModel[] {
  const ownRows = ownPlaylists
    .filter((playlist) => playlist.role !== "invitee")
    .map((playlist): StudioRailPlaylistRowModel => ({
      key: playlist.savedId,
      playlistId: playlist.id,
      name: playlist.name,
      href: playlist.href,
      ownerName: playlist.credit.name,
      isCollaborative: playlist.isCollaborative,
      isSaved: false,
    }));
  const ownSavedIds = new Set(ownRows.map((row) => row.key));
  const savedRows: StudioRailPlaylistRowModel[] = [];
  for (const item of savedItems) {
    if (isSavedItemUnavailable(item) || !item.href) continue;
    if (ownSavedIds.has(item.id)) continue;
    savedRows.push({
      key: item.id,
      playlistId: item.id.slice(SAVED_ID_PREFIX.length),
      name: item.title,
      href: linkToPath(item.href),
      ownerName: item.meta ?? null,
      isCollaborative: false,
      isSaved: true,
    });
  }
  return [...ownRows, ...savedRows];
}
