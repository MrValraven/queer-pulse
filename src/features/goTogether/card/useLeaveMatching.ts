import { useWithdrawGoTogether } from "../api/useGoTogetherMutations";
import { cardErrorKey } from "./goTogetherCard.data";
import { useFocusCardHeading } from "./goTogetherCardFocus";

/** Leaving matching from any live state: withdraw, then move focus to the
 *  card heading because the panel under the button goes away. */
export interface LeaveMatchingControls {
  leave: () => void;
  isPending: boolean;
  errorKey: string | null;
}

export function useLeaveMatching(slug: string): LeaveMatchingControls {
  const withdraw = useWithdrawGoTogether(slug);
  const focusCardHeading = useFocusCardHeading();
  return {
    leave: () => withdraw.mutate(undefined, { onSuccess: focusCardHeading }),
    isPending: withdraw.isPending,
    errorKey: cardErrorKey(withdraw.error),
  };
}
