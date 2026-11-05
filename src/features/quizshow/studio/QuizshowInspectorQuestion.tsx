import { Button } from "../../../shared/components/ui";
import {
  QUIZSHOW_LIMITS,
  type QuizshowLanguage,
  type QuizshowLanguageMode,
  type QuizshowQuestionInput,
  type QuizshowRoundKind,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowBilingualInput } from "../builder/QuizshowBilingualInput";
import type { QuizshowDraftRound } from "../builder/quizshowDraft";
import { QuizshowQuestionMedia } from "../builder/QuizshowQuestionMedia";
import type { QuizshowLocalProblem } from "../builder/quizshowValidation";
import { QuizshowInspectorAnswerFields } from "./QuizshowInspectorAnswerFields";
import { QuizshowInspectorProblems } from "./QuizshowInspectorProblems";
import {
  QuizshowInspectorScoring,
  QuizshowInspectorTypeGrid,
} from "./QuizshowInspectorQuestionFields";
import { QuizshowInspectorSection } from "./QuizshowInspectorSection";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import styles from "./QuizshowStudioInspector.module.css";

const PROMPT_LABEL_KEYS: Record<QuizshowRoundKind, string> = {
  quiz: "quizshow:questions.prompt.label",
  lie_detector: "quizshow:questions.prompt.lieDetectorLabel",
  caption_this: "quizshow:questions.prompt.captionLabel",
  drag_name: "quizshow:questions.prompt.dragNameLabel",
};

/** The type-specific fields the slide has no room for: accepted answers, the Lie Detector truth, the closest band. */
const EXTRA_TYPES = ["type_answer", "prompt"] as const;

interface QuestionPartProps {
  roundIndex: number;
  questionIndex: number;
  round: QuizshowDraftRound;
  question: QuizshowQuestionInput;
  problems: readonly QuizshowLocalProblem[];
  onChange: (question: QuizshowQuestionInput, mediaUrl?: string | null) => void;
}

/** The question text in these languages, with its missing-text lines. */
function PromptField({
  round,
  question,
  languages,
  roundIndex,
  questionIndex,
  problems,
  onChange,
}: QuestionPartProps & { languages: QuizshowLanguageMode }) {
  const { t } = useTranslation();
  const missingLanguages = problems
    .filter((problem) => problem.code === "prompt_missing")
    .flatMap((problem) => (problem.language ? [problem.language] : []));
  return (
    <QuizshowBilingualInput
      label={t(PROMPT_LABEL_KEYS[round.kind])}
      value={question.prompt}
      languages={languages}
      maxLength={QUIZSHOW_LIMITS.promptMax}
      isMultiline
      missingLanguages={missingLanguages}
      errorText={(language: QuizshowLanguage) =>
        t("quizshow:problems.prompt_missing", {
          round: roundIndex + 1,
          question: questionIndex + 1,
          language: t(`quizshow:language.tag.${language}`),
        })
      }
      onChange={(prompt) => onChange({ ...question, prompt })}
    />
  );
}

/** Below 1024px the host types here: the question text and its picture, then the answers. */
function NarrowEditing(props: QuestionPartProps) {
  const { t } = useTranslation();
  const { controller, data } = useQuizshowStudio();
  const { round, roundIndex, question, questionIndex, problems, onChange } =
    props;
  const { languages } = controller.draft;
  const hasPicture = round.kind === "quiz" || round.kind === "caption_this";
  const hasAnswers =
    question.type !== "prompt" || round.kind === "lie_detector";
  const mediaProblem = problems.some(
    (problem) => problem.code === "media_missing",
  );
  const draftQuestions = controller.draft.rounds.flatMap(
    (draftRound) => draftRound.questions,
  );
  const ownKey = round.questions[questionIndex]?.draftKey;
  const otherMediaRefs = [
    ...draftQuestions
      .filter((draftQuestion) => draftQuestion.draftKey !== ownKey)
      .map((draftQuestion) => draftQuestion.question.mediaRef),
    ...(data.quiz?.rounds ?? []).flatMap((savedRound) =>
      savedRound.questions.map((savedQuestion) => savedQuestion.mediaRef),
    ),
  ].filter((mediaRef): mediaRef is string => mediaRef !== null);
  return (
    <>
      <QuizshowInspectorSection
        isTitleHidden
        title={t("quizshow:studio.inspector.question.text")}
      >
        <PromptField {...props} languages={languages} />
        {hasPicture && (
          <QuizshowQuestionMedia
            mediaRef={question.mediaRef}
            mediaUrl={round.questions[questionIndex]?.mediaUrl ?? null}
            otherReferencedMediaRefs={otherMediaRefs}
            pickedPreviewUrl={
              question.mediaRef
                ? (controller.pickedPreviewUrls.get(question.mediaRef) ?? null)
                : null
            }
            onPickedPreview={controller.rememberPickedPreview}
            errorText={
              mediaProblem
                ? t("quizshow:problems.media_missing", {
                    round: roundIndex + 1,
                    question: questionIndex + 1,
                  })
                : undefined
            }
            onChange={(mediaRef, mediaUrl) =>
              props.onChange({ ...question, mediaRef }, mediaUrl)
            }
          />
        )}
      </QuizshowInspectorSection>
      {hasAnswers && (
        <QuizshowInspectorSection title={t("quizshow:questions.options.label")}>
          <QuizshowInspectorAnswerFields
            roundKind={round.kind}
            question={question}
            languages={languages}
            questionNumber={questionIndex + 1}
            problems={problems}
            onChange={onChange}
          />
        </QuizshowInspectorSection>
      )}
    </>
  );
}

