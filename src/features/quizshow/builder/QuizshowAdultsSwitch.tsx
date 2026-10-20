import { useId, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Collapse, Toggle } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./QuizshowBuilder.module.css";

/**
 * A game's 18+ switch. While a round carries the adults label the switch
 * stays on, and an attempt to turn it off names the rounds to relabel first.
 */
export function QuizshowAdultsSwitch({
  isOn,
  adultsRoundNumbers,
  onChange,
}: {
  isOn: boolean;
  adultsRoundNumbers: readonly number[];
  onChange: (isOn: boolean) => void;
}) {
  const { t } = useTranslation();
  const switchId = useId();
  const hintId = useId();
  const [isLockedNoticeOpen, setIsLockedNoticeOpen] = useState(false);
  const isLocked = adultsRoundNumbers.length > 0;
  // Relabelling the last adults round retires the notice.
  if (isLockedNoticeOpen && !isLocked) setIsLockedNoticeOpen(false);
  const label = t("quizshow:settings.adults.label");

  const handleChange = (isNextOn: boolean) => {
    if (!isNextOn && isLocked) {
      setIsLockedNoticeOpen(true);
      return;
    }
    onChange(isNextOn);
  };

  return (
    <div className={styles.adultsSwitch}>
      <div className={styles.adultsRow}>
        <label htmlFor={switchId} className={styles.adultsText}>
          <span className={styles.adultsLabel}>{label}</span>
          <span id={hintId} className={styles.adultsHint}>
            {t("quizshow:settings.adults.hint")}
          </span>
        </label>
        <Toggle
          id={switchId}
          checked={isOn}
          label={label}
          aria-describedby={hintId}
          onChange={handleChange}
        />
      </div>
      <Collapse isOpen={isLockedNoticeOpen && isLocked}>
        <p className={styles.adultsLocked} role="alert">
          <FiAlertCircle
            aria-hidden
            fill="none"
            className={styles.adultsLockedIcon}
          />
          {t("quizshow:settings.adults.locked", {
            count: adultsRoundNumbers.length,
            rounds: adultsRoundNumbers.join(", "),
          })}
        </p>
      </Collapse>
    </div>
  );
}
