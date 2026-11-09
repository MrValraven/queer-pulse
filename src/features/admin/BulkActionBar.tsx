import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { Button } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { describeErrorToast } from "../../shared/api/errorMessage";
import { useBulkListingAction } from "./api/useBulkListingAction";
import { BulkPublishConfirmModal } from "./BulkPublishConfirmModal";
import { BulkRemoveConfirmModal } from "./BulkRemoveConfirmModal";
import {
  LISTING_BULK_ACTION_CAP,
  type ListingQueueRow,
} from "./api/adminListings.api";
import styles from "./AdminListingsPage.module.css";

/** The bar's rendered height, published on the root element so the page can
 *  reserve exactly that much room below the queue (`.queueWithBulkBar`). */
const BULK_BAR_HEIGHT_PROPERTY = "--bulk-bar-h";

/** Keeps `--bulk-bar-h` in step with the bar's height (it changes between
 *  the one-row pill and the two-line phone card, and when the cap note
 *  appears), and removes it when the bar unmounts. */
function usePublishedBarHeight(barRef: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const barElement = barRef.current;
    if (!barElement || typeof ResizeObserver === "undefined") return;
    const rootStyle = document.documentElement.style;
    const publishHeight = () =>
      rootStyle.setProperty(
        BULK_BAR_HEIGHT_PROPERTY,
        `${Math.ceil(barElement.offsetHeight)}px`,
      );
    publishHeight();
    const resizeObserver = new ResizeObserver(publishHeight);
    resizeObserver.observe(barElement);
    return () => {
      resizeObserver.disconnect();
      rootStyle.removeProperty(BULK_BAR_HEIGHT_PROPERTY);
    };
  }, [barRef]);
}

/**
 * Floating action bar for the moderation queue's multi-select: mount it only
 * while `selectedRefs.size > 0` (the page does this), and it disappears the
 * moment the selection empties: on `onClear`, or automatically once a bulk
 * action here succeeds. All three actions run through `useBulkListingAction`,
 * whose unified `isPending` disables every button here together, the same
 * unified-disabled contract `useListingModeration` gives the single-row
 * cluster. Publish and Remove each confirm first (`BulkPublishConfirmModal`,
 * `BulkRemoveConfirmModal`), since one puts listings in front of members and
 * the other is destructive; Back to review fires immediately.
 *
 * `selectedRows` carries each selected listing's status, so Publish and Back
 * to review act only on the listings they would actually move: Publish sends
 * every selected listing that is in review or has a question, and Back to
 * review sends every one that is live or has a question. The success toast
 * then counts real changes. A button whose action would move nothing is
 * disabled with a tooltip naming why; when only part of the selection would
 * move, its label names that count ("Publish 3 live"). Delete always acts on
 * the whole selection.
 */
