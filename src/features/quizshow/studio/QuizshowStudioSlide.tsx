import { QUIZSHOW_LIMITS } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowDraftQuestion,
  QuizshowDraftRound,
} from "../builder/quizshowDraft";
import {
  displayRoundNumber,
  isQuizRoundKind,
  isWheelRoundKind,
  playableRoundCount,
} from "../quizshowWheel";
import { pickQuizshowText } from "../stage/quizshowText";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import { clampStudioSelection } from "./quizshowStudioSelection";
import { isPartyRoundKind } from "./quizshowStudioRailView";
import { QuizshowStudioSlideAnswers } from "./QuizshowStudioSlideAnswers";
import { QuizshowStudioSlideParty } from "./QuizshowStudioSlideParty";
import {
  QuizshowStudioSlideField,
  QuizshowStudioSlidePicture,
  QuizshowStudioSlideSeconds,
} from "./QuizshowStudioSlideParts";
import {
  slideLengthOf,
  useSlideProblemLine,
  withLanguageText,
} from "./quizshowStudioSlideText";
import { QuizshowStudioSlideRound } from "./QuizshowStudioSlideRound";
import { QuizshowStudioSlideWheel } from "./QuizshowStudioSlideWheel";
import styles from "./QuizshowStudioSlide.module.css";

/** The prompt steps down to 40px from this many characters, and to 32px from the next. */
const PROMPT_MEDIUM_FROM = 90;
const PROMPT_LONG_FROM = 170;
const TITLE_LONG_FROM = 36;

/** "3 rounds · 15 questions", the size line under the title. */
function TitleSlideMeta() {
  const { t } = useTranslation();
  const { controller } = useQuizshowStudio();
  const { draft } = controller;
  const questionCount = draft.rounds.reduce(
    (total, round) => total + round.questions.length,
    0,
  );
  return (
    <p className={styles.titleMeta}>
      {t("quizshow:packs.rounds", { count: playableRoundCount(draft.rounds) })}
      <span aria-hidden="true">{" · "}</span>
      <span className={styles.visuallyHidden}>, </span>
      {t("quizshow:packs.questions", { count: questionCount })}
    </p>
  );
}

/** The quiz: a title slide with the game title in Fraunces and its size. */
function TitleSlide() {
  const { t } = useTranslation();
  const { controller } = useQuizshowStudio();
  const { draft } = controller;
  return (
    <div className={styles.slide}>
      <div className={styles.centred}>
        <p className={styles.eyebrow}>{t("quizshow:brand.name")}</p>
        <QuizshowStudioSlideField
          label={t("quizshow:settings.title.label")}
          value={draft.title}
          placeholder={t("quizshow:studio.titlePlaceholder")}
          maxLength={QUIZSHOW_LIMITS.quizTitleMax}
          className={styles.titleField}
          length={slideLengthOf(draft.title, TITLE_LONG_FROM, TITLE_LONG_FROM)}
          onChange={(title) => controller.setQuizField("title", title)}
        />
        <span className={styles.rule} aria-hidden="true" />
        <TitleSlideMeta />
      </div>
    </div>
  );
}

/**
 * The same title slide with nothing to type in: the Big screen view of the
 * Quiz selection, so the canvas shows the slide its label names.
 */
export function QuizshowStudioTitleSlidePreview() {
  const { t } = useTranslation();
  const { controller } = useQuizshowStudio();
  const { title } = controller.draft;
  const isUntitled = title.trim() === "";
  return (
    <div className={styles.slide}>
      <div className={styles.centred}>
        <p className={styles.eyebrow}>{t("quizshow:brand.name")}</p>
        <p
          className={`${styles.titleField} ${styles.titleStatic}`}
          data-length={slideLengthOf(title, TITLE_LONG_FROM, TITLE_LONG_FROM)}
          data-is-empty={isUntitled || undefined}
        >
          {isUntitled ? t("quizshow:studio.titlePlaceholder") : title}
        </p>
        <span className={styles.rule} aria-hidden="true" />
        <TitleSlideMeta />
      </div>
    </div>
  );
}

interface QuestionSlideProps {
  round: QuizshowDraftRound;
  roundIndex: number;
  questionIndex: number;
  draftQuestion: QuizshowDraftQuestion;
}

