import type { AuthorSummary } from "../contracts/contracts";
import type { ConversationClaimFrame } from "../contracts/realtime";

/** A staff member named on a thread's claim, as the inbox renders them. */
export interface ConversationClaimant {
  handle: string;
  name: string;
  firstName: string;
}

/** The claim fields a thread row and the composer bar read. */
export interface ClaimState {
  claimedBy: ConversationClaimant | null;
  /** The claimant's user id, the `fromUserId` a colleague passes to take the
   *  thread over. Null while unclaimed. */
  claimedByUserId: string | null;
  claimedAt: string | null;
  claimTakenOverFrom: ConversationClaimant | null;
}

/** The claim fields a claim, take-over or release response carries. Only the
 *  take-over names the colleague it took the thread from. */
interface ClaimResponseFields {
  claimedByUserId: string | null;
  isNewlyClaimed: boolean;
  claimedBy: AuthorSummary | null;
  claimedAt: string | null;
  previousClaimant?: AuthorSummary | null;
}

/**
 * A claimant as the inbox renders them. `undefined` stays `undefined` (the
 * wire left the field out: a personal thread), `null` stays `null` (an
 * unclaimed mailbox thread), and a summary keeps its handle, its display name
 * and the display name's first word.
 */
export function toConversationClaimant(summary: null): null;
export function toConversationClaimant(summary: undefined): undefined;
export function toConversationClaimant(
  summary: AuthorSummary,
): ConversationClaimant;
export function toConversationClaimant(
  summary: AuthorSummary | null,
): ConversationClaimant | null;
export function toConversationClaimant(
  summary: AuthorSummary | null | undefined,
): ConversationClaimant | null | undefined;
export function toConversationClaimant(
  summary: AuthorSummary | null | undefined,
): ConversationClaimant | null | undefined {
  if (summary === undefined) return undefined;
  if (summary === null) return null;
  const firstName = summary.displayName.trim().split(/\s+/)[0] ?? "";
  return { handle: summary.handle, name: summary.displayName, firstName };
}

/**
 * The claim a `conversation:claim` frame leaves behind. `claimTakenOverFrom`
 * names the colleague on a take-over only; a release, including a system
 * release (`actor: null`), reads fully unclaimed because the frame's
 * `claimedBy` and `claimedAt` are null.
 */
export function claimStateFromFrame(frame: ConversationClaimFrame): ClaimState {
  return {
    claimedBy: toConversationClaimant(frame.claimedBy),
    claimedByUserId: frame.claimedByUserId,
    claimedAt: frame.claimedAt,
    claimTakenOverFrom:
      frame.change === "taken_over"
        ? toConversationClaimant(frame.previousClaimant)
        : null,
  };
}

/** The claim a claim, take-over or release response names: whoever holds
 *  the thread now, which after a lost race is a colleague. */
export function claimStateFromResponse(
  response: ClaimResponseFields,
): ClaimState {
  return {
    claimedBy: toConversationClaimant(response.claimedBy),
    claimedByUserId: response.claimedByUserId,
    claimedAt: response.claimedAt,
    claimTakenOverFrom: toConversationClaimant(
      response.previousClaimant ?? null,
    ),
  };
}