/** From 1024px the slide holds the text; the inspector keeps the extras and the other language. */
function WideExtras(props: QuestionPartProps) {
  const { t } = useTranslation();
  const { controller, viewLanguage } = useQuizshowStudio();
  const { round, question, questionIndex, problems, onChange } = props;
  const { languages } = controller.draft;
  const otherLanguage: QuizshowLanguage = viewLanguage === "en" ? "pt" : "en";
  const hasExtras =
    EXTRA_TYPES.some((type) => type === question.type) &&
    (question.type !== "prompt" || round.kind === "lie_detector");
  return (
    <>
      {hasExtras && (
        <QuizshowInspectorSection
          title={t("quizshow:studio.inspector.question.answerDetails")}
        >
          <QuizshowInspectorAnswerFields
            roundKind={round.kind}
            question={question}
            languages={languages}
            onlyTypes={EXTRA_TYPES}
            questionNumber={questionIndex + 1}
            problems={problems}
            onChange={onChange}
          />
        </QuizshowInspectorSection>
      )}
      {languages === "both" && (
        <QuizshowInspectorSection
          title={t("quizshow:studio.inspector.question.otherLanguage", {
            language: t(`quizshow:language.${otherLanguage}`),
          })}
        >
          <PromptField {...props} languages={otherLanguage} />
          <QuizshowInspectorAnswerFields
            roundKind={round.kind}
            question={question}
            languages={otherLanguage}
            onlyTypes={["multiple_choice", "order"]}
            isTextOnly
            questionNumber={questionIndex + 1}
            problems={problems}
            onChange={onChange}
          />
        </QuizshowInspectorSection>
      )}
    </>
  );
}

/** Which round the question is in, its content label, and the way to the round's settings. */
function InThisRound({
  roundIndex,
  round,
}: Pick<QuestionPartProps, "roundIndex" | "round">) {
  const { t } = useTranslation();
  const { select, viewLanguage } = useQuizshowStudio();
  const roundName =
    round.title[viewLanguage].trim() ||
    t("quizshow:rounds.untitled", { number: roundIndex + 1 });
  const kindName = t(`quizshow:kind.${round.kind}.name`);
  // A round titled with its own kind name would read the same twice.
  const metaParts = kindName === roundName ? [] : [kindName];
  if (round.contentLabel !== "none") {
    metaParts.push(t(`quizshow:contentLabel.${round.contentLabel}`));
  }
  return (
    <QuizshowInspectorSection
      title={t("quizshow:studio.inspector.question.inRound")}
    >
      <p className={styles.roundLine}>
        <span className={styles.roundLineName}>{roundName}</span>
        {metaParts.length > 0 && (
          <span className={styles.roundLineMeta}>{metaParts.join(", ")}</span>
        )}
      </p>
      {round.kind !== "quiz" && (
        <p className={styles.lead}>
          {t("quizshow:studio.inspector.question.partyTiming")}
        </p>
      )}
      <div className={styles.addRow}>
        <Button
          variant="stage-ghost"
          size="sm"
          type="button"
          onClick={() => select({ kind: "round", roundIndex })}
        >
          {t("quizshow:studio.inspector.question.editRound")}
        </Button>
      </div>
    </QuizshowInspectorSection>
  );
}

/** The question state, in the order the brief gives: type, time and points, extras, other language, round, problems. */
export function QuizshowInspectorQuestion({
  roundIndex,
  questionIndex,
}: {
  roundIndex: number;
  questionIndex: number;
}) {
  const { t } = useTranslation();
  const { controller, slideEditing, problemsFor } = useQuizshowStudio();
  // The slide takes the main fields only while it is wide and big enough to type on.
  const isWide = slideEditing.isEditable;
  const round = controller.draft.rounds[roundIndex];
  const question = round?.questions[questionIndex]?.question;
  if (!round || !question) return null;
  const problems = problemsFor({ kind: "question", roundIndex, questionIndex });
  const partProps: QuestionPartProps = {
    roundIndex,
    questionIndex,
    round,
    question,
    problems,
    onChange: (nextQuestion, mediaUrl) =>
      controller.updateQuestion(
        roundIndex,
        questionIndex,
        nextQuestion,
        mediaUrl,
      ),
  };
  const isQuizRound = round.kind === "quiz";
  return (
    <>
      {isQuizRound && (
        <QuizshowInspectorSection
          isTitleHidden
          title={t("quizshow:questions.type.label")}
        >
          <QuizshowInspectorTypeGrid
            question={question}
            roundKind={round.kind}
            onChange={partProps.onChange}
          />
        </QuizshowInspectorSection>
      )}
      {!isWide && <NarrowEditing {...partProps} />}
      {isQuizRound && (
        <QuizshowInspectorSection
          title={t("quizshow:studio.inspector.question.scoring")}
        >
          <QuizshowInspectorScoring
            question={question}
            roundTimeLimitSeconds={round.settings.timeLimitSeconds}
            closestHint={
              isWide && question.type === "closest_number"
                ? t("quizshow:questions.closest.hint")
                : undefined
            }
            onChange={partProps.onChange}
          />
        </QuizshowInspectorSection>
      )}
      {isWide && <WideExtras {...partProps} />}
      <InThisRound roundIndex={roundIndex} round={round} />
      <QuizshowInspectorProblems problems={problems} />
    </>
  );
}
