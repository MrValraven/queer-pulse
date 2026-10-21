import { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Collapse, CollapseListItem } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioLibrarySavedPage } from "./api/useStudioLibrarySaves";
import { useStudioMyPlaylists } from "./api/useStudioMyPlaylists";
import { studioListSortOf } from "./studioLibrarySort.data";
import { StudioRailFolder, StudioRailFolderMoveOut } from "./StudioRailFolder";
import { StudioRailFolderFilingProvider } from "./StudioRailFolder.filing";
import { useStudioRailFolders } from "./StudioRailFolder.rail";
import {
  StudioRailPlaylistMenu,
  type StudioRailMenuTarget,
} from "./StudioRailPlaylistMenu";
import {
  StudioRailLikedRow,
  StudioRailPlaylistRow,
} from "./StudioRailPlaylistRow";
import {
  StudioRailPlaylistsEmpty,
  StudioRailPlaylistsError,
  StudioRailPlaylistsMore,
  StudioRailPlaylistsNoMatches,
  StudioRailPlaylistsSkeleton,
  StudioRailPlaylistsTools,
} from "./StudioRailPlaylistStates";
import {
  RAIL_PLAYLIST_SORT_ACCESSORS,
  railPlaylistFilterText,
  toRailPlaylistRows,
  type StudioRailPlaylistRowModel,
} from "./studioRailPlaylistRows";
import { RAIL_PLAYLIST_FILTER_THRESHOLD } from "./studioRailPlaylists.data";
import { useStudioListFilter } from "./useStudioListFilter";
import {
  chainStudioPagers,
  distinctIdCount,
  useStudioLoadAllPages,
} from "./useStudioLoadAllPages";
import { useStudioRailCollapsed } from "./useStudioRailCollapsed";
import { useStudioRailMemory } from "./useStudioRailMemory";
import css from "./StudioRailPlaylists.module.css";

const LIKED_ROW_KEY = "studio-liked-songs";

/**
 * The rail's listening home: Liked songs pinned first, then the member's own
 * and collaborative playlists, then the ones they saved. It scrolls on its
 * own and keeps its place, sort and filter across pages (DES-52). Folded
 * (the rail's icon strip), it is a column of covers with tooltips. Past
 * eight playlists a filter box appears; the sort (Recent, Title, Creator) is remembered for
 * the tab. A row opens a menu on right-click or long-press (PRD-04) and
 * takes a dragged track when the member may add to it. Saved rows show
 * even while the member's own playlists load or fail; those states sit
 * under the list. Playlists share one route, so a row is active when the
 * open collection's id is its own. The member's folders sit between Liked
 * songs and the loose rows (StudioRailFolder.rail); a row drags onto a
 * folder, and its menu files it from the keyboard.
 */
