import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { FiFolderPlus, FiPlus } from "react-icons/fi";
import { Button, Collapse, LoadMoreFooter } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioLibrarySavedPage } from "./api/useStudioLibrarySaves";
import { useStudioMyPlaylists } from "./api/useStudioMyPlaylists";
import { useStudioPlaylistFolders } from "./api/useStudioPlaylistFolders";
import {
  LibraryEmpty,
  LibraryNoMatches,
  LibrarySavesError,
  type StudioLibraryListProps,
} from "./StudioLibraryEmpty";
import { StudioLibraryFolders } from "./StudioLibraryFolders";
import { StudioLibraryGrid } from "./StudioLibraryGrid";
import { StudioLibrarySavedList } from "./StudioLibrarySavedList";
import { StudioLikedSongsCard } from "./StudioLikedSongsCard";
import { StudioLoadError } from "./StudioLoadStates";
import {
  ownPlaylistFilterText,
  savedItemFilterText,
  studioListSortOf,
} from "./studioLibrarySort.data";
import { StudioPlaylistCard } from "./StudioPlaylistCard";
import { StudioPlaylistDialog } from "./StudioPlaylistDialog";
import { StudioPlaylistFolderDialog } from "./StudioPlaylistFolderDialog";
import { StudioCardSkeleton } from "./StudioSkeletons";
import { savedPlaylistIdOf } from "./useStudioLibrarySavedCard";
import { useStudioListFilter } from "./useStudioListFilter";
import {
  distinctIdCount,
  useStudioLoadAllPages,
} from "./useStudioLoadAllPages";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

const SKELETON_KEYS = ["skeleton-1", "skeleton-2", "skeleton-3"];
const titleText = (title: string) => title;

/** The member's own playlists and the ones they saved, each filtered and
 *  sorted over every page (a filter or a sort reads the rest first, and so
 *  does a filed playlist on a page not read yet, so every folder lists all
 *  it holds). Liked songs leads the grid while the filter matches it. */
function useLibraryPlaylistLists({ query, sort }: StudioLibraryListProps) {
  const { t } = useTranslation();
  const mine = useStudioMyPlaylists();
  const saved = useStudioLibrarySavedPage("studio_playlist");
  const listSort = studioListSortOf(sort);
  const { folderIdByPlaylistId } = useStudioPlaylistFolders();
  const readPlaylistIds = new Set([
    ...mine.playlists.map((playlist) => playlist.id),
    ...saved.items.map(savedPlaylistIdOf),
  ]);
  const hasUnreadFiledPlaylists = [...folderIdByPlaylistId.keys()].some(
    (playlistId) => !readPlaylistIds.has(playlistId),
  );
  const isNarrowed = query.trim() !== "" || listSort !== "custom";
  const shouldReadAll = isNarrowed || hasUnreadFiledPlaylists;
  useStudioLoadAllPages(mine, shouldReadAll, distinctIdCount(mine.playlists));
  useStudioLoadAllPages(saved, shouldReadAll, saved.pagedCount);
  const ownShown = useStudioListFilter(
    mine.playlists,
    query,
    listSort,
    ownPlaylistFilterText,
  );
  const savedShown = useStudioListFilter(
    saved.items,
    query,
    listSort,
    savedItemFilterText,
  );
  const likedMatches = useStudioListFilter(
    [t("studio:liked.title")],
    query,
    "custom",
    titleText,
  );
  return {
    mine,
    saved,
    ownShown,
    savedShown,
    isLikedShown: likedMatches.length > 0,
  };
}

/** The member's folders first (StudioLibraryFolders), then their own
 *  playlists with Create playlist and Create folder, then their saves. A
 *  filed playlist shows in its folder and in its own list, so the filter and
 *  the sort always reach every playlist. */
