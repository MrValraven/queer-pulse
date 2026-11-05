import { useId, useRef, type KeyboardEvent } from "react";
import { FiClock } from "react-icons/fi";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowRound } from "../../../shared/contracts/quizshow";
import { QuizshowQuestionMedia } from "../builder/QuizshowQuestionMedia";
import type {
  QuizshowDraftQuestion,
  QuizshowDraftRound,
} from "../builder/quizshowDraft";
import { useAutoGrowFallback } from "../../subprofiles/useAutoGrowTextarea";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import type { QuizshowSlideLength } from "./quizshowStudioSlideText";
import styles from "./QuizshowStudioSlide.module.css";

/** Line breaks never reach the stage, so a typed or pasted one becomes a space. */
function withoutLineBreaks(value: string): string {
  return value.replace(/[ \t]*(\r\n|\r|\n)+[ \t]*/g, " ");
}

function keepOneLine(event: KeyboardEvent<HTMLTextAreaElement>) {
  if (event.key === "Enter" && !event.nativeEvent.isComposing) {
    event.preventDefault();
  }
}

interface QuizshowStudioSlideFieldProps {
  /** The field's name for screen readers; the slide shows no visible label. */
  label: string;
  value: string;
  placeholder: string;
  maxLength: number;
  /** The stage type this field is drawn in (a CSS-module class, so it may be undefined). */
  className?: string;
  length?: QuizshowSlideLength;
  /** The problem this field has, as its sentence: the field is marked invalid and describes itself with it. */
  problemText?: string;
  onChange: (value: string) => void;
}

/**
 * Text typed straight onto the slide: a one-line textarea that wraps and
 * grows like the stage type it stands in for. Enter adds no line break,
 * since the stage draws none.
 */
export function QuizshowStudioSlideField({
  label,
  value,
  placeholder,
  maxLength,
  className,
  length,
  problemText,
  onChange,
}: QuizshowStudioSlideFieldProps) {
  const fieldId = useId();
  const problemId = useId();
  const isInvalid = problemText !== undefined;
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  useAutoGrowFallback(fieldRef, value);
  return (
    <>
      <label htmlFor={fieldId} className={styles.visuallyHidden}>
        {label}
      </label>
      <textarea
        ref={fieldRef}
        id={fieldId}
        rows={1}
        className={[styles.field, className].filter(Boolean).join(" ")}
        data-length={length}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        enterKeyHint="done"
        aria-invalid={isInvalid || undefined}
        aria-describedby={isInvalid ? problemId : undefined}
        onKeyDown={keepOneLine}
        onChange={(event) => onChange(withoutLineBreaks(event.target.value))}
      />
      {isInvalid && (
        <span id={problemId} className={styles.visuallyHidden}>
          {problemText}
        </span>
      )}
    </>
  );
}

/** Every picture key the draft's other questions and the saved quiz still hold. */
function otherMediaRefsOf(
  draftRounds: readonly QuizshowDraftRound[],
  savedRounds: readonly QuizshowRound[],
  ownDraftKey: string,
): string[] {
  const draftRefs = draftRounds
    .flatMap((round) => round.questions)
    .filter((draftQuestion) => draftQuestion.draftKey !== ownDraftKey)
    .map((draftQuestion) => draftQuestion.question.mediaRef);
  const savedRefs = savedRounds
    .flatMap((round) => round.questions)
    .map((question) => question.mediaRef);
  return [...new Set([...draftRefs, ...savedRefs])].filter(
    (mediaRef): mediaRef is string => mediaRef !== null,
  );
}

interface QuizshowStudioSlidePictureProps {
  roundIndex: number;
  questionIndex: number;
  draftQuestion: QuizshowDraftQuestion;
  /** The "needs a picture" line, when the question has that problem. */
  errorText?: string;
  /** `slide`: the slot as a drop zone on the slide; `chip`: only the add button. */
  variant: "slide" | "chip";
  /** The empty slot's caption (Caption This names that it needs one). */
  placeholder?: string;
  /** The slot's height in canvas pixels. */
  slotHeight?: number;
}

/** The slot's height on the slide, in canvas pixels. */
const SLIDE_PICTURE_HEIGHT = 160;

/**
 * The picture on the slide: the builder's upload field (its preview kept by
 * the draft across a remount), drawn as a dashed glass slot, or as a lone
 * "Add image" chip while the question has no picture.
 */
export function QuizshowStudioSlidePicture({
  roundIndex,
  questionIndex,
  draftQuestion,
  errorText,
  variant,
  placeholder,
  slotHeight = SLIDE_PICTURE_HEIGHT,
}: QuizshowStudioSlidePictureProps) {
  const { controller, data } = useQuizshowStudio();
  const { question, mediaUrl } = draftQuestion;
  const pickedPreviewUrl =
    question.mediaRef === null
      ? null
      : (controller.pickedPreviewUrls.get(question.mediaRef) ?? null);
  return (
    <div className={variant === "slide" ? styles.picture : styles.pictureChip}>
      <QuizshowQuestionMedia
        variant={variant}
        placeholder={placeholder}
        slotHeight={slotHeight}
        mediaRef={question.mediaRef}
        mediaUrl={mediaUrl}
        errorText={errorText}
        otherReferencedMediaRefs={otherMediaRefsOf(
          controller.draft.rounds,
          data.quiz?.rounds ?? [],
          draftQuestion.draftKey,
        )}
        pickedPreviewUrl={pickedPreviewUrl}
        onPickedPreview={controller.rememberPickedPreview}
        onChange={(mediaRef, nextMediaUrl) =>
          controller.updateQuestion(
            roundIndex,
            questionIndex,
            { ...question, mediaRef },
            nextMediaUrl,
          )
        }
      />
    </div>
  );
}

/** The question's time, as a pill: "20s", read out as "Seconds for this question: 20". */
export function QuizshowStudioSlideSeconds({ seconds }: { seconds: number }) {
  const { t } = useTranslation();
  const format = useFormat();
  return (
    <span className={styles.pill}>
      <FiClock aria-hidden="true" focusable="false" />
      <span className={styles.visuallyHidden}>
        {t("quizshow:questions.timeLimit.label")}:{" "}
      </span>
      {t("quizshow:studio.slide.seconds", {
        seconds: format.number(seconds),
      })}
    </span>
  );
}
