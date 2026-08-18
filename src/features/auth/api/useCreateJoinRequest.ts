import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createJoinRequest,
  type CreateJoinRequestResult,
} from "./joinRequest.api";
import type { JoinRequestSource } from "./joinRequestSource";
import { TERMS_VERSION } from "./ageAttestation.api";

/** What the request-invite form hands the mutation. */
export interface JoinRequestVars {
  /** How the applicant wants to be called. */
  name: string;
  /** Required — with no account behind this flow it's the only way back to them. */
  email: string;
  /** Optional free-text city. */
  city?: string;
  message: string;
  /** The email of a member already here who can vouch for the applicant —
   *  a structured field distinct from the free-text `message`. */
  mutualMemberEmail?: string;
  /** The CTA the applicant came through, when the form could resolve one. */
  source?: JoinRequestSource;
}

/**
 * Submit a prospective member's request to join (RequestInvitePage). Demo mode
 * simulates a successful submission locally so the "You're on the list" screen
 * shows with no backend. Live mode POSTs the **public** /join-requests route
 * with name/email/city plus the 18+ attestation — no session needed, since the
 * applicant has no account yet.
 */
export function useCreateJoinRequest() {
  const { demoMode } = useDemoMode();
  return useMutation<CreateJoinRequestResult, Error, JoinRequestVars>({
    // RequestInviteForm toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({
      name,
      email,
      city,
      message,
      mutualMemberEmail,
      source,
    }) => {
      if (demoMode) {
        return {
          id: "demo-join-request",
          status: "pending",
          createdAt: new Date().toISOString(),
        };
      }
      return createJoinRequest({
        name,
        email,
        city: city?.trim() || undefined,
        message,
        mutualMemberEmail: mutualMemberEmail?.trim() || undefined,
        ageAttested: true,
        termsVersion: TERMS_VERSION,
        source,
      });
    },
  });
}
