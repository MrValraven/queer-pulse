import type {
  QuizshowEngineAction,
  QuizshowEngineState,
} from "./quizshowEngineTypes";

export const QUIZSHOW_AUTO_HOST_DELAYS_MS = {
  lobbyAfterLastJoin: 3_000,
  round_intro: 4_000,
  reveal: 5_000,
  scores: 4_000,
  leaderboard: 5_000,
  review: 2_500,
  podium: 9_000,
  ended: 12_000,
} as const;

function hostCommand(
  engine: QuizshowEngineState,
  name: "host:start" | "host:next" | "host:showAnswers",
  now: number,
): QuizshowEngineAction {
  return {
    type: "host",
    name,
    payload: { phaseId: engine.cursor.phaseId },
    now,
  };
}

/** What a human host would press next, or null while the clock or the players decide. */
export function planAutoHostAction(
  engine: QuizshowEngineState,
  now: number,
  options: { expectedPlayerCount: number },
): QuizshowEngineAction | "restart" | null {
  if (engine.pausedAt !== null) return null;
  const { phase, phaseStartedAt } = engine.cursor;
  if (phase === "lobby") {
    const present = engine.players.filter((player) => !player.isRemoved);
    if (present.length === 0 || present.length < options.expectedPlayerCount) {
      return null;
    }
    const lastJoinAt = Math.max(...present.map((player) => player.joinedAt));
    const isSettled =
      now - lastJoinAt >= QUIZSHOW_AUTO_HOST_DELAYS_MS.lobbyAfterLastJoin;
    return isSettled ? hostCommand(engine, "host:start", now) : null;
  }
  if (phaseStartedAt === null) return null;
  const elapsed = now - phaseStartedAt;
  switch (phase) {
    case "round_intro":
    case "reveal":
    case "scores":
    case "leaderboard":
    case "podium":
      return elapsed >= QUIZSHOW_AUTO_HOST_DELAYS_MS[phase]
        ? hostCommand(engine, "host:next", now)
        : null;
    case "review":
      return elapsed >= QUIZSHOW_AUTO_HOST_DELAYS_MS.review
        ? hostCommand(engine, "host:showAnswers", now)
        : null;
    case "ended":
      return elapsed >= QUIZSHOW_AUTO_HOST_DELAYS_MS.ended ? "restart" : null;
    default:
      return null;
  }
}
