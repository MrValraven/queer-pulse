import type { ReactNode } from "react";
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
  settingsExtra,
  titleLabelKey,
  isTitleRequired,
}: {
  controller: QuizshowDraftController;
  isAdultsEvent: boolean;
  problems: readonly QuizshowLocalProblem[];
  openTarget: QuizshowOpenTarget | null;
  onOpen: (target: QuizshowOpenTarget | null) => void;
  /** Shown under the quiz fields (a game's 18+ switch). */
  settingsExtra?: ReactNode;
  /** The title field's label key; the settings default to the quiz title. */
  titleLabelKey?: string;
  /** A game needs its title to save, so a blank one shows a hint. */
  isTitleRequired?: boolean;
}) {
  return (
    <>
      <QuizshowQuizSettings
        controller={controller}
        titleLabelKey={titleLabelKey}
        isTitleRequired={isTitleRequired}
      />
      {settingsExtra}
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
