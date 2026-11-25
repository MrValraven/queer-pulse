import { Button } from "../../../shared/components/ui";
import { Collapse } from "../../../shared/components/ui/Collapse";
import {
  QUIZSHOW_LIMITS,
  type QuizshowLanguage,
  type QuizshowLanguageMode,
  type QuizshowMediaReveal,
  type QuizshowQuestionInput,
  type QuizshowPlayableRoundKind,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowBilingualInput } from "../builder/QuizshowBilingualInput";
import type { QuizshowDraftRound } from "../builder/quizshowDraft";
import { sliceProblemsOf } from "../builder/quizshowDryRunQuiz";
import { QuizshowTryItButton } from "../builder/QuizshowTryItButton";
import {
  QuizshowQuestionMedia,
  QuizshowQuestionPictureFields,
  type QuizshowQuestionPictureDetailsProps,
} from "../builder/QuizshowQuestionMedia";
import type { QuizshowLocalProblem } from "../builder/quizshowValidation";
import { displayRoundNumber } from "../quizshowWheel";
import { pickQuizshowText } from "../stage/quizshowText";
import { QuizshowInspectorAnswerFields } from "./QuizshowInspectorAnswerFields";
import { QuizshowInspectorProblems } from "./QuizshowInspectorProblems";
import {
  QuizshowInspectorScoring,
  QuizshowInspectorTypeGrid,
} from "./QuizshowInspectorQuestionFields";
import { QuizshowInspectorSection } from "./QuizshowInspectorSection";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import { isPlayableRoundKind } from "./quizshowStudioRailView";
import styles from "./QuizshowStudioInspector.module.css";

const PROMPT_LABEL_KEYS: Record<QuizshowPlayableRoundKind, string> = {
  quiz: "quizshow:questions.prompt.label",
  lie_detector: "quizshow:questions.prompt.lieDetectorLabel",
  caption_this: "quizshow:questions.prompt.captionLabel",
  drag_name: "quizshow:questions.prompt.dragNameLabel",
};

/** The type-specific fields the slide has no room for: accepted answers, the Lie Detector truth, the closest margin and unit. */
const EXTRA_TYPES = ["type_answer", "prompt", "closest_number"] as const;

/** The other language's texts: the option lists. */
const OTHER_LANGUAGE_TYPES = ["multiple_choice", "order", "poll"] as const;

interface QuestionPartProps {
  roundIndex: number;
  /** The 1-based number the host sees, skipping wheel rows. */
  roundNumber: number;
  /** The round's kind, narrowed to the kinds that hold questions. */
  roundKind: QuizshowPlayableRoundKind;
  questionIndex: number;
  round: QuizshowDraftRound;
  question: QuizshowQuestionInput;
  problems: readonly QuizshowLocalProblem[];
  onChange: (question: QuizshowQuestionInput, mediaUrl?: string | null) => void;
}

/** The question text in these languages, with its missing-text lines. */
function PromptField({
  roundKind,
  question,
  languages,
  roundNumber,
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
      label={t(PROMPT_LABEL_KEYS[roundKind])}
      value={question.prompt}
      languages={languages}
      maxLength={QUIZSHOW_LIMITS.promptMax}
      isMultiline
      missingLanguages={missingLanguages}
      errorText={(language: QuizshowLanguage) =>
        t("quizshow:problems.prompt_missing", {
          round: roundNumber,
          question: questionIndex + 1,
          language: t(`quizshow:language.tag.${language}`),
        })
      }
      onChange={(prompt) => onChange({ ...question, prompt })}
    />
  );
}

/** Quiz and Caption This questions carry a picture. */
function hasPictureSlot(round: QuizshowDraftRound): boolean {
  return round.kind === "quiz" || round.kind === "caption_this";
}

/** The picture's description and, in quiz rounds, its slow reveal. */
function pictureDetailsOf(
  { round, question, onChange }: QuestionPartProps,
  languages: QuizshowLanguageMode,
): QuizshowQuestionPictureDetailsProps {
  return {
    hasPicture: question.mediaRef !== null,
    alt: question.mediaAlt,
    languages,
    onAltChange: (mediaAlt) => onChange({ ...question, mediaAlt }),
    // Party rounds show a picture at once (contract 6.23).
    ...(round.kind === "quiz"
      ? {
          mediaReveal: question.mediaReveal,
          onMediaRevealChange: (mediaReveal: QuizshowMediaReveal) =>
            onChange({ ...question, mediaReveal }),
        }
      : {}),
  };
}

