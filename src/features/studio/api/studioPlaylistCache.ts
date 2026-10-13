import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import {
  playableTracksOf,
  type StudioArtistView,
  type StudioPlaylistCardView,
  type StudioPlaylistEntryView,
  type StudioPlaylistView,
  type StudioSearchTrackView,
} from "./studio.adapters";
import { studioKeys } from "./studioQueryKeys";
import type { StudioPlaylistsPage } from "./useStudioMyPlaylists";

type MinePages = InfiniteData<StudioPlaylistsPage, string | null>;

/** How many release covers a playlist card shows. */
const PLAYLIST_COVER_LIMIT = 4;

/** A playlist view reduced to the card "your playlists" shows. */
export function cardOfPlaylist(
  playlist: StudioPlaylistView,
): StudioPlaylistCardView {
  return {
    id: playlist.id,
    name: playlist.name,
    credit: playlist.credit,
    coverUrls: playlist.coverUrls,
    tint: playlist.tint,
    trackCount: playlist.trackCount,
    totalDurationSeconds: playlist.totalDurationSeconds,
    updatedAt: playlist.updatedAt,
    isOwner: playlist.isOwner,
    visibility: playlist.visibility,
    visibilityLabelKey: playlist.visibilityLabelKey,
    href: playlist.href,
    savedId: playlist.savedId,
  };
}

/** Each playable release cover once, in playlist order, the first four:
 *  the same covers the server picks for the card. */
function coverUrlsOf(playableTracks: StudioSearchTrackView[]): string[] {
  const coverUrls = playableTracks.flatMap((track) =>
    track.release.coverUrl ? [track.release.coverUrl] : [],
  );
  return [...new Set(coverUrls)].slice(0, PLAYLIST_COVER_LIMIT);
}

/** The same playlist with new entries: renumbered, with the playable list,
 *  the count, the length and the covers recomputed from what can be played. */
function withEntries(
  playlist: StudioPlaylistView,
  entries: StudioPlaylistEntryView[],
): StudioPlaylistView {
  const renumbered = entries.map((entry, index) => ({
    ...entry,
    position: index + 1,
  }));
  const playableTracks = playableTracksOf(renumbered);
  return {
    ...playlist,
    entries: renumbered,
    playableTracks,
    coverUrls: coverUrlsOf(playableTracks),
    trackCount: playableTracks.length,
    totalDurationSeconds: playableTracks.reduce(
      (sum, track) => sum + (track.durationSeconds ?? 0),
      0,
    ),
  };
}

/** Entries in the given order. Ids it does not know are ignored, and any
 *  entry it leaves out keeps its relative place at the end. */
export function withEntryOrder(
  playlist: StudioPlaylistView,
  entryIds: string[],
): StudioPlaylistView {
  const entriesById = new Map(
    playlist.entries.map((entry) => [entry.entryId, entry]),
  );
  const ordered = entryIds.flatMap((entryId) => {
    const entry = entriesById.get(entryId);
    return entry ? [entry] : [];
  });
  const namedIds = new Set(entryIds);
  const rest = playlist.entries.filter((entry) => !namedIds.has(entry.entryId));
  return withEntries(playlist, [...ordered, ...rest]);
}

export function withoutEntry(
  playlist: StudioPlaylistView,
  entryId: string,
): StudioPlaylistView {
  return withEntries(
    playlist,
    playlist.entries.filter((entry) => entry.entryId !== entryId),
  );
}

/** The id order after moving one entry up or down, or null when the move
 *  would leave the list. */
export function movedEntryIds(
  entries: StudioPlaylistEntryView[],
  entryId: string,
  offset: -1 | 1,
): string[] | null {
  const index = entries.findIndex((entry) => entry.entryId === entryId);
  return index < 0 ? null : movedEntryIdsTo(entries, entryId, index + offset);
}

/** The id order after dropping an entry at a position, or null when that
 *  changes nothing or falls outside the list. */
export function movedEntryIdsTo(
  entries: StudioPlaylistEntryView[],
  draggedEntryId: string,
  targetIndex: number,
): string[] | null {
  const entryIds = entries.map((entry) => entry.entryId);
  const fromIndex = entryIds.indexOf(draggedEntryId);
  if (fromIndex < 0 || targetIndex < 0 || targetIndex >= entryIds.length)
    return null;
  if (fromIndex === targetIndex) return null;
  entryIds.splice(fromIndex, 1);
  entryIds.splice(targetIndex, 0, draggedEntryId);
  return entryIds;
}

/** Write a playlist into the caches that show it: its own key, and for the
 *  owner its card at the top of "your playlists" (newest updated first). */
export function storePlaylist(
  queryClient: QueryClient,
  demoMode: boolean,
  playlist: StudioPlaylistView,
): void {
  queryClient.setQueryData(
    studioKeys.playlist(demoMode, playlist.id),
    playlist,
  );
  if (!playlist.isOwner) return;
  const card = cardOfPlaylist(playlist);
  queryClient.setQueryData<MinePages>(
    studioKeys.myPlaylists(demoMode),
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page, index) => {
          const items = page.items.filter((item) => item.id !== card.id);
          return { ...page, items: index === 0 ? [card, ...items] : items };
        }),
      },
  );
}

export function dropPlaylist(
  queryClient: QueryClient,
  demoMode: boolean,
  playlistId: string,
): void {
  queryClient.removeQueries({
    queryKey: studioKeys.playlist(demoMode, playlistId),
  });
  queryClient.setQueryData<MinePages>(
    studioKeys.myPlaylists(demoMode),
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.filter((item) => item.id !== playlistId),
        })),
      },
  );
}

/** Demo artist views hold drafts that exist only in the cache, so they are
 *  patched in place: the playlist leaves every artist's list, and comes back
 *  on its persona's list while it is public and credited there. */
function syncDemoArtistPlaylists(
  queryClient: QueryClient,
  playlist: StudioPlaylistView | null,
  playlistId: string,
) {
  queryClient.setQueriesData<StudioArtistView>(
    { queryKey: ["studio", "artist", true] },
    (view) => {
      if (!view) return view;
      const others = view.playlists.filter((card) => card.id !== playlistId);
      const shownCard =
        playlist &&
        playlist.visibility === "public" &&
        playlist.credit.kind === "persona" &&
        playlist.credit.id === view.artist.id
          ? cardOfPlaylist(playlist)
          : null;
      return {
        ...view,
        playlists: shownCard ? [shownCard, ...others] : others,
      };
    },
  );
}

/** The lists derived from playlists: artist pages, track pages, member
 *  profiles, search, and "Your numbers" (public playlist inclusions move
 *  with adds, removes and visibility changes). Live invalidates them. Demo
 *  reads them from the in-memory store, which already holds the change, so
 *  they are invalidated too, except the artist views (see
 *  syncDemoArtistPlaylists). */
export function refreshPlaylistLists(
  queryClient: QueryClient,
  demoMode: boolean,
  playlist: StudioPlaylistView | null,
  playlistId: string,
): void {
  for (const family of [
    "trackPlaylists",
    "memberPlaylists",
    "search",
    "stats",
  ]) {
    void queryClient.invalidateQueries({ queryKey: ["studio", family] });
  }
  if (demoMode) syncDemoArtistPlaylists(queryClient, playlist, playlistId);
  else void queryClient.invalidateQueries({ queryKey: ["studio", "artist"] });
}
