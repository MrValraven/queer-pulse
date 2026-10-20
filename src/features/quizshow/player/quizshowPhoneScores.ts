import type {
  QuizshowLeaderboardEntry,
  QuizshowPlayerState,
  QuizshowScores,
} from "../../../shared/contracts/quizshow";

/**
 * The scores the phone shows: the top ten as sent, plus the viewer's own row
 * (their team's in teams mode) built from `myScores` when they rank below it,
 * so everyone sees where they stand. The row is added only once both frames
 * belong to the same phase.
 */
export function phoneScoresOf(
  player: QuizshowPlayerState,
): QuizshowScores | null {
  const { scores, myScores, me } = player;
  if (scores === null) return null;
  if (myScores === null || me === null) return scores;
  if (myScores.phaseId !== scores.phaseId) return scores;
  const isTeams = player.playMode === "teams";
  const entrantId = isTeams ? me.teamId : me.playerId;
  if (entrantId === null) return scores;
  const isShown = scores.entries.some((entry) => entry.entrantId === entrantId);
  if (isShown) return scores;
  const team = isTeams
    ? player.lobby.teams.find((candidate) => candidate.teamId === entrantId)
    : undefined;
  if (isTeams && team === undefined) return scores;
  const ownEntry: QuizshowLeaderboardEntry = {
    rank: myScores.rank,
    kind: isTeams ? "team" : "player",
    entrantId,
    name: team?.name ?? me.screenName,
    colorKey: team?.colorKey ?? null,
    score: myScores.score,
    previousScore: myScores.previousScore,
  };
  return { ...scores, entries: [...scores.entries, ownEntry] };
}
