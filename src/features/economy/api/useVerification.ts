import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  DEMO_PHONE_VERIFIED,
  DEMO_VERIFICATION_STATUS,
} from "../verification.data";
import {
  getVerificationStatus,
  startIdentityVerification,
  startPhoneVerification,
  verifyPhoneCode,
  type VerificationStatusDTO,
} from "./verification.api";

export const VERIFICATION_STATUS_KEY = "verification-status";

/** The current member's verification standing. Demo returns the colocated
 * fixture and never hits the network. */
export function useVerificationStatus() {
  const { demoMode } = useDemoMode();
  return useQuery<VerificationStatusDTO>({
    queryKey: [VERIFICATION_STATUS_KEY, demoMode],
    initialData: demoMode ? DEMO_VERIFICATION_STATUS : undefined,
    queryFn: () =>
      demoMode
        ? Promise.resolve(DEMO_VERIFICATION_STATUS)
        : getVerificationStatus(),
  });
}

/** Start a phone challenge (sends an OTP). Demo is a no-op success. */
export function useStartPhoneVerification() {
  const { demoMode } = useDemoMode();
  return useMutation<{ started: true }, Error, string>({
    meta: { silentError: true },
    mutationFn: (phoneNumber) =>
      demoMode
        ? Promise.resolve({ started: true as const })
        : startPhoneVerification(phoneNumber),
  });
}

/** Confirm the OTP and raise to phone level. Demo accepts any code. Writes the
 * new status into the cache so badges/gates update immediately. */
export function useVerifyPhone() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<VerificationStatusDTO, Error, string>({
    meta: { silentError: true },
    mutationFn: (code) =>
      demoMode ? Promise.resolve(DEMO_PHONE_VERIFIED) : verifyPhoneCode(code),
    onSuccess: (status) => {
      queryClient.setQueryData(
        [VERIFICATION_STATUS_KEY, demoMode],
        status,
      );
    },
  });
}

/** Start an external ID check; live returns the provider redirect. Demo returns
 * an empty redirect (the modal simulates completion locally instead). */
export function useStartIdentityVerification() {
  const { demoMode } = useDemoMode();
  return useMutation<
    { redirectUrl: string; providerRef: string },
    Error,
    void
  >({
    meta: { silentError: true },
    mutationFn: () =>
      demoMode
        ? Promise.resolve({ redirectUrl: "", providerRef: "demo" })
        : startIdentityVerification(),
  });
}
