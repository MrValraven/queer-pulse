import type { ClaimState } from "../../../shared/api/conversationClaim";
import type { Conversation } from "../data";

/**
 * Demo mode's claim, release and take-over results for the page session, by
 * thread. Demo has no server to hold a claim, and the demo inbox list
 * re-derives from the static seeds whenever its key changes (a demo delete)
 * or it refetches, so a claim kept only in the query cache would silently
 * revert. The demo list folds these back in on every rebuild.
 */
const demoClaimByConversationId = new Map<string, ClaimState>();

export function recordDemoClaim(
  conversationId: string,
  state: ClaimState,
): void {
  demoClaimByConversationId.set(conversationId, state);
}

/** The row with its session claim applied, the same row when none was made. */
function withDemoClaim<Row extends Conversation>(row: Row): Row {
  const state = demoClaimByConversationId.get(row.id);
  return state ? { ...row, ...state } : row;
}

/** Every row with its session claim applied, as the demo inbox list reads
 *  them. A module-level function so react-query keeps one `select` identity
 *  and re-runs it only when the rows themselves change. */
export function applyDemoClaims<Row extends Conversation>(
  rows: readonly Row[],
): Row[] {
  return rows.map(withDemoClaim);
}

/** Test seam: forget every demo claim. */
export function resetDemoClaims(): void {
  demoClaimByConversationId.clear();
}
