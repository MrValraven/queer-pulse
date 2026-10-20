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
import { studioErrorMessageKeyOf } from "./studioErrors.data";
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

/** Track reports, under the release reports in the Reports tab (contract):
 *  Mark explicit, Add content warning, Take down release, Dismiss. */
export function StudioReviewTrackReports({
  tabButtonId,
}: {
  tabButtonId: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const headingId = useId();
  const list = useStudioReviewTrackReports();
  const focus = useReviewFocus(list.items, reportKey, tabButtonId);
  const action = useStudioTrackReportAction();
  const [pending, setPending] = useState<PendingTrackAction | null>(null);
  const [warningFor, setWarningFor] = useState<{
    report: StudioReviewTrackReportView;
    track: StudioAdminTrackView;
  } | null>(null);

  function run(
    report: StudioReviewTrackReportView,
    nextAction: StudioTrackReportAction,
    successKey: string,
    title: string,
    onSettled: () => void,
  ) {
    focus.markLeaving(report.reportId);
    action.mutate(nextAction, {
      onSuccess: () => {
        onSettled();
        showToast(t(successKey, { title }), "success");
      },
      onError: (error) => {
        focus.clearLeaving();
        onSettled();
        showToast(t(studioErrorMessageKeyOf(error)), "error");
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
        getKey={reportKey}
        emptyTitleKey="studio:flagReviewLive.trackReports.emptyTitle"
        emptyBodyKey="studio:flagReviewLive.trackReports.emptyBody"
        renderCard={(report) => (
          <StudioReviewTrackReportCard
            report={report}
            titleRef={focus.registerTitle(report.reportId)}
            onMarkExplicit={(track) =>
              setPending({
                report,
                request: {
                  titleKey:
                    "studio:flagReviewLive.trackReports.dialog.markExplicitTitle",
                  bodyKey:
                    "studio:flagReviewLive.trackReports.dialog.markExplicitBody",
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
                successKey:
                  "studio:flagReviewLive.trackReports.toast.markedExplicit",
              })
            }
            onAddWarning={(track) => setWarningFor({ report, track })}
            onTakeDown={(track) =>
              setPending({
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
              })
            }
            onDismiss={(trackTitle) =>
              setPending({
                report,
                request: {
                  titleKey: "studio:flagReviewLive.dialog.dismissTitle",
                  bodyKey:
                    "studio:flagReviewLive.trackReports.dialog.dismissBody",
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
              })
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