export function BulkActionBar({
  selectedRefs,
  selectedRows,
  onClear,
}: {
  selectedRefs: Set<string>;
  /** The loaded queue rows whose refs are in `selectedRefs`. */
  selectedRows: ListingQueueRow[];
  onClear: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { bulkSetStatus, bulkRemove, isPending } = useBulkListingAction();
  const [confirmingPublish, setConfirmingPublish] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  usePublishedBarHeight(barRef);
  const refs = Array.from(selectedRefs);
  const count = refs.length;
  const statusByRef = new Map(selectedRows.map((row) => [row.ref, row.status]));
  // A ref with no loaded row keeps its place in both actions, and the
  // backend decides whether it moves.
  const publishableRefs = refs.filter((ref) => statusByRef.get(ref) !== "live");
  const sendBackRefs = refs.filter((ref) => statusByRef.get(ref) !== "review");
  const publishableCount = publishableRefs.length;
  const sendBackCount = sendBackRefs.length;
  const isPublishMovingNothing = publishableCount === 0;
  const isSendBackMovingNothing = sendBackCount === 0;
  const publishLabel =
    publishableCount === count || isPublishMovingNothing
      ? t("admin:adminListings.bulk.publishCta")
      : t("admin:adminListings.bulk.publishCountCta", {
          count: publishableCount,
        });
  const sendBackLabel =
    sendBackCount === count || isSendBackMovingNothing
      ? t("admin:adminListings.bulk.sendBackCta")
      : t("admin:adminListings.bulk.sendBackCountCta", {
          count: sendBackCount,
        });

  async function confirmPublish() {
    try {
      await bulkSetStatus(publishableRefs, "live");
      setConfirmingPublish(false);
      onClear();
    } catch (caught) {
      showToast(
        describeErrorToast(
          t("admin:adminListings.bulk.action.publish"),
          caught,
        ),
        "error",
      );
    }
  }

  async function sendBackToReview() {
    try {
      await bulkSetStatus(sendBackRefs, "review");
      onClear();
    } catch (caught) {
      showToast(
        describeErrorToast(
          t("admin:adminListings.bulk.action.sendBack"),
          caught,
        ),
        "error",
      );
    }
  }

  async function confirmRemove(reason?: string) {
    try {
      await bulkRemove(refs, reason);
      setConfirmingRemove(false);
      onClear();
    } catch (caught) {
      showToast(
        describeErrorToast(t("admin:adminListings.bulk.action.remove"), caught),
        "error",
      );
    }
  }

  return (
    <>
      <div
        ref={barRef}
        className={styles.bulkBar}
        role="region"
        aria-label={t("admin:adminListings.bulk.ariaLabel")}
      >
        {/* The selection summary: the count, the cap note, and Clear, which
            sits beside the count it resets. */}
        <div className={styles.bulkSummary}>
          {/* `role="status"` (implicit `aria-live="polite"` + `aria-atomic`)
              so a screen-reader user is told the bar appeared and hears the
              count update as it changes. The bar itself is inserted with no
              focus move, so nothing else would announce it (WCAG 4.1.3). */}
          <span className={styles.bulkCount} role="status">
            <Translation
              i18nKey="admin:adminListings.bulk.selectedCount"
              values={{ count }}
              slots={{
                count: (
                  <RollingNumber
                    value={fmt.number(count)}
                    numericValue={count}
                  />
                ),
              }}
            />
          </span>
          {count >= LISTING_BULK_ACTION_CAP && (
            <span className={styles.bulkCapNote}>
              {t("admin:adminListings.bulk.capNote", {
                cap: LISTING_BULK_ACTION_CAP,
              })}
            </span>
          )}
          <Button
            variant="ghost-dark"
            size="sm"
            className={styles.bulkClear}
            onClick={onClear}
            disabled={isPending}
          >
            {t("admin:adminListings.bulk.clearCta")}
          </Button>
        </div>
        <div className={styles.bulkActions}>
          <Button
            variant="jade"
            onClick={() => setConfirmingPublish(true)}
            disabled={isPending || isPublishMovingNothing}
            title={
              isPublishMovingNothing
                ? t("admin:adminListings.bulk.publishDisabledReason")
                : undefined
            }
          >
            {publishLabel}
          </Button>
          <Button
            variant="ghost-dark"
            onClick={() => void sendBackToReview()}
            disabled={isPending || isSendBackMovingNothing}
            title={
              isSendBackMovingNothing
                ? t("admin:adminListings.bulk.sendBackDisabledReason")
                : undefined
            }
          >
            {sendBackLabel}
          </Button>
          <Button
            variant="danger"
            onClick={() => setConfirmingRemove(true)}
            disabled={isPending}
          >
            {t("admin:adminListings.bulk.removeCta")}
          </Button>
        </div>
      </div>
      {confirmingPublish && (
        <BulkPublishConfirmModal
          count={publishableCount}
          pending={isPending}
          onConfirm={() => void confirmPublish()}
          onClose={() => setConfirmingPublish(false)}
        />
      )}
      {confirmingRemove && (
        <BulkRemoveConfirmModal
          count={count}
          pending={isPending}
          onConfirm={(reason) => void confirmRemove(reason)}
          onClose={() => setConfirmingRemove(false)}
        />
      )}
    </>
  );
}
