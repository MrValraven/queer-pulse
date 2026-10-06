import { createElement, useCallback, useState, type ReactElement } from "react";
import { StepUpVerificationModal } from "./StepUpVerificationModal";
import {
  verificationRequiredFrom,
  type VerificationLevel,
} from "./api/verification.api";

/**
 * Reusable catch/retry for the verification step-up, the twin of
 * `useAffirmingPledgeGate`. Wire it into any contact mutation the backend puts
 * behind `requireLevel`:
 *
 *   const { handleStepUpError, stepUpGate } = useStepUpVerificationGate();
 *   ...
 *   onError: (error) => {
 *     if (handlePledgeError(error, retry) || handleStepUpError(error, retry)) {
 *       return; // a gate opened
 *     }
 *     // ...existing error handling
 *   }
 *   ...
 *   const gate = pledgeGate ?? stepUpGate;
 *   if (gate) return gate;
 *
 * `handleStepUpError` returns `true` when the error was a
 * `VERIFICATION_REQUIRED` 403 (and it stashed the retry + opened the prompt),
 * so the caller stops its own error handling. Once verified, the stored retry
 * runs with the payload the member already wrote.
 */
export function useStepUpVerificationGate(): {
  handleStepUpError: (error: unknown, onRetry: () => void) => boolean;
  stepUpGate: ReactElement | null;
} {
  const [pending, setPending] = useState<{
    level: VerificationLevel;
    run: () => void;
  } | null>(null);

  const handleStepUpError = useCallback(
    (error: unknown, onRetry: () => void): boolean => {
      const requiredLevel = verificationRequiredFrom(error);
      if (requiredLevel) {
        setPending({ level: requiredLevel, run: onRetry });
        return true;
      }
      return false;
    },
    [],
  );

  const stepUpGate = pending
    ? createElement(StepUpVerificationModal, {
        requiredLevel: pending.level,
        onVerified: () => {
          const stored = pending;
          setPending(null);
          stored.run();
        },
        onClose: () => setPending(null),
      })
    : null;

  return { handleStepUpError, stepUpGate };
}
