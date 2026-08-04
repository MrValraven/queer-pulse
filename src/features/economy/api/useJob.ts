import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { getJob } from "./jobs.api";
import { jobDetailToJob } from "./jobs.adapters";
import { economyKeys } from "./economyKeys";
import type { Job } from "../jobs.data";

/**
 * A single job's detail. Demo returns the mock `JOBS` entry (the calling page
 * layers its locally-posted jobs on top); live calls GET /jobs/:slug and adapts
 * the full detail body. A 404 surfaces as the query's error state.
 *
 * i18n: `language` joins the query key because `jobDetailToJob` resolves chrome
 * through `t` — see `useJobs` for the same reasoning.
 */
export function useJob(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  return useQuery<Job | null>({
    queryKey: economyKeys.job(slug, demoMode, language),
    enabled: Boolean(slug),
    queryFn: async () => {
      if (!slug) return null;
      if (demoMode) {
        // Demo-only mock — loaded on demand so it never ships in the live bundle.
        const { JOBS } = await import("../jobs.data");
        return JOBS.find((j) => j.slug === slug) ?? null;
      }
      return jobDetailToJob(await getJob(slug), t, fmt);
    },
  });
}
