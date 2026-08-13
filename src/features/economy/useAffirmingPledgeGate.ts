import { createElement, useCallback, useState, type ReactElement } from "react";
import { AffirmingPledgeModal } from "./AffirmingPledgeModal";
import { affirmingPledgeRequiredFrom } from "./api/affirmingPledge.api";

/**
 * Reusable catch/retry for the LGBTQ+ affirming pledge, mirroring the
 * verification step-up catch. Wire it into any housing create/contact mutation:
 *
 *   const { handlePledgeError, pledgeGate } = useAffirmingPledgeGate();
 *   ...
 *   onError: (error) => {
 *     if (handlePledgeError(error, () => submit())) return; // opened the modal
 *     // ...existing error handling
 *   }
 *   ...
 *   if (pledgeGate) return pledgeGate; // render the pledge prompt instead
 *
 * `handlePledgeError` returns `true` when the error was an
 * `AFFIRMING_PLEDGE_REQUIRED` 403 (and it stashed the retry + opened the modal),
 * so the caller stops its own error handling. On accept, the stored retry runs.
 */
export function useAffirmingPledgeGate(): {
  handlePledgeError: (error: unknown, onRetry: () => void) => boolean;
  pledgeGate: ReactElement | null;
} {
  const [retry, setRetry] = useState<{ run: () => void } | null>(null);

  const handlePledgeError = useCallback(
    (error: unknown, onRetry: () => void): boolean => {
      if (affirmingPledgeRequiredFrom(error)) {
        setRetry({ run: onRetry });
        return true;
      }
      return false;
    },
    [],
  );

  const pledgeGate = retry
    ? createElement(AffirmingPledgeModal, {
        onAccepted: () => {
          const stored = retry;
          setRetry(null);
          stored.run();
        },
        onClose: () => setRetry(null),
      })
    : null;

  return { handlePledgeError, pledgeGate };
}
