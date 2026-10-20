import type { QuizshowPartyRevealEntry } from "../../../shared/contracts/quizshow";

type RevealOrderFields = Pick<
  QuizshowPartyRevealEntry,
  "voteCount" | "isTruth"
>;

/**
 * The order every party reveal lists its entries in, on the screen and on phones:
 * the Lie Detector truth leads, then the entries with the most votes. Entries with
 * the same vote count keep the order they arrived in.
 */
export function orderRevealEntries<Entry extends RevealOrderFields>(
  entries: readonly Entry[],
): Entry[] {
  return [...entries].sort((first, second) => {
    if (first.isTruth !== second.isTruth) return first.isTruth ? -1 : 1;
    return second.voteCount - first.voteCount;
  });
}
