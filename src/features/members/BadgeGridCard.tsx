import type { Badge } from "./badges.data";
import { progressPercent, RARITY_LABEL_KEY } from "./badgeSelectors";
import { BadgeMedallion } from "./BadgeMedallion";
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
export function BadgeGridCard({ badge, earned, story, hero = false, onOpen }: BadgeGridCardProps) {
  const { t } = useTranslation();
  const percent = progressPercent(badge);
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
        {hero && <span className={styles.heroFlag}>{t("members:badges.case.rarestFlag")}</span>}
        <span className={styles.bcCat}>{badge.category}</span>
        <h4>{badge.name}</h4>
        <span className={styles.bcCrit}>{badge.criteria ?? badge.when}</span>
        {earned && story && <span className={styles.bcStory}>{story}</span>}
        <span className={styles.bcMeta}>
          {earned ? (
            <>
              <span className={styles.bcDate}>{badge.when}</span>
              <span className={`${styles.bcRare} ${badge.rarity === "legendary" ? styles.bcRareHot : ""}`}>
                {t(RARITY_LABEL_KEY[badge.rarity])}
              </span>
            </>
          ) : badge.verifiedBy === "peer" ? (
            <span className={styles.bcRare}>{t("members:badges.momentum.cannotBeChased")}</span>
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
