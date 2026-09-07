import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { apiGet } from "../../../shared/api/client";
import type { ReasonCode, ReportSubjectType } from "../reportReasons";

/** `GET /reports/mine` row — the member-facing half of a report, distinct from
 *  the moderator's fuller `ReportDetail`/`ModReport` shapes in
 *  `admin/adminModeration.data.ts` (those carry content excerpts and mod
 *  actions this member should never see about their own filing). */
export interface MyReportEntry {
  id: string;
  reference: string;
  subjectType: ReportSubjectType;
  reasonCode: ReasonCode;
  status: string;
  createdAt: string;
  /**
   * When the report was closed, or `null` while it is still open. The backend
   * has always sent it (`ReportsController.listMine`); the frontend used to
   * drop it, so a member whose report had been dealt with was never told so
   * anywhere but a `report_resolved` bell notification they may have cleared.
   *
   * The TIMESTAMP only, deliberately. The resolution action, note, duration
   * and acting moderator all sit on the same backend row and none of them are
   * the reporter's to read: they are the moderator's reasoning, their
   * identity, and a consequence report about another member.
   */
  resolvedAt: string | null;
}

/**
 * The reports the logged-in member has filed themselves, newest first — the
 * read-only receipt list behind `/account/reports` and the "Who sees what"
 * sheet's own summary. Never a moderation queue.
 *
 * A member's ANONYMOUS filings are included: `anonymous` hides the reporter
 * from the moderator, not from their own receipt, and the backend stores
 * `reporterId` either way. A signed-out filing has no `reporterId` at all and
 * can never appear here, which is what the empty state says.
 *
 * Demo mode reads the colocated `DEMO_MY_REPORTS` fixture rather than hitting
 * the network.
 */
export function useMyReports() {
  const { demoMode } = useDemoMode();
  return useQuery<MyReportEntry[]>({
    queryKey: ["my-reports", demoMode],
    queryFn: async () => {
      if (demoMode) {
        const { DEMO_MY_REPORTS } = await import("../myReports.data");
        return DEMO_MY_REPORTS;
      }
      return apiGet<MyReportEntry[]>("/reports/mine");
    },
  });
}
