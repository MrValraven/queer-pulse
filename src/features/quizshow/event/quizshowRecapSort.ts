import type { QuizshowRecapQuestion } from "../../../shared/contracts/quizshow";

/** How the recap lists its questions (C6.24). */
export type QuizshowRecapSort = "playOrder" | "hardestFirst";

export const QUIZSHOW_RECAP_SORTS: readonly QuizshowRecapSort[] = [
  "playOrder",
  "hardestFirst",
];

export const QUIZSHOW_RECAP_SORT_LABEL_KEYS: Record<QuizshowRecapSort, string> =
  {
    playOrder: "quizshow:results.sort.playOrder",
    hardestFirst: "quizshow:results.sort.hardestFirst",
  };

export function isQuizshowRecapSort(value: string): value is QuizshowRecapSort {
  return (QUIZSHOW_RECAP_SORTS as readonly string[]).includes(value);
}

/**
 * The recap's questions in the chosen order. "Play order" keeps the order the
 * recap arrives in. "Hardest first" puts the lowest `percentCorrect` on top;
 * questions with no figure (party, poll, warm-up) go to the end, and equal
 * figures keep their play order.
 */
export function sortRecapQuestions(
  questions: readonly QuizshowRecapQuestion[],
  sort: QuizshowRecapSort,
): QuizshowRecapQuestion[] {
  const playOrder = questions.map((question, playIndex) => ({
    question,
    playIndex,
  }));
  if (sort === "hardestFirst") {
    playOrder.sort((first, second) => {
      const firstPercent = first.question.percentCorrect;
      const secondPercent = second.question.percentCorrect;
      if (firstPercent === null && secondPercent === null) {
        return first.playIndex - second.playIndex;
      }
      if (firstPercent === null) return 1;
      if (secondPercent === null) return -1;
      return firstPercent - secondPercent || first.playIndex - second.playIndex;
    });
  }
  return playOrder.map((entry) => entry.question);
}
