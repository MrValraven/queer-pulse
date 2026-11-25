/**
 * Pulse Live demo engine rank index (contract 7.1, W1): one
 * `competitionRanks` sort per frame batch, then an O(1) rank lookup for every
 * per-player frame. Twin of the backend's `buildRankIndex` and `rankOf` in
 * quizshow-engine-state.ts.
 */
import { competitionRanks } from "./quizshowScoring";
import {
  entrantTotals,
  type QuizshowEntrantTotal,
} from "./quizshowEngineSetup";
import type { QuizshowEngineState } from "./quizshowEngineTypes";

/** Every entrant with its competition rank, sorted once, and an id lookup into it. */
export interface QuizshowRankIndex {
  ranked: ReadonlyArray<QuizshowEntrantTotal & { rank: number }>;
  rankByEntrantId: ReadonlyMap<string, number>;
}

/** One `competitionRanks` sort for a whole frame batch, so a frame per player reads its rank from the map. */
export function buildRankIndex(state: QuizshowEngineState): QuizshowRankIndex {
  const ranked = competitionRanks(entrantTotals(state));
  const rankByEntrantId = new Map<string, number>();
  for (const entry of ranked) rankByEntrantId.set(entry.entrantId, entry.rank);
  return { ranked, rankByEntrantId };
}

/** The entrant's rank; an unknown or null id ranks after every entrant. */
export function rankOf(
  index: QuizshowRankIndex,
  entrantId: string | null,
): number {
  const lastRank = index.ranked.length + 1;
  if (entrantId === null) return lastRank;
  return index.rankByEntrantId.get(entrantId) ?? lastRank;
}
