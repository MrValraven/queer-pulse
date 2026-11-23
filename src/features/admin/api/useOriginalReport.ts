import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getModReport } from "./moderation.api";
import { modReportDetailFrom } from "./moderation.adapters";
import type { ReportDetail } from "../adminModeration.data";
import { isReportAboutActorError } from "./enforcementTargetError";

/** The original report, or SEC-31's settled answer that it is about the
 *  signed-in staff member. */
interface OriginalReportResult {
  detail: ReportDetail | null;
  isAboutViewer: boolean;
}

/**
 * SEC-31: the server refuses a report's own subject with a coded 403. That is
 * a settled answer the appeal drawer names, so it resolves here as data and
 * raises no generic error toast; any other failure still throws.
 */
async function fetchOriginalReport(
  reportId: string,
): Promise<OriginalReportResult> {
  try {
    return {
      detail: modReportDetailFrom(await getModReport(reportId)) ?? null,
      isAboutViewer: false,
    };
  } catch (error) {
    if (isReportAboutActorError(error)) {
      return { detail: null, isAboutViewer: true };
    }
    throw error;
  }
}

/**
 * The ORIGINAL reported content behind an appeal (COM-11) — an appeal review
 * used to show only the moderator's self-reported reason for the original
 * decision, never the actual report a member is appealing. Fetches
 * `GET /mod/reports/:id` (the same drawer-detail endpoint `ReportContext`
 * uses) keyed by the appeal's `reportId`, when the appeal carries one.
 *
 * Demo mode never fetches — the seed appeals have no backing report id to
 * resolve (see `Appeal.reportId`'s doc comment) — so the drawer degrades to
 * its existing "original decision" summary there, same as live for a cold
 * appeal with no linked report.
 */
export function useOriginalReport(reportId: string | undefined): {
  detail: ReportDetail | undefined;
  loading: boolean;
  /** True when the original report failed to load. An appeal reviewer must be
   *  able to tell "this appeal has no linked report" from "we could not read
   *  the report you are deciding against" (DES-22). */
  isError: boolean;
  /** Re-runs the failed fetch. */
  refetch: () => void;
  /** SEC-31: the original report is about the signed-in staff member. */
  isAboutViewer: boolean;
} {
  const { demoMode } = useDemoMode();
  const enabled = !demoMode && reportId != null;
  const query = useQuery<OriginalReportResult>({
    queryKey: ["mod-report-original", reportId],
    queryFn: () => fetchOriginalReport(reportId as string),
    enabled,
  });
  return {
    detail: query.data?.detail ?? undefined,
    isAboutViewer: query.data?.isAboutViewer === true,
    loading: enabled && query.isLoading,
    isError: enabled && query.isError,
    refetch: () => void query.refetch(),
  };
}
