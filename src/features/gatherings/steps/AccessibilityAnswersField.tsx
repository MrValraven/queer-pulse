import { useId } from "react";
import {
  ACCESSIBILITY_ANSWER_OPTIONS,
  ACCESSIBILITY_QUESTIONS,
  type AccessibilityAnswer,
  type AccessibilityAnswerMap,
  type AccessibilitySlug,
} from "../../marketing/listBusiness/listingAccessibility.data";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useRovingRadioGroup } from "../../../shared/hooks";
import styles from "./AccessibilityAnswersField.module.css";

/**
 * The six accessibility questions, answered yes / no / nobody has said.
 *
 * Three genuinely different answers, and all three are information. "No" is
 * styled exactly like "yes": a host who says there is a step at the door is
 * doing right by the people who need to know, so nothing here treats it as a
 * failure. "Nobody has said" is the starting state and stays visible rather
 * than quietly reading as a no.
 *
 * The vocabulary, the slugs and the wording come from the business-listing
 * accessibility module, unchanged, so a gathering and a bar answer the same
 * questions in the same words.
 */
export function AccessibilityAnswersField({
  answers,
  onAnswer,
}: {
  answers: AccessibilityAnswerMap;
  onAnswer: (slug: AccessibilitySlug, answer: AccessibilityAnswer) => void;
}) {
  const groupId = useId();

  return (
    <div className={styles.questions}>
      {ACCESSIBILITY_QUESTIONS.map((question) => (
        <AccessibilityQuestionRow
          key={question.slug}
          labelId={`${groupId}-${question.slug}`}
          labelKey={question.labelKey}
          helpKey={question.helpKey}
          answer={answers[question.slug]}
          onAnswer={(answer) => onAnswer(question.slug, answer)}
        />
      ))}
    </div>
  );
}

/**
 * One question and its yes / no / nobody-has-said radiogroup.
 *
 * Its own component so the radiogroup keyboard hook can be called once per
 * question. The answer buttons carry a `data-answer` attribute the stylesheet
 * keys the checked colour off, which is why this group runs on
 * `useRovingRadioGroup` directly rather than through `RadioCardGroup`.
 */
function AccessibilityQuestionRow({
  labelId,
  labelKey,
  helpKey,
  answer,
  onAnswer,
}: {
  labelId: string;
  labelKey: string;
  helpKey: string;
  answer: AccessibilityAnswer | undefined;
  onAnswer: (answer: AccessibilityAnswer) => void;
}) {
  const { t } = useTranslation();
  const checkedIndex = ACCESSIBILITY_ANSWER_OPTIONS.findIndex(
    (option) => option.id === answer,
  );
  const { getRadioProps } = useRovingRadioGroup({
    optionCount: ACCESSIBILITY_ANSWER_OPTIONS.length,
    checkedIndex,
    onSelect: (index) => {
      const nextOption = ACCESSIBILITY_ANSWER_OPTIONS[index];
      if (nextOption) onAnswer(nextOption.id);
    },
  });

  return (
    <div className={styles.question}>
      <div className={styles.text}>
        <span className={styles.label} id={labelId}>
          {t(labelKey)}
        </span>
        <span className={styles.help}>{t(helpKey)}</span>
      </div>
      <div
        className={styles.options}
        role="radiogroup"
        aria-labelledby={labelId}
      >
        {ACCESSIBILITY_ANSWER_OPTIONS.map((option, index) => {
          const AnswerIcon = option.icon;
          const isOn = answer === option.id;
          return (
            <button
              key={option.id}
              {...getRadioProps(index)}
              type="button"
              role="radio"
              aria-checked={isOn}
              data-answer={option.id}
              className={[styles.option, isOn && styles.optionOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onAnswer(option.id)}
            >
              <AnswerIcon aria-hidden />
              <span>{t(option.ownerKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
