import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AuthUser } from "../../../features/auth/api/auth.api";
import {
  hydrateMessagingCache,
  purgeMessagingCache,
  readPersistedMessagingCache,
  removeMessagingQueries,
  startMessagingCacheWriter,
  subscribeToMessagingCachePurge,
} from "./messagingCachePersistence";
import { toProvisionalAuthUser } from "./messagingCacheSelection";
import { prefetchMessagesRouteChunk } from "./messagingRoutePrefetch";
import { probeSignedInSession } from "./sessionProbe";
import { useSessionAbsenceProbe } from "./useSessionAbsenceProbe";

/** The IndexedDB read is local and normally takes milliseconds; past this a
 *  wedged store stops holding the cold offline screen. */
const RESTORE_READ_BUDGET_MS = 1_500;

/**
 * - `reading`: the saved record is being read.
 * - `available`: a saved record exists, and nothing from it is in memory
 *   because the member is on another route; OfflinePage links to it.
 * - `restored`: hydrated on the messages route; `user` is the provisional
 *   member.
 *
 * Exported for `useSessionAbsenceProbe`'s `setProvisional` parameter type.
 */
export type ProvisionalRestore =
  | { phase: "none" }
  | { phase: "reading" }
  | { phase: "available" }
  | { phase: "restored"; user: AuthUser };

interface MessagingCachePersistenceInput {
  demoMode: boolean;
  /** The confirmed member from `AuthProvider`, or null. */
  user: AuthUser | null;
  isOnline: boolean;
  /** True on the first render of a launch that started with no network. */
  isColdOfflineBoot: boolean;
  /** The member is on `/messages`, the one route the saved inbox serves. */
  isMessagesRoute: boolean;
  /** `AuthProvider`'s own `checking`: a live-mode session load (`GET
   *  /auth/me`) is still in flight, so `user` being null does not yet mean
   *  nobody is signed in. */
  isSessionChecking: boolean;
  /** `AuthProvider`'s refresh, used to adopt a session the probe confirmed. */
  refreshSession: () => Promise<void>;
}

interface MessagingCachePersistenceResult {
  /** The saved-cache read for a cold offline launch has not settled yet. */
  isRestorePending: boolean;
  /** A saved inbox exists for the device's last member, on any route. */
  hasSavedMessages: boolean;
  /**
   * The member a cold offline launch restored the saved inbox for. Set only
   * while `/auth/me` could not confirm anyone, so the session is PROVISIONAL:
   * the device's last signed-in member, unverified, trusted to read what this
   * device already stored for them and nothing else.
   */
  provisionalUser: AuthUser | null;
}

/**
 * Wires PRD-375's messaging cache persistence into the app. Live mode only.
 *
 * - A confirmed member: restore their saved record (a record for anyone else
 *   is deleted, along with anything restored for that other member), keep it
 *   written from the live cache, and warm the `/messages` route chunk so a
 *   device holding a saved inbox can still open it offline.
 * - A cold offline launch with no confirmed member: on the messages route,
 *   restore the record for the device's last member provisionally; elsewhere
 *   only note that it exists. Once the network is back, and only on the
 *   messages route, `/auth/me` is probed. A member adopts the session, a 401
 *   purges and drops the provisional member, and a network fault keeps it
 *   until the next `online` event probes again.
 * - A member this tab confirmed goes away, OR this tab never confirmed
 *   anyone but a record from an earlier launch is still on disk (a revoked or
 *   expired session found on the next online launch): `/auth/me` is probed
 *   once the app is online and the bootstrap session check has settled. A
 *   confirmed signed-out answer purges the record; a network fault retries
 *   on the next reconnect, so the saved inbox does not simply sit readable
 *   for up to seven days.
 * - Another tab purging: drop the messaging cache held in memory here too.
 */
