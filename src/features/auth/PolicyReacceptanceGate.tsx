import { useCallback, useState } from "react";
import { useAuth } from "../../app/providers/authContext";
import { usePolicyReacceptanceRequired } from "../../app/authGate";
import { PolicyReacceptanceSheet } from "./PolicyReacceptanceSheet";

/**
 * Mounts the policy re-acceptance sheet when the signed-in member's agreement
 * has fallen behind (ID-14). Sits next to `<ConsentBanner/>` in `App.tsx`: both
 * are app-level, session-scoped interruptions that belong above the route
 * switch rather than inside any one page.
 *
 * The decision itself lives in `usePolicyReacceptanceRequired`
 * (`app/authGate.ts`), alongside the onboarding and account-status gates, so
 * there is one file to read to know what can block a member and why. This
 * component only owns the in-session "they just agreed" latch.
 *
 * That latch matters: `refresh()` re-runs `POST /auth/refresh` + `GET /auth/me`
 * and takes a round trip or two to land, and until the cached user updates the
 * gate would still say "behind" and the sheet would flicker straight back over
 * the page they were returned to. `hasJustAccepted` closes it immediately on a
 * confirmed write; the refresh then reconciles the cache in the background, and
 * the next reload reads the persisted versions either way.
 */
export function PolicyReacceptanceGate() {
  const { refresh, user } = useAuth();
  const isRequired = usePolicyReacceptanceRequired();
  const [hasJustAccepted, setJustAccepted] = useState(false);

  const handleAccepted = useCallback(() => {
    setJustAccepted(true);
    void refresh();
  }, [refresh]);

  const policyVersions = user?.policyVersions;
  if (!isRequired || hasJustAccepted || !policyVersions) return null;

  return (
    <PolicyReacceptanceSheet
      policyVersions={policyVersions}
      onAccepted={handleAccepted}
    />
  );
}
