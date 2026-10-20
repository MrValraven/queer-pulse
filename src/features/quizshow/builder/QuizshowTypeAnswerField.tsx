import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiX } from "react-icons/fi";
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
  FormField,
  IconButton,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowBilingualInput } from "./QuizshowBilingualInput";
import styles from "./QuizshowQuestionEditor.module.css";

type TypeAnswerQuestion = Extract<
  QuizshowQuestionInput,
  { type: "type_answer" }
>;

interface QuizshowTypeAnswerFieldProps {
  question: TypeAnswerQuestion;
  languages: QuizshowLanguageMode;
  missingLanguages: readonly QuizshowLanguage[];
  errorText: (language: QuizshowLanguage) => string;
  onChange: (question: QuizshowQuestionInput) => void;
}

/** The typed answer in each language, plus up to ten other spellings that count. */
export function QuizshowTypeAnswerField({
  question,
  languages,
  missingLanguages,
  errorText,
  onChange,
}: QuizshowTypeAnswerFieldProps) {
  const { t } = useTranslation();
  const [pendingAnswer, setPendingAnswer] = useState("");
  const chipListRef = useRef<HTMLUListElement | null>(null);
  const shouldFocusLastChipRef = useRef(false);
  const { acceptedAnswers } = question;
  const acceptedCount = acceptedAnswers.length;

  // The tenth spelling closes the add input; focus moves to the last chip's
  // remove button, so focus stays in the field.
  useEffect(() => {
    if (!shouldFocusLastChipRef.current) return;
    shouldFocusLastChipRef.current = false;
    const removeButtons = chipListRef.current?.querySelectorAll("button");
    removeButtons?.[removeButtons.length - 1]?.focus();
  }, [acceptedCount]);
  const trimmedAnswer = pendingAnswer.trim();
  const canAdd = acceptedAnswers.length < QUIZSHOW_LIMITS.acceptedAnswersMax;
  const isAddable =
    trimmedAnswer.length > 0 &&
    trimmedAnswer.length <= QUIZSHOW_LIMITS.acceptedAnswerMax &&
    !acceptedAnswers.includes(trimmedAnswer);

  function addPendingAnswer() {
    if (!isAddable) return;
    shouldFocusLastChipRef.current =
      acceptedCount + 1 >= QUIZSHOW_LIMITS.acceptedAnswersMax;
    onChange({
      ...question,
      acceptedAnswers: [...acceptedAnswers, trimmedAnswer],
    });
    setPendingAnswer("");
  }

  return (
    <div className={styles.answerField}>
      <QuizshowBilingualInput
        label={t("quizshow:questions.typeAnswer.answer")}
        value={question.answer?.text ?? { en: "", pt: "" }}
        languages={languages}
        maxLength={QUIZSHOW_LIMITS.answerTextMax}
        missingLanguages={missingLanguages}
        errorText={errorText}
        onChange={(text) => onChange({ ...question, answer: { text } })}
      />
      <span className={styles.groupLabel}>
        {t("quizshow:questions.typeAnswer.accepted")}
      </span>
      <span className={styles.hint}>
        {t("quizshow:questions.typeAnswer.acceptedHint")}
      </span>
      <ul ref={chipListRef} className={styles.chipList}>
        <AnimatePresence initial={false}>
          {acceptedAnswers.map((acceptedAnswer) => (
            <CollapseListItem key={acceptedAnswer}>
              <span className={styles.chip}>
                <span className={styles.chipText}>{acceptedAnswer}</span>
                <IconButton
                  size="sm"
                  aria-label={t(
                    "quizshow:questions.typeAnswer.removeAccepted",
                    {
                      answer: acceptedAnswer,
                    },
                  )}
                  onClick={() =>
                    onChange({
                      ...question,
                      acceptedAnswers: acceptedAnswers.filter(
                        (existing) => existing !== acceptedAnswer,
                      ),
                    })
                  }
                >
                  <FiX aria-hidden />
                </IconButton>
              </span>
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={canAdd}>
        <div className={styles.addRow}>
          <FormField className={styles.addField}>
            <input
              type="text"
              value={pendingAnswer}
              maxLength={QUIZSHOW_LIMITS.acceptedAnswerMax}
              aria-label={t("quizshow:questions.typeAnswer.accepted")}
              onChange={(event) => setPendingAnswer(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addPendingAnswer();
                }
              }}
            />
          </FormField>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-disabled={!isAddable}
            onClick={addPendingAnswer}
          >
            {t("quizshow:questions.typeAnswer.addAccepted")}
          </Button>
        </div>
      </Collapse>
    </div>
  );
}
