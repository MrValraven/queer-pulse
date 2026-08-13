import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { describeError } from "../../shared/api/errorMessage";
import { useBulkDecideVerificationRequests } from "./api/useAdminVerifications";
import { VerificationBulkRejectModal } from "./VerificationBulkRejectModal";
import { VERIFICATION_BULK_ACTION_CAP } from "./api/adminVerifications.api";
import styles from "./AdminVerificationsPage.module.css";

/**
 * Floating action bar for the Review-queue segment's multi-select (Task 4) —
 * mount it only while `selectedIds.size > 0` (`ReviewQueueSegment` does
 * this), and it disappears the moment the selection empties: on `onClear`,
 * or automatically once a bulk action here succeeds. Mirrors
 * `AdminListingsPage`'s `BulkActionBar` one-for-one, adapted to the request
 * queue's three decisions (approve / mark in-review / reject) instead of the
 * listings queue's (publish / send back / remove).
 *
 * All three route through `useBulkDecideVerificationRequests`, whose unified
 * `pending` disables every button here together — the multi-select
 * counterpart of the single-row drawer's unified-disabled contract. Reject
 * routes through its own reason-required confirm dialog
 * (`VerificationBulkRejectModal`); approve and mark-in-review fire
 * immediately, same as the drawer's own approve/in-review buttons needing no
 * confirmation.
 */
export function VerificationBulkActionBar({
  selectedIds,
  onClear,
}: {
  selectedIds: Set<string>;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { bulkDecide, pending } = useBulkDecideVerificationRequests();
  const [confirmingReject, setConfirmingReject] = useState(false);
  const ids = Array.from(selectedIds);
  const count = ids.length;

  async function approve() {
    try {
      await bulkDecide(ids, "approve");
      onClear();
    } catch (caught) {
      showToast(
        describeError(
          t("admin:verifications.requests.bulk.action.approve"),
          caught,
        ),
        "error",
      );
    }
  }

  async function markInReview() {
    try {
      await bulkDecide(ids, "in_review");
      onClear();
    } catch (caught) {
      showToast(
        describeError(
          t("admin:verifications.requests.bulk.action.inReview"),
          caught,
        ),
        "error",
      );
    }
  }

  async function confirmReject(reason: string) {
    try {
      await bulkDecide(ids, "reject", reason);
      setConfirmingReject(false);
      onClear();
    } catch (caught) {
      showToast(
        describeError(
          t("admin:verifications.requests.bulk.action.reject"),
          caught,
        ),
        "error",
      );
    }
  }

  return (
    <>
      <div
        className={styles.bulkBar}
        role="region"
        aria-label={t("admin:verifications.requests.bulk.ariaLabel")}
      >
        {/* `role="status"` (implicit `aria-live="polite"` + `aria-atomic`) so
            a screen-reader user is told the bar appeared and hears the count
            update as it changes — same as the listings queue's bar. */}
        <span className={styles.bulkCount} role="status">
          {t("admin:verifications.requests.bulk.selectedCount", { count })}
        </span>
        {count >= VERIFICATION_BULK_ACTION_CAP && (
          <span className={styles.bulkCapNote}>
            {t("admin:verifications.requests.bulk.capNote", {
              cap: VERIFICATION_BULK_ACTION_CAP,
            })}
          </span>
        )}
        <div className={styles.bulkActions}>
          <Button
            variant="jade"
            onClick={() => void approve()}
            disabled={pending}
          >
            {t("admin:verifications.requests.bulk.approveCta")}
          </Button>
          <Button
            variant="ghost-dark"
            onClick={() => void markInReview()}
            disabled={pending}
          >
            {t("admin:verifications.requests.bulk.inReviewCta")}
          </Button>
          <Button
            variant="danger"
            onClick={() => setConfirmingReject(true)}
            disabled={pending}
          >
            {t("admin:verifications.requests.bulk.rejectCta")}
          </Button>
          <Button variant="ghost-dark" onClick={onClear} disabled={pending}>
            {t("admin:verifications.requests.bulk.clearCta")}
          </Button>
        </div>
      </div>
      {confirmingReject && (
        <VerificationBulkRejectModal
          count={count}
          pending={pending}
          onConfirm={(reason) => void confirmReject(reason)}
          onClose={() => setConfirmingReject(false)}
        />
      )}
    </>
  );
}
