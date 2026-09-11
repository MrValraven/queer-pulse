import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  MAX_RSVP_CUSTOM_ANSWER_LENGTH,
  MAX_RSVP_PRONOUNS_LENGTH,
} from "./gatheringExtras";
import type {
  AskedRsvpQuestions,
  RsvpDetailsAnswerKey,
  RsvpDetailsAnswers,
} from "./rsvpDetailsAnswers";
import styles from "./GatheringDetailPanels.module.css";

/** One labelled answer: a textarea, or a single-line input for a short one. */
function RsvpDetailsTextField({
  id,
  label,
  hint,
  value,
  placeholder,
  maxLength,
  isSingleLine = false,
  isQuestionLabel = false,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  placeholder: string;
  maxLength?: number;
  isSingleLine?: boolean;
  /** The label is a host's whole question in their own words, so it reads as
   *  a sentence in sentence case. */
  isQuestionLabel?: boolean;
  onChange: (value: string) => void;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const labelClassName = isQuestionLabel
    ? `${styles.detailsLabel} ${styles.detailsLabelQuestion}`
    : styles.detailsLabel;
  return (
    <div className={styles.detailsField}>
      <label className={labelClassName} htmlFor={id}>
        {label}
      </label>
      {isSingleLine ? (
        <input
          id={id}
          type="text"
          className={styles.detailsInput}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-describedby={hintId}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <textarea
          id={id}
          className={styles.detailsTextarea}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-describedby={hintId}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {hint && (
        <p id={hintId} className={styles.detailsHint}>
          {hint}
        </p>
      )}
    </div>
  );
}

/**
 * The questions "Anything we should know?" asks on this gathering (ruling R8,
 * see `rsvpDetailsAnswers.ts`): access needs always, food and drink and
 * pronouns when the host switched them on, and the host's own question in
 * their own wording when they wrote one.
 */
export function GatheringRsvpDetailsQuestions({
  asked,
  answers,
  onAnswerChange,
}: {
  asked: AskedRsvpQuestions;
  answers: RsvpDetailsAnswers;
  onAnswerChange: (key: RsvpDetailsAnswerKey, value: string) => void;
}) {
  const { t } = useTranslation();
  const { questions, customQuestion } = asked;
  return (
    <>
      <RsvpDetailsTextField
        id="gathering-rsvp-access"
        label={t("gatherings:rsvpDetails.accessLabel")}
        placeholder={t("gatherings:rsvpDetails.accessPlaceholder")}
        value={answers.accessNeeds}
        onChange={(value) => onAnswerChange("accessNeeds", value)}
      />
      {questions.dietary && (
        <RsvpDetailsTextField
          id="gathering-rsvp-dietary"
          label={t("gatherings:rsvpDetails.dietaryLabel")}
          placeholder={t("gatherings:rsvpDetails.dietaryPlaceholder")}
          value={answers.dietaryNeeds}
          onChange={(value) => onAnswerChange("dietaryNeeds", value)}
        />
      )}
      {questions.pronouns && (
        <RsvpDetailsTextField
          id="gathering-rsvp-pronouns"
          isSingleLine
          maxLength={MAX_RSVP_PRONOUNS_LENGTH}
          label={t("gatherings:rsvpDetails.pronounsLabel")}
          placeholder={t("gatherings:rsvpDetails.pronounsPlaceholder")}
          value={answers.pronouns}
          onChange={(value) => onAnswerChange("pronouns", value)}
        />
      )}
      {customQuestion && (
        <RsvpDetailsTextField
          id="gathering-rsvp-custom"
          isQuestionLabel
          maxLength={MAX_RSVP_CUSTOM_ANSWER_LENGTH}
          label={customQuestion}
          hint={t("gatherings:rsvpDetails.customQuestionHint")}
          placeholder={t("gatherings:rsvpDetails.customAnswerPlaceholder")}
          value={answers.customAnswer}
          onChange={(value) => onAnswerChange("customAnswer", value)}
        />
      )}
    </>
  );
}
