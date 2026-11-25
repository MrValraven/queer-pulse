import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  QuizshowOption,
  QuizshowQuestionInput,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import type { QuizshowDraft, QuizshowDraftRound } from "./quizshowDraft";

/**
 * Review marks (item 24): the PT texts "Fill empty PT with the EN text"
 * copied from EN, until someone checks them. They live in the studio's draft
 * session only: nothing here reaches the draft, its history or a save body.
 */
export interface QuizshowReviewMarks {
  /** True when this PT text was filled from EN and nobody touched it since. */
  isUnreviewed: (value: QuizshowText) => boolean;
  markFilled: (englishTexts: readonly string[]) => void;
  markReviewed: (value: QuizshowText) => void;
}

const NO_REVIEW_MARKS: QuizshowReviewMarks = {
  isUnreviewed: () => false,
  markFilled: () => undefined,
  markReviewed: () => undefined,
};

const EMPTY_FILLED_TEXTS: ReadonlySet<string> = new Set();

const QuizshowReviewMarksContext = createContext<QuizshowReviewMarks | null>(
  null,
);

/**
 * Holds the marks for one studio. A mark is the copied text itself: a field
 * reads unreviewed while its PT still equals its EN and that text was filled,
 * so editing the PT so it differs clears the mark by itself, and an undo that
 * blanks the PT again hides it.
 */
export function QuizshowReviewMarksProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const [filledTexts, setFilledTexts] =
    useState<ReadonlySet<string>>(EMPTY_FILLED_TEXTS);
  const markFilled = useCallback((englishTexts: readonly string[]) => {
    if (englishTexts.length === 0) return;
    setFilledTexts((current) => {
      const next = new Set(current);
      for (const text of englishTexts) next.add(text);
      return next;
    });
  }, []);
  const markReviewed = useCallback((value: QuizshowText) => {
    setFilledTexts((current) => {
      if (!current.has(value.pt)) return current;
      const next = new Set(current);
      next.delete(value.pt);
      return next;
    });
  }, []);
  const isUnreviewed = useCallback(
    (value: QuizshowText) =>
      value.pt.trim() !== "" &&
      value.pt === value.en &&
      filledTexts.has(value.pt),
    [filledTexts],
  );
  const marks = useMemo(
    () => ({ isUnreviewed, markFilled, markReviewed }),
    [isUnreviewed, markFilled, markReviewed],
  );
  return createElement(
    QuizshowReviewMarksContext.Provider,
    { value: marks },
    children,
  );
}

/** The studio's review marks; without a provider `isUnreviewed` is always false and the other two do nothing. */
export function useQuizshowReviewMarks(): QuizshowReviewMarks {
  return useContext(QuizshowReviewMarksContext) ?? NO_REVIEW_MARKS;
}

/** True under a `QuizshowReviewMarksProvider` (the studio), where the bilingual fields offer "Same in both". */
export function useHasQuizshowReviewMarks(): boolean {
  return useContext(QuizshowReviewMarksContext) !== null;
}

/** The EN text copied into a blank PT, collected so the caller can mark it. */
function filledText(text: QuizshowText, copiedTexts: string[]): QuizshowText {
  if (text.pt.trim() !== "" || text.en.trim() === "") return text;
  copiedTexts.push(text.en);
  return { ...text, pt: text.en };
}

function filledOptions(
  options: readonly QuizshowOption[],
  copiedTexts: string[],
): QuizshowOption[] {
  return options.map((option) => ({
    ...option,
    text: filledText(option.text, copiedTexts),
  }));
}

function filledQuestion(
  question: QuizshowQuestionInput,
  copiedTexts: string[],
): QuizshowQuestionInput {
  const sharedTexts = {
    prompt: filledText(question.prompt, copiedTexts),
    mediaAlt: filledText(question.mediaAlt, copiedTexts),
    revealNote: filledText(question.revealNote, copiedTexts),
    numberUnit: filledText(question.numberUnit, copiedTexts),
  };
  switch (question.type) {
    case "multiple_choice":
      return {
        ...question,
        ...sharedTexts,
        options: filledOptions(question.options, copiedTexts),
      };
    case "order":
      return {
        ...question,
        ...sharedTexts,
        options: filledOptions(question.options, copiedTexts),
      };
    case "poll":
      return {
        ...question,
        ...sharedTexts,
        options: filledOptions(question.options, copiedTexts),
      };
    case "type_answer":
      return {
        ...question,
        ...sharedTexts,
        answer:
          question.answer === null
            ? null
            : { text: filledText(question.answer.text, copiedTexts) },
      };
    case "prompt":
      return {
        ...question,
        ...sharedTexts,
        answer:
          question.answer === null
            ? null
            : { truth: filledText(question.answer.truth, copiedTexts) },
      };
    default:
      return { ...question, ...sharedTexts };
  }
}

function filledRound(
  round: QuizshowDraftRound,
  copiedTexts: string[],
): QuizshowDraftRound {
  return {
    ...round,
    title: filledText(round.title, copiedTexts),
    questions: round.questions.map((draftQuestion) => ({
      ...draftQuestion,
      question: filledQuestion(draftQuestion.question, copiedTexts),
    })),
  };
}

/**
 * "Fill empty PT with the EN text": every bilingual text of the draft whose
 * PT is blank and whose EN is not (round titles, prompts, options, notes, alt
 * texts, units, typed answers, Lie Detector truths) takes the EN text. A PT
 * someone wrote stays as it is. `copiedTexts` lists the EN texts copied, for
 * `markFilled`; empty when there was nothing to fill.
 */
export function withEmptyPortugueseFilled(draft: QuizshowDraft): {
  draft: QuizshowDraft;
  copiedTexts: string[];
} {
  const copiedTexts: string[] = [];
  const rounds = draft.rounds.map((round) => filledRound(round, copiedTexts));
  if (copiedTexts.length === 0) return { draft, copiedTexts };
  return { draft: { ...draft, rounds }, copiedTexts };
}

/** True while some bilingual text of the draft has an EN text and a blank PT. */
export function hasEmptyPortuguese(draft: QuizshowDraft): boolean {
  return withEmptyPortugueseFilled(draft).copiedTexts.length > 0;
}
