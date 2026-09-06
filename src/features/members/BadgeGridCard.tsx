import { FiEyeOff } from "react-icons/fi";
import type { Badge } from "./badges.data";
import { progressPercent, RARITY_LABEL_KEY } from "./badgeSelectors";
import {
  badgeCategoryLabelKeyFor,
  badgeDisplayMetaFor,
} from "./badgeCatalog.data";
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
export function BadgeGridCard({
  badge,
  earned,
  story,
  hero = false,
  onOpen,
}: BadgeGridCardProps) {
  const { t } = useTranslation();
  // The catalogue ships a stable id beside its English display words, so the
  // words resolve here rather than off the wire (see `badgeCatalog.data.ts`).
  // An id or category this build has no entry for falls back to the server's
  // own English, which is readable rather than a machine id.
  const displayMeta = badgeDisplayMetaFor(badge.key);
  const categoryLabelKey = badgeCategoryLabelKeyFor(badge.category);
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
        {hero && (
          <span className={styles.heroFlag}>
            {t("members:badges.case.rarestFlag")}
          </span>
        )}
        <span className={styles.bcCat}>
          {categoryLabelKey ? t(categoryLabelKey) : badge.category}
        </span>
        <h4>{displayMeta ? t(displayMeta.nameKey) : badge.name}</h4>
        <span className={styles.bcCrit}>
          {displayMeta
            ? t(displayMeta.lockedContextKey)
            : (badge.criteria ?? badge.when)}
        </span>
        {earned && story && <span className={styles.bcStory}>{story}</span>}
        <span className={styles.bcMeta}>
          {earned ? (
            <>
              <span className={styles.bcDate}>{badge.when}</span>
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
