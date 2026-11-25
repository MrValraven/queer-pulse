import { useId, useState } from "react";
import { Collapse } from "../../../shared/components/ui";
import {
  QUIZSHOW_LIMITS,
  type QuizshowLanguage,
  type QuizshowQuestionInput,
} from "../../../shared/contracts/quizshow";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { closestToleranceOf } from "../builder/quizshowDraft";
import { closestBandCopyOf } from "../screen/quizshowScreenTileModel";
import { shownTextWithLanguageOf } from "./quizshowStudioRailView";
import { QuizshowStudioSlideField } from "./QuizshowStudioSlideParts";
import {
  useSlideProblemLine,
  withLanguageText,
} from "./quizshowStudioSlideText";
import styles from "./QuizshowStudioSlide.module.css";

type QuestionOf<Type extends QuizshowQuestionInput["type"]> = Extract<
  QuizshowQuestionInput,
  { type: Type }
>;

interface AnswerBoxProps<Question extends QuizshowQuestionInput> {
  question: Question;
  language: QuizshowLanguage;
  onChange: (question: QuizshowQuestionInput) => void;
}

/** Reads typed text as a finite number within the limit, or null ("1,000" reads as a thousands mark). */
function parseNumberText(text: string): number | null {
  const trimmed = text.trim();
  if (
    !/^-?(\d+[.,]?\d*|[.,]\d+)$/.test(trimmed) ||
    /^-?\d{1,3}(,\d{3})+$/.test(trimmed)
  ) {
    return null;
  }
  const parsed = Number(trimmed.replace(",", "."));
  const isInRange =
    Number.isFinite(parsed) && Math.abs(parsed) <= QUIZSHOW_LIMITS.numberAbsMax;
  return isInRange ? parsed : null;
}

/** The stage's "Answer on your phone" box, with the right answer typed into it. */
export function QuizshowStudioSlideTypedAnswer({
  question,
  language,
  onChange,
}: AnswerBoxProps<QuestionOf<"type_answer">>) {
  const { t } = useTranslation();
  const answerProblem = useSlideProblemLine("answer_missing");
  const { acceptedAnswers } = question;
  return (
    <>
      <div className={styles.answerBox}>
        <p className={styles.answerBoxNote}>
          {t("quizshow:stage.answerOnPhone")}
        </p>
        <span className={styles.answerBoxLabel} aria-hidden="true">
          {t("quizshow:stage.correctAnswer")}
        </span>
        <QuizshowStudioSlideField
          label={t("quizshow:questions.typeAnswer.answer")}
          value={question.answer?.text[language] ?? ""}
          placeholder={t("quizshow:studio.slide.typedPlaceholder")}
          maxLength={QUIZSHOW_LIMITS.answerTextMax}
          className={styles.answerBoxField}
          lang={language}
          problemText={answerProblem}
          onChange={(value) =>
            onChange({
              ...question,
              answer: {
                text: withLanguageText(
                  question.answer?.text ?? { en: "", pt: "" },
                  language,
                  value,
                ),
              },
            })
          }
        />
      </div>
      <p className={styles.foot}>
        {acceptedAnswers.length > 0 && (
          <>
            <span>{t("quizshow:questions.typeAnswer.accepted")}</span>
            <strong>{acceptedAnswers.join(", ")}</strong>
          </>
        )}
      </p>
    </>
  );
}

/**
 * "Within 10 years scores half" (or 10%), the screen's own copy for the
 * margin; null for an exact answer, which the TV leaves unsaid. The unit
 * rides in a slot so it carries the language it is written in.
 */