export function useMessagingCachePersistence({
  demoMode,
  user,
  isOnline,
  isColdOfflineBoot,
  isMessagesRoute,
  isSessionChecking,
  refreshSession,
}: MessagingCachePersistenceInput): MessagingCachePersistenceResult {
  const queryClient = useQueryClient();
  const [provisional, setProvisional] = useState<ProvisionalRestore>(() =>
    !demoMode && isColdOfflineBoot ? { phase: "reading" } : { phase: "none" },
  );
  const hydratedMemberIdRef = useRef<string | null>(null);
  const lastConfirmedMemberIdRef = useRef<string | null>(null);
  /** True once the session-absence probe below (gaps 1/2) has a definitive
   *  verdict for the member currently tracked by `lastConfirmedMemberIdRef`,
   *  so it stops probing until a new member is confirmed. */
  const hasDefinitiveSessionAbsenceVerdictRef = useRef(false);
  const latestUserRef = useRef(user);
  useEffect(() => {
    latestUserRef.current = user;
  }, [user]);

  // A confirmed session supersedes provisional state for good. Adjusted during
  // render, guarded by the condition it clears, like OfflineGate's latches.
  const hasConfirmedUser = user !== null;
  if (hasConfirmedUser && provisional.phase !== "none") {
    setProvisional({ phase: "none" });
  }

  const shouldReadSavedRecord =
    provisional.phase === "reading" ||
    (provisional.phase === "available" && isMessagesRoute);
  useEffect(() => {
    if (!shouldReadSavedRecord) return;
    let hasSettled = false;
    const readBudget = setTimeout(() => {
      hasSettled = true;
      setProvisional({ phase: "none" });
    }, RESTORE_READ_BUDGET_MS);
    void readPersistedMessagingCache().then((record) => {
      if (hasSettled) return;
      hasSettled = true;
      clearTimeout(readBudget);
      if (!record) {
        setProvisional({ phase: "none" });
        return;
      }
      // Off the messages route only the fact that a record exists is kept,
      // for OfflinePage's link; nothing from it enters the query cache.
      if (!isMessagesRoute) {
        setProvisional({ phase: "available" });
        return;
      }
      hydrateMessagingCache(queryClient, record);
      hydratedMemberIdRef.current = record.member.id;
      setProvisional({
        phase: "restored",
        user: toProvisionalAuthUser(record.member),
      });
    });
    return () => {
      hasSettled = true;
      clearTimeout(readBudget);
    };
  }, [shouldReadSavedRecord, isMessagesRoute, queryClient]);

  useEffect(() => {
    if (demoMode) return;
    return subscribeToMessagingCachePurge((purgedMemberId) => {
      // Another tab purged a different member's record: the member confirmed
      // here keeps their messages in memory and their writer.
      const confirmedMemberId = latestUserRef.current?.id ?? null;
      if (
        purgedMemberId &&
        confirmedMemberId &&
        purgedMemberId !== confirmedMemberId
      ) {
        return false;
      }
      removeMessagingQueries(queryClient);
      hydratedMemberIdRef.current = null;
      setProvisional({ phase: "none" });
      return true;
    });
  }, [demoMode, queryClient]);

  const liveMemberId = demoMode ? null : (user?.id ?? null);
  useEffect(() => {
    if (!liveMemberId) return;
    lastConfirmedMemberIdRef.current = liveMemberId;
    // A freshly confirmed member starts this tab's absence-probe state over:
    // any earlier verdict was about a different session.
    hasDefinitiveSessionAbsenceVerdictRef.current = false;
    // Warm the /messages chunk for this signed-in member (gap 4): it sits
    // outside the precache diet, so without this it is only ever fetched by
    // actually visiting the route, and a device that saves an offline inbox
    // but never opens Messages before going offline would have no chunk to
    // render it with.
    prefetchMessagesRouteChunk();
    let isCurrent = true;
    let stopWriter: (() => void) | null = null;
    void readPersistedMessagingCache().then(async (stored) => {
      if (!isCurrent) return;
      let record = stored;
      const restoredMemberId = hydratedMemberIdRef.current;
      if (restoredMemberId && restoredMemberId !== liveMemberId) {
        removeMessagingQueries(queryClient);
        hydratedMemberIdRef.current = null;
      }
      if (record && record.member.id !== liveMemberId) {
        const purgedMemberId = record.member.id;
        record = null;
        await purgeMessagingCache(purgedMemberId);
        if (!isCurrent) return;
      } else if (record && hydratedMemberIdRef.current !== liveMemberId) {
        hydrateMessagingCache(queryClient, record);
        hydratedMemberIdRef.current = liveMemberId;
      }
      stopWriter = startMessagingCacheWriter(
        queryClient,
        liveMemberId,
        () => latestUserRef.current,
        record,
      );
    });
    return () => {
      isCurrent = false;
      stopWriter?.();
    };
  }, [liveMemberId, queryClient]);

  const shouldRecheckSession =
    provisional.phase === "restored" &&
    isOnline &&
    !hasConfirmedUser &&
    isMessagesRoute;
  useEffect(() => {
    if (!shouldRecheckSession) return;
    let isCurrent = true;
    // `unreachable` changes nothing here. A flap turns `isOnline` off and on
    // again, which flips `shouldRecheckSession` and probes once more.
    void probeSignedInSession().then((verdict) => {
      if (!isCurrent) return;
      if (verdict === "confirmed") {
        // AuthProvider offers no way to hand it the member this probe just
        // returned, so it adopts the session through its own refresh: one
        // more token rotation, under the shared single-flight lock. When that
        // refresh fails on the network the client records it, so a later
        // probe's 401 reads as `suspectNoSession` and the saved inbox stays.
        // The render-phase reset above retires the provisional member once
        // AuthProvider reports a user.
        void refreshSession();
        return;
      }
      if (verdict === "signedOut") {
        void purgeMessagingCache(hydratedMemberIdRef.current);
        removeMessagingQueries(queryClient);
        hydratedMemberIdRef.current = null;
        setProvisional({ phase: "none" });
      }
    });
    return () => {
      isCurrent = false;
    };
  }, [shouldRecheckSession, refreshSession, queryClient]);

  // Privacy backstop for a member this tab never confirmed, or confirmed and
  // then lost. See `useSessionAbsenceProbe`'s own doc for the full case
  // breakdown; extracted to its own hook to keep this function under the
  // 200-line budget.
  useSessionAbsenceProbe({
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
  });

  const canUseSavedRecord = !demoMode && !hasConfirmedUser;
  return {
    isRestorePending: canUseSavedRecord && shouldReadSavedRecord,
    hasSavedMessages:
      canUseSavedRecord &&
      (provisional.phase === "available" || provisional.phase === "restored"),
    provisionalUser:
      canUseSavedRecord && provisional.phase === "restored"
        ? provisional.user
        : null,
  };
}
