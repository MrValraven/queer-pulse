import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  revokeJoinRequestInvite,
  type JoinRequestDTO,
} from "../../auth/api/joinRequest.api";
import { useDemoAwareMutation } from "./demoAwareMutation";
import { demoRow } from "./useReissueJoinRequestInvite";

export interface RevokeJoinRequestInviteVars {
  id: string;
}

/**
 * Pull a still-valid approval invite, so a link that reached the wrong person
 * or leaked stops opening straight away.
 *
 * This matters because QueerPulse delivers no email: the reviewer carries the
 * link over by hand, and a link that went astray keeps working for up to seven
 * days unless someone can switch it off. Revoking is final, since a revoked
 * invite cannot be reissued.
 *
 * Live mode POSTs `/join-requests/:id/invite/revoke` (moderator or admin);
 * demo mode synthesizes the same revoked row so the flow is exercisable with
 * no backend.
 */
export function useRevokeJoinRequestInvite() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    JoinRequestDTO,
    Error,
    RevokeJoinRequestInviteVars
  >({
    demoMode,
    // The revoke action toasts its own per-status message, so silence the
    // global duplicate toast.
    meta: { silentError: true },
    demoResult: ({ id }) => ({ ...demoRow(id), inviteStatus: "revoked" }),
    live: ({ id }) => revokeJoinRequestInvite(id),
    logLabel: "admin.joinRequest.revokeInvite",
    logContext: ({ id }) => ({ id }),
    // Invalidates in BOTH modes: the decided tab is served by the same
    // ["join-requests"] queries the review mutation already refreshes.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["join-requests"] });
    },
  });
}
