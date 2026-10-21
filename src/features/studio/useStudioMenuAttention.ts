import { useStudioClaimCounts } from "./api/useStudioClaimReview";
import { useStudioCreditPendingCount } from "./api/useStudioCreditPendingCount";
import { useStudioCounterWindows } from "./api/useStudioMenuCounts";
import { useStudioMyClaimsReplyCount } from "./api/useStudioMyClaimsReplyCount";
import { useIsStudioStaff } from "./useIsStudioStaff";

/** True while any badge inside the avatar menu has a count: credit
 *  requests, claims waiting on the member's reply, a claim on the artist's
 *  own track they can still counter, or (for staff) claims and takedown
 *  disputes waiting on our team. */
export function useStudioMenuAttention(): { hasAttention: boolean } {
  const isStaff = useIsStudioStaff();
  const { count: creditRequestCount } = useStudioCreditPendingCount();
  const { count: claimReplyCount } = useStudioMyClaimsReplyCount();
  const { count: counterWindowCount } = useStudioCounterWindows();
  const { waitingCount, disputesWaitingCount } = useStudioClaimCounts({
    isEnabled: isStaff,
  });
  return {
    hasAttention:
      creditRequestCount > 0 ||
      claimReplyCount > 0 ||
      counterWindowCount > 0 ||
      (isStaff && (waitingCount > 0 || disputesWaitingCount > 0)),
  };
}
