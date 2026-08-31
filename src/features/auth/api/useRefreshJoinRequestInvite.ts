import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  refreshJoinRequestInvite,
  type JoinRequestStatusDTO,
} from "./joinRequest.api";

/** Seven days, matching the backend's redemption window, so the demo fixture
 *  shows the same deadline shape the live answer carries. */
const DEMO_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * The applicant reviving their own lapsed approval invite from the status page.
 *
 * Approval mints an invite that nothing delivers: QueerPulse sends no email and
 * an applicant has no account, so no in-app notification reaches them either.
 * They learn they were approved only by coming back and looking, and before
 * this hook existed, coming back after the window had closed was terminal.
 * the page said the invite was gone and offered nothing further.
 *
 * On success the status query's cache is written directly rather than
 * invalidated. The read endpoint allows 20 requests an hour and the mutation
 * already returns the full, freshly-computed status, so refetching would spend
 * the applicant's allowance to be told what we are holding.
 *
 * The caller renders every failure itself, in words matched to the refusal
 * (`joinRequestInviteRefreshRefusal`), so the global error toast is silenced.
 */
export function useRefreshJoinRequestInvite(token: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<JoinRequestStatusDTO, Error, void>({
    meta: { silentError: true },
    mutationFn: async () => {
      if (demoMode) {
        // Loaded on demand so the fixtures stay out of the live bundle.
        const { demoRefreshedJoinRequestInvite } =
          await import("../joinRequestStatus.data");
        return demoRefreshedJoinRequestInvite(
          token,
          new Date(Date.now() + DEMO_WINDOW_MS).toISOString(),
        );
      }
      return refreshJoinRequestInvite(token);
    },
    onSuccess: (status) => {
      queryClient.setQueryData<JoinRequestStatusDTO>(
        ["join-request-status", demoMode, token],
        status,
      );
    },
  });
}
