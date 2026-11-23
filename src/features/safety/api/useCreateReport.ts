import { useCallback, useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { I18nContext } from "../../../app/providers/i18nContext";
import { ToastContext } from "../../../shared/components/feedback/toastContext";
import { logInfo } from "../../../shared/observability/logger";
import {
  createReport,
  type CreateReportInput,
  type ReportDTO,
  type ReportFilingOutcome,
} from "./reports.api";

/**
 * PRD-510: the one toast that names a repeat filing's state
 * (`details_added`, `already_open`); a new report (`filed`) says nothing here.
 * Shared by every report flow, `useCreateReport` and the member reports that
 * file through their own routes (Go together, matched chats), so the reporter
 * reads the same line wherever they filed.
 *
 * Both contexts are read directly, so a flow rendered outside a
 * `ToastProvider` or an `I18nProvider` (a unit test, say) still files.
 */
export function useAnnounceFilingOutcome(): (report: {
  filing?: ReportFilingOutcome;
}) => void {
  const toasts = useContext(ToastContext);
  const i18n = useContext(I18nContext);
  return useCallback(
    (report: { filing?: ReportFilingOutcome }) => {
      if (!toasts || !i18n) return;
      if (report.filing === "details_added") {
        toasts.showToast(i18n.t("safety:report.filing.detailsAdded"), "info");
      } else if (report.filing === "already_open") {
        toasts.showToast(i18n.t("safety:report.filing.alreadyOpen"), "info");
      }
    },
    [toasts, i18n],
  );
}

/** How long the demo mode pretends the round-trip takes, to keep the UX honest. */
const DEMO_LATENCY_MS = 650;

function demoReport(body: CreateReportInput): ReportDTO {
  return {
    id: `demo-r-${Date.now()}`,
    subjectType: body.subjectType,
    subjectId: body.subjectId,
    reasonCode: body.reasonCode,
    severity: "medium",
    status: "open",
    createdAt: new Date().toISOString(),
    acknowledgement: "Report received. A moderator is on it.",
    // Demo keeps no reports between filings, so every demo filing is new.
    filing: "filed",
  };
}

/**
 * PRD-510: true when a filing landed on the reporter's OPEN report about the
 * same subject for the same reason (`details_added` or `already_open`). A
 * surface that confirms a filing with its own toast skips that toast for
 * these two, because `useCreateReport` already names the state in one.
 */
export function isFilingOnOpenReport(report: ReportDTO): boolean {
  return report.filing === "details_added" || report.filing === "already_open";
}

export interface UseCreateReportOptions {
  /**
   * Whether this hook toasts the PRD-510 named state itself. On by default so
   * every surface tells the reporter their details reached their open report.
   * A surface that files many reports in one go (a batch) turns it off and
   * sums the outcomes up in its own single message.
   */
  announcesFilingOutcome?: boolean;
}

/**
 * Submit a report from any surface (standalone form, feed post, forum reply,
 * venue flag, member, message). Demo mode resolves after a short simulated
 * delay with no network call and always answers `filing: "filed"`.
 * Live mode POSTs `/reports`: the backend derives severity and the SLA from
 * the reason, and a repeat filing on the reporter's open report for the same
 * subject and reason adds its new details to that report (PRD-510), which
 * `filing` names. The reporter-ack notification is fanned out by the backend
 * once a report is created. Both modes resolve with a `ReportDTO`, so no
 * surface's success UI branches on mode. The named-state toast for a repeat
 * filing comes from here; see `announcesFilingOutcome` and
 * {@link isFilingOnOpenReport}.
 */
export function useCreateReport({
  announcesFilingOutcome = true,
}: UseCreateReportOptions = {}) {
  const { demoMode } = useDemoMode();
  const announceFilingOutcome = useAnnounceFilingOutcome();
  return useMutation<ReportDTO, Error, CreateReportInput>({
    // PRD-510: a repeat filing with the same reason while the first report is
    // still open lands on that open report. This toast is the one place that
    // names it, for every surface; a surface whose own confirmation is a
    // toast skips it for these outcomes (`isFilingOnOpenReport`), so the
    // reporter reads one message. A surface with a success panel keeps its
    // panel, which stays true: the report is with the moderation team.
    onSuccess: (report) => {
      if (announcesFilingOutcome) announceFilingOutcome(report);
    },
    // Every report surface renders its own failure UI in `onError` (a toast, a
    // retry panel, an inline note) and routes it through
    // `useReportSubmissionError`, which is what decides between the server's
    // own flood-cap copy and the surface's generic line. Without this opt-out
    // the cache-level handler toasts a SECOND, different message on top of it,
    // and for the 60-second burst throttle that second message is
    // `reasonFor(error)`: the framework's raw "ThrottlerException: Too Many
    // Requests", put straight in front of a member.
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, DEMO_LATENCY_MS));
        logInfo("report.create (demo — no network)", {
          subjectType: body.subjectType,
          reasonCode: body.reasonCode,
        });
        return demoReport(body);
      }
      return createReport(body);
    },
  });
}
