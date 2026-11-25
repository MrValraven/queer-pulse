import type {
  QuizshowQuestionInput,
  QuizshowQuestionType,
  QuizshowRoundKind,
} from "../../../shared/contracts/quizshow";
import {
  changeQuestionType,
  isQuestionTypeChangeLossy,
} from "../builder/quizshowDraft";

type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

/** What a type change takes away: the options with text it drops, and whether the answer goes. */
export interface QuizshowTypeChangeLoss {
  lostOptionCount: number;
  isAnswerLost: boolean;
}

/** The confirm dialog's body and its button. */
export interface QuizshowTypeChangeCopy {
  body: string;
  confirm: string;
}

function hasText(text: { en: string; pt: string }): boolean {
  return text.en.trim().length > 0 || text.pt.trim().length > 0;
}

/**
 * The options with text the change drops (counted by id against the changed
 * question) and whether the answer goes: the lossy check over the same
 * question with every option blank sees the answer alone.
 */
export function typeChangeLossOf(
  question: QuizshowQuestionInput,
  nextType: QuizshowQuestionType,
  roundKind: QuizshowRoundKind,
): QuizshowTypeChangeLoss {
  const changed = changeQuestionType(question, nextType, roundKind);
  const keptIds = new Set(changed.options.map((option) => option.id));
  const lostOptionCount = question.options.filter(
    (option) => !keptIds.has(option.id) && hasText(option.text),
  ).length;
  const blankOptions = question.options.map((option) => ({
    ...option,
    text: { en: "", pt: "" },
  }));
  const isAnswerLost = isQuestionTypeChangeLossy(
    { ...question, options: blankOptions } as QuizshowQuestionInput,
    nextType,
  );
  return { lostOptionCount, isAnswerLost };
}

/**
 * Names what the change removes: "Changing to Type the answer removes the 4
 * options and the right answer". The button says "remove options" while any
 * option goes, and "remove the answer" when only the answer does.
 */
export function typeChangeCopyOf(
  loss: QuizshowTypeChangeLoss,
  typeName: string,
  t: Translate,
): QuizshowTypeChangeCopy {
  const values = { type: typeName, count: loss.lostOptionCount };
  if (loss.lostOptionCount === 0) {
    return {
      body: t("quizshow:studio.typeChange.bodyAnswer", values),
      confirm: t("quizshow:studio.typeChange.confirmAnswer"),
    };
  }
  return {
    body: t(
      loss.isAnswerLost
        ? "quizshow:studio.typeChange.bodyOptionsAndAnswer"
        : "quizshow:studio.typeChange.bodyOptions",
      values,
    ),
    confirm: t("quizshow:studio.typeChange.confirm"),
  };
}
