import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  type QuizshowLanguage,
  type QuizshowLanguageMode,
  type QuizshowQuestionInput,
  type QuizshowQuestionType,
  type QuizshowRoundKind,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowNumberField } from "../builder/QuizshowNumberField";
import { QuizshowOptionsField } from "../builder/QuizshowOptionsField";
import { QuizshowOrderField } from "../builder/QuizshowOrderField";
import { QuizshowPromptFields } from "../builder/QuizshowPromptFields";
import { QuizshowTrueFalseField } from "../builder/QuizshowTrueFalseField";
import { QuizshowTypeAnswerField } from "../builder/QuizshowTypeAnswerField";
import {
  closestToleranceOf,
  withClosestTolerance,
} from "../builder/quizshowDraft";
import {
  usedLanguagesOf,
  type QuizshowLocalProblem,
} from "../builder/quizshowValidation";

type ProblemCode = QuizshowLocalProblem["code"];

interface QuizshowInspectorAnswerFieldsProps {
  roundKind: QuizshowRoundKind;
  question: QuizshowQuestionInput;
  /** The draft question's key, so a field that holds state per question resets with it. */
  draftKey: string;
  /** The languages the answer fields show. */
  languages: QuizshowLanguageMode;
  /** Only these question types render a field; the rest render nothing. */
  onlyTypes?: readonly QuizshowQuestionType[];
  /** Multiple choice and order show only the texts (the other language's fields). */
  isTextOnly?: boolean;
  /** Closest number: false shows only the margin and unit, for when the slide edits the number. Defaults to true. */
  isNumberValueShown?: boolean;
  /** 1-based, for the problem sentences. */
  questionNumber: number;
  problems: readonly QuizshowLocalProblem[];
  onChange: (question: QuizshowQuestionInput) => void;
}

/** The dispatch on the question's type, with this question's problems wired to each field. */
function AnswerFieldSwitch({
  roundKind,
  question,
  draftKey,
  languages,
  isTextOnly,
  isNumberValueShown = true,
  questionNumber,
  problems,
  onChange,
}: Omit<QuizshowInspectorAnswerFieldsProps, "onlyTypes">) {
  const { t } = useTranslation();
  const sentence = (code: ProblemCode, language: QuizshowLanguage | null) => {
    const source = problems.find((problem) => problem.code === code);
    return t(`quizshow:problems.${code}`, {
      round: (source?.roundIndex ?? 0) + 1,
      question: questionNumber,
      language: language ? t(`quizshow:language.tag.${language}`) : "",
    });
  };
  const languagesFor = (code: ProblemCode) =>
    problems
      .filter((problem) => problem.code === code)
      .flatMap((problem) => (problem.language ? [problem.language] : []));
  const hasPlainLine = (code: ProblemCode) =>
    problems.some((problem) => problem.code === code && !problem.language);
  const lineFor = (code: ProblemCode) => (language: QuizshowLanguage) =>
    sentence(code, language);
  const plainLine = (code: ProblemCode) =>
    hasPlainLine(code) ? sentence(code, null) : undefined;
  // Multiple choice names why its marks cannot save: none marked, or every
  // option marked (contract 2.2).
  const markLine =
    plainLine("correct_option_missing") ??
    plainLine("too_many_correct_options") ??
    plainLine("answer_missing");
  switch (question.type) {
    case "multiple_choice":
      return (
        <QuizshowOptionsField
          question={question}
          languages={languages}
          missingLanguages={languagesFor("option_text_missing")}
          errorText={lineFor("option_text_missing")}
          answerErrorText={isTextOnly ? undefined : markLine}
          isTextOnly={isTextOnly}
          onChange={onChange}
        />
      );
    case "poll":
      return (
        <QuizshowOptionsField
          question={question}
          languages={languages}
          missingLanguages={languagesFor("option_text_missing")}
          errorText={lineFor("option_text_missing")}
          isTextOnly={isTextOnly}
          onChange={onChange}
        />
      );
    case "true_false":
      return (
        <QuizshowTrueFalseField
          question={question}
          errorText={plainLine("answer_missing")}
          onChange={onChange}
        />
      );
    case "type_answer":
      return (
        <QuizshowTypeAnswerField
          question={question}
          languages={languages}
          missingLanguages={
            hasPlainLine("answer_missing")
              ? usedLanguagesOf(languages)
              : languagesFor("answer_missing")
          }
          errorText={lineFor("answer_missing")}
          onChange={onChange}
        />
      );
    case "order":
      return (
        <QuizshowOrderField
          question={question}
          languages={languages}
          missingLanguages={languagesFor("option_text_missing")}
          errorText={lineFor("option_text_missing")}
          isTextOnly={isTextOnly}
          onChange={onChange}
        />
      );
    case "closest_number":
      return (
        <QuizshowNumberField
          key={draftKey}
          question={question}
          draftKey={draftKey}
          errorText={plainLine("answer_missing")}
          tolerance={closestToleranceOf(question)}
          onToleranceChange={(tolerance) =>
            onChange(withClosestTolerance(question, tolerance))
          }
          unit={question.numberUnit}
          onUnitChange={(numberUnit) => onChange({ ...question, numberUnit })}
          languages={languages}
          isValueShown={isNumberValueShown}
          onChange={onChange}
        />
      );
    case "prompt":
      return roundKind === "lie_detector" ? (
        <QuizshowPromptFields
          question={question}
          languages={languages}
          missingLanguages={languagesFor("truth_missing")}
          errorText={lineFor("truth_missing")}
          onChange={onChange}
        />
      ) : null;
  }
}

/**
 * The answer field of the question's type, for the inspector. A change of type
 * cross-fades the fields: the exiting copy
 * keeps the props it last rendered with, so it never shows the new question.
 */
export function QuizshowInspectorAnswerFields(
  props: QuizshowInspectorAnswerFieldsProps,
) {
  const { reducedMotion } = useMotionPrefs();
  const { onlyTypes, ...switchProps } = props;
  if (onlyTypes && !onlyTypes.includes(props.question.type)) return null;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={props.question.type}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.18 }}
      >
        <AnswerFieldSwitch {...switchProps} />
      </m.div>
    </AnimatePresence>
  );
}
