import { useId } from "react";
import type { QuizshowWinBadgesPreview } from "../../../shared/contracts/quizWinBadges";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizWinBadgeChip } from "./QuizWinBadgeChip";
import styles from "./QuizshowWinBadges.module.css";

interface QuizshowWinToEarnProps {
  preview: QuizshowWinBadgesPreview;
  /** "page" sits on paper with a hairline; "phone" matches the lobby card. */
  tone: "page" | "phone";
}

/** The next game's badges: "Win to earn", the game number and the badge chips. */
export function QuizshowWinToEarn({ preview, tone }: QuizshowWinToEarnProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const toneClass = tone === "phone" ? styles.phone : styles.page;
  return (
    <section
      aria-labelledby={titleId}
      className={`${styles.winToEarn} ${toneClass}`}
    >
      <h3 id={titleId} className={styles.title}>
        {t("quizshow:winBadges.winToEarn.title")}
      </h3>
      <p className={styles.game}>
        {t("quizshow:winBadges.winToEarn.game", { number: preview.gameNumber })}
      </p>
      <p className={styles.hint}>{t("quizshow:winBadges.winToEarn.hint")}</p>
      <ul className={styles.chips}>
        {preview.badges.map((badge) => (
          <li key={badge.badgeKey}>
            <QuizWinBadgeChip badge={badge} size="md" />
          </li>
        ))}
      </ul>
    </section>
  );
}
