import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "./ProfileProvider";
import { useDemoMode } from "./DemoModeProvider";
import { useAuth } from "./authContext";
import {
  evaluatePublicEligibility,
  type ContributionSignals,
  type PublicEligibility,
} from "../../features/members/publicFigure";
import { CURRENT_USER_PUBLIC } from "../../features/members/currentUserPublic.data";
import {
  getPublicProfileVisibility,
  putPublicProfileVisibility,
} from "../../features/members/api/publicProfile.api";
import { logError } from "../../shared/observability/logger";

interface PublicProfileContextValue {
  /** Whether the member has asked for a public profile. Off by default. */
  enabled: boolean;
  /** Set the preference; resolves false when the write failed. */
  setEnabled: (value: boolean) => Promise<boolean>;
  toggle: () => Promise<boolean>;
  /** True while a write is in flight. */
  saving: boolean;
  /** Derived from the live self profile — whether the member may go public. */
  eligibility: PublicEligibility;
}

const PublicProfileContext = createContext<PublicProfileContextValue | null>(
  null,
);

/**
 * Public-pieces count for the demo fixture — the mock member's published
 * writing plus the open events they host.
 */
const DEMO_SIGNALS: ContributionSignals = {
  publicPieces:
    CURRENT_USER_PUBLIC.writing.length + CURRENT_USER_PUBLIC.hosting.length,
};

/**
 * Public-pieces count for a real member, read off their own profile.
 *
 * `activity` is the member's recent *public* activity across the platform and
 * `work` is the selected work they choose to surface — the two public-facing
 * signals the profile payload actually carries. It's a proxy until the backend
 * exposes a contributions endpoint, but it is *theirs*: eligibility for a real
 * member must never be decided by a fixture describing a fictional one.
 */
function signalsFromProfile(profile: {
  activity: unknown[];
  work: unknown[];
}): ContributionSignals {
  return { publicPieces: profile.activity.length + profile.work.length };
}

/**
 * Owns the member's public-profile preference and derives eligibility from their
 * live profile. Must sit inside `ProfileProvider`, since eligibility reads
 * `useProfile()`.
 *
 * Dual-mode: demo mode is session-only (no network) and scores eligibility from
 * the `currentUserPublic.data` fixture, exactly as the prototype always did.
 * Live mode reads/writes GET+PUT /me/public-profile and scores eligibility from
 * the signed-in member's real profile.
 */
export function PublicProfileProvider({ children }: { children: ReactNode }) {
  const { profile } = useProfile();
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const queryClient = useQueryClient();
  const [enabled, setEnabledState] = useState(false);

  const live = !demoMode && loggedIn;

  const eligibility = useMemo(
    () =>
      evaluatePublicEligibility(
        profile,
        demoMode ? DEMO_SIGNALS : signalsFromProfile(profile),
      ),
    [profile, demoMode],
  );

  const { data } = useQuery({
    queryKey: ["publicProfileVisibility", demoMode],
    enabled: live,
    queryFn: getPublicProfileVisibility,
  });

  useEffect(() => {
    if (data) setEnabledState(data.enabled);
  }, [data]);

  // Demo mode / signed out has no stored preference to show.
  useEffect(() => {
    if (!live) setEnabledState(false);
  }, [live]);

  const { mutateAsync: writeVisibility, isPending: saving } = useMutation({
    mutationKey: ["publicProfileVisibility", "save"],
    mutationFn: putPublicProfileVisibility,
  });

  const setEnabled = useCallback(
    async (value: boolean): Promise<boolean> => {
      if (!live) {
        setEnabledState(value);
        return true;
      }
      const previous = enabled;
      setEnabledState(value);
      try {
        const res = await writeVisibility(value);
        setEnabledState(res.enabled);
        queryClient.setQueryData(["publicProfileVisibility", demoMode], res);
        return true;
      } catch (err) {
        logError(err, { scope: "publicProfile.setEnabled" });
        setEnabledState(previous);
        return false;
      }
    },
    [live, enabled, writeVisibility, queryClient, demoMode],
  );

  const toggle = useCallback(() => setEnabled(!enabled), [setEnabled, enabled]);

  const value = useMemo<PublicProfileContextValue>(
    () => ({
      enabled,
      setEnabled,
      toggle,
      saving,
      eligibility,
    }),
    [enabled, setEnabled, toggle, saving, eligibility],
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
