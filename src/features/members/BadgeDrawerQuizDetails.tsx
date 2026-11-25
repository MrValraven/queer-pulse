import { useTranslation } from "../../shared/i18n/useTranslation";
import type { QuizBadgeDetails } from "./badges.data";
import { QuizBadgeCount } from "./QuizBadgeCount";
import { QuizBadgeWinList } from "./QuizBadgeWinList";
import badgeStyles from "./BadgesPage.module.css";
import styles from "./QuizBadges.module.css";

interface BadgeDrawerQuizDetailsProps {
  quiz: QuizBadgeDetails;
}

/** The two drawer sections only a quiz badge has: how it is checked, and the
 *  list of games it was won in, with a count once there is more than one. */
export function BadgeDrawerQuizDetails({ quiz }: BadgeDrawerQuizDetailsProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className={badgeStyles.drSec}>
        <h5>{t("members:badges.drawer.howCheckedHeading")}</h5>
        <p className={styles.howChecked}>
          {t("members:badges.quiz.howChecked")}
        </p>
      </div>
      <div className={badgeStyles.drSec}>
        <div className={styles.winsHead}>
          <h5 className={styles.winsTitle}>
            {t("members:badges.quiz.winsHeading")}
          </h5>
          <QuizBadgeCount winCount={quiz.winCount} />
        </div>
        <QuizBadgeWinList wins={quiz.wins} />
      </div>
    </>
  );
}
