import { m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./QuizshowPlayer.module.css";

export type QuizshowRevealTone = "right" | "wrong";

/** The full-screen wash behind the player's own result: jade for right, a calm rose for wrong. */
export function QuizshowRevealWash({
  tone,
}: {
  tone: QuizshowRevealTone | null;
}) {
  const { reducedMotion } = useMotionPrefs();
  if (tone === null) return null;
  return (
    <m.div
      key={tone}
      className={styles.wash}
      data-tone={tone}
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: reducedMotion ? 0 : 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
    />
  );
}

/**
 * The points this question earned, rolling up from zero. The rolling line is
 * drawn for the eye; the plain sentence beside it is what assistive tech reads.
 */
export function QuizshowPointsLine({ points }: { points: number }) {
  const { t } = useTranslation();
  const format = useFormat();
  const formatted = format.number(points);
  return (
    <p className={styles.points}>
      <span aria-hidden="true">
        <Translation
          i18nKey="quizshow:player.pointsEarned"
          values={{ points: formatted }}
          slots={{
            points: (
              <RollingNumber
                value={formatted}
                numericValue={points}
                revealFrom={{ value: format.number(0), numericValue: 0 }}
              />
            ),
          }}
        />
      </span>
      <span className={styles.visuallyHidden}>
        {t("quizshow:player.pointsEarned", { points: formatted })}
      </span>
    </p>
  );
}
