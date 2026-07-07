import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getJobs } from "./jobs.api";
import { jobCardToJob } from "./jobs.adapters";
import { JOBS, type Job } from "../jobs.data";

/**
 * Jobs board source. Demo mode returns the mock `JOBS` array (the page merges
 * its locally-posted jobs on top and does its own client-side filtering, so
 * demo renders exactly as today). Live mode calls GET /jobs and adapts each
 * card via `jobCardToJob`.
 */
export function useJobs(
  params: { cat?: string; type?: string; page?: number } = {},
) {
  const { demoMode } = useDemoMode();
  return useQuery<Job[]>({
    queryKey: ["jobs", demoMode, params],
    queryFn: async () => {
      if (demoMode) return JOBS;
      const res = await getJobs(params);
      return res.items.map(jobCardToJob);
    },
  });
}
