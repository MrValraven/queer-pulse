import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { createJoinRequest, type JoinRequestDTO } from "./joinRequest.api";

/**
 * Submit a prospective member's request to join (RequestInvitePage). Demo mode
 * simulates a successful submission locally so the "You're on the list" screen
 * shows with no backend; live mode POSTs /join-requests. Pending-ok: usable by a
 * signed-in-but-not-yet-approved member.
 */
export function useCreateJoinRequest() {
  const { demoMode } = useDemoMode();
  return useMutation<JoinRequestDTO, Error, string>({
    mutationFn: async (message) => {
      if (demoMode) {
        return {
          id: "demo-join-request",
          message,
          status: "pending",
          createdAt: new Date().toISOString(),
        };
      }
      return createJoinRequest(message);
    },
  });
}
