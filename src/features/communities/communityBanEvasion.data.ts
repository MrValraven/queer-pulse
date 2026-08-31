import type {
  CommunityBanEvasionEscalationDTO,
  CommunityBanEvasionFlagDTO,
} from "./api/communityBanEvasion.api";

/**
 * Demo fixtures for the join-queue ban-evasion flag (PRD-31).
 *
 * Keyed by the demo queue's own join-request ids (`HUB_REQUESTS` in
 * `livingCommunities.data.ts`). The three rows there are deliberately given the
 * three DIFFERENT outcomes the surface has, so the demo shows all of them at
 * once rather than only the happy one:
 *
 *   hub-r1  answered, no match       -> the row renders nothing
 *   hub-r2  ABSENT from this map     -> "we couldn't check this one"
 *   hub-r3  answered, match          -> the flag, and the escalate action
 *
 * The absence of `hub-r2` is the fixture, not an oversight. The live endpoint
 * omits an id it could not resolve rather than answering `false` for it, and
 * the demo has to be able to show what that looks like: a failed or missing
 * answer must never read as an all-clear.
 */
export const DEMO_BAN_EVASION_FLAGS: Record<string, boolean> = {
  "hub-r1": false,
  "hub-r3": true,
};

/** The demo's answers for one page of the queue, shaped exactly like the live
 *  response: ids with no fixture are left out instead of being answered. */
export function demoBanEvasionFlags(
  joinRequestIds: string[],
): CommunityBanEvasionFlagDTO[] {
  return joinRequestIds.flatMap((joinRequestId) => {
    const isMatchingBannedMember = DEMO_BAN_EVASION_FLAGS[joinRequestId];
    if (isMatchingBannedMember === undefined) return [];
    return [{ joinRequestId, isMatchingBannedMember }];
  });
}

/** Nobody has escalated anything yet in demo. The demo escalate mutation writes
 *  its synthesized row into this same cache entry, so pressing the button
 *  actually moves the row to "escalated" the way it would live. */
export const DEMO_BAN_EVASION_ESCALATIONS: CommunityBanEvasionEscalationDTO[] =
  [];

/** One synthesized escalation, for the demo path only. Mirrors the live
 *  response shape, including storing the note the moderator actually typed. */
export function demoBanEvasionEscalation(
  joinRequestId: string,
  note: string | undefined,
): CommunityBanEvasionEscalationDTO {
  return {
    id: `demo-escalation-${joinRequestId}`,
    joinRequestId,
    status: "open",
    createdAt: new Date().toISOString(),
    note: note?.trim() ? note.trim() : null,
  };
}
