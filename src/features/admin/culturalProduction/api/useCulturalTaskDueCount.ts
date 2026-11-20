import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { getCulturalTaskDueCount } from "./culturalProduction.api";
import { culturalKeys } from "./culturalProductionKeys";

const LIVE_STALE_MS = 30_000;

/**
 * How many of the caller's open tasks are due today or earlier (the Lisbon
 * day): the nav badge's number. Off while `isEnabled` is false (no Cultural
 * Production access), so it sends no request then.
 */
export function useCulturalTaskDueCount(options: {
  isEnabled: boolean;
}): UseQueryResult<number, Error> {
  const { demoMode } = useDemoMode();
  return useQuery<number, Error>({
    queryKey: culturalKeys.dueCount(demoMode),
    enabled: options.isEnabled,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : LIVE_STALE_MS,
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoCulturalTaskDueCount } =
          await import("../culturalProductionDemoStore");
        return demoCulturalTaskDueCount().count;
      }
      return (await getCulturalTaskDueCount(signal)).count;
    },
  });
}
