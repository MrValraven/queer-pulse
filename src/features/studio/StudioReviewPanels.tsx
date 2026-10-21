import { AnimatePresence } from "motion/react";
import { useId, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioErrorCodeOf } from "./api/studio.api";
import { STUDIO_DISPUTE_LIMITS, STUDIO_LIMITS } from "./api/studio.types";
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
import {
  isReviewSettledElsewhere,
  reviewErrorKeyOf,
} from "./StudioReviewErrors";
import { REASON_LABEL_KEYS, type ReasonCode } from "../safety/reportReasons";
import type { StudioReviewTrackReportView } from "./api/studioSafety.adapters";
import { useStudioReviewTrackReports } from "./api/useStudioTrackReports";
import { useStudioRowSelection } from "./kit/useStudioRowSelection";
import { StudioReviewBulkDismiss } from "./StudioReviewBulkDismiss";
import { StudioReviewList } from "./StudioReviewList";
import { useReviewQueueOrder } from "./StudioReviewQueue";
import { StudioReviewQueueBar } from "./StudioReviewQueueBar";
import { StudioReviewTrackReports } from "./StudioReviewTrackReports";
import css from "./StudioFlagReview.module.css";
import { useReviewFocus } from "./useReviewFocus";

const reportKey = (report: StudioReviewReportView) => report.reportId;

const REPORT_QUEUE_FIELDS = {
  createdAtOf: (report: StudioReviewReportView) => report.createdAt,
  severityOf: (report: StudioReviewReportView) => report.severity,
  filterValueOf: (report: StudioReviewReportView) => report.reasonCode,
};
const disputeKey = (dispute: StudioReviewDisputeView) => dispute.disputeId;
const withdrawnKey = (item: StudioReviewWithdrawnView) => item.release.id;

const DISPUTE_QUEUE_FIELDS = {
  createdAtOf: (dispute: StudioReviewDisputeView) => dispute.createdAt,
};
// Withdrawn is a record of what is down, so it opens newest first.
const WITHDRAWN_QUEUE_FIELDS = {
  createdAtOf: (item: StudioReviewWithdrawnView) => item.takenDownAt ?? "",
  initialSortOrder: "newest" as const,
};

const TRACK_REPORT_QUEUE_FIELDS = {
  createdAtOf: (report: StudioReviewTrackReportView) => report.createdAt,
  severityOf: (report: StudioReviewTrackReportView) => report.severity,
  filterValueOf: (report: StudioReviewTrackReportView) => report.reasonCode,
};

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
 *  outlives its card), the request, the toasts and the focus move. A failed
 *  decision keeps the dialog and the typed note, with the reason inside. */