export function StudioRailPlaylists() {
  const { t } = useTranslation();
  const mine = useStudioMyPlaylists({ silentError: true });
  const saved = useStudioLibrarySavedPage("studio_playlist");
  const rows = toRailPlaylistRows(mine.playlists, saved.items);
  const { pathname, search } = useLocation();
  const openPlaylistId =
    pathname === routes.studioCollection
      ? new URLSearchParams(search).get("id")
      : null;
  const listRef = useRef<HTMLElement>(null);
  const { isRailCollapsed } = useStudioRailCollapsed();
  const [menuTarget, setMenuTarget] = useState<StudioRailMenuTarget | null>(
    null,
  );
  const [editPendingId, setEditPendingId] = useState<string | null>(null);
  const isLoading = mine.loadState.isLoading;
  const memory = useStudioRailMemory(listRef, {
    isReady: !isLoading,
    activeKey: pathname === routes.studioLiked ? LIKED_ROW_KEY : openPlaylistId,
  });
  const { query, setQuery } = memory;
  // The folded strip shows every playlist: its filter waits for the rail.
  const activeQuery = isRailCollapsed ? "" : query;
  const listSort = studioListSortOf(memory.sort);
  const pager = chainStudioPagers(mine, saved);
  const loadError = mine.loadState.isError ? mine.loadState : saved.loadState;
  const shownRows = useStudioListFilter(
    rows,
    activeQuery,
    listSort,
    railPlaylistFilterText,
    RAIL_PLAYLIST_SORT_ACCESSORS,
  );
  const folders = useStudioRailFolders({
    rows,
    shownRows,
    isFiltering: activeQuery.trim() !== "",
    openPlaylistId,
    isCompact: isRailCollapsed,
  });
  // A folder lists every playlist filed in it, so a filed playlist on a
  // later page reads the rest, as a filter or a sort does.
  useStudioLoadAllPages(
    pager,
    activeQuery.trim() !== "" ||
      listSort !== "custom" ||
      folders.hasUnreadFiledPlaylists,
    distinctIdCount(mine.playlists) + saved.pagedCount,
  );
  const isFilterOffered = rows.length > RAIL_PLAYLIST_FILTER_THRESHOLD;
  // A filter that the list outgrows (a delete) clears with it, once the
  // member's own playlists are in (a remount restores it before they are).
  if (!isLoading && !isFilterOffered && query !== "") setQuery("");
  const isEmpty = !isLoading && !mine.loadState.isError && rows.length === 0;
  const hasNoMatches =
    activeQuery.trim() !== "" && !pager.hasMore && shownRows.length === 0;
  const isExpanded = !isRailCollapsed;
  const renderRow = (row: StudioRailPlaylistRowModel) => (
    <StudioRailPlaylistRow
      row={row}
      isActive={openPlaylistId === row.playlistId}
      isCompact={isRailCollapsed}
      isBusy={editPendingId === row.playlistId}
      onOpenMenu={(point) => setMenuTarget({ row, point })}
      dragSource={folders.dragSourceOf(row)}
    />
  );
  return (
    <nav
      ref={listRef}
      className={css.root}
      data-compact={isRailCollapsed || undefined}
      aria-label={t("studio:railPlaylists.label")}
    >
      <StudioRailFolderFilingProvider value={folders.filing}>
        <Collapse isOpen={isExpanded && rows.length > 1}>
          <StudioRailPlaylistsTools
            isFilterOffered={isFilterOffered}
            query={query}
            onQueryChange={setQuery}
            sort={memory.sort}
            onSortChange={memory.setSort}
          />
        </Collapse>
        <ul className={css.list}>
          <AnimatePresence initial={false}>
            <CollapseListItem key={LIKED_ROW_KEY}>
              <StudioRailLikedRow
                isActive={pathname === routes.studioLiked}
                isCompact={isRailCollapsed}
              />
            </CollapseListItem>
            {folders.groups.map((group) => (
              <CollapseListItem key={`folder:${group.folder.id}`}>
                <StudioRailFolder
                  {...group}
                  isCompact={isRailCollapsed}
                  renderRow={renderRow}
                />
              </CollapseListItem>
            ))}
            {folders.looseRows.map((row) => (
              <CollapseListItem key={row.key}>
                {renderRow(row)}
              </CollapseListItem>
            ))}
          </AnimatePresence>
        </ul>
        <StudioRailFolderMoveOut
          isOpen={folders.isMoveOutShown}
          isCompact={isRailCollapsed}
          onDropPlaylist={folders.onDropOut}
        />
        <Collapse isOpen={isExpanded && hasNoMatches}>
          <StudioRailPlaylistsNoMatches
            query={query}
            onClear={() => setQuery("")}
          />
        </Collapse>
        <Collapse isOpen={isExpanded && isLoading}>
          <StudioRailPlaylistsSkeleton />
        </Collapse>
        <Collapse isOpen={isExpanded && loadError.isError}>
          <StudioRailPlaylistsError loadState={loadError} />
        </Collapse>
        <Collapse isOpen={isExpanded && isEmpty}>
          <StudioRailPlaylistsEmpty />
        </Collapse>
        <Collapse
          isOpen={isExpanded && (pager.hasMore || pager.isFetchNextPageError)}
        >
          <StudioRailPlaylistsMore list={pager} />
        </Collapse>
        <StudioRailPlaylistMenu
          target={menuTarget}
          openPlaylistId={openPlaylistId}
          savedItems={saved.items}
          onEditPendingChange={setEditPendingId}
          onClose={() => setMenuTarget(null)}
        />
        {folders.overlays}
      </StudioRailFolderFilingProvider>
    </nav>
  );
}
