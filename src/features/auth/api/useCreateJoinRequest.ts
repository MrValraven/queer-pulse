import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { createJoinRequest, type JoinRequestDTO } from "./joinRequest.api";
import { TERMS_VERSION } from "./ageAttestation.api";

/** What the request-invite form hands the mutation. */
export interface JoinRequestVars {
  message: string;
}

/**
 * Submit a prospective member's request to join (RequestInvitePage). Demo mode
 * simulates a successful submission locally so the "You're on the list" screen
 * shows with no backend; the age fields are accepted and echoed but never sent.
 * Live mode POSTs /join-requests with the 18+ attestation. Pending-ok: usable by
 * a signed-in-but-not-yet-approved member.
 */
export function useCreateJoinRequest() {
  const { demoMode } = useDemoMode();
  return useMutation<JoinRequestDTO, Error, JoinRequestVars>({
    mutationFn: async ({ message }) => {
      if (demoMode) {
        return {
          id: "demo-join-request",
          message,
          status: "pending",
          createdAt: new Date().toISOString(),
        };
      }
      return createJoinRequest({
        message,
        ageAttested: true,
        termsVersion: TERMS_VERSION,
      });
    },
  });
}
