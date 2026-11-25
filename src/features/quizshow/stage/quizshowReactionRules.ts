import {
  QUIZSHOW_LIMITS,
  type QuizshowPhase,
} from "../../../shared/contracts/quizshow";

/** The phases `reaction:send` is accepted in (C6.19); every other one refuses `quizshow_reaction_not_now`. */
export const QUIZSHOW_REACTION_PHASES: readonly QuizshowPhase[] = [
  "lobby",
  "round_intro",
  "reveal",
  "scores",
  "leaderboard",
  "wheel",
  "podium",
];

export function isReactionPhase(phase: QuizshowPhase): boolean {
  return QUIZSHOW_REACTION_PHASES.includes(phase);
}

/** One player's reaction token bucket as last written. */
export interface QuizshowReactionBucket {
  tokens: number;
  refilledAt: number;
}

/**
 * Tokens left at `now` (C6.19): a burst of `reactionBurst`, one token back per
 * `reactionRefillMs`, refilled continuously as the server's limiter does. No
 * bucket yet reads full, so a player's first reaction always has a token.
 */
export function reactionTokensAt(
  bucket: QuizshowReactionBucket | undefined,
  now: number,
): number {
  if (bucket === undefined) return QUIZSHOW_LIMITS.reactionBurst;
  const elapsedMs = Math.max(0, now - bucket.refilledAt);
  return Math.min(
    QUIZSHOW_LIMITS.reactionBurst,
    bucket.tokens + elapsedMs / QUIZSHOW_LIMITS.reactionRefillMs,
  );
}
