import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getAdminStudioClaimCounts } from "./studioSafety.api";
import { studioSafetyKeys } from "./studioSafetyQueryKeys";

/** The tab strip reads quietly; its own panels name every failure. */
const SILENT = { silentError: true } as const;

export interface StudioReviewCounts {
  /** Claims waiting for our team: submitted plus countered. */
  claimsWaiting: number;
  /** Artists' takedown disputes still open. */
  disputesWaiting: number;
}

/** The flag review's tab counts, from the one counts route the Claims badge
 *  and the staff menu badge read too (same key, so one request serves all
 *  three). Every decision re-reads it through `refreshReviewQueues`. */
export function useStudioReviewCounts(): StudioReviewCounts {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: studioSafetyKeys.reviewClaimCounts(demoMode),
    meta: SILENT,
    queryFn: async () =>
      demoMode
        ? (await import("./studioDemoSafety")).demoAdminClaimCounts()
        : getAdminStudioClaimCounts(),
  });
  const counts = query.data;
  return {
    claimsWaiting: counts ? counts.submitted + counts.countered : 0,
    disputesWaiting: counts?.disputesWaiting ?? 0,
  };
}
