import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createJoinRequest,
  type CreateJoinRequestResult,
} from "./joinRequest.api";
import type { JoinRequestSource } from "./joinRequestSource";
import { rememberJoinRequestStatus } from "./joinRequestStatusToken";
import { TERMS_VERSION } from "./ageAttestation.api";
import { usePlatformStatus } from "../../../shared/api/usePlatformStatus";

/** What the request-invite form hands the mutation, once the applicant has
 *  typed the code that confirms their address. */
export interface JoinRequestVars {
  /** The challenge the code belongs to. */
  challengeId: string;
  /** The 6-digit code from the email. */
  code: string;
  /** How the applicant wants to be called. */
  name: string;
  /** Optional free-text city. */
  city?: string;
  message: string;
  /** The email of a member already here who can vouch for the applicant —
   *  a structured field distinct from the free-text `message`. */
  mutualMemberEmail?: string;
  /** Required: where they heard about QueerPulse, already trimmed. */
  heardFrom: string;
  /** Optional social profile, a handle or a link. Omit when blank. */
  socialProfile?: string;
  /** The CTA the applicant came through, when the form could resolve one. */
  source?: JoinRequestSource;
}

/**
 * File a prospective member's request to join (RequestInvitePage) with the
 * code that confirmed their address (SEC-10). Demo mode simulates it locally,
 * with `000000` answering `code_incorrect` like the sign-in demo, so the
 * "You're on the list" screen shows with no backend. Live mode POSTs the
 * **public** `/auth/email-code/join-request/verify` route with the form, the
 * 18+ attestation and the code; no session needed, since the applicant has no
 * account yet.
 *
 * On success the token from the 201 is written to storage HERE rather than in
 * the form, so no future caller of this mutation can submit a request and
 * silently drop the applicant's only route back to their own decision. The
 * confirmation screen still shows the code: storage can be unavailable (private
 * window, blocked site data) and the token is never re-issued.
 */
export function useCreateJoinRequest() {
  const { demoMode } = useDemoMode();
  // The Terms revision in effect, from the backend — the single source of
  // truth for it (ID-14). `TERMS_VERSION` is the fallback for the moment
  // before this public query resolves; the applicant has no session, which is
  // why it rides `/platform-status` rather than `/auth/me`.
  const { data: platformStatus } = usePlatformStatus();
  const termsVersion = platformStatus?.termsVersion ?? TERMS_VERSION;
  return useMutation<CreateJoinRequestResult, Error, JoinRequestVars>({
    // RequestInviteForm toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({
      challengeId,
      code,
      name,
      city,
      message,
      mutualMemberEmail,
      heardFrom,
      socialProfile,
      source,
    }) => {
      if (demoMode) {
        // The demo token is a real fixture code, so the confirmation screen's
        // "check your request" link lands on a populated status page instead of
        // a dead end. Loaded on demand to stay out of the live bundle.
        const demoCode = await import("../emailCode.data");
        await demoCode.demoLatency();
        demoCode.demoVerifyEmailCode({ challengeId, code });
        const { DEMO_STATUS_TOKENS } =
          await import("../joinRequestStatus.data");
        return {
          id: "demo-join-request",
          status: "pending",
          createdAt: new Date().toISOString(),
          statusToken: DEMO_STATUS_TOKENS.underReview,
        };
      }
      return createJoinRequest({
        challengeId,
        code,
        name,
        city: city?.trim() || undefined,
        message,
        mutualMemberEmail: mutualMemberEmail?.trim() || undefined,
        heardFrom,
        socialProfile: socialProfile?.trim() || undefined,
        ageAttested: true,
        termsVersion,
        source,
      });
    },
    onSuccess: (result) => {
      rememberJoinRequestStatus({
        token: result.statusToken,
        submittedAt: result.createdAt,
      });
    },
  });
}
