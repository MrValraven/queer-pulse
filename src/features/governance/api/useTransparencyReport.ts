import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getTransparencyReport,
  type TransparencyPeriodSelector,
  type TransparencyReportDTO,
} from "./transparency.api";

export interface TransparencyReportResult {
  report: TransparencyReportDTO | null;
  /** True while the first fetch for this period is in flight. */
  isLoading: boolean;
  /** True when the fetch failed, so the page offers a retry instead of an
   *  empty document that reads like "we had nothing to report". */
  hasError: boolean;
  retry: () => void;
}

/**
 * Data source for the public Transparency Report page.
 *
 * Demo mode reads the page's own fixture (imported on demand so it never ships
 * in the live bundle); live mode calls the public `GET /transparency/report`.
 * The endpoint needs no session, so this hook works for a signed-out visitor,
 * which is the whole point of the page.
 */
export function useTransparencyReport(
  period: TransparencyPeriodSelector,
): TransparencyReportResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<TransparencyReportDTO>({
    queryKey: ["transparency-report", period, demoMode],
    queryFn: async () => {
      if (!demoMode) return getTransparencyReport(period);
      const { TRANSPARENCY_DEMO_REPORT } = await import("../transparency.data");
      return TRANSPARENCY_DEMO_REPORT[period];
    },
  });

  const retry = () => {
    void query.refetch();
  };

  return {
    report: query.data ?? null,
    isLoading: query.isPending,
    hasError: query.isError,
    retry,
  };
}
