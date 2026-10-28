import { useMemo } from "react";
import { useStudioLibrarySavedPage } from "./api/useStudioLibrarySaves";
import { useStudioMyPlaylists } from "./api/useStudioMyPlaylists";
import {
  toRailPlaylistRows,
  toRailReleaseRows,
  type StudioRailRowModel,
} from "./studioRailPlaylistRows";
import {
  chainStudioPagers,
  distinctIdCount,
  type StudioPager,
} from "./useStudioLoadAllPages";

/**
 * Everything the rail list reads: the member's own and collaborative
 * playlists, the playlists they saved, then the albums and shows they
 * liked (kept as release saves). One pager reads them in that order, each
 * source to its end before the next, and `distinctCount` counts every
 * distinct item read so far for a load-all run. A failed read of the
 * member's own playlists is the error the rail names first.
 */
export function useStudioRailRows() {
  const mine = useStudioMyPlaylists({ silentError: true });
  const savedPlaylists = useStudioLibrarySavedPage("studio_playlist");
  const savedReleases = useStudioLibrarySavedPage("studio_release");
  const rows: StudioRailRowModel[] = [
    ...toRailPlaylistRows(mine.playlists, savedPlaylists.items),
    ...toRailReleaseRows(savedReleases.items),
  ];
  const pager: StudioPager = chainStudioPagers(
    chainStudioPagers(mine, savedPlaylists),
    savedReleases,
  );
  const loadError = mine.loadState.isError
    ? mine.loadState
    : savedPlaylists.loadState.isError
      ? savedPlaylists.loadState
      : savedReleases.loadState;
  const savedItems = useMemo(
    () => [...savedPlaylists.items, ...savedReleases.items],
    [savedPlaylists.items, savedReleases.items],
  );
  return {
    rows,
    pager,
    loadError,
    /** The saves the rail shows, for the menu's Undo. */
    savedItems,
    isLoading: mine.loadState.isLoading,
    isOwnPlaylistsError: mine.loadState.isError,
    distinctCount:
      distinctIdCount(mine.playlists) +
      savedPlaylists.pagedCount +
      savedReleases.pagedCount,
  };
}
