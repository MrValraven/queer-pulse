import { FiCheckCircle, FiSmartphone } from "react-icons/fi";
import {
  QUIZSHOW_LIMITS,
  type QuizshowPartyRoundKind,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowDraftQuestion,
  QuizshowDraftRound,
} from "../builder/quizshowDraft";
import { displayRoundNumber, playableRoundCount } from "../quizshowWheel";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import { isPartyRoundKind } from "./quizshowStudioRailView";
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
import styles from "./QuizshowStudioSlide.module.css";

const PROMPT_LABEL_KEYS: Record<QuizshowPartyRoundKind, string> = {
  lie_detector: "quizshow:questions.prompt.lieDetectorLabel",
  caption_this: "quizshow:questions.prompt.captionLabel",
  drag_name: "quizshow:questions.prompt.dragNameLabel",
};

const PLACEHOLDER_KEYS: Record<QuizshowPartyRoundKind, string> = {
  lie_detector: "quizshow:studio.slide.lieDetectorPlaceholder",
  caption_this: "quizshow:studio.slide.captionPlaceholder",
  drag_name: "quizshow:studio.slide.dragNamePlaceholder",
};

interface QuizshowStudioSlidePartyProps {
  round: QuizshowDraftRound;
  roundIndex: number;
  questionIndex: number;
  draftQuestion: QuizshowDraftQuestion;
}

/**
 * A party question: the prompt as the stage's big glass card, typed on
 * directly, with the picture slot beside it in Caption This. Players write on
 * their phones; a Lie Detector names its truth underneath, and the inspector
 * edits it.
 */
export function QuizshowStudioSlideParty({
  round,
  roundIndex,
  questionIndex,
  draftQuestion,
}: QuizshowStudioSlidePartyProps) {
  const { t } = useTranslation();
  const { controller, viewLanguage } = useQuizshowStudio();
  const mediaProblem = useSlideProblemLine("media_missing");
  const promptProblem = useSlideProblemLine("prompt_missing");
  const { question } = draftQuestion;
  const kind: QuizshowPartyRoundKind = isPartyRoundKind(round.kind)
    ? round.kind
    : "drag_name";
  const isCaption = kind === "caption_this";
  const prompt = question.prompt[viewLanguage];
  const truth =
    kind === "lie_detector" &&
    question.answer !== null &&
    "truth" in question.answer
      ? question.answer.truth[viewLanguage].trim()
      : "";
  return (
    <div className={styles.slide}>
      <div className={styles.top}>
        <span className={`${styles.pill} ${styles.pillParts}`}>
          <strong>{t(`quizshow:kind.${kind}.name`)}</strong>
          <span>
            {t("quizshow:stage.roundOf", {
              number: displayRoundNumber(controller.draft.rounds, roundIndex),
              total: playableRoundCount(controller.draft.rounds),
            })}
          </span>
        </span>
        <QuizshowStudioSlideSeconds seconds={round.settings.writeSeconds} />
      </div>
      <div className={styles.partyBody} data-has-picture={isCaption}>
        <div className={styles.partyCard}>
          <p className={styles.partyLabel} aria-hidden="true">
            {t(PROMPT_LABEL_KEYS[kind])}
          </p>
          <QuizshowStudioSlideField
            label={t(PROMPT_LABEL_KEYS[kind])}
            value={prompt}
            placeholder={t(PLACEHOLDER_KEYS[kind])}
            maxLength={QUIZSHOW_LIMITS.promptMax}
            className={styles.prompt}
            length={slideLengthOf(prompt, 90, 170)}
            problemText={promptProblem}
            onChange={(value) =>
              controller.updateQuestion(roundIndex, questionIndex, {
                ...question,
                prompt: withLanguageText(question.prompt, viewLanguage, value),
              })
            }
          />
        </div>
        {isCaption && (
          <QuizshowStudioSlidePicture
            roundIndex={roundIndex}
            questionIndex={questionIndex}
            draftQuestion={draftQuestion}
            errorText={mediaProblem}
            variant="slide"
            placeholder={t("quizshow:questions.media.captionRequired")}
            slotHeight={260}
          />
        )}
      </div>
      <p className={styles.foot}>
        {truth === "" ? (
          <FiSmartphone aria-hidden="true" focusable="false" />
        ) : (
          <FiCheckCircle aria-hidden="true" focusable="false" />
        )}
        {truth === "" ? (
          t("quizshow:stage.answerOnPhone")
        ) : (
          <>
            <span>{t("quizshow:questions.truth.label")}</span>
            <strong>{truth}</strong>
          </>
        )}
      </p>
    </div>
  );
}
