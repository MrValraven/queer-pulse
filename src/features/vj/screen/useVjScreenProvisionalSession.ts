import { useEffect, useRef, useState } from "react";
import type { AuthErrorCode } from "../../../app/providers/authContext";
import type { AuthUser } from "../../auth/api/auth.api";
import { probeSignedInSession } from "../../../shared/api/queryPersistence/sessionProbe";
import {
  clearVjScreenSession,
  readVjScreenSession,
  saveVjScreenSession,
  toProvisionalVjAdmin,
} from "./vjScreenSession";

interface VjScreenProvisionalSessionInput {
  demoMode: boolean;
  /** The confirmed user from `AuthProvider`, or null. */
  user: AuthUser | null;
  isOnline: boolean;
  /** True on the first render of a launch that started with no network. */
  isColdOfflineBoot: boolean;
  /** The page is the projector at `/admin/vj/screen`. */
  isVjScreenRoute: boolean;
  /**
   * `AuthProvider`'s session error. A `network` error with no user once the
   * check is over means `/auth/me` never answered (a dead uplink behind live
   * wifi), which the projector treats like an offline boot.
   */
  authError?: AuthErrorCode | null;
  /** `AuthProvider`'s `checking`: the session is still being determined. */
  isSessionChecking?: boolean;
  /** `AuthProvider`'s refresh, used to adopt a session the probe confirmed. */
  refreshSession: () => Promise<void>;
}

interface VjScreenProvisionalSessionResult {
  /**
   * The admin who last set up a screen on this device, standing in for the
   * session while `/auth/me` cannot confirm anyone. Set only on the VJ screen
   * route, only in live mode and only while no confirmed user exists.
   */
  provisionalUser: AuthUser | null;
}

interface StandInState {
  /**
   * The saved record was read for this boot, or a confirmed user was seen on
   * this mount: either way it is never read again.
   */
  hasReadRecord: boolean;
  standInUser: AuthUser | null;
}

/** While a provisional admin stands in online, an unreachable server is asked again this often. */
export const VJ_SCREEN_SESSION_REPROBE_MS = 30_000;

function readStandInUser(): AuthUser | null {
  const savedRecord = readVjScreenSession();
  return savedRecord ? toProvisionalVjAdmin(savedRecord) : null;
}

/**
 * Lets the VJ projector reload with no internet and keep the show going.
 *
 * - A confirmed active admin on the VJ screen route saves the small session
 *   record; a confirmed user who is no active admin, or another person than
 *   the saved one, clears it on any route; a confirmed user who goes away
 *   while online (a sign out in this tab) clears it too.
 * - A cold offline boot on the VJ screen route with no confirmed user reads
 *   the record synchronously from localStorage and answers the saved admin
 *   as a provisional user. So does a boot whose `/auth/me` failed on the
 *   network with no user (the browser says online, the server is out of
 *   reach). The record must be an active admin saved under 7 days ago, and
 *   once a confirmed user was seen on this mount it is never read again.
 * - Once online with that provisional admin still standing in, `/auth/me` is
 *   probed on every online transition: `confirmed` adopts the session through
 *   `refreshSession`, `signedOut` clears the record and drops the stand-in so
 *   the admin gate sends the page to sign in, and `unreachable` keeps it and
 *   asks again after VJ_SCREEN_SESSION_REPROBE_MS.
 *
 * Demo mode needs no network, so nothing here runs there.
 */
export function useVjScreenProvisionalSession({
  demoMode,
  user,
  isOnline,
  isColdOfflineBoot,
  isVjScreenRoute,
  refreshSession,
  authError = null,
  isSessionChecking = false,
}: VjScreenProvisionalSessionInput): VjScreenProvisionalSessionResult {
  const hasNetworkBootFailure =
    !isSessionChecking && authError?.kind === "network";
  const shouldReadRecord =
    !demoMode &&
    isVjScreenRoute &&
    user === null &&
    (isColdOfflineBoot || hasNetworkBootFailure);
  const [standIn, setStandIn] = useState<StandInState>(() => ({
    hasReadRecord: shouldReadRecord,
    standInUser: shouldReadRecord ? readStandInUser() : null,
  }));

  // Both adjustments run during render, each guarded by the condition it
  // clears, so the first committed frame already carries the right session.
  if (shouldReadRecord && !standIn.hasReadRecord) {
    setStandIn({ hasReadRecord: true, standInUser: readStandInUser() });
  }
  const hasConfirmedUser = user !== null;
  if (
    hasConfirmedUser &&
    (standIn.standInUser !== null || !standIn.hasReadRecord)
  ) {
    setStandIn({ hasReadRecord: true, standInUser: null });
  }

  const liveUser = demoMode ? null : user;
  useEffect(() => {
    if (!liveUser) return;
    const isActiveAdmin =
      liveUser.role === "admin" && liveUser.status === "active";
    if (!isActiveAdmin) {
      clearVjScreenSession();
      return;
    }
    if (isVjScreenRoute) {
      saveVjScreenSession(liveUser);
      return;
    }
    const savedRecord = readVjScreenSession();
    if (savedRecord && savedRecord.userId !== liveUser.id) {
      clearVjScreenSession();
    }
  }, [liveUser, isVjScreenRoute]);

  const lastConfirmedUserIdRef = useRef<string | null>(null);
  const liveUserId = liveUser?.id ?? null;
  useEffect(() => {
    const previousUserId = lastConfirmedUserIdRef.current;
    lastConfirmedUserIdRef.current = liveUserId;
    if (previousUserId !== null && liveUserId === null && isOnline) {
      clearVjScreenSession();
    }
  }, [liveUserId, isOnline]);

  const latestRefreshSessionRef = useRef(refreshSession);
  useEffect(() => {
    latestRefreshSessionRef.current = refreshSession;
  }, [refreshSession]);

  const isStandingIn =
    !demoMode &&
    isVjScreenRoute &&
    !hasConfirmedUser &&
    standIn.standInUser !== null;
  const shouldProbeSession = isStandingIn && isOnline;
  useEffect(() => {
    if (!shouldProbeSession) return;
    let isCurrent = true;
    let reprobeTimerId: number | undefined;
    // A flap turns `isOnline` off and on again, which flips
    // `shouldProbeSession` and probes once more. `unreachable` keeps the
    // stand-in and asks again later: with a dead uplink behind live wifi,
    // `online` never fires, and a sign out must still reach this screen.
    const probe = (): void => {
      void probeSignedInSession().then((verdict) => {
        if (!isCurrent) return;
        if (verdict === "confirmed") {
          // The render-phase reset above retires the stand-in once
          // AuthProvider reports the user.
          void latestRefreshSessionRef.current();
          return;
        }
        if (verdict === "signedOut") {
          clearVjScreenSession();
          setStandIn({ hasReadRecord: true, standInUser: null });
          return;
        }
        reprobeTimerId = window.setTimeout(probe, VJ_SCREEN_SESSION_REPROBE_MS);
      });
    };
    probe();
    return () => {
      isCurrent = false;
      window.clearTimeout(reprobeTimerId);
    };
  }, [shouldProbeSession]);

  return { provisionalUser: isStandingIn ? standIn.standInUser : null };
}
