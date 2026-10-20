import { useId } from "react";
import { AnimatePresence, m } from "motion/react";
import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_QUESTION_TYPES,
  type QuizshowLanguage,
  type QuizshowLanguageMode,
  type QuizshowQuestionInput,
  type QuizshowQuestionType,
  type QuizshowRoundKind,
} from "../../../shared/contracts/quizshow";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Select, type SelectOption } from "../../../shared/components/ui";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { changeQuestionType } from "./quizshowDraft";
import type { TFunction } from "../../../shared/i18n/types";
import { QuizshowBilingualInput } from "./QuizshowBilingualInput";
import { QuizshowNumberField } from "./QuizshowNumberField";
import { QuizshowOptionsField } from "./QuizshowOptionsField";
import { QuizshowOrderField } from "./QuizshowOrderField";
import { QuizshowPromptFields } from "./QuizshowPromptFields";
import { QuizshowTrueFalseField } from "./QuizshowTrueFalseField";
import { QuizshowTypeAnswerField } from "./QuizshowTypeAnswerField";
import { QuizshowQuestionMedia } from "./QuizshowQuestionMedia";
import {
  usedLanguagesOf,
  type QuizshowLocalProblem,
} from "./quizshowValidation";
import styles from "./QuizshowQuestionEditor.module.css";

const SECONDS_CHOICES = [10, 15, 20, 30, 45, 60, 90, 120] as const;
const ROUND_DEFAULT_SECONDS = "default";

/** The catalog line for one problem code, in one language when it has one. */
function problemLine(
  problems: readonly QuizshowLocalProblem[],
  code: QuizshowLocalProblem["code"],
  questionNumber: number,
  language: QuizshowLanguage | null,
  t: TFunction,
): string {
  const source = problems.find((problem) => problem.code === code);
  return t(`quizshow:problems.${code}`, {
    round: (source?.roundIndex ?? 0) + 1,
    question: questionNumber,
    language: language ? t(`quizshow:language.tag.${language}`) : "",
  });
}

interface AnswerFieldSwitchProps {
  roundKind: QuizshowRoundKind;
  question: QuizshowQuestionInput;
  languages: QuizshowLanguageMode;
  questionNumber: number;
  problems: readonly QuizshowLocalProblem[];
  onChange: (question: QuizshowQuestionInput) => void;
}

