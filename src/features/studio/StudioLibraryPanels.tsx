import { useId } from "react";
import { Collapse, LoadMoreFooter } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioFollowedArtists } from "./api/useStudioFollowedArtists";
import { useStudioLibrarySavedPage } from "./api/useStudioLibrarySaves";
import { StudioArtistCard } from "./StudioArtistCard";
import {
  LibraryEmpty,
  LibraryNoMatches,
  LibrarySavesError,
} from "./StudioLibraryEmpty";
import type { StudioLibraryListProps } from "./StudioLibraryEmpty";
import { StudioLibraryGrid } from "./StudioLibraryGrid";
import { StudioLibraryPlaylists } from "./StudioLibraryPlaylists";
import { StudioLibrarySavedList } from "./StudioLibrarySavedList";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioPurchaseList } from "./StudioPurchaseList";
import {
  artistFilterText,
  savedItemFilterText,
  STUDIO_LIBRARY_ARTIST_SORTS,
  studioListSortOf,
} from "./studioLibrarySort.data";
import type { StudioLibraryTab } from "./studioPaths";
import { StudioCardGridSkeleton } from "./StudioSkeletons";
import { useStudioListFilter } from "./useStudioListFilter";
import {
  distinctIdCount,
  useStudioLoadAllPages,
} from "./useStudioLoadAllPages";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

/** Saved releases as cards, every page (ENG-04): a filter or sort reads the
 *  rest first. Liked tracks have their own page (routes.studioLiked). */
function LibraryReleases({
  query,
  sort,
  onClearQuery,
}: StudioLibraryListProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const saved = useStudioLibrarySavedPage("studio_release");
  const listSort = studioListSortOf(sort);
  const isNarrowed = query.trim() !== "" || listSort !== "custom";
  useStudioLoadAllPages(saved, isNarrowed, saved.pagedCount);
  const shown = useStudioListFilter(
    saved.items,
    query,
    listSort,
    savedItemFilterText,
  );
  const hasItems = saved.items.length > 0;
  const isLoading = saved.loadState.isLoading && !hasItems;
  const isFailed = saved.loadState.isError && !hasItems;
  const isSettled = !isLoading && !isFailed && !saved.hasMore;
  return (
    <section className={styles.row} aria-labelledby={headingId}>
      <div className={styles.rowH}>
        <h2 id={headingId}>
          <Translation
            i18nKey="studio:libraryLive.savedReleases"
            components={{ em: <em /> }}
          />
        </h2>
      </div>
      <Collapse isOpen={isLoading}>
        <StudioCardGridSkeleton count={4} className={styles.rowGrid} />
      </Collapse>
      <Collapse isOpen={isFailed}>
        <StudioLoadError
          loadState={saved.loadState}
          what="studio:errors.what.savedReleases"
        />
      </Collapse>
      <StudioLibrarySavedList items={shown} />
      <Collapse isOpen={saved.loadState.isError && hasItems}>
        <LibrarySavesError loadState={saved.loadState} />
      </Collapse>
      <Collapse isOpen={isSettled && !hasItems}>
        <LibraryEmpty
          titleKey="studio:libraryLive.empty.releasesTitle"
          bodyKey="studio:libraryLive.empty.releasesBody"
        />
      </Collapse>
      <Collapse isOpen={isSettled && hasItems && shown.length === 0}>
        <LibraryNoMatches query={query} onClearQuery={onClearQuery} />
      </Collapse>
      <Collapse
        isOpen={hasItems && (saved.hasMore || saved.isFetchNextPageError)}
      >
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
  );
}

function LibraryArtists({ query, sort, onClearQuery }: StudioLibraryListProps) {
  const { t } = useTranslation();
  const followed = useStudioFollowedArtists();
  const listSort = studioListSortOf(sort, STUDIO_LIBRARY_ARTIST_SORTS);
  const isNarrowed = query.trim() !== "" || listSort !== "custom";
  useStudioLoadAllPages(
    followed,
    isNarrowed,
    distinctIdCount(followed.artists),
  );
  const shown = useStudioListFilter(
    followed.artists,
    query,
    listSort,
    artistFilterText,
  );
  const hasArtists = followed.artists.length > 0;
  const isLoading = followed.loadState.isLoading && !hasArtists;
  const isFailed = followed.loadState.isError && !hasArtists;
  const isSettled = !isLoading && !isFailed && !followed.hasMore;
  return (
    <>
      <Collapse isOpen={isLoading}>
        <StudioCardGridSkeleton count={4} className={styles.rowGrid} />
      </Collapse>
      <Collapse isOpen={isFailed}>
        <StudioLoadError
          loadState={followed.loadState}
          what="studio:errors.what.followedArtists"
        />
      </Collapse>
      <StudioLibraryGrid>
        {shown.map((artist) => (
          <StudioArtistCard key={artist.id} artist={artist} />
        ))}
      </StudioLibraryGrid>
      <Collapse isOpen={isSettled && !hasArtists}>
        <LibraryEmpty
          titleKey="studio:libraryLive.empty.artistsTitle"
          bodyKey="studio:libraryLive.empty.artistsBody"
        />
      </Collapse>
      <Collapse isOpen={isSettled && hasArtists && shown.length === 0}>
        <LibraryNoMatches query={query} onClearQuery={onClearQuery} />
      </Collapse>
      <Collapse isOpen={followed.hasMore || followed.isFetchNextPageError}>
        <div className={kit.moreFooter}>
          <LoadMoreFooter
            isFetchingNextPage={followed.isFetchingNextPage}
            isFetchNextPageError={followed.isFetchNextPageError}
            onLoadMore={followed.fetchNextPage}
            label={t("studio:libraryLive.showMoreArtists")}
            loadingLabel={t("studio:libraryLive.loadingMoreArtists")}
            errorMessage={t("studio:libraryLive.loadMoreArtistsError")}
          />
        </div>
      </Collapse>
    </>
  );
}

/** Purchases from artists, every status, newest first; no filter or sort. */
function StudioLibraryPurchases() {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <section className={styles.row} aria-labelledby={headingId}>
      <div className={styles.rowH}>
        <h2 id={headingId}>
          <Translation
            i18nKey="studio:purchase.list.heading"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.sub}>{t("studio:purchase.list.dek")}</p>
      </div>
      <StudioPurchaseList status="all" isStudioContext headingLevel={3} />
    </section>
  );
}

/** One library tab's content. */
export function StudioLibraryPanel({
  tab,
  ...listProps
}: StudioLibraryListProps & { tab: StudioLibraryTab }) {
  if (tab === "playlists") return <StudioLibraryPlaylists {...listProps} />;
  if (tab === "artists") return <LibraryArtists {...listProps} />;
  if (tab === "purchases") return <StudioLibraryPurchases />;
  return <LibraryReleases {...listProps} />;
}
