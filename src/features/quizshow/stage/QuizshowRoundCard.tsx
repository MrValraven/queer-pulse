import { m } from "motion/react";
import { FiAlertTriangle, FiStar, FiZap } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
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

/** The card's entrance: about 1.2 s from the first frame to the notes. */
const ENTRANCE_EASE = [0.16, 1, 0.3, 1] as const;

function riseIn(delaySeconds: number, durationSeconds: number) {
  return {
    hidden: { opacity: 0, y: 24 },
    shown: {
      opacity: 1,
      y: 0,
      transition: {
        delay: delaySeconds,
        duration: durationSeconds,
        ease: ENTRANCE_EASE,
      },
    },
  };
}

const CARD_VARIANTS = {
  hidden: { opacity: 0, scale: 0.94 },
  shown: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: ENTRANCE_EASE },
  },
};
const NUMBER_VARIANTS = riseIn(0.12, 0.7);
const TITLE_VARIANTS = riseIn(0.32, 0.6);
const NOTES_VARIANTS = riseIn(0.55, 0.6);
const STILL_VARIANTS = { hidden: {}, shown: {} };

/**
 * The round intro: a huge round number, the round's kind and title, and its
 * notes. It rises in over about 1.2 s with one light sweep across the glass;
 * under reduced motion it is simply there. The host can advance at any time.
 */
export function QuizshowRoundCard({
  round,
  roundCount,
  language,
  size,
}: QuizshowRoundCardProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const roundNumber = round.roundIndex + 1;
  const hasNotes =
    round.contentLabel !== "none" ||
    round.isJokerAllowed ||
    round.isSpeedBonusOn;
  return (
    <m.section
      className={`${styles.roundCard} ${styles[size]}`}
      initial={reducedMotion ? false : "hidden"}
      animate="shown"
      variants={reducedMotion ? STILL_VARIANTS : CARD_VARIANTS}
    >
      {!reducedMotion && (
        <span className={styles.roundSweep} aria-hidden="true" />
      )}
      <span className={styles.roundKind}>
        {t(`quizshow:kind.${round.kind}.name`)}
      </span>
      <m.span
        className={styles.roundNumber}
        aria-hidden="true"
        variants={reducedMotion ? STILL_VARIANTS : NUMBER_VARIANTS}
      >
        {roundNumber}
      </m.span>
      <m.div
        className={styles.roundHeading}
        variants={reducedMotion ? STILL_VARIANTS : TITLE_VARIANTS}
      >
        <p className={styles.roundEyebrow}>
          {t("quizshow:stage.roundOf", {
            number: roundNumber,
            total: roundCount,
          })}
        </p>
        <h2 className={styles.roundTitle}>
          {pickQuizshowText(round.title, language)}
        </h2>
      </m.div>
      {hasNotes && (
        <m.ul
          className={styles.roundNotes}
          variants={reducedMotion ? STILL_VARIANTS : NOTES_VARIANTS}
        >
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
        </m.ul>
      )}
    </m.section>
  );
}
