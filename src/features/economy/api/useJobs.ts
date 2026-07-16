import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { getJobs } from "./jobs.api";
import { jobCardToJob } from "./jobs.adapters";
import { JOBS, type Job } from "../jobs.data";

/**
 * Jobs board source. Demo mode returns the mock `JOBS` array (the page merges
 * its locally-posted jobs on top and does its own client-side filtering, so
 * demo renders exactly as today). Live mode calls GET /jobs and adapts each
 * card via `jobCardToJob`.
 *
 * i18n: `language` is part of the query key because `jobCardToJob` resolves
 * chrome (pay/affiliation fallbacks) through `t` — switching language must
 * re-derive the adapted view-models. Locale stays independent of demo mode.
 */
export function useJobs(
  params: { cat?: string; type?: string; page?: number } = {},
) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  return useQuery<Job[]>({
    queryKey: ["jobs", demoMode, language, params],
    queryFn: async () => {
      if (demoMode) return JOBS;
      const res = await getJobs(params);
      return res.items.map((dto) => jobCardToJob(dto, t));
    },
  });
}
