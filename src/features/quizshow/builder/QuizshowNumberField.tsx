import { useEffect, useId, useState } from "react";
import {
  QUIZSHOW_LIMITS,
  type QuizshowClosestTolerance,
  type QuizshowClosestToleranceMode,
  type QuizshowLanguageMode,
  type QuizshowQuestionInput,
  type QuizshowText,
} from "../../../shared/contracts/quizshow";
import {
  Collapse,
  FormField,
  RadioCardGroup,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowBilingualInput } from "./QuizshowBilingualInput";
import styles from "./QuizshowQuestionEditor.module.css";

type ClosestNumberQuestion = Extract<
  QuizshowQuestionInput,
  { type: "closest_number" }
>;

interface QuizshowNumberFieldProps {
  question: ClosestNumberQuestion;
  /**
   * The question's identity: ST2 passes the draft question's `draftKey`. The
   * margin the field holds while no number is set belongs to this key, so a
   * field reused for another question never carries the last one's margin.
   */
  draftKey: string;
  /** The "needs a correct answer" line. */
  errorText?: string;
  /**
   * The margin shown when neither the answer nor the field holds one:
   * `closestToleranceOf(question)` from the draft model.
   */
  tolerance: QuizshowClosestTolerance;
  /**
   * Each new margin. Write it with `withClosestTolerance(question, tolerance)`.
   * While no number is set the field holds the margin itself (the host's pick,
   * or the margin the answer had before the number was cleared) and sends it
   * with the next number typed.
   */
  onToleranceChange: (tolerance: QuizshowClosestTolerance) => void;
  /** The unit label ("years"), shown with the number on the screen. */
  unit: QuizshowText;
  onUnitChange: (unit: QuizshowText) => void;
  languages: QuizshowLanguageMode;
  /**
   * Additive. False leaves the number input out and shows only the margin and
   * the unit: the studio's wide inspector, whose slide edits the number.
   * Defaults to true.
   */
  isValueShown?: boolean;
  onChange: (question: QuizshowQuestionInput) => void;
}

/** Digits with one dot or comma as the decimal mark and an optional leading minus. */
const NUMBER_TEXT_PATTERN = /^-?(\d+[.,]?\d*|[.,]\d+)$/;
/** "1,000" reads as a thousands mark, so the host is asked to retype it. */
const THOUSANDS_LOOKALIKE_PATTERN = /^-?\d{1,3}(,\d{3})+$/;

/** The amount each mode starts with when the host picks it. */
const STARTING_AMOUNTS: Record<QuizshowClosestToleranceMode, number> = {
  exact: 0,
  absolute: 1,
  percent: QUIZSHOW_LIMITS.closestLegacyPercent,
};

const TOLERANCE_MODE_LABEL_KEYS: Record<QuizshowClosestToleranceMode, string> =
  {
    exact: "quizshow:questions.tolerance.exact",
    absolute: "quizshow:questions.tolerance.within",
    percent: "quizshow:questions.tolerance.withinPercent",
  };

const TOLERANCE_MODES: readonly QuizshowClosestToleranceMode[] = [
  "exact",
  "absolute",
  "percent",
];

/** A margin and the question it was held for. */
interface HeldMargin {
  draftKey: string;
  tolerance: QuizshowClosestTolerance;
}

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
 * The catalog key naming why the typed margin cannot score (contract 6.1
 * ranges), or null when it can. "Exact" has no amount to check.
 */
function amountProblemKeyOf(
  mode: QuizshowClosestToleranceMode,
  text: string,
): string | null {
  if (mode === "exact") return null;
  if (text.trim().length === 0) {
    return "quizshow:questions.tolerance.amountMissing";
  }
  const parsed = parseNumberText(text);
  if (parsed === null) return "quizshow:questions.tolerance.amountInvalid";
  if (mode === "absolute") {
    return parsed > 0 ? null : "quizshow:questions.tolerance.amountAboveZero";
  }
  const isPercentInRange =
    Number.isInteger(parsed) &&
    parsed >= QUIZSHOW_LIMITS.closestPercentMin &&
    parsed <= QUIZSHOW_LIMITS.closestPercentMax;
  return isPercentInRange
    ? null
    : "quizshow:questions.tolerance.percentOutOfRange";
}

/**
 * A number as plain digits in fixed notation ("1e-7" is not something
 * the field reads back), with no thousands marks.
 */
function numberText(value: number | null): string {
  if (value === null) return "";
  return value.toLocaleString("en-US", {
    useGrouping: false,
    maximumFractionDigits: 20,
  });
}

/**
 * The text being typed for a committed number. The same position can hold
 * new content (their version loaded, a rebase, an import, an undo): whenever
 * the committed number changes to one the typed text does not read as, the
 * field drops its typed copy and shows the committed number, focused or not,
 * so Cmd/Ctrl+Z shows its result at once. Typing only ever commits what the
 * text reads as, so it never trips this. A blur re-seeds unreadable text.
 */
