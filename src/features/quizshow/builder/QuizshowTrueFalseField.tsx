import { useId } from "react";
import type { QuizshowQuestionInput } from "../../../shared/contracts/quizshow";
import {
  Collapse,
  RadioCardGroup,
  type RadioCardOption,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowShape } from "../QuizshowShape";
import { trueFalseSwatchFor } from "../quizshowSwatches";
import styles from "./QuizshowQuestionEditor.module.css";

type TrueFalseQuestion = Extract<QuizshowQuestionInput, { type: "true_false" }>;
type TrueFalseId = "true" | "false";

interface QuizshowTrueFalseFieldProps {
  question: TrueFalseQuestion;
  /** The "needs a correct answer" line. */
  errorText?: string;
  onChange: (question: QuizshowQuestionInput) => void;
}

function selectedIdOf(question: TrueFalseQuestion): TrueFalseId | "" {
  if (question.answer === null) return "";
  return question.answer.isTrue ? "true" : "false";
}

/** True or False as two radio cards, each in its own shape and colour. */
export function QuizshowTrueFalseField({
  question,
  errorText,
  onChange,
}: QuizshowTrueFalseFieldProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const options: RadioCardOption<TrueFalseId>[] = ([true, false] as const).map(
    (isTrue) => ({
      id: isTrue ? "true" : "false",
      render: (
        <>
          <QuizshowShape
            colorKey={trueFalseSwatchFor(isTrue).colorKey}
            size="medium"
            label={null}
          />
          <span>
            {t(
              isTrue
                ? "quizshow:questions.trueFalse.true"
                : "quizshow:questions.trueFalse.false",
            )}
          </span>
        </>
      ),
    }),
  );
  return (
    <div className={styles.answerField}>
      <span id={labelId} className={styles.groupLabel}>
        {t("quizshow:questions.trueFalse.label")}
      </span>
      <RadioCardGroup
        value={selectedIdOf(question)}
        options={options}
        ariaLabel={t("quizshow:questions.trueFalse.label")}
        ariaLabelledBy={labelId}
        className={styles.cardGroup}
        optionClassName={styles.card}
        checkedClassName={styles.cardChecked}
        columns={2}
        onChange={(id) =>
          onChange({ ...question, answer: { isTrue: id === "true" } })
        }
      />
      <Collapse isOpen={Boolean(errorText)}>
        <p className={styles.problem} role="alert">
          {errorText}
        </p>
      </Collapse>
    </div>
  );
}
