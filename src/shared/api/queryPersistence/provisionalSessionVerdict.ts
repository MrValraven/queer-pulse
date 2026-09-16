/**
 * The session probe behind a provisional member (PRD-375), as a pure
 * decision. A cold offline launch renders the saved inbox for the device's
 * last member without `/auth/me`; when the network looks back, `/auth/me` is
 * probed and its outcome decides what happens to that provisional member.
 *
 * Only a definite answer from the server moves anything. `navigator.onLine`
 * flaps, and a tunnel or a captive portal makes the probe fail for reasons
 * that say nothing about the session, so those keep the saved inbox on screen
 * and the probe runs again on the next `online` event.
 */

/** What the client last recorded about POST /auth/refresh
 *  (`readLastRefreshSettlement` in client.ts), described structurally. */
export interface RefreshSettlement {
  outcome:
    | { kind: "succeeded" }
    | { kind: "rejected"; status: number }
    | { kind: "networkFailed" }
    | { kind: "lockTimedOut" };
  settledAt: number;
}

/**
 * What a 401 from the probe can be trusted to mean, given the refresh history.
 * The client answers every failed refresh with the same 401, so this is the
 * only way to see which kind of failure sat behind it.
 * - `refreshedDuringProbe`: a refresh settled while the probe ran (the probe's
 *   own 401 recovery, or one it joined), and this is how it ended.
 * - `notAttempted`: no refresh ran during the probe, and the client's belief
 *   that there is no session is trustworthy: this tab never refreshed, or its
 *   last refresh was rejected by the server with 401.
 * - `suspectNoSession`: no refresh ran during the probe, and the last refresh
 *   in this tab ended any other way: a network fault, an abandoned refresh
 *   lock, a server refusal other than 401 (a 403, or a 500 during a database
 *   outage), or a success. The client's "no session" belief may have come
 *   from something other than a dead session, so a 401 now proves nothing.
 */
export type RefreshEvidence =
  | { kind: "refreshedDuringProbe"; outcome: RefreshSettlement["outcome"] }
  | { kind: "notAttempted" }
  | { kind: "suspectNoSession" };

export function refreshEvidenceFor(
  settlement: RefreshSettlement | null,
  probeStartedAt: number,
): RefreshEvidence {
  if (!settlement) return { kind: "notAttempted" };
  if (settlement.settledAt >= probeStartedAt) {
    return { kind: "refreshedDuringProbe", outcome: settlement.outcome };
  }
  const { outcome } = settlement;
  const wasRejectedAsSignedOut =
    outcome.kind === "rejected" && outcome.status === 401;
  return wasRejectedAsSignedOut
    ? { kind: "notAttempted" }
    : { kind: "suspectNoSession" };
}

export type SessionProbeOutcome =
  | { kind: "user" }
  | { kind: "httpError"; status: number; refresh: RefreshEvidence }
  | { kind: "networkError" };

/**
 * - `confirmed`: the server returned a member, so `AuthProvider` adopts the
 *   session and the provisional member stops being used.
 * - `signedOut`: `/auth/me` answered 401, and the latest refresh settlement
 *   is either absent or a server rejection with status 401. The provisional
 *   member is dropped and the saved record purged.
 * - `unreachable`: every other outcome, and nothing changes until the next
 *   probe. That covers a 401 whose latest refresh settlement is a network
 *   failure, an abandoned refresh lock, a 403, a 5xx or a success, and it
 *   covers `/auth/me` itself failing on the network or answering 408, 403 or
 *   a 5xx. The provisional member stays on the saved inbox in all of these.
 */
export type ProvisionalSessionVerdict =
  "confirmed" | "signedOut" | "unreachable";

export function provisionalSessionVerdictFor(
  outcome: SessionProbeOutcome,
): ProvisionalSessionVerdict {
  if (outcome.kind === "user") return "confirmed";
  if (outcome.kind !== "httpError" || outcome.status !== 401) {
    return "unreachable";
  }
  const { refresh } = outcome;
  if (refresh.kind === "notAttempted") return "signedOut";
  const isRefreshRejected =
    refresh.kind === "refreshedDuringProbe" &&
    refresh.outcome.kind === "rejected" &&
    refresh.outcome.status === 401;
  return isRefreshRejected ? "signedOut" : "unreachable";
}
