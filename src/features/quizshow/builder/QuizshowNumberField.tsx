import { useEffect, useState } from "react";
import {
  QUIZSHOW_LIMITS,
  type QuizshowQuestionInput,
} from "../../../shared/contracts/quizshow";
import { FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./QuizshowQuestionEditor.module.css";

type ClosestNumberQuestion = Extract<
  QuizshowQuestionInput,
  { type: "closest_number" }
>;

interface QuizshowNumberFieldProps {
  question: ClosestNumberQuestion;
  /** The "needs a correct answer" line. */
  errorText?: string;
  onChange: (question: QuizshowQuestionInput) => void;
}

/** Digits with one dot or comma as the decimal mark and an optional leading minus. */
const NUMBER_TEXT_PATTERN = /^-?(\d+[.,]?\d*|[.,]\d+)$/;
/** "1,000" reads as a thousands mark, so the host is asked to retype it. */
const THOUSANDS_LOOKALIKE_PATTERN = /^-?\d{1,3}(,\d{3})+$/;

/** Reads typed text as a finite number within the limit, or null. */
function parseNumberText(text: string): number | null {
  const trimmed = text.trim();
  if (
    !NUMBER_TEXT_PATTERN.test(trimmed) ||
    THOUSANDS_LOOKALIKE_PATTERN.test(trimmed)
  ) {
    return null;
  }
  const parsed = Number(trimmed.replace(",", "."));
  const isInRange =
    Number.isFinite(parsed) && Math.abs(parsed) <= QUIZSHOW_LIMITS.numberAbsMax;
  return isInRange ? parsed : null;
}

/**
 * A number as plain digits, never in exponent form ("1e-7" is not something
 * the field reads back), with no thousands marks.
 */
function numberText(value: number | null): string {
  if (value === null) return "";
  return value.toLocaleString("en-US", {
    useGrouping: false,
    maximumFractionDigits: 20,
  });
}

/** The right number for a Closest number question, kept as the text being typed. */
export function QuizshowNumberField({
  question,
  errorText,
  onChange,
}: QuizshowNumberFieldProps) {
  const { t } = useTranslation();
  const committedValue =
    question.answer === null ? null : question.answer.value;
  const [text, setText] = useState(() => numberText(committedValue));
  const [isFocused, setIsFocused] = useState(false);
  // The same position can hold new content (their version loaded, a rebase, an
  // import): while the input is not being typed in, it follows what is
  // committed. It only adopts text that reads back as the committed number.
  useEffect(() => {
    if (isFocused) return;
    const seededText = numberText(committedValue);
    if (parseNumberText(seededText) !== committedValue) return;
    // The draft is the external source here, and the text is the field's own
    // typed copy of it, so following the draft is a sync of that copy and cannot be a derived value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText((currentText) =>
      parseNumberText(currentText) === committedValue
        ? currentText
        : seededText,
    );
  }, [committedValue, isFocused]);
  const isUnreadable = text.trim().length > 0 && parseNumberText(text) === null;
  return (
    <div className={styles.answerField}>
      <FormField
        label={t("quizshow:questions.closest.label")}
        helper={t("quizshow:questions.closest.hint")}
        error={
          isUnreadable ? t("quizshow:questions.closest.invalid") : errorText
        }
      >
        <input
          type="text"
          inputMode="decimal"
          value={text}
          aria-invalid={isUnreadable || undefined}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(event) => {
            const nextText = event.target.value;
            setText(nextText);
            const parsed = parseNumberText(nextText);
            onChange({
              ...question,
              answer: parsed === null ? null : { value: parsed },
            });
          }}
        />
      </FormField>
    </div>
  );
}
