import { useContext } from "react";
import { AuthContext } from "../../../app/providers/authContext";
import type { EarlyAccessFeatureKey } from "../../../shared/contracts/earlyAccess";

/**
 * Whether the signed-in member holds an early-access grant for `featureKey`,
 * read off `user.earlyAccessFeatures` (sourced from `/auth/me`). This is the
 * grant alone: demo mode, `pnpm dev` and launch are layered on top by each
 * feature's visibility check (e.g. `isQuizshowVisible`), so demo stays false
 * here like the demo user's empty list.
 *
 * Reads the context directly so a page rendered without an `AuthProvider`
 * (component tests) reads "no grant" instead of throwing the way `useAuth`
 * does. Signed out, and while the session is still being checked, there is no
 * user, so this is false; the route gate holds gated paths on the loader in
 * that window, so nothing decides on the early false.
 */
export function useHasEarlyAccess(featureKey: EarlyAccessFeatureKey): boolean {
  const auth = useContext(AuthContext);
  const grantedFeatures = auth?.user?.earlyAccessFeatures ?? [];
  return grantedFeatures.includes(featureKey);
}
