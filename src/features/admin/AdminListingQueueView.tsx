import { FiAlertTriangle } from "react-icons/fi";
import { Button, EmptyState, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminPanel } from "./ui";
import { AdminListingRows, ListingRowsSkeleton } from "./AdminListingRows";
import { AdminListingsHeader } from "./AdminListingsHeader";
import { BulkActionBar } from "./BulkActionBar";
import type { ListingQueueState } from "./useListingQueueState";
import styles from "./AdminListingsPage.module.css";

/**
 * The Submissions view: the filter bar, then one queue panel holding the body
 * (skeleton, error, or the rows), then the load-more button. While a selection
 * is active, the bulk-bar reserve pads below the panel and the floating bar
 * mounts.
 */
export function AdminListingQueueView({ queue }: { queue: ListingQueueState }) {
  const { t } = useTranslation();
  return (
    <>
      <FadeIn
        delay={70}
        className={
          queue.hasRowsBody && queue.hasSelection
            ? styles.queueWithBulkBar
            : undefined
        }
      >
        <AdminListingsHeader
          value={{
            q: queue.searchQuery,
            sort: queue.sort,
            status: queue.filter,
          }}
          counts={queue.counts}
          onChange={queue.handleHeaderChange}
        />
        <AdminPanel
          padding="flush"
          isOverflowVisible
          className={styles.queuePanel}
        >
          {queue.isLoading ? (
            <ListingRowsSkeleton />
          ) : queue.hasRowsBody ? (
            <AdminListingRows
              rows={queue.rows}
              searchQuery={queue.searchQuery}
              statusFilter={queue.filter}
              selectedRefs={queue.selectedRefs}
              atSelectionCap={queue.atSelectionCap}
              animateEntrance={queue.animateRowEntrance}
              onOpen={queue.setOpenRow}
              onToggle={queue.toggleSelected}
              onToggleAll={queue.toggleSelectAll}
            />
          ) : (
            // A failed fetch must read as an outage. `EmptyQueueState`'s
            // plum "queue is empty" success panel is reserved for a
            // genuinely empty queue after a successful fetch.
            <div className={styles.panelMessage}>
              <ListingQueueErrorState onRetry={() => void queue.refetch()} />
            </div>
          )}
        </AdminPanel>
        {queue.hasRowsBody && queue.hasNextPage && (
          <div className={styles.loadMore}>
            <Button
              variant="ghost"
              size="md"
              onClick={() => void queue.fetchNextPage()}
              disabled={queue.isFetchingNextPage}
            >
              {t("admin:adminListings.loadMoreCta")}
            </Button>
          </div>
        )}
      </FadeIn>
      {/* Mounted outside the FadeIn and the panel: both are containing
          blocks for fixed descendants (`will-change: transform`, the
          container query), and the bar floats against the viewport. */}
      {queue.hasRowsBody && queue.hasSelection && (
        <BulkActionBar
          selectedRefs={queue.selectedRefs}
          selectedRows={queue.rows.filter((row) =>
            queue.selectedRefs.has(row.ref),
          )}
          onClear={queue.clearSelection}
        />
      )}
    </>
  );
}

/** Branded, retryable error state, mirroring `QueueErrorPane` in
 *  `AdminModerationPanes.tsx`. A failed live fetch must read as an outage a
 *  moderator can recover from; the "nothing to review" state is kept for a
 *  genuinely empty queue. Demo mode never errors, so this only ever fires
 *  against the real API. */
function ListingQueueErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiAlertTriangle />}
      title={t("common:error.title")}
      description={t("common:error.description")}
      action={{ label: t("common:error.retry"), onClick: onRetry }}
    />
  );
}
