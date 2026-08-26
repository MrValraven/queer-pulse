import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { describeError } from "../../shared/api/errorMessage";
import { useBulkReviewJoinRequests } from "./api/useBulkReviewJoinRequests";

export type BulkDecisionStatus = "approved" | "declined" | "waitlisted";

/** What one bulk call actually did, kept whole. The server answers per item,
 *  so `succeeded` and `failed` can both be non-empty on the same 200 and the
 *  UI has to say so rather than rounding either way. */
export interface JoinRequestBulkOutcome {
  status: BulkDecisionStatus;
  succeeded: string[];
  failed: { id: string; reason: string }[];
}

const CONFIRM_COPY: Record<BulkDecisionStatus, string> = {
  approved: "admin:members.verify.bulk.confirmApprove",
  waitlisted: "admin:members.verify.bulk.confirmWaitlist",
  declined: "admin:members.verify.bulk.confirmDecline",
};

const FAILURE_FRAME: Record<BulkDecisionStatus, string> = {
  approved: "admin:members.verify.bulk.action.approve",
  waitlisted: "admin:members.verify.bulk.action.waitlist",
  declined: "admin:members.verify.bulk.action.decline",
};

const SUCCESS_TOAST: Record<BulkDecisionStatus, string> = {
  approved: "admin:members.verify.bulk.approvedToast",
  waitlisted: "admin:members.verify.bulk.waitlistedToast",
  declined: "admin:members.verify.bulk.declinedToast",
};

/**
 * The bulk approve / waitlist / decline a reviewer takes on a multi-selected
 * batch of the join-request queue, from the confirmation step through to what
 * the server actually did with each id.
 *
 * NOTHING FIRES WITHOUT A CONFIRMATION. `request()` only opens the confirm step;
 * `run()` is what calls the endpoint, and only the dialog's confirm button
 * reaches it. These are applications from real people, and an approval mints an
 * invite while a decline closes the request, so neither is a click to take by
 * accident.
 *
 * A PARTIAL RESULT IS THE NORMAL CASE. `POST /admin/join-requests/bulk` reviews
 * each id independently (`JoinRequestsService.bulkReview` loops `review`), so a
 * request a colleague settled a moment ago lands in `failed` with the server's
 * own reason while the rest go through. The outcome is handed back whole:
 * `onOutcome` gets the succeeded ids to drop from the queue and the failed ids
 * to leave selected, and `outcome` below is what the result panel renders. Only
 * a clean sweep is announced as a plain success.
 */
export function useJoinRequestBulkDecision({
  ids,
  onOutcome,
}: {
  ids: string[];
  /** Succeeded ids leave the queue; failed ids stay selected for a retry. */
  onOutcome: (succeededIds: string[], failedIds: string[]) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { bulkReview, pending } = useBulkReviewJoinRequests();
  // The decision waiting on its confirmation step, or null when none is.
  const [confirming, setConfirming] = useState<BulkDecisionStatus | null>(null);
  const [outcome, setOutcome] = useState<JoinRequestBulkOutcome | null>(null);

  function request(status: BulkDecisionStatus) {
    if (pending || ids.length === 0) return;
    setOutcome(null);
    setConfirming(status);
  }

  async function run(status: BulkDecisionStatus, declineReason?: string) {
    if (pending || ids.length === 0) return;
    const batch = [...ids];
    try {
      const result = await bulkReview(batch, status, declineReason);
      setConfirming(null);
      const failedIds = result.failed.map((failure) => failure.id);
      if (result.failed.length === 0) {
        setOutcome(null);
        showToast(
          t(SUCCESS_TOAST[status], { count: result.succeeded.length }),
          status === "approved" ? "success" : "info",
        );
      } else {
        setOutcome({
          status,
          succeeded: result.succeeded,
          failed: result.failed,
        });
      }
      onOutcome(result.succeeded, failedIds);
    } catch (caught) {
      showToast(
        describeError(
          t(FAILURE_FRAME[status]),
          caught,
          t("shared:apiError.tryAgainTail"),
        ),
        "error",
      );
    }
  }

  return {
    /** The i18n key prefix for the open confirmation's title/body/cta. */
    confirmCopyKey: confirming ? CONFIRM_COPY[confirming] : null,
    confirming,
    outcome,
    pending,
    request,
    run,
    cancel: () => setConfirming(null),
    dismissOutcome: () => setOutcome(null),
  };
}
