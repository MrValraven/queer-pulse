import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getJob } from "./jobs.api";
import { jobDetailToJob } from "./jobs.adapters";
import { JOBS, type Job } from "../jobs.data";

/**
 * A single job's detail. Demo returns the mock `JOBS` entry (the calling page
 * layers its locally-posted jobs on top); live calls GET /jobs/:slug and adapts
 * the full detail body. A 404 surfaces as the query's error state.
 */
export function useJob(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<Job | null>({
    queryKey: ["job", slug, demoMode],
    enabled: Boolean(slug),
    queryFn: async () => {
      if (!slug) return null;
      if (demoMode) return JOBS.find((j) => j.slug === slug) ?? null;
      return jobDetailToJob(await getJob(slug));
    },
  });
}
