import { useId } from "react";
import {
  Button,
  LoadErrorState,
  SegmentedControl,
  Sending,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { sectionRoom } from "../api/feedEpisodeMapping";
import type { SubprofileFeedDTO } from "../api/subprofileFeeds.api";
import { MAX_ITEMS_PER_SECTION } from "../subprofileEditor.data";
import { FeedEntryRow } from "./FeedEntryRow";
import { useFeedReview } from "./useFeedReview";
import styles from "./FeedReview.module.css";

/**
 * A feed's review queue: the episodes waiting for a decision (publish or
 * dismiss, one at a time or in bulk) and a Dismissed view where anything can
 * be restored. It says how much room the target section has and what happens
 * to episodes that do not fit, and reports every result in a live region.
 * Publishing is locked with a one-line reason while the editor has unsaved
 * edits (see `useFeedPublish`).
 */
export function FeedReviewQueue({
  feed,
  sectionLabel,
  sectionItemCount,
}: {
  feed: SubprofileFeedDTO;
  sectionLabel: string;
  sectionItemCount: number;
}) {
  const { t } = useTranslation();
  const review = useFeedReview(feed);
  const lockId = useId();
  const {
    view,
    entries,
    selectedEntries,
    entriesQuery,
    isBusy,
    lockReasonKey,
    message,
  } = review;

  const room = sectionRoom(sectionItemCount);
  const isPendingView = view === "pending";
  const cannotPublish = isBusy || lockReasonKey !== null || room === 0;
  const allSelected =
    entries.length > 0 && selectedEntries.length === entries.length;

  return (
    <div className={styles.queue}>
      <div className={styles.queueHead}>
        <SegmentedControl
          options={[
            {
              value: "pending",
              label: t("subprofiles:feedImport.review.viewNew"),
            },
            {
              value: "dismissed",
              label: t("subprofiles:feedImport.review.viewDismissed"),
            },
          ]}
          value={view}
          onChange={(next) =>
            review.setView(next === "dismissed" ? "dismissed" : "pending")
          }
          label={t("subprofiles:feedImport.review.viewLabel")}
        />
      </div>

      {isPendingView && entries.length > 0 && (
        <p className={styles.room}>
          {room === 0
            ? t("subprofiles:feedImport.review.roomNone", {
                section: sectionLabel,
                max: MAX_ITEMS_PER_SECTION,
              })
            : t("subprofiles:feedImport.review.room", {
                count: room,
                section: sectionLabel,
              })}{" "}
          {room > 0 && entries.length > room
            ? t("subprofiles:feedImport.review.overRoom", { room })
            : null}
        </p>
      )}

      {isPendingView && entries.length > 0 && (
        <div className={styles.toolbar}>
          <label className={styles.selectAll}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={review.toggleAll}
            />
            <span>
              {selectedEntries.length > 0
                ? t("subprofiles:feedImport.review.selected", {
                    count: selectedEntries.length,
                  })
                : t("subprofiles:feedImport.review.selectAll", {
                    count: entries.length,
                  })}
            </span>
          </label>
          <div className={styles.toolbarActions}>
            <Button
              variant="primary"
              size="sm"
              disabled={cannotPublish || selectedEntries.length === 0}
              aria-describedby={lockReasonKey ? lockId : undefined}
              onClick={() => void review.publishSelected()}
            >
              {review.isPublishing ? (
                <Sending
                  label={t("subprofiles:feedImport.review.publishing")}
                />
              ) : (
                t("subprofiles:feedImport.review.publishSelected")
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={cannotPublish}
              aria-describedby={lockReasonKey ? lockId : undefined}
              onClick={() => void review.publishAll()}
            >
              {t("subprofiles:feedImport.review.publishAll")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isBusy || selectedEntries.length === 0}
              onClick={() => void review.dismissSelected()}
            >
              {t("subprofiles:feedImport.review.dismiss")}
            </Button>
          </div>
          {lockReasonKey && (
            <p id={lockId} className={styles.lock}>
              {t(lockReasonKey)}
            </p>
          )}
        </div>
      )}

      {/* Always mounted, so a screen reader hears each result when it lands. */}
      <p className={styles.status} role="status">
        {message?.tone === "ok" ? message.text : ""}
      </p>
      <p className={styles.statusError} role="alert">
        {message?.tone === "error" ? message.text : ""}
      </p>

      {entriesQuery.isLoading ? (
        <SkeletonLine />
      ) : entriesQuery.isError ? (
        <LoadErrorState
          compact
          headingLevel={3}
          title={t("subprofiles:feedImport.review.loadError")}
          onRetry={() => void entriesQuery.refetch()}
          isRetrying={entriesQuery.isRefetching}
        />
      ) : entries.length === 0 ? (
        <p className={styles.empty}>
          {isPendingView
            ? t("subprofiles:feedImport.review.empty")
            : t("subprofiles:feedImport.review.emptyDismissed")}
        </p>
      ) : (
        <ul className={styles.list}>
          {review.visibleEntries.map((entry) => (
            <FeedEntryRow
              key={entry.id}
              entry={entry}
              mode={view}
              isSelected={review.selectedIds.has(entry.id)}
              isBusy={isBusy}
              onToggle={review.toggle}
              onRestore={(restored) => void review.restoreEntry(restored)}
            />
          ))}
        </ul>
      )}

      {review.hasMore && (
        <Button variant="ghost" size="sm" onClick={review.showMore}>
          {t("subprofiles:feedImport.review.showMore")}
        </Button>
      )}
    </div>
  );
}
