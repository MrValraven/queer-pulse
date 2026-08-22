import { useCallback, useRef, useState } from "react";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logError } from "../../../shared/observability/logger";
import { postUnderAgeDisclosure } from "./auth.api";

/**
 * The signed-in "I'm not 18 yet" path: record the disclosure with the backend,
 * then end the session.
 *
 * Order matters. Signing out first would drop the session cookie the route
 * needs, so the platform would go on holding a fully active adult-community
 * account for someone who just told us they are under 18. Recording first is
 * what makes the notice true.
 *
 * Robust by design: a failed call still signs the member out, because leaving
 * them inside an adults-only space is the worse outcome, and the failure is
 * logged (so it reaches error monitoring) rather than swallowed. The one-shot
 * ref keeps a double tap from firing two round trips.
 *
 * Demo mode never touches the network and just signs out of the local demo
 * session, matching every other live path's demo fallback.
 */
export function useUnderAgeDisclosure() {
  const { signOut } = useAuth();
  const { demoMode } = useDemoMode();
  const [isRecording, setIsRecording] = useState(false);
  const hasStartedRef = useRef(false);

  const discloseAndSignOut = useCallback(async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    setIsRecording(true);
    try {
      if (!demoMode) await postUnderAgeDisclosure();
    } catch (error) {
      logError(error, { context: "auth.underAgeDisclosure" });
    } finally {
      setIsRecording(false);
      signOut();
    }
  }, [demoMode, signOut]);

  return { discloseAndSignOut, isRecording };
}
