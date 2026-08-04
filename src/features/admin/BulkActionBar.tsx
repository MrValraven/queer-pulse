import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { describeError } from "../../shared/api/errorMessage";
import { useBulkListingAction } from "./api/useBulkListingAction";
import { BulkRemoveConfirmModal } from "./BulkRemoveConfirmModal";
import { LISTING_BULK_ACTION_CAP } from "./api/adminListings.api";
import styles from "./AdminListingsPage.module.css";

/**
 * Floating action bar for the moderation queue's multi-select: mount it only
 * while `selectedRefs.size > 0` (the page does this), and it disappears the
 * moment the selection empties — on `onClear`, or automatically once a bulk
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
  const { showToast } = useToast();
  const { bulkSetStatus, bulkRemove, isPending } = useBulkListingAction();
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const refs = Array.from(selectedRefs);
  const count = refs.length;

  async function publishLive() {
    try {
      await bulkSetStatus(refs, "live");
      onClear();
    } catch (caught) {
      showToast(
        describeError(
          t("admin:adminListings.bulk.action.publish"),
          caught,
        ),
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
        describeError(
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
        describeError(t("admin:adminListings.bulk.action.remove"), caught),
        "error",
      );
    }
  }

  return (
    <>
      <div
        className={styles.bulkBar}
        role="region"
        aria-label={t("admin:adminListings.bulk.ariaLabel")}
      >
        {/* `role="status"` (implicit `aria-live="polite"` + `aria-atomic`) so
            a screen-reader user is told the bar appeared and hears the count
            update as it changes — the bar itself is inserted with no focus
            move, so nothing else would announce it (WCAG 4.1.3). */}
        <span className={styles.bulkCount} role="status">
          {t("admin:adminListings.bulk.selectedCount", { count })}
        </span>
        {count >= LISTING_BULK_ACTION_CAP && (
          <span className={styles.bulkCapNote}>
            {t("admin:adminListings.bulk.capNote", {
              cap: LISTING_BULK_ACTION_CAP,
            })}
          </span>
        )}
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
          <Button
            variant="ghost-dark"
            onClick={onClear}
            disabled={isPending}
          >
            {t("admin:adminListings.bulk.clearCta")}
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