/** The "Fun fact" the reveal shows with the answer, on a quiz round's question (contract 6.22). */
function RevealNoteSection({
  round,
  question,
  languages,
  onChange,
}: Pick<QuestionPartProps, "round" | "question" | "onChange"> & {
  languages: QuizshowLanguageMode;
}) {
  const { t } = useTranslation();
  if (round.kind !== "quiz" || question.type === "prompt") return null;
  const label = t("quizshow:questions.revealNote.label");
  return (
    <QuizshowInspectorSection isTitleHidden title={label}>
      <QuizshowBilingualInput
        label={label}
        hint={t("quizshow:questions.revealNote.hint")}
        value={question.revealNote}
        languages={languages}
        maxLength={QUIZSHOW_LIMITS.revealNoteMax}
        isMultiline
        onChange={(revealNote) => onChange({ ...question, revealNote })}
      />
    </QuizshowInspectorSection>
  );
}

/** Below 1024px the host types here: the question text and its picture, then the answers. */
function NarrowEditing(props: QuestionPartProps) {
  const { t } = useTranslation();
  const { controller, data, viewLanguage } = useQuizshowStudio();
  const { round, roundNumber, question, questionIndex, problems, onChange } =
    props;
  const { languages } = controller.draft;
  const hasPicture = hasPictureSlot(round);
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
                    round: roundNumber,
                    question: questionIndex + 1,
                  })
                : undefined
            }
            alt={pickQuizshowText(question.mediaAlt, viewLanguage)}
            pictureDetails={pictureDetailsOf(props, languages)}
            onChange={(mediaRef, mediaUrl) =>
              props.onChange(
                {
                  ...question,
                  mediaRef,
                  // A slow reveal needs a picture (slow_reveal_needs_picture).
                  mediaReveal:
                    mediaRef === null ? "instant" : question.mediaReveal,
                },
                mediaUrl,
              )
            }
          />
        )}
      </QuizshowInspectorSection>
      {hasAnswers && (
        <QuizshowInspectorSection title={t("quizshow:questions.options.label")}>
          <QuizshowInspectorAnswerFields
            roundKind={round.kind}
            question={question}
            draftKey={ownKey ?? ""}
            languages={languages}
            questionNumber={questionIndex + 1}
            problems={problems}
            onChange={onChange}
          />
        </QuizshowInspectorSection>
      )}
      <RevealNoteSection
        round={round}
        question={question}
        languages={languages}
        onChange={onChange}
      />
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
  const draftKey = round.questions[questionIndex]?.draftKey ?? "";
  // The slide holds the picture itself; its description and reveal live here.
  const isPictureShown = hasPictureSlot(round) && question.mediaRef !== null;
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
            draftKey={draftKey}
            onlyTypes={EXTRA_TYPES}
            // The slide edits the right number; here the margin and the unit.
            isNumberValueShown={false}
            questionNumber={questionIndex + 1}
            problems={problems}
            onChange={onChange}
          />
        </QuizshowInspectorSection>
      )}
      <Collapse isOpen={isPictureShown}>
        <QuizshowInspectorSection title={t("quizshow:questions.media.label")}>
          <QuizshowQuestionPictureFields
            {...pictureDetailsOf(props, languages)}
          />
        </QuizshowInspectorSection>
      </Collapse>
      <RevealNoteSection
        round={round}
        question={question}
        languages={languages}
        onChange={onChange}
      />
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
            draftKey={draftKey}
            languages={otherLanguage}
            onlyTypes={OTHER_LANGUAGE_TYPES}
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

/** Which round the question is in, its content label, the way to the round's settings, and Try from this question (item 21). */
function InThisRound({
  roundIndex,
  roundNumber,
  round,
  questionIndex,
}: Pick<
  QuestionPartProps,
  "roundIndex" | "roundNumber" | "round" | "questionIndex"
>) {
  const { t } = useTranslation();
  const { controller, dryRunProblems, select, viewLanguage } =
    useQuizshowStudio();
  const slice = { roundIndex, fromQuestionIndex: questionIndex };
  const roundName =
    round.title[viewLanguage].trim() ||
    t("quizshow:rounds.untitled", { number: roundNumber });
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
        <QuizshowTryItButton
          appearance="studio"
          draft={controller.draft}
          pickedPreviewUrls={controller.pickedPreviewUrls}
          problems={sliceProblemsOf(dryRunProblems, controller.draft, slice)}
          slice={slice}
        />
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
  if (!round || !question || !isPlayableRoundKind(round.kind)) return null;
  const roundNumber = displayRoundNumber(controller.draft.rounds, roundIndex);
  const problems = problemsFor({ kind: "question", roundIndex, questionIndex });
  const partProps: QuestionPartProps = {
    roundIndex,
    roundNumber,
    roundKind: round.kind,
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
            roundIndex={roundIndex}
            questionIndex={questionIndex}
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
            onChange={partProps.onChange}
          />
        </QuizshowInspectorSection>
      )}
      {isWide && <WideExtras {...partProps} />}
      <InThisRound
        roundIndex={roundIndex}
        roundNumber={roundNumber}
        round={round}
        questionIndex={questionIndex}
      />
      <QuizshowInspectorProblems problems={problems} />
    </>
  );
}
