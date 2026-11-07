/**
 * The flash warning (design decision 4): the first flash-capable effect,
 * transition or strobe in a show asks for a second tap with the seizure
 * warning; once confirmed, every later flash in the same show sends at once.
 * A new stageEpoch is a new show, so the warning comes back. Consent lives in
 * memory only, so a reload asks again.
 */
import { useCallback, useState } from "react";

/** The stage epochs whose flash warning was confirmed on this page load. */
const consentedStageEpochs = new Set<string>();

export interface VjFlashConsent {
  hasConsented: boolean;
  consent: () => void;
}

/** With no stage epoch yet (no state received), nothing can be confirmed. */
export function useVjFlashConsent(stageEpoch: string | null): VjFlashConsent {
  const [, setConsentCount] = useState(0);
  const consent = useCallback(() => {
    if (stageEpoch === null) return;
    consentedStageEpochs.add(stageEpoch);
    setConsentCount((count) => count + 1);
  }, [stageEpoch]);
  const hasConsented =
    stageEpoch !== null && consentedStageEpochs.has(stageEpoch);
  return { hasConsented, consent };
}
