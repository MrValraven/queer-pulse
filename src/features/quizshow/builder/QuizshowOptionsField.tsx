import { useId } from "react";
import { AnimatePresence } from "motion/react";
import { FiCheck, FiPlus, FiX } from "react-icons/fi";
import {
  QUIZSHOW_LIMITS,
  type QuizshowLanguage,
  type QuizshowLanguageMode,
  type QuizshowOption,
  type QuizshowQuestionInput,
} from "../../../shared/contracts/quizshow";
import {
  Button,
  Collapse,
  CollapseListItem,
  IconButton,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowShape } from "../QuizshowShape";
import { answerSwatchFor } from "../quizshowSwatches";
import {
  correctIndexesOf,
  isLastWrongOption,
  mintOptionId,
  withCorrectOptionToggled,
  withOptionRemoved,
  type QuizshowOptionListQuestion,
} from "./quizshowDraft";
import { QuizshowBilingualInput } from "./QuizshowBilingualInput";
import styles from "./QuizshowQuestionEditor.module.css";

interface QuizshowOptionsFieldProps {
  /** Multiple choice marks its correct options; a poll has none to mark. */
  question: QuizshowOptionListQuestion;
  languages: QuizshowLanguageMode;
  /** Languages with an empty answer somewhere in this question. */
  missingLanguages: readonly QuizshowLanguage[];
  errorText: (language: QuizshowLanguage) => string;
  /** The "needs a correct answer" line. */
  answerErrorText?: string;
  /**
   * Only the texts, without the correct marks or the remove and add buttons.
   * The studio
   * inspector's other-language fields set it, so the inputs get the full width.
   */
  isTextOnly?: boolean;
  onChange: (question: QuizshowQuestionInput) => void;
}

interface OptionRowProps {
  question: QuizshowOptionListQuestion;
  option: QuizshowOption;
  optionIndex: number;
  languages: QuizshowLanguageMode;
  missingLanguages: readonly QuizshowLanguage[];
  errorText: (language: QuizshowLanguage) => string;
  isTextOnly: boolean;
  /** The "Leave at least one option wrong" hint, named by a blocked mark. */
  keepOneWrongHintId: string;
  onChange: (question: QuizshowQuestionInput) => void;
}

/** One option: its shape and label with (unless text only) its correct mark and remove button, then its texts across the row. */
function OptionRow({
  question,
  option,
  optionIndex,
  languages,
  missingLanguages,
  errorText,
  isTextOnly,
  keepOneWrongHintId,
  onChange,
}: OptionRowProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const number = optionIndex + 1;
  const { options } = question;
  const markableQuestion =
    question.type === "multiple_choice" ? question : null;
  const isMarked =
    markableQuestion !== null &&
    correctIndexesOf(markableQuestion).includes(optionIndex);
  // The only wrong option: it can be neither marked nor removed, since either
  // would leave every remaining option correct. The field shows the hint from
  // the same predicate, so the description below always points at it.
  const isMarkBlocked =
    markableQuestion !== null &&
    isLastWrongOption(markableQuestion, optionIndex);
  const canRemove =
    options.length > QUIZSHOW_LIMITS.multipleChoiceOptionsMin && !isMarkBlocked;
  const emptyLanguages = missingLanguages.filter(
    (language) => option.text[language].trim().length === 0,
  );
  return (
    <div
      className={`${styles.optionRow} ${isTextOnly ? styles.textOnlyRow : ""}`}
    >
      <span className={styles.rowLead}>
        <QuizshowShape
          colorKey={answerSwatchFor(optionIndex).colorKey}
          size="small"
          label={null}
        />
      </span>
      <span id={labelId} className={`${styles.groupLabel} ${styles.rowLabel}`}>
        {t("quizshow:questions.options.item", { number })}
      </span>
      {!isTextOnly && (
        <div className={styles.optionActions}>
          {markableQuestion !== null && (
            <IconButton
              size="sm"
              className={`${styles.correctToggle} ${isMarked ? styles.correctToggleOn : ""}`}
              aria-label={t("quizshow:questions.options.markCorrect", {
                number,
              })}
              aria-pressed={isMarked}
              aria-disabled={isMarkBlocked || undefined}
              aria-describedby={isMarkBlocked ? keepOneWrongHintId : undefined}
              onClick={() => {
                if (isMarkBlocked) return;
                onChange(
                  withCorrectOptionToggled(markableQuestion, optionIndex),
                );
              }}
            >
              <FiCheck aria-hidden />
            </IconButton>
          )}
          <Collapse isOpen={canRemove}>
            <IconButton
              size="sm"
              aria-label={t("quizshow:questions.options.remove", { number })}
              onClick={() => onChange(withOptionRemoved(question, optionIndex))}
            >
              <FiX aria-hidden />
            </IconButton>
          </Collapse>
        </div>
      )}
      <div className={styles.rowFields}>
        <QuizshowBilingualInput
          labelledById={labelId}
          value={option.text}
          languages={languages}
          maxLength={QUIZSHOW_LIMITS.optionTextMax}
          missingLanguages={emptyLanguages}
          errorText={errorText}
          onChange={(text) =>
            onChange({
              ...question,
              options: options.map((existing, index) =>
                index === optionIndex ? { ...existing, text } : existing,
              ),
            })
          }
        />
      </div>
    </div>
  );
}

/**
 * Two to four answers, each tagged with its shape. Multiple choice marks one
 * or more as correct and always leaves one wrong; a poll marks none.
 */
export function QuizshowOptionsField({
  question,
  languages,
  missingLanguages,
  errorText,
  answerErrorText,
  isTextOnly = false,
  onChange,
}: QuizshowOptionsFieldProps) {
  const { t } = useTranslation();
  const keepOneWrongHintId = useId();
  const { options } = question;
  const canAdd = options.length < QUIZSHOW_LIMITS.multipleChoiceOptionsMax;
  // Shown exactly while some option's mark is blocked (see OptionRow).
  const isKeepOneWrongShown =
    !isTextOnly &&
    question.type === "multiple_choice" &&
    options.some((_option, optionIndex) =>
      isLastWrongOption(question, optionIndex),
    );

  return (
    <div className={styles.answerField}>
      <ul className={styles.rowList}>
        <AnimatePresence initial={false}>
          {options.map((option, optionIndex) => (
            <CollapseListItem key={option.id}>
              <OptionRow
                question={question}
                option={option}
                optionIndex={optionIndex}
                languages={languages}
                missingLanguages={missingLanguages}
                errorText={errorText}
                isTextOnly={isTextOnly}
                keepOneWrongHintId={keepOneWrongHintId}
                onChange={onChange}
              />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={isKeepOneWrongShown}>
        <p id={keepOneWrongHintId} className={styles.hint}>
          {t("quizshow:questions.options.keepOneWrong")}
        </p>
      </Collapse>
      <Collapse isOpen={canAdd && !isTextOnly}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            onChange({
              ...question,
              options: [
                ...options,
                { id: mintOptionId(options), text: { en: "", pt: "" } },
              ],
            })
          }
        >
          <FiPlus aria-hidden /> {t("quizshow:questions.options.add")}
        </Button>
      </Collapse>
      <Collapse isOpen={Boolean(answerErrorText)}>
        <p className={styles.problem} role="alert">
          {answerErrorText}
        </p>
      </Collapse>
    </div>
  );
}
