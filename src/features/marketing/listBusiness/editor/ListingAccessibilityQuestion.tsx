import { useId } from "react";
import { RadioCardGroup } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  ACCESSIBILITY_ANSWER_OPTIONS,
  type AccessibilityAnswer,
  type AccessibilityQuestionDefinition,
} from "../listingAccessibility.data";
import styles from "./ListingAccessibility.module.css";

/**
 * One accessibility question and its three-way answer.
 *
 * The control is a real radiogroup: the container is named by the visible
 * question text beside it (`aria-labelledby`) and described by the one-line
 * explanation under it (`aria-describedby`), and each of the three options is a
 * radio carrying its own word. A screen-reader user hears "Step-free entrance,
 * radio group … No, radio, 2 of 3, selected", which is the whole point.
 *
 * The three buttons are deliberately identical in size, shape and weight. An
 * owner answering "no" is telling the truth to someone who needs it, and the
 * interface should not make that the harder or smaller-looking choice.
 */
export function ListingAccessibilityQuestion({
  question,
  answer,
  onChange,
}: {
  question: AccessibilityQuestionDefinition;
  answer: AccessibilityAnswer;
  onChange: (slug: AccessibilityQuestionDefinition["slug"], next: AccessibilityAnswer) => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const labelId = `${fieldId}-label`;
  const helpId = `${fieldId}-help`;

  return (
    <div className={styles.question} data-answer={answer}>
      <span className={styles.questionText}>
        <span className={styles.questionLabel} id={labelId}>
          {t(question.labelKey)}
        </span>
        <span className={styles.questionHelp} id={helpId}>
          {t(question.helpKey)}
        </span>
      </span>

      <RadioCardGroup<AccessibilityAnswer>
        value={answer}
        onChange={(next) => onChange(question.slug, next)}
        ariaLabel={t(question.labelKey)}
        ariaLabelledBy={labelId}
        ariaDescribedBy={helpId}
        className={styles.answers}
        optionClassName={styles.answer}
        checkedClassName={styles.answerOn}
        options={ACCESSIBILITY_ANSWER_OPTIONS.map((option) => {
          const OptionIcon = option.icon;
          return {
            id: option.id,
            render: (
              <>
                <OptionIcon aria-hidden />
                {t(option.ownerKey)}
              </>
            ),
          };
        })}
      />
    </div>
  );
}
