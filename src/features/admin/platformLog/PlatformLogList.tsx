import {
  EmptyState,
  LoadErrorState,
  LoadMoreFooter,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  hasFailedWithoutData,
  isRetryingFailedRead,
} from "../queryLoadFailure";
import {
  dayLabel,
  groupByDay,
  localDayKey,
  type PlatformLogPartyView,
  type PlatformLogRowView,
} from "./api/platformLog.adapters";
import type { PlatformLogQuery } from "./api/usePlatformLog";
import { PlatformLogRow } from "./PlatformLogRow";
import styles from "./AdminPlatformLogPage.module.css";

const SKELETON_ROWS = 6;

export function PlatformLogList({
  rows,
  query,
  onFilterMember,
  onClearFilters,
}: {
  rows: PlatformLogRowView[];
  query: PlatformLogQuery;
  onFilterMember: (party: PlatformLogPartyView) => void;
  /** Offered in the empty state while any filter is narrowing the log. */
  onClearFilters?: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  // A failed next page keeps `data`, so this only fires when nothing loaded,
  // and it stays true while a Retry of that failure runs.
  if (hasFailedWithoutData(query)) {
    return (
      <LoadErrorState
        headingLevel={2}
        isRetrying={isRetryingFailedRead(query)}
        onRetry={() => void query.refetch()}
        title={t("admin:platformLog.error.title")}
        description={t("admin:platformLog.error.body")}
      />
    );
  }

  if (query.isPending) {
    return (
      <div className={styles.card} aria-busy="true">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <div key={index} className={styles.skeletonRow}>
            <SkeletonLine height={42} />
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        compact
        headingLevel={2}
        title={t("admin:platformLog.empty.title")}
        description={t("admin:platformLog.empty.body")}
        action={
          onClearFilters
            ? {
                label: t("admin:platformLog.empty.clearFilters"),
                onClick: onClearFilters,
              }
            : undefined
        }
      />
    );
  }

  const now = new Date();
  const todayKey = localDayKey(now);
  return (
    <div className={styles.card}>
      {groupByDay(rows).map((group) => {
        const headingId = `platform-log-day-${group.dayKey}`;
        return (
          <section
            key={group.dayKey}
            aria-labelledby={headingId}
            className={styles.day}
          >
            <h2 id={headingId} className={styles.dayHeading}>
              {dayLabel(group.dayKey, now, t, fmt)}
            </h2>
            <ol className={styles.list}>
              {group.rows.map((row) => (
                <PlatformLogRow
                  key={row.id}
                  row={row}
                  isToday={group.dayKey === todayKey}
                  onFilterMember={onFilterMember}
                />
              ))}
            </ol>
          </section>
        );
      })}
      {query.hasNextPage || query.isFetchNextPageError ? (
        <LoadMoreFooter
          className={styles.loadMore}
          isFetchingNextPage={query.isFetchingNextPage}
          isFetchNextPageError={query.isFetchNextPageError}
          onLoadMore={() => void query.fetchNextPage()}
          label={t("admin:platformLog.loadMore")}
          loadingLabel={t("admin:platformLog.loadingMore")}
          errorMessage={t("admin:platformLog.loadMoreError")}
        />
      ) : null}
    </div>
  );
}
