import { FiAlertTriangle, FiStar, FiZap } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowLanguage,
  QuizshowRoundCard as QuizshowRoundCardData,
} from "../../../shared/contracts/quizshow";
import styles from "./QuizshowStage.module.css";
import { pickQuizshowText, type QuizshowStageSize } from "./quizshowText";

interface QuizshowRoundCardProps {
  round: QuizshowRoundCardData;
  roundCount: number;
  language: QuizshowLanguage;
  size: QuizshowStageSize;
}

export function QuizshowRoundCard({
  round,
  roundCount,
  language,
  size,
}: QuizshowRoundCardProps) {
  const { t } = useTranslation();
  return (
    <section className={`${styles.roundCard} ${styles[size]}`}>
      <p className={styles.roundEyebrow}>
        {t("quizshow:stage.roundOf", {
          number: round.roundIndex + 1,
          total: roundCount,
        })}
      </p>
      <h2 className={styles.roundTitle}>
        {pickQuizshowText(round.title, language)}
      </h2>
      <ul className={styles.roundNotes}>
        {round.contentLabel !== "none" && (
          <li className={styles.roundNote}>
            <FiAlertTriangle aria-hidden="true" fill="none" />
            {t(`quizshow:contentLabel.${round.contentLabel}`)}
          </li>
        )}
        {round.isJokerAllowed && (
          <li className={styles.roundNote}>
            <FiStar aria-hidden="true" fill="none" />
            {t("quizshow:stage.jokerAllowed")}
          </li>
        )}
        {round.isSpeedBonusOn && (
          <li className={styles.roundNote}>
            <FiZap aria-hidden="true" fill="none" />
            {t("quizshow:stage.speedBonus")}
          </li>
        )}
      </ul>
    </section>
  );
}
