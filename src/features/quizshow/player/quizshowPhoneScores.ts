import {
  QUIZSHOW_LIMITS,
  type QuizshowLeaderboardEntry,
  type QuizshowPlayerState,
  type QuizshowScores,
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
    // The phone knows only its own streak, also in teams play.
    streak: me.streak,
  };
  return { ...scores, entries: [...scores.entries, ownEntry] };
}

/** Positive = places gained, negative = places lost since the previous own rank (item 14); null without a previous rank or with no change. */
export function placesMovedOf(ownRanks: {
  previous: number | null;
  current: number | null;
}): number | null {
  const { previous, current } = ownRanks;
  if (previous === null || current === null || previous === current)
    return null;
  return previous - current;
}

/** "120 points behind Alex": the entry ranked just above the player's entrant in `scores`, when in the top 10 and not first; null otherwise. */
export function gapAheadOf(
  scores: QuizshowScores | null,
  ownEntrantId: string | null,
  ownScore: number,
): { points: number; name: string } | null {
  if (scores === null || ownEntrantId === null) return null;
  const ownEntry = scores.entries.find(
    (entry) => entry.entrantId === ownEntrantId,
  );
  if (ownEntry === undefined) return null;
  // The rank decides the top 10, so an own row phoneScoresOf appended below it never counts.
  const isInTopRanks = ownEntry.rank <= QUIZSHOW_LIMITS.leaderboardTopCount;
  if (!isInTopRanks || ownEntry.rank === 1) return null;
  const entriesAbove = scores.entries.filter(
    (entry) => entry.rank < ownEntry.rank,
  );
  const entryAhead = entriesAbove.reduce<QuizshowLeaderboardEntry | null>(
    (closest, entry) =>
      closest === null || entry.rank > closest.rank ? entry : closest,
    null,
  );
  if (entryAhead === null) return null;
  return {
    points: Math.max(0, entryAhead.score - ownScore),
    name: entryAhead.name,
  };
}
