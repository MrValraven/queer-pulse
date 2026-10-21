import {
  Button,
  Collapse,
  LoadMoreButton,
  LoadMoreStatus,
  SearchInput,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioLoadState } from "./api/studioLoadState";
import { StudioLibrarySortMenu } from "./StudioLibraryToolbar";
import {
  STUDIO_LIBRARY_SORTS,
  type StudioLibrarySort,
} from "./studioLibrarySort.data";
import { StudioLine } from "./StudioSkeletons";
import { RAIL_PLAYLIST_SKELETON_ROW_COUNT } from "./studioRailPlaylists.data";
import type { StudioPager } from "./useStudioLoadAllPages";
import css from "./StudioRailPlaylists.module.css";

const SKELETON_ROW_INDEXES = Array.from(
  { length: RAIL_PLAYLIST_SKELETON_ROW_COUNT },
  (_, rowIndex) => rowIndex,
);

/** Placeholder rows while the member's own playlists load: a name line and
 *  a shorter owner line each, on the Studio shimmer. */
export function StudioRailPlaylistsSkeleton() {
  return (
    <div className={css.skeleton} aria-hidden>
      {SKELETON_ROW_INDEXES.map((rowIndex) => (
        <div key={rowIndex} className={css.skeletonRow}>
          <StudioLine width="70%" height={12} />
          <StudioLine width="45%" height={10} />
        </div>
      ))}
    </div>
  );
}

/** One quiet line and a Retry when the member's own playlists fail to load.
 *  `aria-disabled` keeps focus on Retry while it runs. */
export function StudioRailPlaylistsError({
  loadState,
}: {
  loadState: StudioLoadState;
}) {
  const { t } = useTranslation();
  return (
    <div className={css.state}>
      <p className={css.stateText}>{t("studio:railPlaylists.loadError")}</p>
      <Button
        type="button"
        variant="quiet"
        size="sm"
        onClick={() => {
          if (!loadState.isRetrying) loadState.retry();
        }}
        aria-disabled={loadState.isRetrying || undefined}
      >
        {loadState.isRetrying
          ? t("shared:loadError.retryingCta")
          : t("common:error.retry")}
      </Button>
    </div>
  );
}

/** Show more for the member's own playlists, then their saved ones. It
 *  reads one page per press (a filter or a sort reads the rest itself), and
 *  a failed page stops there, so it can never loop. */
export function StudioRailPlaylistsMore({ list }: { list: StudioPager }) {
  const { t } = useTranslation();
  return (
    <div className={css.state}>
      <LoadMoreStatus
        isFetchingNextPage={list.isFetchingNextPage}
        isFetchNextPageError={list.isFetchNextPageError}
        errorMessage={t("studio:playlist.add.loadMoreError")}
        messageClassName={css.stateText}
      />
      <LoadMoreButton
        isFetchingNextPage={list.isFetchingNextPage}
        isFetchNextPageError={list.isFetchNextPageError}
        onLoadMore={list.fetchNextPage}
        label={t("studio:playlist.add.showMore")}
        loadingLabel={t("studio:playlist.add.loadingMore")}
        size="sm"
      />
    </div>
  );
}

/** The member has no playlists of their own and has saved none. */
export function StudioRailPlaylistsEmpty() {
  const { t } = useTranslation();
  return (
    <div className={css.state}>
      <p className={css.stateText}>{t("studio:railPlaylists.empty")}</p>
    </div>
  );
}

/** The sort, and past eight playlists the filter box, above the rows. */
export function StudioRailPlaylistsTools({
  isFilterOffered,
  query,
  onQueryChange,
  sort,
  onSortChange,
}: {
  isFilterOffered: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  sort: StudioLibrarySort;
  onSortChange: (sort: StudioLibrarySort) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={css.tools}>
      <div className={css.toolsRow}>
        <span className={css.toolsLabel}>
          {t("studio:railPlaylists.sortLabel")}
        </span>
        <StudioLibrarySortMenu
          sort={sort}
          options={STUDIO_LIBRARY_SORTS}
          onSortChange={onSortChange}
          className={css.sortTrigger}
        />
      </div>
      <Collapse isOpen={isFilterOffered}>
        <SearchInput
          value={query}
          onChange={onQueryChange}
          ariaLabel={t("studio:railPlaylists.filterLabel")}
          placeholder={t("studio:railPlaylists.filterPlaceholder")}
          className={css.filter}
        />
      </Collapse>
    </div>
  );
}

/** The filter matched no playlist: say so and offer to clear it. */
export function StudioRailPlaylistsNoMatches({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={css.state}>
      <p className={css.stateText}>
        {t("studio:railPlaylists.noMatches", { query: query.trim() })}
      </p>
      <Button type="button" variant="quiet" size="sm" onClick={onClear}>
        {t("studio:libraryLive.clearFilterCta")}
      </Button>
    </div>
  );
}
