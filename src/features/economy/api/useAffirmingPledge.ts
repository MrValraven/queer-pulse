import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { DEMO_AFFIRMING_PLEDGE_STATUS } from "../affirmingPledge.data";
import {
  acceptAffirmingPledge,
  getAffirmingPledgeStatus,
  type AffirmingPledgeStatusDTO,
} from "./affirmingPledge.api";

export const AFFIRMING_PLEDGE_KEY = "affirming-pledge-status";

/** The current member's affirming-pledge standing. Demo returns the colocated
 * pre-pledged fixture and never hits the network. */
export function useAffirmingPledgeStatus() {
  const { demoMode } = useDemoMode();
  return useQuery<AffirmingPledgeStatusDTO>({
    queryKey: [AFFIRMING_PLEDGE_KEY, demoMode],
    initialData: demoMode ? DEMO_AFFIRMING_PLEDGE_STATUS : undefined,
    queryFn: () =>
      demoMode
        ? Promise.resolve(DEMO_AFFIRMING_PLEDGE_STATUS)
        : getAffirmingPledgeStatus(),
  });
}

/** Accept the affirming pledge. Demo is a no-op success. Writes the accepted
 * status into the cache so the gate opens through on the retry. */
export function useAcceptAffirmingPledge() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<AffirmingPledgeStatusDTO, Error, void>({
    meta: { silentError: true },
    mutationFn: () =>
      demoMode
        ? Promise.resolve(DEMO_AFFIRMING_PLEDGE_STATUS)
        : acceptAffirmingPledge(),
    onSuccess: (status) => {
      queryClient.setQueryData([AFFIRMING_PLEDGE_KEY, demoMode], status);
    },
  });
}
