import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useProfile } from "./ProfileProvider";
import {
  evaluatePublicEligibility,
  type PublicEligibility,
} from "../../features/members/publicFigure";
import { CURRENT_USER_PUBLIC } from "../../features/members/currentUserPublic.data";

interface PublicProfileContextValue {
  /** Whether the member's public profile is live. Off by default. */
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  toggle: () => void;
  /** Derived from the live self profile — whether the member may go public. */
  eligibility: PublicEligibility;
}

const PublicProfileContext = createContext<PublicProfileContextValue | null>(
  null,
);

/**
 * Owns the one piece of public-profile state — whether it's switched on — and
 * derives eligibility from the logged-in member's live profile. Session-lived
 * (no backend), consistent with the app's other mock providers. Must sit inside
 * `ProfileProvider`, since eligibility reads `useProfile()`.
 */
export function PublicProfileProvider({ children }: { children: ReactNode }) {
  const { profile } = useProfile();
  const [enabled, setEnabled] = useState(false);

  const eligibility = useMemo(
    () => evaluatePublicEligibility(profile, CURRENT_USER_PUBLIC),
    [profile],
  );

  const toggle = useCallback(() => setEnabled((v) => !v), []);

  const value = useMemo<PublicProfileContextValue>(
    () => ({ enabled, setEnabled, toggle, eligibility }),
    [enabled, toggle, eligibility],
  );

  return (
    <PublicProfileContext.Provider value={value}>
      {children}
    </PublicProfileContext.Provider>
  );
}

export function usePublicProfile(): PublicProfileContextValue {
  const ctx = useContext(PublicProfileContext);
  if (!ctx)
    throw new Error(
      "usePublicProfile must be used within a PublicProfileProvider",
    );
  return ctx;
}
