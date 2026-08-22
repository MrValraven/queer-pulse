import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "./DemoModeProvider";
import { useAuth } from "./authContext";
import {
  evaluatePublicEligibility,
  type PublicEligibility,
} from "../../features/members/publicFigure";
import {
  demoEligibilitySignals,
  liveEligibilitySignals,
} from "../../features/members/eligibilitySignals.data";
import {
  putPublicProfileVisibility,
  type PublicProfileVisibilityDTO,
} from "../../features/members/api/publicProfile.api";
import { usePublicEligibilitySignals } from "../../features/members/api/usePublicEligibilitySignals";
import { logError } from "../../shared/observability/logger";
import {
  PublicProfileContext,
  type PublicProfileContextValue,
} from "./usePublicProfile";

/** Shown while live signals are loading/errored — locked, no score, no actions. */
const PENDING_ELIGIBILITY: PublicEligibility = {
  gates: [],
  score: { total: 0, target: 100, families: [] },
  standingOk: true,
  eligible: false,
  nextActions: [],
};

/**
 * Owns the member's public-profile preference and derives eligibility from their
 * live signals.
 *
 * Dual-mode: demo mode is session-only (no network) and scores eligibility from
 * the `currentUserPublic.data` fixture, exactly as the prototype always did.
 * Live mode reads/writes GET+PUT /me/public-profile and scores eligibility from
 * GET /me/public-eligibility, fetched asynchronously — `eligibilityStatus`
 * tells consumers whether that fetch is still loading, errored, or ready, and
 * `eligibility` stays a neutral locked placeholder until it resolves.
 *
 * ELIGIBILITY IS DEMAND-DRIVEN. This provider is mounted app-wide, so a fetch
 * gated only on `live` fired GET /me/public-eligibility on every route for
 * every signed-in member, while the only things that read the answer are the
 * profile hero's badge and the public-profile modal. `usePublicProfileEligibility()`
 * registers demand for as long as such a consumer is mounted, and the query
 * stays disabled until one is — the same "the request fires where the control
 * is shown" rule `usePublicProfile()` already applies to GET /me/public-profile.
 */
export function PublicProfileProvider({ children }: { children: ReactNode }) {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const queryClient = useQueryClient();
  const [enabled, setEnabledState] = useState(false);

  const live = !demoMode && loggedIn;

  // How many mounted consumers are actually reading eligibility. A counter
  // rather than a boolean so two consumers (the hero badge and the modal it
  // opens) don't switch the query off when the first of them unmounts.
  const [eligibilityDemand, setEligibilityDemand] = useState(0);
  const requestEligibility = useCallback(() => {
    setEligibilityDemand((count) => count + 1);
    return () => setEligibilityDemand((count) => count - 1);
  }, []);

  const signalsQuery = usePublicEligibilitySignals(live && eligibilityDemand > 0);

  const eligibility = useMemo<PublicEligibility>(() => {
    // A single reference "now" the pure evaluator scores against — resolved here
    // (the impure boundary), not inside the evaluator, so renders stay stable
    // within a session. ISO string keeps the evaluator wall-clock-free.
    const nowIso = new Date().toISOString();
    if (demoMode) {
      return evaluatePublicEligibility(demoEligibilitySignals(nowIso));
    }
    if (signalsQuery.data) {
      return evaluatePublicEligibility(
        liveEligibilitySignals(signalsQuery.data, nowIso),
      );
    }
    return PENDING_ELIGIBILITY;
  }, [demoMode, signalsQuery.data]);

  const eligibilityStatus: "loading" | "ready" | "error" = demoMode
    ? "ready"
    : signalsQuery.isError
      ? "error"
      : signalsQuery.data
        ? "ready"
        : "loading";

  // Captured by name rather than closing over `signalsQuery` (a fresh object
  // every render) — `refetch` itself is a stable reference, so `retryEligibility`
  // stays stable too and doesn't bust the context `value` memo below.
  const { refetch: refetchSignals } = signalsQuery;
  const retryEligibility = useCallback(() => {
    if (live) void refetchSignals();
  }, [live, refetchSignals]);

  // Whether this live session has already adopted the stored preference.
  const hydrated = useRef(false);

  const hydrate = useCallback((data: PublicProfileVisibilityDTO) => {
    if (hydrated.current) return;
    hydrated.current = true;
    setEnabledState(data.enabled);
  }, []);

  // Demo mode / signed out has no stored preference to show — and re-arm the
  // latch so the next live session hydrates for itself.
  useEffect(() => {
    if (live) return;
    hydrated.current = false;
    // Resets on the external live/demo mode change, re-arming the hydration latch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabledState(false);
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
      eligibilityStatus,
      retryEligibility,
      requestEligibility,
      hydrate,
    }),
    [
      enabled,
      setEnabled,
      toggle,
      saving,
      eligibility,
      eligibilityStatus,
      retryEligibility,
      requestEligibility,
      hydrate,
    ],
  );

  return (
    <PublicProfileContext.Provider value={value}>
      {children}
    </PublicProfileContext.Provider>
  );
}
