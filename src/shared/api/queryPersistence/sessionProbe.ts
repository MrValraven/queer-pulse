import { fetchMe } from "../../../features/auth/api/auth.api";
import { ApiError, readLastRefreshSettlement } from "../client";
import {
  provisionalSessionVerdictFor,
  refreshEvidenceFor,
  type ProvisionalSessionVerdict,
} from "./provisionalSessionVerdict";

/**
 * Ask `/auth/me` who is signed in, reduced to a verdict (PRD-375). The
 * client's own 401 recovery still runs underneath, so a lapsed access cookie
 * with a live refresh token comes back confirmed. The client answers a
 * refresh that failed on the network with the same 401 as a real rejection,
 * so a 401 is weighed against what the client recorded about that refresh.
 *
 * Shared by `useMessagingCachePersistence`'s own recheck effect and
 * `useSessionAbsenceProbe`, so both read the session the same way.
 */
export async function probeSignedInSession(): Promise<ProvisionalSessionVerdict> {
  const probeStartedAt = Date.now();
  try {
    await fetchMe();
    return provisionalSessionVerdictFor({ kind: "user" });
  } catch (error) {
    if (!(error instanceof ApiError)) {
      return provisionalSessionVerdictFor({ kind: "networkError" });
    }
    return provisionalSessionVerdictFor({
      kind: "httpError",
      status: error.status,
      refresh: refreshEvidenceFor(readLastRefreshSettlement(), probeStartedAt),
    });
  }
}
