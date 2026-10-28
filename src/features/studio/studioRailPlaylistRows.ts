import { linkToPath } from "../../app/routeMap";
import {
  isSavedItemUnavailable,
  type SavedItem,
} from "../../app/providers/useSaved";
import type { ImageSlotTint } from "../../shared/components/ui";
import type { StudioPlaylistCardView } from "./api/studio.adapters";
import {
  RELEASE_SAVED_ID_PREFIX,
  SAVED_ID_PREFIX,
} from "./studioRailPlaylists.data";
import { savedCoverTintOf } from "./studioLibrarySort.data";

/** One playlist row in the Studio rail. */
export interface StudioRailPlaylistRowModel {
  kind: "playlist";
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
  /** The member owns it: Rename and Delete playlist. */
  isOwner: boolean;
  /** The owner or an active editor: Rename, and dropped tracks land in it. */
  hasEditRights: boolean;
  /** Tracks the member can play, for the add toast's count; null for a
   *  save, which carries none. */
  trackCount: number | null;
  /** The folded rail's cover over the playlist's tint: up to four release
   *  covers, or for a save the one cover the server last read for it. */
  coverUrls: string[];
  tint: ImageSlotTint;
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
      kind: "playlist",
      key: playlist.savedId,
      playlistId: playlist.id,
      name: playlist.name,
      href: playlist.href,
      ownerName: playlist.credit.name,
      isCollaborative: playlist.isCollaborative,
      isSaved: false,
      isOwner: playlist.isOwner,
      hasEditRights: playlist.hasEditRights,
      trackCount: playlist.trackCount,
      coverUrls: playlist.coverUrls,
      tint: playlist.tint,
    }));
  const ownSavedIds = new Set(ownRows.map((row) => row.key));
  const savedRows: StudioRailPlaylistRowModel[] = [];
  for (const item of savedItems) {
    if (isSavedItemUnavailable(item) || !item.href) continue;
    if (ownSavedIds.has(item.id)) continue;
    savedRows.push({
      kind: "playlist",
      key: item.id,
      playlistId: item.id.slice(SAVED_ID_PREFIX.length),
      name: item.title,
      href: linkToPath(item.href),
      ownerName: item.meta ?? null,
      isCollaborative: false,
      isSaved: true,
      isOwner: false,
      hasEditRights: false,
      trackCount: null,
      coverUrls: item.coverUrl ? [item.coverUrl] : [],
      tint: savedCoverTintOf(item.id),
    });
  }
  return [...ownRows, ...savedRows];
}

/** One liked release in the Studio rail: an album, or a show, which the
 *  saved store keeps as a release too. It opens its page and takes no
 *  dropped tracks. */
export interface StudioRailReleaseRowModel {
  kind: "release";
  /** The saved id: "studio_release:<id>". */
  key: string;
  releaseId: string;
  name: string;
  /** Router path, via linkToPath. */
  href: string;
  /** `SavedItem.meta`: the artist, or a show's "Podcast · {artist}" line. */
  artistLine: string | null;
  /** The cover as the server last read it, or null for none. */
  coverUrl: string | null;
  tint: ImageSlotTint;
}

/** Any row in the rail's list under Liked songs. */
export type StudioRailRowModel =
  StudioRailPlaylistRowModel | StudioRailReleaseRowModel;

export const isRailPlaylistRow = (
  row: StudioRailRowModel,
): row is StudioRailPlaylistRowModel => row.kind === "playlist";

/**
 * The rail's release rows: the albums and shows the member liked, in
 * saved-store order. As with saved playlists, a like that can no longer be
 * opened or that has no link is left out.
 */
export function toRailReleaseRows(
  savedReleases: SavedItem[],
): StudioRailReleaseRowModel[] {
  const rows: StudioRailReleaseRowModel[] = [];
  for (const item of savedReleases) {
    if (isSavedItemUnavailable(item) || !item.href) continue;
    if (!item.id.startsWith(RELEASE_SAVED_ID_PREFIX)) continue;
    rows.push({
      kind: "release",
      key: item.id,
      releaseId: item.id.slice(RELEASE_SAVED_ID_PREFIX.length),
      name: item.title,
      href: linkToPath(item.href),
      artistLine: item.meta ?? null,
      coverUrl: item.coverUrl ?? null,
      tint: savedCoverTintOf(item.id),
    });
  }
  return rows;
}

/** A row's second line as data: who made it or who it belongs to. */
const railRowCreditOf = (row: StudioRailRowModel) =>
  row.kind === "release" ? row.artistLine : row.ownerName;

/** What the rail's filter box matches: the name and who made it or who it
 *  belongs to. */
export const railPlaylistFilterText = (row: StudioRailRowModel) =>
  `${row.name} ${railRowCreditOf(row) ?? ""}`;

/** The rail's Creator sort reads the owner line, or a release's artist. */
export const RAIL_PLAYLIST_SORT_ACCESSORS = {
  title: (row: StudioRailRowModel) => row.name,
  artist: (row: StudioRailRowModel) => railRowCreditOf(row),
};
