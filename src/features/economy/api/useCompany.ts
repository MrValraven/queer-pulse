import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { getCompany } from "./companies.api";
import { companyDetailToProfile } from "./companies.adapters";
import { jobCardToJob } from "./jobs.adapters";
import { economyKeys } from "./economyKeys";
import type { CompanyProfile } from "../companies.data";
import type { Job } from "../jobs.data";

export interface CompanyResult {
  profile: CompanyProfile | null;
  /** The company's open roles from the API. `null` in demo — the page computes
   *  them from the posted-jobs store + mock JOBS, exactly as today. */
  openRoles: Job[] | null;
  isOwner: boolean;
}

/**
 * A company profile. Demo returns the mock `COMPANY_PROFILES` entry (and leaves
 * `openRoles` null so the page keeps its local jobs merge); live calls
 * GET /companies/:slug, adapting the profile and its `openRoles` jobs.
 */
export function useCompany(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  return useQuery<CompanyResult>({
    queryKey: economyKeys.company(slug, demoMode, language),
    enabled: Boolean(slug),
    // Forward react-query's own cancellation signal into the fetch — navigating
    // away from the company page mid-fetch cancels the request at the network
    // layer, not just in the query cache.
    queryFn: async ({ signal }) => {
      if (!slug) return { profile: null, openRoles: null, isOwner: false };
      if (demoMode) {
        // Demo-only mock — loaded on demand so it never ships in the live bundle.
        const { COMPANY_PROFILES } = await import("../companies.data");
        return {
          profile: COMPANY_PROFILES[slug] ?? null,
          openRoles: null,
          isOwner: false,
        };
      }
      const dto = await getCompany(slug, signal);
      return {
        profile: companyDetailToProfile(dto, t),
        openRoles: dto.openRoles.map((jobCard) =>
          jobCardToJob(jobCard, t, fmt),
        ),
        isOwner: dto.isOwner,
      };
    },
  });
}
