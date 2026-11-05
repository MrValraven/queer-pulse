import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { getLeadDueCount } from "./leads.api";
import { leadKeys } from "./leadKeys";

const LIVE_STALE_MS = 30_000;

/**
 * How many open leads have a follow-up due today or earlier: the nav
 * badge's number. Off while `isEnabled` is false (no leads access), so it
 * sends no request then.
 */
export function useLeadDueCount(options: {
  isEnabled: boolean;
}): UseQueryResult<number, Error> {
  const { demoMode } = useDemoMode();
  return useQuery<number, Error>({
    queryKey: leadKeys.dueCount(demoMode),
    enabled: options.isEnabled,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : LIVE_STALE_MS,
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoLeadDueCount } = await import("../leadsDemoStore");
        return demoLeadDueCount().count;
      }
      return (await getLeadDueCount(signal)).count;
    },
  });
}