export function StudioLibraryPlaylists(props: StudioLibraryListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mine, saved, ownShown, savedShown, isLikedShown } =
    useLibraryPlaylistLists(props);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const isPlaylistsReady = !mine.loadState.isError && !mine.loadState.isLoading;
  // The empty state carries its own Create playlist action, so the header
  // pill appears only once at least one playlist has loaded.
  const hasOwnPlaylists = isPlaylistsReady && mine.playlists.length > 0;
  // A folder can hold saves alone, so Create folder needs any playlist.
  const hasAnyPlaylist =
    hasOwnPlaylists || (isPlaylistsReady && saved.items.length > 0);
  const isFiltering = props.query.trim() !== "";
  const hasNoMatches =
    isFiltering &&
    isPlaylistsReady &&
    (mine.playlists.length > 0 || saved.items.length > 0) &&
    !mine.hasMore &&
    !saved.hasMore &&
    !isLikedShown &&
    ownShown.length === 0 &&
    savedShown.length === 0;
  const mineHeadingId = useId();
  const savedHeadingId = useId();
  return (
    <>
      <StudioLibraryFolders
        ownShown={isPlaylistsReady ? ownShown : []}
        savedShown={savedShown}
        isFiltering={isFiltering}
      />
      <section className={styles.row} aria-labelledby={mineHeadingId}>
        <div className={styles.rowH}>
          <h2 id={mineHeadingId}>
            <Translation
              i18nKey="studio:libraryLive.yourPlaylists"
              components={{ em: <em /> }}
            />
          </h2>
          <Collapse isOpen={hasOwnPlaylists} isInitialSkipped={false}>
            <Button
              type="button"
              variant="quiet"
              size="sm"
              onClick={() => setIsCreating(true)}
            >
              <FiPlus aria-hidden /> {t("studio:libraryLive.newPlaylistCta")}
            </Button>
          </Collapse>
          <Collapse isOpen={hasAnyPlaylist} isInitialSkipped={false}>
            <Button
              type="button"
              variant="quiet"
              size="sm"
              onClick={() => setIsCreatingFolder(true)}
            >
              <FiFolderPlus aria-hidden />{" "}
              {t("studio:playlistFolders.create.menuItem")}
            </Button>
          </Collapse>
        </div>
        {/* Liked songs leads the grid: it needs no playlist load. */}
        <StudioLibraryGrid>
          {isLikedShown && <StudioLikedSongsCard key="liked" />}
          {mine.loadState.isLoading &&
            SKELETON_KEYS.map((key) => <StudioCardSkeleton key={key} />)}
          {isPlaylistsReady &&
            ownShown.map((playlist) => (
              <StudioPlaylistCard key={playlist.id} playlist={playlist} />
            ))}
        </StudioLibraryGrid>
        <Collapse isOpen={mine.loadState.isError}>
          <StudioLoadError
            loadState={mine.loadState}
            what="studio:errors.what.yourPlaylists"
          />
        </Collapse>
        <Collapse isOpen={isPlaylistsReady && mine.playlists.length === 0}>
          <LibraryEmpty
            titleKey="studio:libraryLive.empty.ownPlaylistsTitle"
            bodyKey="studio:libraryLive.empty.playlistsBody"
            onCreatePlaylist={() => setIsCreating(true)}
          />
        </Collapse>
        <Collapse isOpen={hasNoMatches}>
          <LibraryNoMatches
            query={props.query}
            onClearQuery={props.onClearQuery}
          />
        </Collapse>
        <Collapse isOpen={mine.hasMore || mine.isFetchNextPageError}>
          <div className={kit.moreFooter}>
            <LoadMoreFooter
              isFetchingNextPage={mine.isFetchingNextPage}
              isFetchNextPageError={mine.isFetchNextPageError}
              onLoadMore={mine.fetchNextPage}
              label={t("studio:playlist.add.showMore")}
              loadingLabel={t("studio:playlist.add.loadingMore")}
              errorMessage={t("studio:playlist.add.loadMoreError")}
            />
          </div>
        </Collapse>
      </section>
      <Collapse
        isOpen={
          savedShown.length > 0 ||
          saved.isFetchNextPageError ||
          saved.loadState.isError
        }
      >
        <section className={styles.row} aria-labelledby={savedHeadingId}>
          <div className={styles.rowH}>
            <h2 id={savedHeadingId}>
              <Translation
                i18nKey="studio:libraryLive.savedPlaylists"
                components={{ em: <em /> }}
              />
            </h2>
          </div>
          <StudioLibrarySavedList items={savedShown} />
          <Collapse isOpen={saved.loadState.isError}>
            <LibrarySavesError loadState={saved.loadState} />
          </Collapse>
          <Collapse isOpen={saved.hasMore || saved.isFetchNextPageError}>
            <div className={kit.moreFooter}>
              <LoadMoreFooter
                isFetchingNextPage={saved.isFetchingNextPage}
                isFetchNextPageError={saved.isFetchNextPageError}
                onLoadMore={saved.fetchNextPage}
                label={t("studio:libraryLive.showMoreSaves")}
                loadingLabel={t("studio:libraryLive.loadingMoreSaves")}
                errorMessage={t("studio:libraryLive.loadMoreSavesError")}
              />
            </div>
          </Collapse>
        </section>
      </Collapse>
      <AnimatePresence>
        {isCreating && (
          <StudioPlaylistDialog
            key="create"
            mode="create"
            onClose={() => setIsCreating(false)}
            onSaved={(playlist) => {
              setIsCreating(false);
              void navigate(playlist.href);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isCreatingFolder && (
          <StudioPlaylistFolderDialog
            key="createFolder"
            mode="create"
            onClose={() => setIsCreatingFolder(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
