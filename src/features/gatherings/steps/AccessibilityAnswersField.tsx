import { useId } from "react";
import {
  ACCESSIBILITY_ANSWER_OPTIONS,
  ACCESSIBILITY_QUESTIONS,
  type AccessibilityAnswer,
  type AccessibilityAnswerMap,
  type AccessibilitySlug,
} from "../../marketing/listBusiness/listingAccessibility.data";
import { useTranslation } from "../../../shared/i18n/useTranslation";
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
  const { t } = useTranslation();
  const groupId = useId();

  return (
    <div className={styles.questions}>
      {ACCESSIBILITY_QUESTIONS.map((question) => {
        const labelId = `${groupId}-${question.slug}`;
        const current = answers[question.slug];
        return (
          <div
            key={question.slug}
            className={styles.question}
            role="radiogroup"
            aria-labelledby={labelId}
          >
            <div className={styles.text}>
              <span className={styles.label} id={labelId}>
                {t(question.labelKey)}
              </span>
              <span className={styles.help}>{t(question.helpKey)}</span>
            </div>
            <div className={styles.options}>
              {ACCESSIBILITY_ANSWER_OPTIONS.map((option) => {
                const AnswerIcon = option.icon;
                const isOn = current === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isOn}
                    data-answer={option.id}
                    className={[styles.option, isOn && styles.optionOn]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => onAnswer(question.slug, option.id)}
                  >
                    <AnswerIcon aria-hidden />
                    <span>{t(option.ownerKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
