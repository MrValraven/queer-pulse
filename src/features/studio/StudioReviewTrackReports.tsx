import { AnimatePresence } from "motion/react";
import { useId, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_LIMITS } from "./api/studio.types";
import type {
  StudioAdminTrackView,
  StudioReviewTrackReportView,
} from "./api/studioSafety.adapters";
import {
  useStudioReviewTrackReports,
  useStudioTrackReportAction,
  type StudioTrackReportAction,
} from "./api/useStudioTrackReports";
import { REASON_LABEL_KEYS, type ReasonCode } from "../safety/reportReasons";
import type { StudioRowSelection } from "./kit/useStudioRowSelection";
import {
  isReviewSettledElsewhere,
  reviewErrorKeyOf,
} from "./StudioReviewErrors";
import type { ReviewQueueOrder } from "./StudioReviewQueue";
import { StudioReviewQueueBar } from "./StudioReviewQueueBar";
import {
  StudioReviewDialog,
  type StudioReviewDialogRequest,
} from "./StudioReviewDialog";
import { StudioReviewList } from "./StudioReviewList";
import { StudioReviewTrackReportCard } from "./StudioReviewTrackReportCard";
import { StudioReviewWarningDialog } from "./StudioReviewWarningDialog";
import { useReviewFocus } from "./useReviewFocus";
import css from "./StudioFlagReview.module.css";

const reportKey = (report: StudioReviewTrackReportView) => report.reportId;

interface PendingTrackAction {
  report: StudioReviewTrackReportView;
  request: StudioReviewDialogRequest;
  toAction: (text: string) => StudioTrackReportAction;
  successKey: string;
}

/** Mark explicit: no text, the track keeps playing with its new mark. */
function markExplicitRequest(
  report: StudioReviewTrackReportView,
  track: StudioAdminTrackView,
): PendingTrackAction {
  return {
    report,
    request: {
      titleKey: "studio:flagReviewLive.trackReports.dialog.markExplicitTitle",
      bodyKey: "studio:flagReviewLive.trackReports.dialog.markExplicitBody",
      confirmKey: "studio:flagReviewLive.trackReports.markExplicit",
      textLabelKey: null,
      textMaxLength: 0,
      releaseTitle: track.title,
      tone: "default",
    },
    toAction: () => ({
      kind: "markExplicit",
      reportId: report.reportId,
      trackId: track.id,
    }),
    successKey: "studio:flagReviewLive.trackReports.toast.markedExplicit",
  };
}

/** Take the whole release down, with the reason the artist reads. */
function takeDownRequest(
  report: StudioReviewTrackReportView,
  track: StudioAdminTrackView,
): PendingTrackAction {
  return {
    report,
    request: {
      titleKey: "studio:flagReviewLive.dialog.takeDownTitle",
      bodyKey: "studio:flagReviewLive.dialog.takeDownBody",
      confirmKey: "studio:flagReviewLive.action.takeDown",
      textLabelKey: "studio:flagReviewLive.dialog.reasonLabel",
      textMaxLength: STUDIO_LIMITS.takedownReasonMax,
      releaseTitle: track.release.title,
      tone: "destructive",
    },
    toAction: (reason) => ({
      kind: "takeDown",
      reportId: report.reportId,
      releaseId: track.releaseId,
      reason,
    }),
    successKey: "studio:flagReviewLive.toast.takenDown",
  };
}

/** Dismiss: the report closes and the track stays as it is. */
function dismissRequest(
  report: StudioReviewTrackReportView,
  trackTitle: string,
): PendingTrackAction {
  return {
    report,
    request: {
      titleKey: "studio:flagReviewLive.dialog.dismissTitle",
      bodyKey: "studio:flagReviewLive.trackReports.dialog.dismissBody",
      confirmKey: "studio:flagReviewLive.action.dismiss",
      textLabelKey: null,
      textMaxLength: 0,
      releaseTitle: trackTitle,
      tone: "default",
    },
    toAction: () => ({
      kind: "dismiss",
      reportId: report.reportId,
      reasonCode: report.reasonCode,
    }),
    successKey: "studio:flagReviewLive.toast.dismissed",
  };
}

