import { useEffect, useState, type MutableRefObject } from "react";
import type { QueryClient } from "@tanstack/react-query";
import type { AuthUser } from "../../../features/auth/api/auth.api";
import {
  purgeMessagingCache,
  readPersistedMessagingCacheResult,
  removeMessagingQueries,
} from "./messagingCachePersistence";
import { probeSignedInSession } from "./sessionProbe";
import type { ProvisionalRestore } from "./useMessagingCachePersistence";

interface SessionAbsenceProbeInput {
  demoMode: boolean;
  hasConfirmedUser: boolean;
  isSessionChecking: boolean;
  isOnline: boolean;
  /** True while `useMessagingCachePersistence`'s own recheck effect already
   *  owns the probe for a provisional restore on the messages route, so the
   *  two never race each other's purge. */
  shouldRecheckSession: boolean;
  refreshSession: () => Promise<void>;
  queryClient: QueryClient;
  lastConfirmedMemberIdRef: MutableRefObject<string | null>;
  hydratedMemberIdRef: MutableRefObject<string | null>;
  hasDefinitiveSessionAbsenceVerdictRef: MutableRefObject<boolean>;
  /** Kept in sync with `AuthProvider`'s `user` by the parent hook's own
   *  effect, so this hook can read the outcome of `refreshSession()` after
   *  awaiting it: the `hasConfirmedUser` prop above is a snapshot from the
   *  render that scheduled this effect and goes stale across an `await`. */
  latestUserRef: MutableRefObject<AuthUser | null>;
  setProvisional: (next: ProvisionalRestore) => void;
}

/**
 * Privacy backstop for a member this tab never confirmed, or confirmed and
 * then lost: a revoked or expired session must not leave a saved inbox
 * readable offline for up to seven days just because nobody reopened
 * Messages to trigger `useMessagingCachePersistence`'s own recheck effect
 * (which only runs for a provisional restore ON the messages route).
 * Extracted into its own hook to keep that function under the 200-line
 * budget.
 *
 * Covers two cases:
 * - a member was confirmed here and went away (sign-out elsewhere, an
 *   expired or revoked session, or a refresh that failed on a flaky
 *   network; only the server can tell these apart);
 * - this tab never confirmed anyone, but a record from an earlier launch is
 *   still on disk (a fresh online launch after "sign out all sessions" on
 *   another device).
 *
 * On each run: read the disk record first (a target member with nothing on
 * disk, e.g. an explicit sign-out that already purged directly, needs no
 * network probe at all); probe `/auth/me` for that member; on `confirmed`,
 * await `AuthProvider`'s own `refreshSession()` to adopt the session and
 * only latch "definitive" if that adoption actually lands a user (a refused
 * rotation, the member signed out elsewhere between the probe and the
 * refresh, must not wedge the tab); on `signedOut`, re-read the disk before
 * purging, since another tab may have signed the same member back in while
 * the probe was in flight, and skip the purge if a newer record shows up.
 *
 * `isSessionChecking` holds the whole thing off while `AuthProvider`'s own
 * bootstrap (`GET /auth/me`, gated behind `bootstrapCsrf`) is still in
 * flight: that round trip alone settles `hasConfirmedUser` for the ordinary
 * case, and probing here too would fire a second `/auth/me` on nearly every
 * online launch that has a saved record. Retried on the next reconnect
 * (`isOnline`) or the next time the tab becomes visible again (a captive
 * portal, a VPN drop, a 5xx or an abandoned refresh lock can all leave
 * `navigator.onLine` untouched for hours), bounded to once per trigger.
 */
