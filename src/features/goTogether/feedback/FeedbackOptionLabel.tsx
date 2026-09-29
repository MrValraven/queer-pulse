import { FiCheck } from "react-icons/fi";
import styles from "./GoTogetherFeedback.module.css";

interface FeedbackOptionLabelProps {
  label: string;
  isSelected: boolean;
}

/**
 * The inside of one meet-again answer option. The picked option leads with a
 * check mark, so the choice reads through shape and weight as well as colour
 * (WCAG 1.4.1). The same selected look the questionnaire's choice cards use:
 * accent border, tinted surface, check.
 */
export function FeedbackOptionLabel({
  label,
  isSelected,
}: FeedbackOptionLabelProps) {
  return (
    <>
      {isSelected && <FiCheck className={styles.optionTick} aria-hidden />}
      <span className={styles.optionLabel}>{label}</span>
    </>
  );
}