/** Track reports, under the release reports in the Reports tab (contract):
 *  Mark explicit, Add content warning, Take down release, Dismiss. */
export function StudioReviewTrackReports({
  tabButtonId,
  selection,
  queueOrder,
}: {
  tabButtonId: string;
  /** The Reports tab's one selection, shared with the release reports. */
  selection?: StudioRowSelection;
  /** The track queue's sort and filter, held by the Reports tab so its one
   *  selection covers exactly the cards on screen. */
  queueOrder: ReviewQueueOrder<StudioReviewTrackReportView>;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const headingId = useId();
  const list = useStudioReviewTrackReports();
  const focus = useReviewFocus(queueOrder.visibleItems, reportKey, tabButtonId);
  const action = useStudioTrackReportAction();
  const [pending, setPending] = useState<PendingTrackAction | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const openPending = (next: PendingTrackAction) => {
    setErrorKey(null);
    setPending(next);
  };
  const [warningFor, setWarningFor] = useState<{
    report: StudioReviewTrackReportView;
    track: StudioAdminTrackView;
  } | null>(null);

  /** Sends one decision. Success closes its dialog (`onDone`); a card
   *  settled elsewhere closes it too, and any other failure keeps the dialog
   *  and what staff picked or wrote, with the reason inside. */
  function run(
    report: StudioReviewTrackReportView,
    nextAction: StudioTrackReportAction,
    successKey: string,
    title: string,
    onDone: () => void,
  ) {
    setErrorKey(null);
    focus.markLeaving(report.reportId);
    action.mutate(nextAction, {
      onSuccess: () => {
        onDone();
        showToast(t(successKey, { title }), "success");
      },
      onError: (error) => {
        const messageKey = reviewErrorKeyOf(error);
        if (isReviewSettledElsewhere(error)) onDone();
        else {
          focus.clearLeaving();
          setErrorKey(messageKey);
        }
        showToast(t(messageKey), "error");
      },
    });
  }

  function confirm(text: string) {
    if (!pending || action.isPending) return;
    if (pending.request.textLabelKey !== null && text.length === 0) return;
    run(
      pending.report,
      pending.toAction(text),
      pending.successKey,
      pending.request.releaseTitle,
      () => setPending(null),
    );
  }

  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId} className={css.sectionHeading}>
        {t("studio:flagReviewLive.trackReports.heading")}
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
          />
        }
        getKey={reportKey}
        emptyTitleKey="studio:flagReviewLive.trackReports.emptyTitle"
        emptyBodyKey="studio:flagReviewLive.trackReports.emptyBody"
        renderCard={(report) => (
          <StudioReviewTrackReportCard
            report={report}
            titleRef={focus.registerTitle(report.reportId)}
            selection={selection}
            onMarkExplicit={(track) =>
              openPending(markExplicitRequest(report, track))
            }
            onAddWarning={(track) => {
              setErrorKey(null);
              setWarningFor({ report, track });
            }}
            onTakeDown={(track) => openPending(takeDownRequest(report, track))}
            onDismiss={(trackTitle) =>
              openPending(dismissRequest(report, trackTitle))
            }
          />
        )}
      />
      <AnimatePresence>
        {pending && (
          <StudioReviewDialog
            key={`${pending.report.reportId}-${pending.request.confirmKey}`}
            request={pending.request}
            isPending={action.isPending}
            errorKey={errorKey}
            onConfirm={confirm}
            onClose={() => {
              if (!action.isPending) setPending(null);
            }}
          />
        )}
        {warningFor && (
          <StudioReviewWarningDialog
            key={`${warningFor.report.reportId}-warning`}
            track={warningFor.track}
            isPending={action.isPending}
            errorKey={errorKey}
            onConfirm={(warnings) =>
              run(
                warningFor.report,
                {
                  kind: "addWarnings",
                  reportId: warningFor.report.reportId,
                  trackId: warningFor.track.id,
                  warnings,
                },
                "studio:flagReviewLive.trackReports.toast.warningAdded",
                warningFor.track.title,
                () => setWarningFor(null),
              )
            }
            onClose={() => {
              if (!action.isPending) setWarningFor(null);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