export function useSessionAbsenceProbe({
  demoMode,
  hasConfirmedUser,
  isSessionChecking,
  isOnline,
  shouldRecheckSession,
  refreshSession,
  queryClient,
  lastConfirmedMemberIdRef,
  hydratedMemberIdRef,
  hasDefinitiveSessionAbsenceVerdictRef,
  latestUserRef,
  setProvisional,
}: SessionAbsenceProbeInput): void {
  // A cheap extra retry trigger alongside `isOnline`: incremented only when
  // the document becomes visible again, so switching back to a tab that has
  // sat "online" but unchecked for hours (a captive portal, a VPN drop, a
  // 5xx, an abandoned refresh lock) still gets another attempt. The guards
  // inside the effect below make an extra run free whenever there is
  // nothing left to check.
  const [visibleAtTick, setVisibleAtTick] = useState(0);
  useEffect(() => {
    if (demoMode) return;
    function handleVisibilityChange(): void {
      if (document.visibilityState !== "visible") return;
      setVisibleAtTick((tick) => tick + 1);
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [demoMode]);

  useEffect(() => {
    if (
      demoMode ||
      hasConfirmedUser ||
      isSessionChecking ||
      !isOnline ||
      shouldRecheckSession
    ) {
      return;
    }
    if (hasDefinitiveSessionAbsenceVerdictRef.current) return;
    let isCurrent = true;
    void (async () => {
      // The disk record is what decides whether there is anything to
      // protect, even when a member id is already known from this tab's own
      // history: an explicit sign-out purges the record directly
      // (`AuthProvider`), and without this check every reconnect for the
      // rest of the tab's life would still spend a probe on a member who is
      // already fully signed out.
      const diskReadResult = await readPersistedMessagingCacheResult();
      if (!isCurrent) return;
      if (diskReadResult.status === "unavailable") {
        // Could not check the disk this time; the next reconnect tries
        // again, so a wedged read is never mistaken for nothing to protect.
        return;
      }
      const diskRecord = diskReadResult.record;
      const targetMemberId =
        lastConfirmedMemberIdRef.current ?? diskRecord?.member.id ?? null;
      if (
        !targetMemberId ||
        !diskRecord ||
        diskRecord.member.id !== targetMemberId
      ) {
        // Confirmed nothing worth protecting for this member: either
        // nothing was ever saved, or it is already gone.
        hasDefinitiveSessionAbsenceVerdictRef.current = true;
        return;
      }
      const probeStartedAt = Date.now();
      const verdict = await probeSignedInSession();
      if (!isCurrent || verdict === "unreachable") return;
      if (verdict === "confirmed") {
        // AuthProvider offers no way to hand it the member this probe just
        // returned, so it adopts the session through its own refresh, the
        // same way the recheck effect does. Awaited: `refreshSession()` can
        // itself end with no user (a rotation refused by a sign-out on
        // another device between this probe and now, or a non-401 `fetchMe`
        // failure), and latching "definitive" on the probe's word alone
        // would wedge this tab's saved inbox readable for the rest of the
        // session once that happens. `lastConfirmedMemberIdRef` is left
        // alone either way: a real confirmed member sets it itself (the
        // `liveMemberId` effect), and a failed adoption should still be
        // re-checked against the same target on the next trigger.
        await refreshSession();
        if (!isCurrent) return;
        hasDefinitiveSessionAbsenceVerdictRef.current =
          latestUserRef.current !== null;
        return;
      }
      // verdict === "signedOut". Re-read before purging: another tab may
      // have signed this same member back in while the probe above was in
      // flight, writing a fresher record this probe's now-stale 401 must not
      // erase (the probe only answers what the session looked like at the
      // moment it started).
      const postProbeRead = await readPersistedMessagingCacheResult();
      if (!isCurrent) return;
      if (postProbeRead.status === "unavailable") {
        // Cannot confirm it is still safe to purge; the next trigger tries
        // again.
        return;
      }
      const freshRecord = postProbeRead.record;
      const hasNewerSession =
        freshRecord &&
        (freshRecord.savedAt > probeStartedAt ||
          freshRecord.member.id !== targetMemberId);
      if (hasNewerSession) {
        // Leave the newer session's record alone; retry the absence check
        // on the next trigger.
        return;
      }
      hasDefinitiveSessionAbsenceVerdictRef.current = true;
      lastConfirmedMemberIdRef.current = null;
      void purgeMessagingCache(targetMemberId);
      removeMessagingQueries(queryClient);
      hydratedMemberIdRef.current = null;
      setProvisional({ phase: "none" });
    })();
    return () => {
      isCurrent = false;
    };
  }, [
    demoMode,
    hasConfirmedUser,
    isSessionChecking,
    isOnline,
    shouldRecheckSession,
    refreshSession,
    queryClient,
    lastConfirmedMemberIdRef,
    hydratedMemberIdRef,
    hasDefinitiveSessionAbsenceVerdictRef,
    latestUserRef,
    setProvisional,
    visibleAtTick,
  ]);
}
