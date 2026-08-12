import { useQuery } from "@tanstack/react-query";
import {
  getPublicEligibilitySignals,
  type PublicEligibilitySignalsDto,
} from "./publicProfile.api";

/**
 * Fetches the signed-in member's eligibility signals. Enabled only in live mode
 * (demo mode scores from a fixture, no network). Cached briefly so reopening the
 * public-profile modal doesn't refetch.
 */
export function usePublicEligibilitySignals(enabled: boolean) {
  return useQuery<PublicEligibilitySignalsDto>({
    queryKey: ["publicEligibilitySignals"],
    queryFn: getPublicEligibilitySignals,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
