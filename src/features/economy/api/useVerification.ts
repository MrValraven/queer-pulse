import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  DEMO_VERIFICATION_STATUS,
  simulateVerificationRequestSubmission,
  simulateVerificationRequestTransition,
} from "../verification.data";
import {
  appealVerificationRequest,
  getVerificationStatus,
  startIdentityVerification,
  submitVerificationRequest,
  withdrawVerificationRequest,
  type SubmitVerificationRequestInput,
  type VerificationRequestDTO,
  type VerificationStatusWithRequestDTO,
} from "./verification.api";

export const VERIFICATION_STATUS_KEY = "verification-status";

/** The current member's verification standing, plus their newest request (if
 * any) via `latestRequest` — what the step-up modal and the "needed" page
 * read to show submitted/in-review/approved/rejected/appealing status. Demo
 * returns the colocated fixture and never hits the network. */
export function useVerificationStatus() {
  const { demoMode } = useDemoMode();
  return useQuery<VerificationStatusWithRequestDTO>({
    queryKey: [VERIFICATION_STATUS_KEY, demoMode],
    initialData: demoMode ? DEMO_VERIFICATION_STATUS : undefined,
    queryFn: () =>
      demoMode
        ? Promise.resolve(DEMO_VERIFICATION_STATUS)
        : getVerificationStatus(),
  });
}

/** Start an external ID check; live returns the provider redirect. Demo returns
 * an empty redirect (the modal simulates completion locally instead). */
export function useStartIdentityVerification() {
  const { demoMode } = useDemoMode();
  return useMutation<{ redirectUrl: string; providerRef: string }, Error, void>(
    {
      meta: { silentError: true },
      mutationFn: () =>
        demoMode
          ? Promise.resolve({ redirectUrl: "", providerRef: "demo" })
          : startIdentityVerification(),
    },
  );
}

/** Writes a decided request into the `latestRequest` slot of the cached
 * verification status, live-reconciling afterward. Shared by submit/withdraw/
 * appeal below — each just resolves a different `VerificationRequestDTO`. */
function useApplyLatestRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return (request: VerificationRequestDTO) => {
    queryClient.setQueryData<VerificationStatusWithRequestDTO | undefined>(
      [VERIFICATION_STATUS_KEY, demoMode],
      (previous) =>
        previous ? { ...previous, latestRequest: request } : previous,
    );
    if (!demoMode) {
      void queryClient.invalidateQueries({
        queryKey: [VERIFICATION_STATUS_KEY, false],
      });
    }
  };
}

/**
 * Submit a new manual verification request (option-A, reference-based
 * evidence — no document upload). 409s live when the member already has an
 * open request for the type; the caller surfaces that itself (`silentError`).
 * Demo simulates a fresh `pending` request via the colocated fixture helper
 * and never hits the network.
 */
export function useSubmitVerificationRequest() {
  const { demoMode } = useDemoMode();
  const applyLatestRequest = useApplyLatestRequest();
  return useMutation<
    VerificationRequestDTO,
    Error,
    SubmitVerificationRequestInput
  >({
    meta: { silentError: true },
    mutationFn: (input) =>
      demoMode
        ? Promise.resolve(simulateVerificationRequestSubmission(input))
        : submitVerificationRequest(input),
    onSuccess: applyLatestRequest,
  });
}

/** Withdraw your own open request (only legal from pending/in_review — the
 * server enforces this; demo mirrors the same state machine loosely by just
 * re-stamping the cached request). */
export function useWithdrawVerificationRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const applyLatestRequest = useApplyLatestRequest();
  return useMutation<VerificationRequestDTO, Error, string>({
    meta: { silentError: true },
    mutationFn: (requestId) => {
      if (demoMode) {
        const current =
          queryClient.getQueryData<VerificationStatusWithRequestDTO>([
            VERIFICATION_STATUS_KEY,
            true,
          ]);
        return Promise.resolve(
          simulateVerificationRequestTransition(
            current?.latestRequest,
            requestId,
            "withdrawn",
          ),
        );
      }
      return withdrawVerificationRequest(requestId);
    },
    onSuccess: applyLatestRequest,
  });
}

/** Appeal a rejected request, exactly once (409 live on a second appeal or
 * from any other status — surfaced by the caller). */
export function useAppealVerificationRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const applyLatestRequest = useApplyLatestRequest();
  return useMutation<VerificationRequestDTO, Error, string>({
    meta: { silentError: true },
    mutationFn: (requestId) => {
      if (demoMode) {
        const current =
          queryClient.getQueryData<VerificationStatusWithRequestDTO>([
            VERIFICATION_STATUS_KEY,
            true,
          ]);
        return Promise.resolve(
          simulateVerificationRequestTransition(
            current?.latestRequest,
            requestId,
            "appealing",
            { isAppeal: true },
          ),
        );
      }
      return appealVerificationRequest(requestId);
    },
    onSuccess: applyLatestRequest,
  });
}
