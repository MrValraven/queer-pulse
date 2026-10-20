import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { ApiError } from "../../shared/api/client";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioErrorCodeOf } from "./api/studio.api";
import {
  STUDIO_DISPUTE_LIMITS,
  STUDIO_LIMITS,
  type StudioErrorCode,
} from "./api/studio.types";
import type {
  StudioReviewAction,
  StudioReviewDisputeView,
  StudioReviewReportView,
  StudioReviewWithdrawnView,
} from "./api/studioFlagReview.adapters";
import {
  useStudioReviewAction,
  useStudioReviewDisputes,
  useStudioReviewReports,
  useStudioReviewWithdrawn,
} from "./api/useStudioFlagReview";
import {
  StudioReviewDisputeCard,
  StudioReviewReportCard,
  StudioReviewWithdrawnCard,
} from "./StudioReviewCard";
import {
  StudioReviewDialog,
  type StudioReviewDialogRequest,
} from "./StudioReviewDialog";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import { StudioReviewList } from "./StudioReviewList";
import { StudioReviewTrackReports } from "./StudioReviewTrackReports";
import { useReviewFocus } from "./useReviewFocus";

/** Refusals that mean the card already moved on: the dialog closes and the
 *  queues re-read (the mutation hook does that on every refusal). A reject
 *  that hits a release someone already restored answers "not taken down". */
const SETTLED_ELSEWHERE: ReadonlySet<StudioErrorCode> = new Set([
  "studio_dispute_not_open",
  "studio_takedown_report_not_open",
  "studio_release_not_taken_down",
]);

/** A coded refusal from the list above, or an uncoded 404 or 409: the
 *  release or the report is gone or already decided by someone else. */
function isSettledElsewhere(error: unknown, code: StudioErrorCode | null) {
  if (code) return SETTLED_ELSEWHERE.has(code);
  return (
    error instanceof ApiError && (error.status === 404 || error.status === 409)
  );
}

const reportKey = (report: StudioReviewReportView) => report.reportId;
const disputeKey = (dispute: StudioReviewDisputeView) => dispute.disputeId;
const withdrawnKey = (item: StudioReviewWithdrawnView) => item.release.id;

interface PendingDecision {
  /** The card's key: the card that leaves on success. */
  key: string;
  request: StudioReviewDialogRequest;
  toAction: (text: string) => StudioReviewAction;
  successKey: string;
}

const REPLY_FIELD = {
  textLabelKey: "studio:flagReviewLive.dialog.replyLabel",
  textMaxLength: STUDIO_DISPUTE_LIMITS.replyMax,
} as const;
const NO_TEXT_FIELD = { textLabelKey: null, textMaxLength: 0 } as const;

/** Restoring through an open dispute's uphold, with the reply the artist
 *  reads. Both the Disputes and the Withdrawn queue use it. */
function upholdDecision(
  key: string,
  disputeId: string,
  releaseId: string,
  releaseTitle: string,
): PendingDecision {
  return {
    key,
    request: {
      titleKey: "studio:flagReviewLive.dialog.restoreTitle",
      bodyKey: "studio:flagReviewLive.dialog.restoreDisputeBody",
      confirmKey: "studio:flagReviewLive.action.restore",
      ...REPLY_FIELD,
      releaseTitle,
      tone: "positive",
    },
    toAction: (reply) => ({ kind: "uphold", disputeId, releaseId, reply }),
    successKey: "studio:flagReviewLive.toast.restored",
  };
}

/** The decision flow every queue shares: the dialog hosted here (so it
 *  outlives its card), the request, the toasts and the focus move. */
function useDecision(
  markLeaving: (key: string) => void,
  clearLeaving: () => void,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const action = useStudioReviewAction();
  const [pending, setPending] = useState<PendingDecision | null>(null);

  function confirm(text: string) {
    if (!pending || action.isPending) return;
    const { key, request, toAction, successKey } = pending;
    if (request.textLabelKey !== null && text.length === 0) return;
    markLeaving(key);
    action.mutate(toAction(text), {
      onSuccess: () => {
        setPending(null);
        showToast(t(successKey, { title: request.releaseTitle }), "success");
      },
      onError: (error) => {
        const code = studioErrorCodeOf(error);
        if (code === "studio_release_has_open_dispute") {
          // The artist disputed in the meantime: the card stays, the re-read
          // shows "Dispute waiting" and Restore goes through that dispute.
          setPending(null);
          clearLeaving();
        } else if (isSettledElsewhere(error, code)) {
          // A card settled elsewhere leaves on the re-read, and focus moves
          // on as it would after a success.
          setPending(null);
        } else clearLeaving();
        showToast(
          t(
            code
              ? studioErrorMessageKeyOf(error)
              : "studio:flagReviewLive.toast.actionError",
          ),
          "error",
        );
      },
    });
  }

  // Mounted per request, so its text starts empty; AnimatePresence plays the
  // exit with the last request still showing.
  const dialog = (
    <AnimatePresence>
      {pending && (
        <StudioReviewDialog
          key={`${pending.key}-${pending.request.confirmKey}`}
          request={pending.request}
          isPending={action.isPending}
          onConfirm={confirm}
          onClose={() => {
            if (!action.isPending) setPending(null);
          }}
        />
      )}
    </AnimatePresence>
  );
  return { open: setPending, dialog };
}

