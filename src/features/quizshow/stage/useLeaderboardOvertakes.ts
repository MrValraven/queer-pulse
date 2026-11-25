import { useEffect, useMemo, useState } from "react";
import {
  QUIZSHOW_LIMITS,
  type QuizshowLeaderboardEntry,
} from "../../../shared/contracts/quizshow";

/** How long the scores count up in the old order before the rows re-sort (item 11). */
export const LEADERBOARD_COUNT_UP_MS = 600;
/** The re-sort's slide: a FLIP of each row's position, transform only (item 11). */
export const LEADERBOARD_RESORT_MS = 500;

/** One leaderboard row as the board draws it right now. */
export interface QuizshowLeaderboardDisplayRow {
  entry: QuizshowLeaderboardEntry;
  /** The rank beside the row: the previous rank while the scores count up, the new rank once settled. */
  shownRank: number;
  /** Places gained since the previous scores; null when the row did not move up. */
  placesUp: number | null;
  /** The row glides up when the board re-sorts, so it is drawn over the rows it passes. */
  isRising: boolean;
}

export interface QuizshowLeaderboardOvertakes {
  rows: QuizshowLeaderboardDisplayRow[];
  /** The rows sit in the new order and the "+N places" arrows show. */
  isSettled: boolean;
}

/**
 * A row ranked past the top ten: the phone appends the player's own row
 * there (outside the public top ten). Its place among the shown rows says
 * nothing about where it was, so it keeps its own rank and stays last.
 */
function isAppendedRow(entry: QuizshowLeaderboardEntry): boolean {
  return entry.rank > QUIZSHOW_LIMITS.leaderboardTopCount;
}

/** Competition ranks by `previousScore` among the top rows: 1, 1, 3. */
function previousRanksOf(
  topEntries: readonly QuizshowLeaderboardEntry[],
): Map<string, number> {
  const previousRanks = new Map<string, number>();
  for (const entry of topEntries) {
    const higherCount = topEntries.filter(
      (other) => other.previousScore > entry.previousScore,
    ).length;
    previousRanks.set(entry.entrantId, higherCount + 1);
  }
  return previousRanks;
}

/**
 * The first scored board: every row starts from the same previous score, so
 * there is no old order to count up in and no place anyone climbed from.
 */
function hasSharedPreviousScore(
  topEntries: readonly QuizshowLeaderboardEntry[],
): boolean {
  const firstPreviousScore = topEntries[0]?.previousScore;
  return topEntries.every(
    (entry) => entry.previousScore === firstPreviousScore,
  );
}

/**
 * Places gained, or null. A row whose previous score sits below every other
 * top row's may have climbed from outside the board, so its count is unknown
 * and it shows none.
 */
function placesUpOf(
  entry: QuizshowLeaderboardEntry,
  previousRank: number,
  topEntries: readonly QuizshowLeaderboardEntry[],
): number | null {
  const isBelowEveryOther = topEntries.every(
    (other) =>
      other.entrantId === entry.entrantId ||
      other.previousScore > entry.previousScore,
  );
  if (isBelowEveryOther) return null;
  const placesGained = previousRank - entry.rank;
  return placesGained > 0 ? placesGained : null;
}

/**
 * The leaderboard's overtakes (item 11, C6.18): the rows first stand in
 * `previousScore` order while their numbers count up, then after
 * `LEADERBOARD_COUNT_UP_MS` they take the new order (the caller slides them
 * with a layout FLIP) and the rows that climbed show "+N places". A new
 * `phaseId` starts over. Reduced motion: the new order at once, arrows only.
 * A board where every row shares its previous score (the first scores) has
 * no old order, so it stands settled from the start.
 */
export function useLeaderboardOvertakes(
  entries: readonly QuizshowLeaderboardEntry[],
  phaseId: string,
  isReducedMotion: boolean,
): QuizshowLeaderboardOvertakes {
  const [settledPhaseId, setSettledPhaseId] = useState<string | null>(null);
  const hasNoOldOrder = useMemo(
    () =>
      hasSharedPreviousScore(entries.filter((entry) => !isAppendedRow(entry))),
    [entries],
  );
  const isSettled =
    isReducedMotion || hasNoOldOrder || settledPhaseId === phaseId;

  useEffect(() => {
    if (isSettled) return undefined;
    const timer = window.setTimeout(() => {
      setSettledPhaseId(phaseId);
    }, LEADERBOARD_COUNT_UP_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [isSettled, phaseId]);

  const rows = useMemo(() => {
    const topEntries = entries.filter((entry) => !isAppendedRow(entry));
    const appendedEntries = entries.filter(isAppendedRow);
    const previousRanks = previousRanksOf(topEntries);
    const topRows = topEntries.map((entry): QuizshowLeaderboardDisplayRow => {
      const previousRank = previousRanks.get(entry.entrantId) ?? entry.rank;
      return {
        entry,
        shownRank: isSettled ? entry.rank : previousRank,
        placesUp: placesUpOf(entry, previousRank, topEntries),
        isRising: previousRank > entry.rank,
      };
    });
    const appendedRows = appendedEntries.map(
      (entry): QuizshowLeaderboardDisplayRow => ({
        entry,
        shownRank: entry.rank,
        placesUp: null,
        isRising: false,
      }),
    );
    if (isSettled) return [...topRows, ...appendedRows];
    // A stable sort, so rows with equal previous scores keep the new order.
    const previousOrder = [...topRows].sort(
      (first, second) => second.entry.previousScore - first.entry.previousScore,
    );
    return [...previousOrder, ...appendedRows];
  }, [entries, isSettled]);

  return { rows, isSettled };
}
