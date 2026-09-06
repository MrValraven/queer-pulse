import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { submitCoopJoinRequest } from "./housingCoop.api";
import { economyKeys } from "./economyKeys";

export interface CoopJoinRequestInput {
  slug: string;
  name: string;
  householdSize: string;
  note?: string;
}

/**
 * POST /housing/coops/:slug/join-requests — a prospective member asking to
 * join a forming co-op.
 *
 * Demo mode keeps a short "sending…" beat and resolves with no network, so
 * `JoinCoopModal` shows its plum success panel exactly as the prototype
 * would (mirrors `useSubmitPartnerApplication`). Live mode calls the API.
 *
 * PRD-242: a success invalidates the caller's own applications, so the new
 * pending row appears on `/local/housing/coop` from the server rather than from
 * a guess, and the page the outcome will later deep-link to already names it.
 */
export function useSubmitCoopJoinRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<{ id: string } | null, Error, CoopJoinRequestInput>({
    // JoinCoopModal toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ slug, name, householdSize, note }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 650));
        return null;
      }
      return submitCoopJoinRequest(slug, { name, householdSize, note });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: economyKeys.myCoopJoinRequestsRoot,
      });
    },
  });
}
