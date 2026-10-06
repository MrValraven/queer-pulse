import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { VERIFICATION_STATUS_KEY } from "../../economy/api/useVerification";
import {
  getVerificationStatus,
  meetsLevel,
  type VerificationStatusWithRequestDTO,
} from "../../economy/api/verification.api";
import { DEMO_VERIFICATION_STATUS } from "../../economy/verification.data";

export type AskEligibilityStatus = "checking" | "allowed" | "needsPhone";

export interface AskEligibility {
  status: AskEligibilityStatus;
  refresh: () => void;
}

/**
 * May this member start a fundraiser (phone verification or above)?
 *
 * Shares `useVerificationStatus`'s cache key, so `StepUpVerificationModal`'s
 * own updates land here, and fetches only while a fundraiser is being written.
 * A lookup that fails reads as allowed: the server refuses with
 * `funding_ask_verification_required`, which shows the gate anyway, and a
 * member is never locked out by a network error.
 */
export function useAskEligibility(isEnabled: boolean): AskEligibility {
  const { demoMode } = useDemoMode();
  const query = useQuery<VerificationStatusWithRequestDTO>({
    queryKey: [VERIFICATION_STATUS_KEY, demoMode],
    enabled: isEnabled,
    initialData: demoMode ? DEMO_VERIFICATION_STATUS : undefined,
    queryFn: () =>
      demoMode
        ? Promise.resolve(DEMO_VERIFICATION_STATUS)
        : getVerificationStatus(),
  });
  const level = query.data?.level;
  let status: AskEligibilityStatus = "checking";
  if (level) status = meetsLevel(level, "phone") ? "allowed" : "needsPhone";
  else if (query.isError) status = "allowed";
  return { status, refresh: () => void query.refetch() };
}
