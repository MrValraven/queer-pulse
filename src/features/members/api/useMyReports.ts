import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { apiGet } from "../../../shared/api/client";
import type { ReasonCode, ReportSubjectType } from "../../safety/reportReasons";

/** `GET /reports/mine` row (backend Task 7) — the member-facing half of a
 *  report, distinct from the moderator's fuller `ReportDetail`/`ModReport`
 *  shapes in `admin/adminModeration.data.ts` (those carry content excerpts
 *  and mod actions this member should never see about their own filing). */
export interface MyReportEntry {
  id: string;
  reference: string;
  subjectType: ReportSubjectType;
  reasonCode: ReasonCode;
  status: string;
  createdAt: string;
}

/**
 * The reports the logged-in member has filed themselves — a read-only receipt
 * list ("Your reports") in the "Who sees what" sheet, not a moderation queue.
 * Demo mode reads the colocated `DEMO_MY_REPORTS` fixture rather than hitting
 * the network.
 */
export function useMyReports() {
  const { demoMode } = useDemoMode();
  return useQuery<MyReportEntry[]>({
    queryKey: ["my-reports", demoMode],
    queryFn: async () => {
      if (demoMode) {
        const { DEMO_MY_REPORTS } = await import("../whoSeesWhat.data");
        return DEMO_MY_REPORTS;
      }
      return apiGet<MyReportEntry[]>("/reports/mine");
    },
  });
}
