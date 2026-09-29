import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { Button } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { describeError } from "../../shared/api/errorMessage";
import { useBulkListingAction } from "./api/useBulkListingAction";
import { BulkRemoveConfirmModal } from "./BulkRemoveConfirmModal";
import { LISTING_BULK_ACTION_CAP } from "./api/adminListings.api";
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
 * cluster. Remove routes through its own confirm dialog (`BulkRemoveConfirmModal`)
 * since it's destructive; the other two fire immediately.
 */
export function BulkActionBar({
  selectedRefs,
  onClear,
}: {
  selectedRefs: Set<string>;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { bulkSetStatus, bulkRemove, isPending } = useBulkListingAction();
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  usePublishedBarHeight(barRef);
  const refs = Array.from(selectedRefs);
  const count = refs.length;

  async function publishLive() {
    try {
      await bulkSetStatus(refs, "live");
      onClear();
    } catch (caught) {
      showToast(
        describeError(t("admin:adminListings.bulk.action.publish"), caught),
        "error",
      );
    }
  }

  async function sendBackToReview() {
    try {
      await bulkSetStatus(refs, "review");
      onClear();
    } catch (caught) {
      showToast(
        describeError(t("admin:adminListings.bulk.action.sendBack"), caught),
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
        describeError(t("admin:adminListings.bulk.action.remove"), caught),
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
            onClick={() => void publishLive()}
            disabled={isPending}
          >
            {t("admin:adminListings.bulk.publishCta")}
          </Button>
          <Button
            variant="ghost-dark"
            onClick={() => void sendBackToReview()}
            disabled={isPending}
          >
            {t("admin:adminListings.bulk.sendBackCta")}
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