export function StudioReviewReportsPanel({
  tabButtonId,
}: {
  tabButtonId: string;
}) {
  const list = useStudioReviewReports();
  const focus = useReviewFocus(list.items, reportKey, tabButtonId);
  const decision = useDecision(focus.markLeaving, focus.clearLeaving);
  return (
    <>
      <StudioReviewList
        list={list}
        getKey={reportKey}
        emptyTitleKey="studio:flagReviewLive.empty.reportsTitle"
        emptyBodyKey="studio:flagReviewLive.empty.reportsBody"
        renderCard={(report) => (
          <StudioReviewReportCard
            report={report}
            titleRef={focus.registerTitle(report.reportId)}
            onTakeDown={(releaseTitle) =>
              decision.open({
                key: report.reportId,
                request: {
                  titleKey: "studio:flagReviewLive.dialog.takeDownTitle",
                  bodyKey: "studio:flagReviewLive.dialog.takeDownBody",
                  confirmKey: "studio:flagReviewLive.action.takeDown",
                  textLabelKey: "studio:flagReviewLive.dialog.reasonLabel",
                  textMaxLength: STUDIO_LIMITS.takedownReasonMax,
                  releaseTitle,
                  tone: "destructive",
                },
                toAction: (reason) => ({
                  kind: "takeDown",
                  reportId: report.reportId,
                  releaseId: report.releaseId,
                  reason,
                }),
                successKey: "studio:flagReviewLive.toast.takenDown",
              })
            }
            onDismiss={(releaseTitle) =>
              decision.open({
                key: report.reportId,
                request: {
                  titleKey: "studio:flagReviewLive.dialog.dismissTitle",
                  bodyKey: "studio:flagReviewLive.dialog.dismissBody",
                  confirmKey: "studio:flagReviewLive.action.dismiss",
                  ...NO_TEXT_FIELD,
                  releaseTitle,
                  tone: "default",
                },
                toAction: () => ({
                  kind: "dismiss",
                  reportId: report.reportId,
                  reasonCode: report.reasonCode,
                }),
                successKey: "studio:flagReviewLive.toast.dismissed",
              })
            }
          />
        )}
      />
      {decision.dialog}
      <StudioReviewTrackReports tabButtonId={tabButtonId} />
    </>
  );
}

export function StudioReviewDisputesPanel({
  tabButtonId,
}: {
  tabButtonId: string;
}) {
  const { t } = useTranslation();
  const list = useStudioReviewDisputes();
  const focus = useReviewFocus(list.items, disputeKey, tabButtonId);
  const decision = useDecision(focus.markLeaving, focus.clearLeaving);
  const releaseTitleOf = (dispute: StudioReviewDisputeView) =>
    dispute.release.title || t("studio:flagReviewLive.card.unknownRelease");
  return (
    <>
      <StudioReviewList
        list={list}
        getKey={disputeKey}
        emptyTitleKey="studio:flagReviewLive.empty.disputesTitle"
        emptyBodyKey="studio:flagReviewLive.empty.disputesBody"
        renderCard={(dispute) => (
          <StudioReviewDisputeCard
            dispute={dispute}
            titleRef={focus.registerTitle(dispute.disputeId)}
            onRestore={() =>
              decision.open(
                upholdDecision(
                  dispute.disputeId,
                  dispute.disputeId,
                  dispute.release.id,
                  releaseTitleOf(dispute),
                ),
              )
            }
            onKeepDown={() =>
              decision.open({
                key: dispute.disputeId,
                request: {
                  titleKey: "studio:flagReviewLive.dialog.keepDownTitle",
                  bodyKey: "studio:flagReviewLive.dialog.keepDownBody",
                  confirmKey: "studio:flagReviewLive.action.keepDown",
                  ...REPLY_FIELD,
                  releaseTitle: releaseTitleOf(dispute),
                  tone: "default",
                },
                toAction: (reply) => ({
                  kind: "reject",
                  disputeId: dispute.disputeId,
                  releaseId: dispute.release.id,
                  reply,
                }),
                successKey: "studio:flagReviewLive.toast.keptDown",
              })
            }
          />
        )}
      />
      {decision.dialog}
    </>
  );
}

export function StudioReviewWithdrawnPanel({
  tabButtonId,
}: {
  tabButtonId: string;
}) {
  const { t } = useTranslation();
  const list = useStudioReviewWithdrawn();
  const focus = useReviewFocus(list.items, withdrawnKey, tabButtonId);
  const decision = useDecision(focus.markLeaving, focus.clearLeaving);
  // A release with a dispute waiting restores through that dispute's uphold
  // (with a reply), which closes it in the same step; the plain restore
  // refuses while a dispute is open (PLAN-1).
  function openRestore(item: StudioReviewWithdrawnView) {
    const releaseId = item.release.id;
    const releaseTitle =
      item.release.title || t("studio:flagReviewLive.card.unknownRelease");
    decision.open(
      item.openDisputeId
        ? upholdDecision(releaseId, item.openDisputeId, releaseId, releaseTitle)
        : {
            key: releaseId,
            request: {
              titleKey: "studio:flagReviewLive.dialog.restoreTitle",
              bodyKey: "studio:flagReviewLive.dialog.restoreWithdrawnBody",
              confirmKey: "studio:flagReviewLive.action.restore",
              ...NO_TEXT_FIELD,
              releaseTitle,
              tone: "positive",
            },
            toAction: () => ({ kind: "restore", releaseId }),
            successKey: "studio:flagReviewLive.toast.restored",
          },
    );
  }
  return (
    <>
      <StudioReviewList
        list={list}
        getKey={withdrawnKey}
        emptyTitleKey="studio:flagReviewLive.empty.withdrawnTitle"
        emptyBodyKey="studio:flagReviewLive.empty.withdrawnBody"
        renderCard={(item) => (
          <StudioReviewWithdrawnCard
            item={item}
            titleRef={focus.registerTitle(item.release.id)}
            onRestore={() => openRestore(item)}
          />
        )}
      />
      {decision.dialog}
    </>
  );
}
