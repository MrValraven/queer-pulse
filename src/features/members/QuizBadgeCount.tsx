import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./QuizBadgeCount.module.css";

interface QuizBadgeCountProps {
  /** Every live win of the badge. The pill shows from the second win on. */
  winCount: number;
}

/** The "×N" pill of a quiz badge won in more than one game. It sits after the
 *  badge name, once per surface. The glyph is sighted-only; a screen reader
 *  hears the spelled-out count ("Won 2 times"). */
export function QuizBadgeCount({ winCount }: QuizBadgeCountProps) {
  const { t } = useTranslation();
  if (winCount < 2) return null;
  return (
    <span className={styles.count}>
      <span aria-hidden="true">
        {t("members:badges.quiz.count", { count: winCount })}
      </span>
      <span className="visuallyHidden">
        {t("members:badges.quiz.countLabel", { count: winCount })}
      </span>
    </span>
  );
}
