import { AnimatePresence } from "motion/react";
import { FiMusic } from "react-icons/fi";
import { reasonFor } from "../../../shared/api/errorMessage";
import {
  EmptyState,
  LoadErrorState,
  LoadMoreButton,
  LoadMoreStatus,
} from "../../../shared/components/ui";
import { FadeListItem } from "../../../shared/components/ui/ViewFade";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { MusicEventListResult } from "./api/useMusicEvents";
import type { MusicEventBucket } from "./api/musicEvents.types";
import { AdminMusicEventRow } from "./AdminMusicEventRow";
import { AdminMusicEventsSkeleton } from "./AdminMusicEventStates";
import { EMPTY_COPY_KEYS } from "./musicEventList.data";
import type { MusicEventListViewName } from "./musicEventListView";
import styles from "./AdminMusicEvents.module.css";

/**
 * The content of one list view. It holds no animation of its own: the parent
 * swaps whole views with a fade and eases the panel height once. Rows that
 * arrive with the view appear at rest; rows a "Show more" press appends fade
 * in beside them.
 */
export function AdminMusicEventsListView({
  viewName,
  bucket,
  list,
}: {
  viewName: MusicEventListViewName;
  bucket: MusicEventBucket;
  list: MusicEventListResult;
}) {
  const { t } = useTranslation();
  const emptyCopy = EMPTY_COPY_KEYS[bucket];

  if (viewName === "loading") return <AdminMusicEventsSkeleton />;
  if (viewName === "error") {
    return (
      <LoadErrorState
        className={styles.listState}
        compact
        headingLevel={2}
        title={t("admin:musicEvents.loadError")}
        description={reasonFor(list.error) ?? undefined}
        onRetry={list.retry}
        isRetrying={list.isRetrying}
      />
    );
  }
  if (viewName === "empty") {
    return (
      <EmptyState
        className={styles.listState}
        compact
        headingLevel={2}
        icon={<FiMusic aria-hidden />}
        title={t(emptyCopy.title)}
        description={t(emptyCopy.body)}
      />
    );
  }
  if (viewName === "none") return null;
  return (
    <>
      <ul className={styles.rows}>
        <AnimatePresence initial={false}>
          {list.rows.map((row) => (
            <FadeListItem key={row.slug}>
              <AdminMusicEventRow row={row} />
            </FadeListItem>
          ))}
        </AnimatePresence>
      </ul>
      <LoadMoreStatus
        isFetchingNextPage={list.isFetchingMore}
        isFetchNextPageError={list.isLoadMoreError}
        errorMessage={t("admin:musicEvents.loadError")}
      />
      {list.hasMore && (
        <div className={styles.loadMore}>
          <LoadMoreButton
            isFetchingNextPage={list.isFetchingMore}
            isFetchNextPageError={list.isLoadMoreError}
            onLoadMore={list.loadMore}
            label={t("admin:musicEvents.loadMore")}
            loadingLabel={t("shared:loading.label")}
          />
        </div>
      )}
    </>
  );
}
