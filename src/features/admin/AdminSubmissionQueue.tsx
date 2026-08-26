import type { ReactNode } from "react";
import { FiClock } from "react-icons/fi";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { adminWaitingTone, daysWaitingSince } from "./adminSubmissionMeta";
import styles from "./AdminSubmissionList.module.css";

/**
 * The list machinery every member-submission queue in the console shares:
 * loading skeleton, error line, empty line, staggered rows, and the load-more
 * button. `AdminConcernsPage` and the intake console both render through it, so
 * the two cannot drift into two different-looking inboxes — each supplies only
 * its own row.
 */

/** How long something has been waiting for a human, coloured by how bad that
 *  is. Render it only on rows nobody has picked up yet. */
export function AdminWaitingChip({ since }: { since: string }) {
  const { t } = useTranslation();
  const daysWaiting = daysWaitingSince(since);
  const tone = adminWaitingTone(daysWaiting);
  return (
    <span
      className={`${styles.waiting} ${styles[`waiting--${tone}`]}`}
      data-tone={tone}
    >
      <FiClock className={styles.waitingIcon} aria-hidden />
      {daysWaiting === 0
        ? t("admin:adminIntakes.waiting.today")
        : t("admin:adminIntakes.waiting.days", { count: daysWaiting })}
    </span>
  );
}

export function AdminQueueSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className={styles.rows}>
      {Array.from({ length: rows }, (_unused, rowIndex) => (
        <SkeletonLine key={rowIndex} height={92} style={{ borderRadius: 22 }} />
      ))}
    </div>
  );
}

export interface AdminSubmissionQueueProps<Item> {
  items: Item[];
  itemKey: (item: Item) => string;
  renderItem: (item: Item) => ReactNode;
  isLoading: boolean;
  isError: boolean;
  errorText: string;
  emptyText: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  loadMoreLabel: string;
  loadingMoreLabel: string;
}

export function AdminSubmissionQueue<Item>({
  items,
  itemKey,
  renderItem,
  isLoading,
  isError,
  errorText,
  emptyText,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  loadMoreLabel,
  loadingMoreLabel,
}: AdminSubmissionQueueProps<Item>) {
  if (isLoading) return <AdminQueueSkeleton />;
  if (isError) return <p className={styles.emptyLine}>{errorText}</p>;
  if (items.length === 0)
    return <p className={styles.emptyLine}>{emptyText}</p>;

  return (
    <>
      <div className={styles.rows}>
        {items.map((item, index) => (
          <FadeIn key={itemKey(item)} delay={Math.min(index, 8) * 50}>
            {renderItem(item)}
          </FadeIn>
        ))}
      </div>
      {hasNextPage && (
        <div className={styles.loadMore}>
          <Button
            variant="ghost"
            size="md"
            disabled={isFetchingNextPage}
            onClick={onLoadMore}
          >
            {isFetchingNextPage ? loadingMoreLabel : loadMoreLabel}
          </Button>
        </div>
      )}
    </>
  );
}
