import { useId, useRef, type KeyboardEvent } from "react";
import { FiCheck, FiClock } from "react-icons/fi";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Collapse } from "../../../shared/components/ui";
import type {
  QuizshowLanguage,
  QuizshowRound,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import { QuizshowQuestionMedia } from "../builder/QuizshowQuestionMedia";
import type {
  QuizshowDraftQuestion,
  QuizshowDraftRound,
} from "../builder/quizshowDraft";
import { useAutoGrowFallback } from "../../subprofiles/useAutoGrowTextarea";
import { QuizshowStageText } from "../stage/QuizshowStageText";
import { pickQuizshowText } from "../stage/quizshowText";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import { slideTextLanguageOf } from "./quizshowStudioRailView";
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
  /**
   * The language typed in this field (item 41): the studio's view language
   * when left out, and no `lang` at all for null (the quiz title has none).
   */
  lang?: QuizshowLanguage | null;
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
  lang,
  onChange,
}: QuizshowStudioSlideFieldProps) {
  const { viewLanguage } = useQuizshowStudio();
  const fieldLanguage = lang === undefined ? viewLanguage : lang;
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
        lang={fieldLanguage ?? undefined}
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
  const { controller, data, viewLanguage } = useQuizshowStudio();
  const { question, mediaUrl } = draftQuestion;
  const pickedPreviewUrl =
    question.mediaRef === null
      ? null
      : (controller.pickedPreviewUrls.get(question.mediaRef) ?? null);
  return (
    <div className={variant === "slide" ? styles.picture : styles.pictureChip}>
      <QuizshowQuestionMedia
        variant={variant}
        alt={pickQuizshowText(question.mediaAlt, viewLanguage)}
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
            // A slow reveal needs a picture, so removing it reveals at once.
            mediaRef === null
              ? { ...question, mediaRef, mediaReveal: "instant" }
              : { ...question, mediaRef },
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

/**
 * The reveal note under the answers, muted under a "Fun fact" label, as the
 * TV reveal draws it. It is typed in the inspector; the slide shows it while
 * either language holds text, in both lines when the TV shows both.
 */
export function QuizshowStudioSlideNote({ note }: { note: QuizshowText }) {
  const { t } = useTranslation();
  const { controller, viewLanguage } = useQuizshowStudio();
  const hasNote = note.en.trim() !== "" || note.pt.trim() !== "";
  return (
    <Collapse isOpen={hasNote}>
      <p className={styles.note}>
        <span className={styles.noteLabel}>
          {t("quizshow:stage.revealNote")}
        </span>
        <QuizshowStageText
          text={note}
          language={slideTextLanguageOf(
            controller.draft.screenLanguage,
            viewLanguage,
          )}
          className={styles.noteText}
        />
      </p>
    </Collapse>
  );
}

interface QuizshowStudioSlideRightMarkProps {
  /** `checkbox`: one of several right options (multiple choice); `radio`: one of two (true or false). */
  type: "checkbox" | "radio";
  /** The radio group's name; a checkbox needs none. */
  name?: string;
  label?: string;
  isChecked: boolean;
  /** Marking it would leave no option wrong: it stays focusable, says why, and does nothing. */
  isBlocked?: boolean;
  /** The id of the line that says why a blocked mark does nothing. */
  describedBy?: string;
  onCheck: () => void;
}

/** The circle that marks a right answer: a native control, jade with a check once marked. */
export function QuizshowStudioSlideRightMark({
  type,
  name,
  label,
  isChecked,
  isBlocked = false,
  describedBy,
  onCheck,
}: QuizshowStudioSlideRightMarkProps) {
  return (
    <span className={styles.markWrap}>
      <input
        type={type}
        name={name}
        className={styles.mark}
        checked={isChecked}
        aria-label={label}
        aria-disabled={isBlocked || undefined}
        aria-describedby={describedBy}
        onChange={() => {
          if (!isBlocked) onCheck();
        }}
      />
      <FiCheck
        className={styles.markCheck}
        aria-hidden="true"
        focusable="false"
      />
    </span>
  );
}
