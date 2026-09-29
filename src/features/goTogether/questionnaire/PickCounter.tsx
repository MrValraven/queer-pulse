import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./GoTogetherQuestionnaire.module.css";

interface PickCounterProps {
  count: number;
  maximum: number;
}

/** "You've picked 3 of 8", announced politely as picks change, with a nudge
 *  once the limit is reached (the other chips go unpickable then). It sits in
 *  the sticky action bar, so it stays in view while the chips scroll. */
export function PickCounter({ count, maximum }: PickCounterProps) {
  const { t } = useTranslation();
  return (
    <p className={styles.actionCounter} role="status">
      {t("goTogether:questionnaire.pickCount", { count, max: maximum })}
      {count >= maximum && ` ${t("goTogether:questionnaire.pickLimitReached")}`}
    </p>
  );
}
