import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { ModReport, ReportDetail } from "../adminModeration.data";
import { getModReport } from "./moderation.api";
import { modReportDetailFrom } from "./moderation.adapters";

/**
 * Resolves the rich drawer context (reported content, thread, people) for one
 * report. The open-queue list carries `detail` only on some items — in the mock
 * seed just the first emergency, and in live mode the list DTO omits it entirely
 * (`detail` is only present on `GET /mod/reports/:id`). When it's missing this
 * hook fetches the single-report endpoint in live mode; demo mode uses whatever
 * the seed carries and never hits the network. The drawer renders a summary
 * fallback when even this comes back empty, so the action flow is always usable.
 */
export function useModReportDetail(report: ModReport): {
  detail: ReportDetail | undefined;
  loading: boolean;
  /** True when the single-report fetch failed. The drawer still renders its
   *  summary fallback, so this exists to say the richer context is missing
   *  because of an outage rather than because the report has none (DES-22). */
  isError: boolean;
  /** Re-runs the failed detail fetch. */
  refetch: () => void;
} {
  const { demoMode } = useDemoMode();
  const hasDetail = report.detail != null;
  const query = useQuery<ReportDetail | null>({
    queryKey: ["mod-report", report.id],
    queryFn: async () =>
      modReportDetailFrom(await getModReport(report.id)) ?? null,
    // Only reach for the network when the list item lacks detail and we're live.
    enabled: !demoMode && !hasDetail,
  });
  return {
    detail: report.detail ?? query.data ?? undefined,
    loading: !hasDetail && !demoMode && query.isLoading,
    isError: !hasDetail && query.isError,
    refetch: () => void query.refetch(),
  };
}
