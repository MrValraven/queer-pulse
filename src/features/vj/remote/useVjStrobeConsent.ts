import { useCallback, useState } from "react";

/**
 * The shows whose strobe warning was confirmed on this page load. A new
 * stageEpoch is a new show, so the warning comes back; a reload asks again
 * too, since the set lives in memory only.
 */
const consentedStageEpochs = new Set<string>();

/**
 * Design 6.4: the first Start strobe in a show asks for a second tap with the
 * seizure warning. Once that second tap lands, every later Start strobe in the
 * same show sends at once.
 */
export function useVjStrobeConsent(stageEpoch: string): {
  hasConsented: boolean;
  consent: () => void;
} {
  const [, setConsentCount] = useState(0);
  const consent = useCallback(() => {
    consentedStageEpochs.add(stageEpoch);
    setConsentCount((count) => count + 1);
  }, [stageEpoch]);
  return { hasConsented: consentedStageEpochs.has(stageEpoch), consent };
}
