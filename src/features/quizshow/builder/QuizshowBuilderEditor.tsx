import type { QuizshowLocalProblem } from "./quizshowValidation";
import type { QuizshowDraftController } from "./useQuizshowDraft";
import { QuizshowQuizSettings } from "./QuizshowQuizSettings";
import {
  QuizshowRoundList,
  type QuizshowOpenTarget,
} from "./QuizshowRoundList";

/** The quiz fields, then the rounds and their questions. */
export function QuizshowBuilderEditor({
  controller,
  isAdultsEvent,
  problems,
  openTarget,
  onOpen,
}: {
  controller: QuizshowDraftController;
  isAdultsEvent: boolean;
  problems: readonly QuizshowLocalProblem[];
  openTarget: QuizshowOpenTarget | null;
  onOpen: (target: QuizshowOpenTarget | null) => void;
}) {
  return (
    <>
      <QuizshowQuizSettings controller={controller} />
      <QuizshowRoundList
        controller={controller}
        isAdultsEvent={isAdultsEvent}
        problems={problems}
        openTarget={openTarget}
        onOpen={onOpen}
      />
    </>
  );
}