function useClosestBandLine(
  question: QuestionOf<"closest_number">,
  language: QuizshowLanguage,
) {
  const format = useFormat();
  const tolerance = question.answer?.tolerance;
  if (tolerance === undefined) return null;
  const unit = shownTextWithLanguageOf(question.numberUnit, language);
  const copy = closestBandCopyOf(
    tolerance,
    format.number(tolerance.amount),
    unit.text,
  );
  if (copy === null) return null;
  const hasUnitSlot = copy.values.unit !== undefined;
  return (
    <Translation
      i18nKey={copy.key}
      values={copy.values}
      slots={
        hasUnitSlot
          ? { unit: <span lang={unit.language}>{unit.text}</span> }
          : undefined
      }
    />
  );
}

/** The closest number box: the right number with its unit, and the margin that scores half. */
export function QuizshowStudioSlideClosestNumber({
  question,
  language,
  onChange,
}: AnswerBoxProps<QuestionOf<"closest_number">>) {
  const { t } = useTranslation();
  const hintId = useId();
  const unitId = useId();
  const bandId = useId();
  const savedNumber = question.answer?.value ?? null;
  const [numberText, setNumberText] = useState(() =>
    savedNumber === null ? "" : String(savedNumber),
  );
  // Clearing the number clears the answer; the margin it had comes back with
  // the next number typed.
  const [heldTolerance, setHeldTolerance] = useState(() =>
    closestToleranceOf(question),
  );
  // The typed text stays while it reads as the saved number; an edit made
  // elsewhere (the inspector) shows through.
  const parsedNumber = parseNumberText(numberText);
  const shownNumberText =
    parsedNumber === savedNumber ||
    (savedNumber === null && parsedNumber === null)
      ? numberText
      : String(savedNumber);
  const isUnreadable =
    shownNumberText.trim() !== "" && parseNumberText(shownNumberText) === null;
  const answerProblem = useSlideProblemLine("answer_missing");
  const isNumberInvalid = isUnreadable || answerProblem !== undefined;
  const unit = shownTextWithLanguageOf(question.numberUnit, language);
  const hasUnit = unit.text !== "";
  const bandLine = useClosestBandLine(question, language);
  const describedBy = [hasUnit && unitId, bandLine !== null && bandId, hintId]
    .filter(Boolean)
    .join(" ");
  return (
    <>
      <div className={styles.answerBox}>
        <p className={styles.answerBoxNote}>
          {t("quizshow:stage.answerOnPhone")}
        </p>
        <span className={styles.answerBoxLabel} aria-hidden="true">
          {t("quizshow:stage.correctAnswer")}
        </span>
        <label htmlFor={hintId + "-number"} className={styles.visuallyHidden}>
          {t("quizshow:questions.closest.label")}
        </label>
        <div className={styles.answerBoxRow}>
          <input
            id={hintId + "-number"}
            type="text"
            inputMode="decimal"
            className={`${styles.field} ${styles.answerBoxField}`}
            value={shownNumberText}
            placeholder={t("quizshow:studio.slide.numberPlaceholder")}
            aria-invalid={isNumberInvalid || undefined}
            aria-describedby={describedBy}
            onChange={(event) => {
              const nextText = event.target.value;
              setNumberText(nextText);
              const parsed = parseNumberText(nextText);
              const tolerance = question.answer?.tolerance ?? heldTolerance;
              if (question.answer !== null) setHeldTolerance(tolerance);
              onChange({
                ...question,
                answer: parsed === null ? null : { value: parsed, tolerance },
              });
            }}
          />
          <Collapse isOpen={hasUnit} className={styles.answerBoxUnitPanel}>
            <span
              id={unitId}
              className={styles.answerBoxUnit}
              lang={unit.language}
            >
              {unit.text}
            </span>
          </Collapse>
        </div>
        <Collapse isOpen={bandLine !== null}>
          <p id={bandId} className={styles.foot}>
            {bandLine}
          </p>
        </Collapse>
      </div>
      <p
        id={hintId}
        className={styles.foot}
        data-tone={isNumberInvalid ? "problem" : undefined}
      >
        {isUnreadable
          ? t("quizshow:questions.closest.invalid")
          : (answerProblem ?? t("quizshow:questions.closest.hint"))}
      </p>
    </>
  );
}
