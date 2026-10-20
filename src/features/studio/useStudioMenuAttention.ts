import { useStudioClaimCounts } from "./api/useStudioClaimReview";
import { useStudioCreditPendingCount } from "./api/useStudioCreditPendingCount";
import { useStudioMyClaimsReplyCount } from "./api/useStudioMyClaimsReplyCount";
import { useIsStudioStaff } from "./useIsStudioStaff";

/** True while any creator badge inside the avatar menu has a count: credit
 *  requests, claims waiting on the member, or (for staff) claims waiting on
 *  our team. */
export function useStudioMenuAttention(): { hasAttention: boolean } {
  const isStaff = useIsStudioStaff();
  const { count: creditRequestCount } = useStudioCreditPendingCount();
  const { count: claimReplyCount } = useStudioMyClaimsReplyCount();
  const { waitingCount } = useStudioClaimCounts({ isEnabled: isStaff });
  return {
    hasAttention:
      creditRequestCount > 0 ||
      claimReplyCount > 0 ||
      (isStaff && waitingCount > 0),
  };
}
