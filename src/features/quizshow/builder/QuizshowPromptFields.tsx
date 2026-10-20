import {
  QUIZSHOW_LIMITS,
  type QuizshowLanguage,
  type QuizshowLanguageMode,
  type QuizshowQuestionInput,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowBilingualInput } from "./QuizshowBilingualInput";

type PromptQuestion = Extract<QuizshowQuestionInput, { type: "prompt" }>;

interface QuizshowPromptFieldsProps {
  question: PromptQuestion;
  languages: QuizshowLanguageMode;
  missingLanguages: readonly QuizshowLanguage[];
  errorText: (language: QuizshowLanguage) => string;
  onChange: (question: QuizshowQuestionInput) => void;
}

/** Lie Detector's true answer, which players try to fool each other around. */
export function QuizshowPromptFields({
  question,
  languages,
  missingLanguages,
  errorText,
  onChange,
}: QuizshowPromptFieldsProps) {
  const { t } = useTranslation();
  return (
    <QuizshowBilingualInput
      label={t("quizshow:questions.truth.label")}
      hint={t("quizshow:questions.truth.hint")}
      value={question.answer?.truth ?? { en: "", pt: "" }}
      languages={languages}
      maxLength={QUIZSHOW_LIMITS.answerTextMax}
      missingLanguages={missingLanguages}
      errorText={errorText}
      onChange={(truth) => onChange({ ...question, answer: { truth } })}
    />
  );
}
