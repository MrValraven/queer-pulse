import { AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReviewReportView } from "./api/studioFlagReview.adapters";
import type { StudioReleaseView } from "./api/studio.adapters";
import { studioErrorCodeOf } from "./api/studio.api";
import type {
  StudioAdminTrackView,
  StudioReviewTrackReportView,
} from "./api/studioSafety.adapters";
import { studioSafetyKeys } from "./api/studioSafetyQueryKeys";
import { useStudioReviewAction } from "./api/useStudioFlagReview";
import { useStudioTrackReportAction } from "./api/useStudioTrackReports";
import { StudioSelectionBar } from "./kit/StudioSelectionBar";
import type { StudioRowSelection } from "./kit/useStudioRowSelection";
import {
  isReviewSettledElsewhere,
  reviewErrorKeyOf,
} from "./StudioReviewErrors";

/**
 * Bulk dismiss for the Reports tab: the selection bar's "Dismiss reports",
 * a confirm that names the count, then one dismiss per report in order. The
 * toast says how many closed, and names the reason when some did not; those
 * cards stay in the queue with their tick, ready for another try.
 */
export function StudioReviewBulkDismiss({
  selection,
  releaseReports,
  trackReports,
}: {
  selection: StudioRowSelection;
  releaseReports: StudioReviewReportView[];
  trackReports: StudioReviewTrackReportView[];
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const releaseAction = useStudioReviewAction();
  const trackAction = useStudioTrackReportAction();
  const [pending, setPending] = useState<{
    ids: string[];
    titles: ReadonlyMap<string, string>;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  /** The title a report's card showed, from the reads its card made. */
  function titleOfReport(reportId: string): string {
    const releaseReport = releaseReports.find(
      (report) => report.reportId === reportId,
    );
    if (releaseReport)
      return (
        // The staff release read's key (useAdminStudio `staffReleaseKey`).
        queryClient.getQueryData<StudioReleaseView>([
          "admin-studio",
          "release",
          demoMode,
          releaseReport.releaseId,
        ])?.title || t("studio:flagReviewLive.card.unknownRelease")
      );
    const trackReport = trackReports.find(
      (report) => report.reportId === reportId,
    );
    return (
      (trackReport &&
        queryClient.getQueryData<StudioAdminTrackView>(
          studioSafetyKeys.adminTrack(demoMode, trackReport.trackId),
        )?.title) ||
      t("studio:flagReviewLive.trackReports.unknownTrack")
    );
  }

  /** The reason line for the first failure: an uncoded 404 or 409 means the
   *  report was closed meanwhile or its release is gone. */
  function failureKeyOf(error: unknown): string {
    if (!studioErrorCodeOf(error) && isReviewSettledElsewhere(error))
      return "studio:flagReviewLive.bulk.reportGone";
    return reviewErrorKeyOf(error);
  }

  async function dismissAll(
    reportIds: string[],
    titles: ReadonlyMap<string, string>,
  ) {
    setIsRunning(true);
    let dismissedCount = 0;
    let firstError: unknown = null;
    const skippedTitles: string[] = [];
    for (const reportId of reportIds) {
      const releaseReport = releaseReports.find(
        (report) => report.reportId === reportId,
      );
      const trackReport = trackReports.find(
        (report) => report.reportId === reportId,
      );
      const reasonCode = releaseReport?.reasonCode ?? trackReport?.reasonCode;
      if (!reasonCode) {
        // It left the queue between the tick and the confirm.
        skippedTitles.push(titles.get(reportId) ?? reportId);
        continue;
      }
      try {
        if (releaseReport)
          await releaseAction.mutateAsync({
            kind: "dismiss",
            reportId,
            reasonCode,
          });
        else
          await trackAction.mutateAsync({
            kind: "dismiss",
            reportId,
            reasonCode,
          });
        dismissedCount += 1;
      } catch (error) {
        firstError ??= error;
      }
    }
    setIsRunning(false);
    setPending(null);
    const skippedLine =
      skippedTitles.length > 0
        ? ` ${t("studio:flagReviewLive.bulk.skipped", {
            count: skippedTitles.length,
            titles: skippedTitles.join(", "),
          })}`
        : "";
    if (firstError === null) {
      selection.clear();
      showToast(
        `${t("studio:flagReviewLive.bulk.dismissed", {
          count: dismissedCount,
        })}${skippedLine}`,
        skippedTitles.length > 0 ? "info" : "success",
      );
      return;
    }
    showToast(
      `${t("studio:flagReviewLive.bulk.partlyDismissed", {
        done: dismissedCount,
        count: reportIds.length,
      })} ${t(failureKeyOf(firstError))}${skippedLine}`,
      "error",
    );
  }

  return (
    <>
      <StudioSelectionBar
        selection={selection}
        actions={[
          {
            id: "dismiss",
            label: t("studio:flagReviewLive.bulk.dismissAction"),
            icon: <FiX aria-hidden />,
            tone: "danger",
            onRun: (ids) => {
              if (ids.length === 0) return;
              setPending({
                ids,
                titles: new Map(ids.map((id) => [id, titleOfReport(id)])),
              });
            },
          },
        ]}
      />
      <AnimatePresence>
        {pending && (
          <ConfirmDialog
            open
            tone="destructive"
            loading={isRunning}
            title={t("studio:flagReviewLive.bulk.confirmTitle", {
              count: pending.ids.length,
            })}
            description={t("studio:flagReviewLive.bulk.confirmBody")}
            confirmLabel={t("studio:flagReviewLive.bulk.confirmAction", {
              count: pending.ids.length,
            })}
            onConfirm={() => {
              if (!isRunning) void dismissAll(pending.ids, pending.titles);
            }}
            onClose={() => {
              if (!isRunning) setPending(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
