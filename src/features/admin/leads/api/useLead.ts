import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { getLead } from "./leads.api";
import { leadKeys } from "./leadKeys";
import { leadReasonOf, type LeadDTO } from "./leads.types";

const LIVE_STALE_MS = 30_000;

/**
 * One lead with its whole history. A refusal that names a reason (the lead
 * is gone) answers at once; any other failure retries twice. Demo reads the
 * demo store, which only demo writes change, so it never goes stale there.
 */
export function useLead(leadId: string): UseQueryResult<LeadDTO, Error> {
  const { demoMode } = useDemoMode();
  return useQuery<LeadDTO, Error>({
    queryKey: leadKeys.detail(leadId, demoMode),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : LIVE_STALE_MS,
    retry: (failureCount, error) =>
      leadReasonOf(error) === null && failureCount < 2,
    meta: { silentError: true, isPrivateQueryKey: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoGetLead } = await import("../leadsDemoStore");
        return demoGetLead(leadId);
      }
      return getLead(leadId, signal);
    },
  });
}