function useTypedNumberText(committedValue: number | null) {
  const [text, setText] = useState(() => numberText(committedValue));
  const [isFocused, setIsFocused] = useState(false);
  useEffect(() => {
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
  return {
    text,
    setText,
    isUnreadable: text.trim().length > 0 && parseNumberText(text) === null,
    focusHandlers: {
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
    },
  };
}

interface ToleranceFieldsProps {
  tolerance: QuizshowClosestTolerance;
  /** The right number, for the "% of 0" hint; null while none is set. */
  committedValue: number | null;
  onToleranceChange: (tolerance: QuizshowClosestTolerance) => void;
}

/** "Exact", "Within" or "Within %", and the margin for the last two (contract 6.1). */
function ToleranceFields({
  tolerance,
  committedValue,
  onToleranceChange,
}: ToleranceFieldsProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const zeroHintId = useId();
  const committedAmount = tolerance.mode === "exact" ? null : tolerance.amount;
  const amount = useTypedNumberText(committedAmount);
  const isPercent = tolerance.mode === "percent";
  const isZeroHintShown = isPercent && committedValue === 0;
  const amountProblemKey = amountProblemKeyOf(tolerance.mode, amount.text);
  const percentRange = {
    min: QUIZSHOW_LIMITS.closestPercentMin,
    max: QUIZSHOW_LIMITS.closestPercentMax,
  };
  return (
    <div className={styles.toleranceFields}>
      <span id={labelId} className={styles.groupLabel}>
        {t("quizshow:questions.tolerance.label")}
      </span>
      <RadioCardGroup<QuizshowClosestToleranceMode>
        value={tolerance.mode}
        ariaLabel={t("quizshow:questions.tolerance.label")}
        ariaLabelledBy={labelId}
        className={styles.cardGroup}
        optionClassName={`${styles.card} ${styles.toleranceCard}`}
        checkedClassName={styles.cardChecked}
        columns={TOLERANCE_MODES.length}
        onChange={(mode) => {
          if (mode === tolerance.mode) return;
          const nextAmount = STARTING_AMOUNTS[mode];
          amount.setText(mode === "exact" ? "" : numberText(nextAmount));
          onToleranceChange({ mode, amount: nextAmount });
        }}
        options={TOLERANCE_MODES.map((mode) => ({
          id: mode,
          render: <span>{t(TOLERANCE_MODE_LABEL_KEYS[mode])}</span>,
        }))}
      />
      <Collapse isOpen={tolerance.mode !== "exact"}>
        <FormField
          className={styles.amountField}
          label={t("quizshow:questions.tolerance.amount")}
          helper={
            isPercent
              ? t("quizshow:questions.tolerance.percentHint", percentRange)
              : undefined
          }
          error={
            amountProblemKey === null
              ? undefined
              : t(amountProblemKey, percentRange)
          }
        >
          <input
            type="text"
            inputMode={isPercent ? "numeric" : "decimal"}
            value={amount.text}
            aria-describedby={isZeroHintShown ? zeroHintId : undefined}
            {...amount.focusHandlers}
            onChange={(event) => {
              const nextText = event.target.value;
              amount.setText(nextText);
              const parsed = parseNumberText(nextText);
              // A number outside the mode's range is still kept, so the draft
              // matches what the line above names and the tolerance problem
              // holds the save. Empty or unreadable text keeps the last
              // margin, names the reason, and goes back to it on blur.
              if (parsed !== null && tolerance.mode !== "exact") {
                onToleranceChange({ mode: tolerance.mode, amount: parsed });
              }
            }}
          />
        </FormField>
      </Collapse>
      <Collapse isOpen={isZeroHintShown}>
        <p id={zeroHintId} className={styles.hint}>
          {t("quizshow:questions.tolerance.zeroHint")}
        </p>
      </Collapse>
    </div>
  );
}

/**
 * The right number for a Closest number question, kept as the text being
 * typed, with its scoring margin and its unit right under it.
 */
export function QuizshowNumberField({
  question,
  draftKey,
  errorText,
  tolerance,
  onToleranceChange,
  unit,
  onUnitChange,
  languages,
  isValueShown = true,
  onChange,
}: QuizshowNumberFieldProps) {
  const { t } = useTranslation();
  const committedValue =
    question.answer === null ? null : question.answer.value;
  const value = useTypedNumberText(committedValue);
  // With no number set the answer is null and has nowhere to keep a margin,
  // so the field holds the last one (the answer's, or the host's pick) for
  // this question until a number is typed again.
  const [heldMargin, setHeldMargin] = useState<HeldMargin | null>(null);
  const heldTolerance =
    heldMargin?.draftKey === draftKey ? heldMargin.tolerance : null;
  const shownTolerance =
    question.answer?.tolerance ?? heldTolerance ?? tolerance;
  const holdMargin = (nextTolerance: QuizshowClosestTolerance) =>
    setHeldMargin({ draftKey, tolerance: nextTolerance });
  return (
    <div className={styles.answerField}>
      {isValueShown && (
        <FormField
          label={t("quizshow:questions.closest.label")}
          helper={t("quizshow:questions.closest.hint")}
          error={
            value.isUnreadable
              ? t("quizshow:questions.closest.invalid")
              : errorText
          }
        >
          <input
            type="text"
            inputMode="decimal"
            value={value.text}
            aria-invalid={value.isUnreadable || undefined}
            {...value.focusHandlers}
            onChange={(event) => {
              const nextText = event.target.value;
              value.setText(nextText);
              const parsed = parseNumberText(nextText);
              // Clearing or retyping the number keeps the margin it had.
              holdMargin(shownTolerance);
              onChange({
                ...question,
                answer:
                  parsed === null
                    ? null
                    : { value: parsed, tolerance: shownTolerance },
              });
            }}
          />
        </FormField>
      )}
      <ToleranceFields
        tolerance={shownTolerance}
        committedValue={committedValue}
        onToleranceChange={(nextTolerance) => {
          holdMargin(nextTolerance);
          onToleranceChange(nextTolerance);
        }}
      />
      <QuizshowBilingualInput
        label={t("quizshow:questions.numberUnit.label")}
        hint={t("quizshow:questions.numberUnit.placeholder")}
        value={unit}
        languages={languages}
        maxLength={QUIZSHOW_LIMITS.numberUnitMax}
        onChange={onUnitChange}
      />
    </div>
  );
}