/** A quiz question: the meta pill and time, the prompt, the picture slot and the answers. */
function QuestionSlide({
  round,
  roundIndex,
  questionIndex,
  draftQuestion,
}: QuestionSlideProps) {
  const { t } = useTranslation();
  const { controller, viewLanguage } = useQuizshowStudio();
  const promptProblem = useSlideProblemLine("prompt_missing");
  const { question } = draftQuestion;
  const prompt = question.prompt[viewLanguage];
  const roundTitle = pickQuizshowText(round.title, viewLanguage).trim();
  const seconds = question.timeLimitSeconds ?? round.settings.timeLimitSeconds;
  const hasPicture = question.mediaRef !== null;
  return (
    <div className={styles.slide}>
      {/* One grid for the meta row and the prompt, so the picture keeps one
          place in the tree: a chip beside the time while the question has
          none, then a column beside the prompt (as on the TV). Switching
          never remounts the upload field, so a first pick keeps its state. */}
      <div className={styles.questionHead} data-has-picture={hasPicture}>
        <span
          className={`${styles.pill} ${styles.pillParts} ${styles.headMeta}`}
        >
          <strong>
            {t("quizshow:stage.roundOf", {
              number: displayRoundNumber(controller.draft.rounds, roundIndex),
              total: playableRoundCount(controller.draft.rounds),
            })}
          </strong>
          {roundTitle !== "" && <span>{roundTitle}</span>}
          <span>
            {t("quizshow:stage.questionOf", {
              number: questionIndex + 1,
              total: round.questions.length,
            })}
          </span>
        </span>
        <QuizshowStudioSlidePicture
          roundIndex={roundIndex}
          questionIndex={questionIndex}
          draftQuestion={draftQuestion}
          variant={hasPicture ? "slide" : "chip"}
        />
        <div className={styles.headTime}>
          <QuizshowStudioSlideSeconds seconds={seconds} />
        </div>
        <div className={styles.headPrompt}>
          <QuizshowStudioSlideField
            label={t("quizshow:questions.prompt.label")}
            value={prompt}
            placeholder={t("quizshow:studio.slide.promptPlaceholder")}
            maxLength={QUIZSHOW_LIMITS.promptMax}
            className={styles.prompt}
            length={slideLengthOf(prompt, PROMPT_MEDIUM_FROM, PROMPT_LONG_FROM)}
            problemText={promptProblem}
            onChange={(value) =>
              controller.updateQuestion(roundIndex, questionIndex, {
                ...question,
                prompt: withLanguageText(question.prompt, viewLanguage, value),
              })
            }
          />
        </div>
      </div>
      <QuizshowStudioSlideAnswers
        question={question}
        language={viewLanguage}
        onChange={(next) =>
          controller.updateQuestion(roundIndex, questionIndex, next)
        }
      />
    </div>
  );
}

/**
 * The selected slide, typed on directly: the title slide for the quiz, the
 * round intro card for a round header, and a question as the TV draws it.
 * Every edit goes through the draft controller.
 */
export function QuizshowStudioSlide() {
  const { selection, controller } = useQuizshowStudio();
  const fitted = clampStudioSelection(selection, controller.draft);
  if (fitted.kind === "quiz") return <TitleSlide />;
  const round = controller.draft.rounds[fitted.roundIndex];
  if (round === undefined) return <TitleSlide />;
  if (isWheelRoundKind(round.kind)) {
    return <QuizshowStudioSlideWheel roundIndex={fitted.roundIndex} />;
  }
  const draftQuestion =
    fitted.kind === "question"
      ? round.questions[fitted.questionIndex]
      : undefined;
  if (fitted.kind === "round" || draftQuestion === undefined) {
    return <QuizshowStudioSlideRound roundIndex={fitted.roundIndex} />;
  }
  // Keyed by position: ids and draft keys are minted again after a save,
  // and a remount would take the caret out of the field being typed in.
  const slideKey = `${fitted.roundIndex}-${fitted.questionIndex}`;
  if (isPartyRoundKind(round.kind)) {
    return (
      <QuizshowStudioSlideParty
        key={slideKey}
        round={round}
        roundIndex={fitted.roundIndex}
        questionIndex={fitted.questionIndex}
        draftQuestion={draftQuestion}
      />
    );
  }
  if (isQuizRoundKind(round.kind)) {
    return (
      <QuestionSlide
        key={slideKey}
        round={round}
        roundIndex={fitted.roundIndex}
        questionIndex={fitted.questionIndex}
        draftQuestion={draftQuestion}
      />
    );
  }
  return <QuizshowStudioSlideRound roundIndex={fitted.roundIndex} />;
}
