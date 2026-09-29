import { ApiError } from "../../../shared/api/client";
import { goTogetherErrorCode } from "../api/goTogether.api";

/** Plain copy for a failed group action. The server's code picks the line;
 *  anything else reads as a gentle retry. */
export function groupErrorKey(error: unknown): string {
  switch (goTogetherErrorCode(error)) {
    case "GO_TOGETHER_CHECKIN_CLOSED":
      return "goTogether:group.error.checkInClosed";
    case "GO_TOGETHER_MERGE_EXPIRED":
      return "goTogether:group.error.mergeExpired";
    default:
      return "goTogether:group.error.generic";
  }
}

/** True for the 404 the group route answers once the caller is no longer
 *  grouped in it (after a block moved them out, say). */
export function isGroupNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

/**
 * What a block does to the BLOCKER, which the confirm spells out:
 * - `beforeStart`: they move to another group of the gathering when one
 *   fits. When none does they become unmatched, which the card reads as
 *   closed once the late-group pass has run (6 hours before the start), so
 *   the copy points to the card for what comes next.
 * - `afterStart`: they leave the group and its chat.
 * - `late`: more than 12 hours after the start nobody moves, and the two
 *   stop seeing each other in the group.
 */
export type GroupBlockTiming = "beforeStart" | "afterStart" | "late";

/** How long after the start a block still moves the blocker (the backend's
 *  `moveAfterBlock` window). */
const BLOCK_MOVE_WINDOW_MS = 12 * 60 * 60 * 1000;

/** `isLeaveChatOnly` is the server's own "the gathering has started" flag.
 *  The start time backs it up, because a group read just before the start
 *  can still carry `false` when Block is pressed just after it. The start
 *  time also marks the late window. */
export function groupBlockTiming(
  isLeaveChatOnly: boolean,
  eventStartAt: string,
  nowMs: number,
): GroupBlockTiming {
  const startMs = Date.parse(eventStartAt);
  const hasReadableStart = Number.isFinite(startMs);
  const hasStarted = isLeaveChatOnly || (hasReadableStart && nowMs >= startMs);
  if (!hasStarted) return "beforeStart";
  if (hasReadableStart && nowMs > startMs + BLOCK_MOVE_WINDOW_MS) {
    return "late";
  }
  return "afterStart";
}

/** Copy for a failed Block or Report. A 404 means the member left the group
 *  (or their ref is gone), which a retry cannot fix, so it gets its own
 *  line. */
export function memberActionErrorKey(error: unknown): string {
  return isGroupNotFoundError(error)
    ? "goTogether:group.member.gone"
    : groupErrorKey(error);
}
