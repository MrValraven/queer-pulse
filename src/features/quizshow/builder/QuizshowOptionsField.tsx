import { useId } from "react";
import { AnimatePresence } from "motion/react";
import { FiPlus, FiX } from "react-icons/fi";
import {
  QUIZSHOW_LIMITS,
  type QuizshowLanguage,
  type QuizshowLanguageMode,
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
import { mintOptionId } from "./quizshowDraft";
import { QuizshowBilingualInput } from "./QuizshowBilingualInput";
import styles from "./QuizshowQuestionEditor.module.css";

type MultipleChoiceQuestion = Extract<
  QuizshowQuestionInput,
  { type: "multiple_choice" }
>;

interface QuizshowOptionsFieldProps {
  question: MultipleChoiceQuestion;
  languages: QuizshowLanguageMode;
  /** Languages with an empty answer somewhere in this question. */
  missingLanguages: readonly QuizshowLanguage[];
  errorText: (language: QuizshowLanguage) => string;
  /** The "needs a correct answer" line. */
  answerErrorText?: string;
  onChange: (question: QuizshowQuestionInput) => void;
}

/** Index of the correct answer after the option at `removedIndex` goes. */
function correctIndexAfterRemoving(
  correctIndex: number | undefined,
  removedIndex: number,
): { correctIndex: number } | null {
  if (correctIndex === undefined || correctIndex === removedIndex) return null;
  return {
    correctIndex: correctIndex > removedIndex ? correctIndex - 1 : correctIndex,
  };
}

/** Two to four answers, each tagged with its shape, one marked correct. */
export function QuizshowOptionsField({
  question,
  languages,
  missingLanguages,
  errorText,
  answerErrorText,
  onChange,
}: QuizshowOptionsFieldProps) {
  const { t } = useTranslation();
  const radioName = useId();
  const { options, answer } = question;
  const canAdd = options.length < QUIZSHOW_LIMITS.multipleChoiceOptionsMax;
  const canRemove = options.length > QUIZSHOW_LIMITS.multipleChoiceOptionsMin;

  return (
    <div className={styles.answerField}>
      <ul className={styles.rowList}>
        <AnimatePresence initial={false}>
          {options.map((option, optionIndex) => {
            const number = optionIndex + 1;
            const emptyLanguages = missingLanguages.filter(
              (language) => option.text[language].trim().length === 0,
            );
            return (
              <CollapseListItem key={option.id}>
                <div className={styles.optionRow}>
                  <QuizshowShape
                    colorKey={answerSwatchFor(optionIndex).colorKey}
                    size="small"
                    label={null}
                  />
                  <QuizshowBilingualInput
                    label={t("quizshow:questions.options.item", { number })}
                    value={option.text}
                    languages={languages}
                    maxLength={QUIZSHOW_LIMITS.optionTextMax}
                    missingLanguages={emptyLanguages}
                    errorText={errorText}
                    onChange={(text) =>
                      onChange({
                        ...question,
                        options: options.map((existing, index) =>
                          index === optionIndex
                            ? { ...existing, text }
                            : existing,
                        ),
                      })
                    }
                  />
                  <div className={styles.optionActions}>
                    <input
                      type="radio"
                      name={radioName}
                      className={styles.radio}
                      checked={answer?.correctIndex === optionIndex}
                      aria-label={t("quizshow:questions.options.markCorrect", {
                        number,
                      })}
                      onChange={() =>
                        onChange({
                          ...question,
                          answer: { correctIndex: optionIndex },
                        })
                      }
                    />
                    <Collapse isOpen={canRemove}>
                      <IconButton
                        size="sm"
                        aria-label={t("quizshow:questions.options.remove", {
                          number,
                        })}
                        onClick={() =>
                          onChange({
                            ...question,
                            options: options.filter(
                              (_existing, index) => index !== optionIndex,
                            ),
                            answer: correctIndexAfterRemoving(
                              answer?.correctIndex,
                              optionIndex,
                            ),
                          })
                        }
                      >
                        <FiX aria-hidden />
                      </IconButton>
                    </Collapse>
                  </div>
                </div>
              </CollapseListItem>
            );
          })}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={canAdd}>
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
