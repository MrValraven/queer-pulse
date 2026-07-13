import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
import {
  createReport,
  type CreateReportInput,
  type ReportDTO,
} from "./reports.api";

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
    acknowledgement: "Report received — a moderator is on it.",
  };
}

/**
 * Submit a report from any surface (standalone form, feed post, forum reply,
 * venue flag, member, message). Demo mode resolves after a short simulated delay
 * and never touches the network — every surface's existing plum-panel / toast
 * confirmation is preserved unchanged. Live mode POSTs `/reports`; the backend
 * derives severity + SLA, dedupes, and fires the reporter-ack notification (that
 * fan-out is backend-driven — the frontend only triggers it by creating the
 * report). Both modes resolve with a `ReportDTO`, so no surface's success UI
 * needs to branch on mode.
 */
export function useCreateReport() {
  const { demoMode } = useDemoMode();
  return useMutation<ReportDTO, Error, CreateReportInput>({
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
