import { useMemo, useState } from "react";
import type {
  QuizshowQuiz,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import type { useTranslation } from "../../../shared/i18n/useTranslation";
import { draftFromQuiz, draftToInput } from "./quizshowDraft";
import { quizshowProblemsFor } from "./quizshowValidation";

type Translate = ReturnType<typeof useTranslation>["t"];

export type QuizshowEventSummaryTone = "live" | "ready" | "todo";

/**
 * Where the event's game stands on the Manage tab: the open lobby or game,
 * else whether the saved quiz can open one. Null with no quiz yet, where the
 * card's heading already says so.
 */
export function summaryStatusOf(
  data: QuizshowQuizResponse,
  lobbyProblemCount: number,
  t: Translate,
): { text: string; tone: QuizshowEventSummaryTone } | null {
  const { liveSession } = data;
  if (liveSession !== null) {
    const key =
      liveSession.status === "lobby"
        ? "quizshow:games.row.lobbyTag"
        : "quizshow:games.row.liveTag";
    return { text: t(key, { code: liveSession.joinCode }), tone: "live" };
  }
  if (data.quiz === null) return null;
  if (lobbyProblemCount > 0) {
    return {
      text: t("quizshow:studio.problems.count", { count: lobbyProblemCount }),
      tone: "todo",
    };
  }
  return { text: t("quizshow:studio.problems.none"), tone: "ready" };
}

/** Keeps the last value it saw, so a panel that folds away keeps its content while it leaves. */
export function useLastPresent<Value>(value: Value | null): Value | null {
  const [lastValue, setLastValue] = useState(value);
  if (value !== null && value !== lastValue) setLastValue(value);
  return value ?? lastValue;
}

/**
 * The saved quiz as Try it plays it, and the problems that block that: the
 * quiz's own, with the adults-event check left out (it is about the event).
 */
export function useSavedQuizTryOut(
  quiz: QuizshowQuiz | null,
  isAdultsEvent: boolean,
) {
  const draft = useMemo(() => (quiz ? draftFromQuiz(quiz) : null), [quiz]);
  const problems = useMemo(
    () =>
      draft === null
        ? []
        : quizshowProblemsFor(draftToInput(draft, null), {
            isAdultsEvent,
          }).filter(
            (problem) => problem.code !== "adults_round_needs_adults_event",
          ),
    [draft, isAdultsEvent],
  );
  return { draft, problems };
}

export function questionCountOf(quiz: QuizshowQuiz | null): number {
  return (quiz?.rounds ?? []).reduce(
    (total, round) => total + round.questions.length,
    0,
  );
}
