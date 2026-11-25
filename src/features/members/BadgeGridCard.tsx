import { FiEyeOff } from "react-icons/fi";
import type { Badge } from "./badges.data";
import { progressPercent, RARITY_LABEL_KEY } from "./badgeSelectors";
import { badgeCategoryLabelKeyFor } from "./badgeCatalog.data";
import { badgeCriteriaFor, badgeNameFor } from "./badgeDisplayText";
import { BadgeMedallion } from "./BadgeMedallion";
import { QuizBadgeCount } from "./QuizBadgeCount";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./BadgesPage.module.css";

interface BadgeGridCardProps {
  badge: Badge;
  earned: boolean;
  story?: string;
  hero?: boolean;
  onOpen: () => void;
}

/** One badge tile in the case grid: medallion, name, criteria, and either
 *  the earned date + rarity or a locked progress readout. */
export function BadgeGridCard({
  badge,
  earned,
  story,
  hero = false,
  onOpen,
}: BadgeGridCardProps) {
  const { t, language } = useTranslation();
  const fmt = useFormat();
  // The name and "what it takes" line resolve in `badgeDisplayText.ts`: a quiz
  // badge reads its own text, a catalogue badge its translated words by stable
  // id, and an id this build has no entry for the server's own English.
  const categoryLabelKey = badgeCategoryLabelKeyFor(badge.category);
  const percent = progressPercent(badge);
  // A quiz badge's `when` is its English description, so its earned line names
  // the latest win the way a code badge names its moment: event, then day.
  const latestQuizWin = badge.quiz?.wins[0];
  const earnedLine = badge.quiz
    ? latestQuizWin
      ? `${latestQuizWin.eventName ?? t("members:badges.quiz.maskedEvent")} · ${fmt.date(new Date(latestQuizWin.wonAt))}`
      : ""
    : badge.when;
  const cardClass = [
    styles.bcard,
    earned ? styles.bcardEarned : styles.bcardLocked,
    hero ? styles.heroTile : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={cardClass} onClick={onOpen}>
      <BadgeMedallion badge={badge} earned={earned} progressPercent={percent} />
      <span className={styles.bcBody}>
        {hero && (
          <span className={styles.heroFlag}>
            {t("members:badges.case.rarestFlag")}
          </span>
        )}
        <span className={styles.bcCat}>
          {categoryLabelKey ? t(categoryLabelKey) : badge.category}
        </span>
        <h4>{badgeNameFor(badge, t, language)}</h4>
        {badge.quiz && <QuizBadgeCount winCount={badge.quiz.winCount} />}
        <span className={styles.bcCrit}>
          {badgeCriteriaFor(badge, t, language)}
        </span>
        {earned && story && <span className={styles.bcStory}>{story}</span>}
        <span className={styles.bcMeta}>
          {earned ? (
            <>
              <span className={styles.bcDate}>{earnedLine}</span>
              <span
                className={`${styles.bcRare} ${badge.rarity === "legendary" ? styles.bcRareHot : ""}`}
              >
                {t(RARITY_LABEL_KEY[badge.rarity])}
              </span>
              {/* Owner view only: the backend omits a hidden badge from any
                  other member's read, so this flag can only ever appear on
                  your own case. */}
              {badge.hiddenFromProfile && (
                <span className={styles.bcRare}>
                  <FiEyeOff aria-hidden /> {t("members:badges.case.hiddenFlag")}
                </span>
              )}
            </>
          ) : badge.verifiedBy === "peer" ? (
            <span className={styles.bcRare}>
              {t("members:badges.momentum.cannotBeChased")}
            </span>
          ) : badge.progress ? (
            <span className={styles.nxProgText}>
              {t("members:badges.momentum.progress", {
                units: badge.progress.units,
                target: badge.progress.target,
              })}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}
