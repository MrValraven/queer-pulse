import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  postAgeAttestation,
  TERMS_VERSION,
  type AgeAttestationResult,
} from "./ageAttestation.api";

/**
 * Record the onboarding 18+ attestation. Demo mode is client-only: it fabricates
 * an `ageAttestedAt` locally so the step advances with no network. Live mode
 * POSTs `/auth/onboarding`, which promotes the `pending` account toward `active`.
 * The caller fires this as the age-confirmation step completes.
 */
export function useAgeAttestation() {
  const { demoMode } = useDemoMode();
  return useMutation<AgeAttestationResult, Error, { dateOfBirth?: string }>({
    mutationFn: async ({ dateOfBirth }) => {
      if (demoMode) {
        return {
          ageAttestedAt: new Date().toISOString(),
          termsVersion: TERMS_VERSION,
        };
      }
      return postAgeAttestation({
        ageAttested: true,
        termsVersion: TERMS_VERSION,
        ...(dateOfBirth ? { dateOfBirth } : {}),
      });
    },
  });
}
