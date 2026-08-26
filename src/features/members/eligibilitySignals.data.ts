import type { EligibilitySignals } from "./publicFigure";
import type { PublicEligibilitySignalsDto } from "./api/publicProfile.api";
import { CURRENT_USER_PUBLIC } from "./currentUserPublic.data";

/**
 * Signals for the demo fixture — the mock member (tiago) as a well-rounded,
 * qualifying public contributor, so the unlocked state is demonstrable offline.
 * Timestamps are literals (never `Date.now()`), keeping demo output stable.
 */
export function demoEligibilitySignals(nowIso: string): EligibilitySignals {
  return {
    nowIso,
    verified: true,
    tenureDays: 400,
    publishedPieces: CURRENT_USER_PUBLIC.writing.map(() => ({
      at: "2026-03-01T00:00:00.000Z",
    })),
    hostedOpenEvents: CURRENT_USER_PUBLIC.hosting.map(() => ({
      at: "2026-06-01T00:00:00.000Z",
    })),
    publishedSubprofiles: 1,
    vouchCount: 3,
    endorsementCount: 4,
    connectionCount: 12,
    eventsAttended: 6,
    communityPosts: 5,
    lastActiveDaysAgo: 2,
    standingOk: true,
  };
}

/**
 * Map the backend's real eligibility signals to the evaluator's input. Live mode
 * is now backed by GET /me/public-eligibility, so real members reach the score
 * threshold — the previous zero-filled proxy (which capped live at 99) is gone.
 */
export function liveEligibilitySignals(
  dto: PublicEligibilitySignalsDto,
  nowIso: string,
): EligibilitySignals {
  return {
    nowIso,
    verified: dto.verified,
    tenureDays: dto.tenureDays,
    publishedPieces: dto.publishedPieces.map((at) => ({ at })),
    hostedOpenEvents: dto.hostedOpenEvents.map((at) => ({ at })),
    publishedSubprofiles: dto.publishedSubprofiles,
    vouchCount: dto.vouchCount,
    endorsementCount: dto.endorsementCount,
    connectionCount: dto.connectionCount,
    eventsAttended: dto.eventsAttended,
    communityPosts: dto.communityPosts,
    lastActiveDaysAgo: dto.lastActiveDaysAgo,
    standingOk: dto.standingOk,
  };
}