function useDecision(
  markLeaving: (key: string) => void,
  clearLeaving: () => void,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const action = useStudioReviewAction();
  const [pending, setPending] = useState<PendingDecision | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  function open(decision: PendingDecision) {
    setErrorKey(null);
    setPending(decision);
  }

  function confirm(text: string) {
    if (!pending || action.isPending) return;
    const { key, request, toAction, successKey } = pending;
    if (request.textLabelKey !== null && text.length === 0) return;
    setErrorKey(null);
    markLeaving(key);
    action.mutate(toAction(text), {
      onSuccess: () => {
        setPending(null);
        showToast(t(successKey, { title: request.releaseTitle }), "success");
      },
      onError: (error) => {
        const messageKey = reviewErrorKeyOf(error);
        if (studioErrorCodeOf(error) === "studio_release_has_open_dispute") {
          // The artist disputed in the meantime: the card stays, the re-read
          // shows "Dispute waiting" and Restore goes through that dispute.
          setPending(null);
          clearLeaving();
        } else if (isReviewSettledElsewhere(error)) {
          // A card settled elsewhere leaves on the re-read, and focus moves
          // on as it would after a success.
          setPending(null);
        } else {
          clearLeaving();
          setErrorKey(messageKey);
        }
        showToast(t(messageKey), "error");
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
          errorKey={errorKey}
          onConfirm={confirm}
          onClose={() => {
            if (!action.isPending) setPending(null);
          }}
        />
      )}
    </AnimatePresence>
  );
  return { open, dialog };
}

/** The Reports tab: release reports, then track reports, each under its
 *  own heading with its own Sort and filter, and one selection across both
 *  for a bulk dismiss. */
export function StudioReviewReportsPanel({
  tabButtonId,
}: {
  tabButtonId: string;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const list = useStudioReviewReports();
  const trackList = useStudioReviewTrackReports();
  const queueOrder = useReviewQueueOrder(list.items, REPORT_QUEUE_FIELDS);
  const trackQueueOrder = useReviewQueueOrder(
    trackList.items,
    TRACK_REPORT_QUEUE_FIELDS,
  );
  // One selection over the cards on screen, in screen order, so Select all
  // and a Shift range never tick a report the filters hide.
  const selection = useStudioRowSelection([
    ...queueOrder.visibleItems.map(reportKey),
    ...trackQueueOrder.visibleItems.map((report) => report.reportId),
  ]);
  const focus = useReviewFocus(queueOrder.visibleItems, reportKey, tabButtonId);
  const decision = useDecision(focus.markLeaving, focus.clearLeaving);
  const hasReports = list.items.length + trackList.items.length > 0;
  return (
    <>
      <section aria-labelledby={headingId}>
        <h3 id={headingId} className={css.sectionHeadingFirst}>
          {t("studio:flagReviewLive.reports.releaseHeading")}
        </h3>
        <StudioReviewList
          list={list}
          items={queueOrder.visibleItems}
          toolbar={
            <StudioReviewQueueBar
              order={queueOrder}
              totalCount={list.items.length}
              canSortBySeverity
              filterLabelOf={(reasonCode) =>
                t(REASON_LABEL_KEYS[reasonCode as ReasonCode])
              }
              filterGroupLabelKey="studio:flagReviewLive.queue.filterReason"
              selectLabelKey={
                hasReports
                  ? selection.isSelecting
                    ? "studio:flagReviewLive.bulk.stopSelecting"
                    : "studio:flagReviewLive.bulk.selectReports"
                  : undefined
              }
              isSelecting={selection.isSelecting}
              onStartSelecting={() =>
                selection.isSelecting ? selection.clear() : selection.start()
              }
            />
          }
          getKey={reportKey}
          emptyTitleKey="studio:flagReviewLive.empty.reportsTitle"
          emptyBodyKey="studio:flagReviewLive.empty.reportsBody"
          renderCard={(report) => (
            <StudioReviewReportCard
              report={report}
              titleRef={focus.registerTitle(report.reportId)}
              selection={selection}
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
      </section>
      {decision.dialog}
      <StudioReviewTrackReports
        tabButtonId={tabButtonId}
        selection={selection}
        queueOrder={trackQueueOrder}
      />
      <StudioReviewBulkDismiss
        selection={selection}
        releaseReports={list.items}
        trackReports={trackList.items}
      />
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
  const queueOrder = useReviewQueueOrder(list.items, DISPUTE_QUEUE_FIELDS);
  const focus = useReviewFocus(
    queueOrder.visibleItems,
    disputeKey,
    tabButtonId,
  );
  const decision = useDecision(focus.markLeaving, focus.clearLeaving);
  const releaseTitleOf = (dispute: StudioReviewDisputeView) =>
    dispute.release.title || t("studio:flagReviewLive.card.unknownRelease");
  return (
    <>
      <StudioReviewList
        list={list}
        items={queueOrder.visibleItems}
        toolbar={
          <StudioReviewQueueBar
            order={queueOrder}
            totalCount={list.items.length}
          />
        }
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
  const queueOrder = useReviewQueueOrder(list.items, WITHDRAWN_QUEUE_FIELDS);
  const focus = useReviewFocus(
    queueOrder.visibleItems,
    withdrawnKey,
    tabButtonId,
  );
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
        items={queueOrder.visibleItems}
        toolbar={
          <StudioReviewQueueBar
            order={queueOrder}
            totalCount={list.items.length}
          />
        }
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
