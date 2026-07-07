import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getJobApplications, getMyApplications } from "./jobs.api";
import { applicationToView, type JobApplicationView } from "./jobs.adapters";

/**
 * The viewer's own applications (GET /me/applications). Demo returns an empty
 * list — the prototype's Application-status page renders its own rich mock, not
 * this lightweight view — so demo makes no network call.
 */
export function useMyApplications() {
  const { demoMode } = useDemoMode();
  return useQuery<JobApplicationView[]>({
    queryKey: ["my-applications", demoMode],
    queryFn: async () => {
      if (demoMode) return [];
      return (await getMyApplications()).map(applicationToView);
    },
  });
}

/**
 * Applications to a job (GET /jobs/:slug/applications), poster-only. Demo
 * returns an empty list (no poster-facing applications view exists in the
 * prototype), so demo makes no network call.
 */
export function useJobApplications(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<JobApplicationView[]>({
    queryKey: ["job-applications", demoMode, slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      if (!slug || demoMode) return [];
      return (await getJobApplications(slug)).map(applicationToView);
    },
  });
}
