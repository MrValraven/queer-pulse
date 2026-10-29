import { AnimatePresence } from "motion/react";
import { FiMusic } from "react-icons/fi";
import { reasonFor } from "../../../shared/api/errorMessage";
import {
  Collapse,
  CollapseListItem,
  EmptyState,
  LoadErrorState,
  LoadMoreButton,
  LoadMoreStatus,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useMusicEventList } from "./api/useMusicEvents";
import type { MusicEventBucket } from "./api/musicEvents.types";
import { AdminMusicEventRow } from "./AdminMusicEventRow";
import { AdminMusicEventsSkeleton } from "./AdminMusicEventStates";
import { EMPTY_COPY_KEYS } from "./musicEventList.data";
import styles from "./AdminMusicEvents.module.css";

/**
 * One bucket of house music events. Every state (loading, a failed first
 * page, empty, rows) sits in its own fold, so moving between them animates.
 * A failed later page keeps the loaded rows and turns the footer into a
 * retry. The list pages only on a press of Show more events.
 */
export function AdminMusicEventsList({ bucket }: { bucket: MusicEventBucket }) {
  const { t } = useTranslation();
  const list = useMusicEventList(bucket);
  const { rows } = list;
  const hasRows = rows.length > 0;
  const isEmpty = !list.isLoading && !list.isLoadError && !hasRows;
  const isLoadErrorShown = list.isLoadError && list.errorUpdateCount > 0;
  const emptyCopy = EMPTY_COPY_KEYS[bucket];

  return (
    <>
      <Collapse isOpen={list.isLoading}>
        <AdminMusicEventsSkeleton />
      </Collapse>
      <Collapse isOpen={isLoadErrorShown}>
        <LoadErrorState
          className={styles.listState}
          compact
          headingLevel={2}
          title={t("admin:musicEvents.loadError")}
          description={reasonFor(list.error) ?? undefined}
          onRetry={list.retry}
          isRetrying={list.isRetrying}
        />
      </Collapse>
      <Collapse isOpen={isEmpty}>
        <EmptyState
          className={styles.listState}
          compact
          headingLevel={2}
          icon={<FiMusic aria-hidden />}
          title={t(emptyCopy.title)}
          description={t(emptyCopy.body)}
        />
      </Collapse>
      <Collapse isOpen={hasRows}>
        <ul className={styles.rows}>
          <AnimatePresence initial={false}>
            {rows.map((row) => (
              <CollapseListItem key={row.slug}>
                <AdminMusicEventRow row={row} />
              </CollapseListItem>
            ))}
          </AnimatePresence>
        </ul>
        <LoadMoreStatus
          isFetchingNextPage={list.isFetchingMore}
          isFetchNextPageError={list.isLoadMoreError}
          errorMessage={t("admin:musicEvents.loadError")}
        />
        <Collapse isOpen={list.hasMore}>
          <div className={styles.loadMore}>
            <LoadMoreButton
              isFetchingNextPage={list.isFetchingMore}
              isFetchNextPageError={list.isLoadMoreError}
              onLoadMore={list.loadMore}
              label={t("admin:musicEvents.loadMore")}
              loadingLabel={t("shared:loading.label")}
            />
          </div>
        </Collapse>
      </Collapse>
    </>
  );
}
