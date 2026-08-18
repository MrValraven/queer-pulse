import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { describeError } from "../../shared/api/errorMessage";
import { useBulkReviewJoinRequests } from "./api/useBulkReviewJoinRequests";
import { JoinRequestBulkDeclineModal } from "./JoinRequestBulkDeclineModal";
import { JOIN_REQUEST_BULK_ACTION_CAP } from "../auth/api/joinRequest.api";
import styles from "./AdminMembersPage.module.css";

/**
 * Floating bulk-action bar for the pending join-request queue's multi-select
 * (Task 6). Mirrors `VerificationBulkActionBar` one-for-one, adapted to this
 * queue's three decisions: approve, waitlist, decline (reason required).
 *
 * `onSuccess` reports back which ids actually succeeded (a bulk decide is
 * per-item, not all-or-nothing — see `useBulkReviewJoinRequests`). This is a
 * deliberate addition over the plan's original sketch: `AdminVerifyQueue`
 * needs the succeeded ids to drop those rows from the pending view the same
 * way it already does for a single approve/decline, since demo mode's mock
 * queue never mutates its own backing array on a mutation and so wouldn't
 * otherwise reflect the bulk decision at all.
 */
export function JoinRequestBulkActionBar({
  selectedIds,
  onClear,
  onSuccess,
}: {
  selectedIds: Set<string>;
  onClear: () => void;
  onSuccess: (ids: string[]) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { bulkReview, pending } = useBulkReviewJoinRequests();
  const [confirmingDecline, setConfirmingDecline] = useState(false);
  const ids = Array.from(selectedIds);
  const count = ids.length;

  async function approve() {
    try {
      const result = await bulkReview(ids, "approved");
      onSuccess(result.succeeded);
      onClear();
    } catch (caught) {
      showToast(
        describeError(t("admin:members.verify.bulk.action.approve"), caught),
        "error",
      );
    }
  }

  async function waitlist() {
    try {
      const result = await bulkReview(ids, "waitlisted");
      onSuccess(result.succeeded);
      onClear();
    } catch (caught) {
      showToast(
        describeError(t("admin:members.verify.bulk.action.waitlist"), caught),
        "error",
      );
    }
  }

  async function confirmDecline(reason: string) {
    try {
      const result = await bulkReview(ids, "declined", reason);
      onSuccess(result.succeeded);
      setConfirmingDecline(false);
      onClear();
    } catch (caught) {
      showToast(
        describeError(t("admin:members.verify.bulk.action.decline"), caught),
        "error",
      );
    }
  }

  return (
    <>
      <div
        className={styles.bulkBar}
        role="region"
        aria-label={t("admin:members.verify.bulk.ariaLabel")}
      >
        <span className={styles.bulkCount} role="status">
          {t("admin:members.verify.bulk.selectedCount", { count })}
        </span>
        {count >= JOIN_REQUEST_BULK_ACTION_CAP && (
          <span className={styles.bulkCapNote}>
            {t("admin:members.verify.bulk.capNote", {
              cap: JOIN_REQUEST_BULK_ACTION_CAP,
            })}
          </span>
        )}
        <div className={styles.bulkActions}>
          <Button variant="jade" onClick={() => void approve()} disabled={pending}>
            {t("admin:members.verify.bulk.approveCta")}
          </Button>
          <Button
            variant="ghost-dark"
            onClick={() => void waitlist()}
            disabled={pending}
          >
            {t("admin:members.verify.bulk.waitlistCta")}
          </Button>
          <Button
            variant="danger"
            onClick={() => setConfirmingDecline(true)}
            disabled={pending}
          >
            {t("admin:members.verify.bulk.declineCta")}
          </Button>
          <Button variant="ghost-dark" onClick={onClear} disabled={pending}>
            {t("admin:members.verify.bulk.clearCta")}
          </Button>
        </div>
      </div>
      {confirmingDecline && (
        <JoinRequestBulkDeclineModal
          count={count}
          pending={pending}
          onConfirm={(reason) => void confirmDecline(reason)}
          onClose={() => setConfirmingDecline(false)}
        />
      )}
    </>
  );
}
