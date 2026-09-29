import { useId } from "react";
import { RadioCardGroup } from "../../../shared/components/ui";
import type { HostQuestion } from "../api/goTogether.types";
import { ChoiceCheck } from "./ChoiceCheck";
import styles from "./GoTogetherCard.module.css";

/** One host question: the host's own prompt and options, single choice.
 *  The opt-in form and the "answer it again" panel both use it. */
export function HostQuestionStep({
  question,
  answer,
  onAnswer,
}: {
  question: HostQuestion;
  answer: string;
  onAnswer: (optionId: string) => void;
}) {
  const headingId = useId();
  return (
    <fieldset className={styles.step}>
      <legend id={headingId} className={styles.stepTitle}>
        {question.prompt}
      </legend>
      <RadioCardGroup<string>
        value={answer}
        onChange={onAnswer}
        ariaLabel={question.prompt}
        ariaLabelledBy={headingId}
        className={styles.choices}
        optionClassName={styles.choice}
        checkedClassName={styles.choiceChecked}
        options={question.options.map((option) => ({
          id: option.id,
          render: (
            <>
              <span className={styles.choiceLabel}>{option.label}</span>
              <ChoiceCheck isChecked={answer === option.id} />
            </>
          ),
        }))}
      />
    </fieldset>
  );
}