/** The answer field of the question's type, fed the problems that belong to it. */
function AnswerFieldSwitch({
  roundKind,
  question,
  languages,
  questionNumber,
  problems,
  onChange,
}: AnswerFieldSwitchProps) {
  const { t } = useTranslation();
  const languagesFor = (code: QuizshowLocalProblem["code"]) =>
    problems
      .filter((problem) => problem.code === code)
      .flatMap((problem) => (problem.language ? [problem.language] : []));
  const hasPlainLine = (code: QuizshowLocalProblem["code"]) =>
    problems.some((problem) => problem.code === code && !problem.language);
  const lineFor =
    (code: QuizshowLocalProblem["code"]) => (language: QuizshowLanguage) =>
      problemLine(problems, code, questionNumber, language, t);
  const plainLine = (code: QuizshowLocalProblem["code"]) =>
    hasPlainLine(code)
      ? problemLine(problems, code, questionNumber, null, t)
      : undefined;
  switch (question.type) {
    case "multiple_choice":
      return (
        <QuizshowOptionsField
          question={question}
          languages={languages}
          missingLanguages={languagesFor("option_text_missing")}
          errorText={lineFor("option_text_missing")}
          answerErrorText={plainLine("answer_missing")}
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
          onChange={onChange}
        />
      );
    case "closest_number":
      return (
        <QuizshowNumberField
          question={question}
          errorText={plainLine("answer_missing")}
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

const PROMPT_LABEL_KEYS: Record<QuizshowRoundKind, string> = {
  quiz: "quizshow:questions.prompt.label",
  lie_detector: "quizshow:questions.prompt.lieDetectorLabel",
  caption_this: "quizshow:questions.prompt.captionLabel",
  drag_name: "quizshow:questions.prompt.dragNameLabel",
};

interface QuizshowQuestionEditorProps {
  roundKind: QuizshowRoundKind;
  languages: QuizshowLanguageMode;
  roundTimeLimitSeconds: number;
  questionNumber: number;
  question: QuizshowQuestionInput;
  mediaUrl: string | null;
  /** This question's problems only. */
  problems: readonly QuizshowLocalProblem[];
  /** Picture keys of the other questions in the draft and the saved quiz, so a replaced image they share is never deleted. */
  otherReferencedMediaRefs?: readonly string[];
  /** The draft's own preview of a picture picked in this edit. */
  pickedPreviewUrl?: string | null;
  onPickedPreview?: (mediaRef: string, previewUrl: string) => void;
  onChange: (question: QuizshowQuestionInput, mediaUrl?: string | null) => void;
}

/** The type picker, prompt, picture, answer and scoring of one question. */
export function QuizshowQuestionEditor({
  roundKind,
  languages,
  roundTimeLimitSeconds,
  questionNumber,
  question,
  mediaUrl,
  problems,
  otherReferencedMediaRefs,
  pickedPreviewUrl,
  onPickedPreview,
  onChange,
}: QuizshowQuestionEditorProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const typeLabelId = useId();
  const pointsLabelId = useId();
  const secondsLabelId = useId();
  const isQuizRound = roundKind === "quiz";
  const hasPicture = isQuizRound || roundKind === "caption_this";

  const promptLanguages = problems
    .filter((problem) => problem.code === "prompt_missing")
    .flatMap((problem) => (problem.language ? [problem.language] : []));
  const mediaProblem = problems.find(
    (problem) => problem.code === "media_missing",
  );
  const lineFor = (language: QuizshowLanguage) =>
    problemLine(problems, "prompt_missing", questionNumber, language, t);

  const typeOptions: SelectOption[] = QUIZSHOW_QUESTION_TYPES.filter(
    (type) => type !== "prompt",
  ).map((type) => ({ value: type, label: t(`quizshow:type.${type}`) }));
  const pointsOptions: SelectOption[] = QUIZSHOW_LIMITS.pointsValues.map(
    (points) => ({
      value: String(points),
      label: t("quizshow:common.points", { points }),
    }),
  );
  const secondsChoices = [...SECONDS_CHOICES] as number[];
  if (
    question.timeLimitSeconds !== null &&
    !secondsChoices.includes(question.timeLimitSeconds)
  ) {
    secondsChoices.push(question.timeLimitSeconds);
    secondsChoices.sort((first, second) => first - second);
  }
  const secondsOptions: SelectOption[] = [
    {
      value: ROUND_DEFAULT_SECONDS,
      label: t("quizshow:questions.timeLimit.roundDefault", {
        seconds: format.number(roundTimeLimitSeconds),
      }),
    },
    ...secondsChoices.map((seconds) => ({
      value: String(seconds),
      label: `${format.number(seconds)}s`,
    })),
  ];

  return (
    <div className={styles.editor}>
      <Collapse isOpen={isQuizRound}>
        <div className={styles.selectField}>
          <span id={typeLabelId} className={styles.groupLabel}>
            {t("quizshow:questions.type.label")}
          </span>
          <Select
            value={question.type}
            options={typeOptions}
            labelledBy={typeLabelId}
            onChange={(nextType) => {
              if (nextType && nextType !== question.type) {
                onChange(
                  changeQuestionType(
                    question,
                    nextType as QuizshowQuestionType,
                    roundKind,
                  ),
                );
              }
            }}
          />
        </div>
      </Collapse>
      <QuizshowBilingualInput
        label={t(PROMPT_LABEL_KEYS[roundKind])}
        value={question.prompt}
        languages={languages}
        maxLength={QUIZSHOW_LIMITS.promptMax}
        isMultiline
        missingLanguages={promptLanguages}
        errorText={lineFor}
        onChange={(prompt) => onChange({ ...question, prompt })}
      />
      <Collapse isOpen={hasPicture}>
        <QuizshowQuestionMedia
          mediaRef={question.mediaRef}
          mediaUrl={mediaUrl}
          otherReferencedMediaRefs={otherReferencedMediaRefs}
          pickedPreviewUrl={pickedPreviewUrl}
          onPickedPreview={onPickedPreview}
          errorText={
            mediaProblem
              ? problemLine(problems, "media_missing", questionNumber, null, t)
              : undefined
          }
          onChange={(mediaRef, nextMediaUrl) =>
            onChange({ ...question, mediaRef }, nextMediaUrl)
          }
        />
      </Collapse>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={question.type}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.18 }}
        >
          <AnswerFieldSwitch
            roundKind={roundKind}
            question={question}
            languages={languages}
            questionNumber={questionNumber}
            problems={problems}
            onChange={onChange}
          />
        </m.div>
      </AnimatePresence>
      <Collapse isOpen={isQuizRound}>
        <div className={styles.scoreRow}>
          <div className={styles.selectField}>
            <span id={pointsLabelId} className={styles.groupLabel}>
              {t("quizshow:questions.points.label")}
            </span>
            <Select
              value={String(question.points)}
              options={pointsOptions}
              labelledBy={pointsLabelId}
              onChange={(points) =>
                points && onChange({ ...question, points: Number(points) })
              }
            />
          </div>
          <div className={styles.selectField}>
            <span id={secondsLabelId} className={styles.groupLabel}>
              {t("quizshow:questions.timeLimit.label")}
            </span>
            <Select
              value={
                question.timeLimitSeconds === null
                  ? ROUND_DEFAULT_SECONDS
                  : String(question.timeLimitSeconds)
              }
              options={secondsOptions}
              labelledBy={secondsLabelId}
              onChange={(seconds) =>
                seconds &&
                onChange({
                  ...question,
                  timeLimitSeconds:
                    seconds === ROUND_DEFAULT_SECONDS ? null : Number(seconds),
                })
              }
            />
          </div>
        </div>
      </Collapse>
    </div>
  );
}
