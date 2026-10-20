import {
  Button,
  LoadMoreButton,
  LoadMoreStatus,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioLoadState } from "./api/studioLoadState";
import type { StudioPlaylistListResult } from "./api/useStudioMyPlaylists";
import { StudioLine } from "./StudioSkeletons";
import { RAIL_PLAYLIST_SKELETON_ROW_COUNT } from "./studioRailPlaylists.data";
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
        variant="ghost"
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

/** Show more for the member's own playlists; Studio pagers never auto-fetch,
 *  so a failed page can never loop. */
export function StudioRailPlaylistsMore({
  list,
}: {
  list: StudioPlaylistListResult;
}) {
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
