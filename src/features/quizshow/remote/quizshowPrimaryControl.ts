import type { QuizshowPhase } from "../../../shared/contracts/quizshow";

/** The big button: Start game in the lobby, Show answers in review, Next elsewhere. */
export function quizshowPrimaryControlOf(phase: QuizshowPhase): {
  name: "host:start" | "host:showAnswers" | "host:next";
  labelKey: string;
} {
  if (phase === "lobby") {
    return { name: "host:start", labelKey: "quizshow:remote.start" };
  }
  if (phase === "review") {
    return {
      name: "host:showAnswers",
      labelKey: "quizshow:remote.showAnswers",
    };
  }
  return { name: "host:next", labelKey: "quizshow:remote.next" };
}
