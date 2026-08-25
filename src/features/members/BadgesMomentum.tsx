import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  RecognitionLevel,
  XpBreakdownItem,
} from "./api/recognition.adapters";
import type { Badge, BadgeDrawerEntry } from "./badges.data";
import { xpSourceMetaFor } from "./xpBreakdown.data";
import { closestToEarning, progressPercent } from "./badgeSelectors";
import { BadgeMedallion } from "./BadgeMedallion";
import { BadgeEarnMoment } from "./BadgeEarnMoment";
import styles from "./BadgesPage.module.css";

interface BadgesMomentumProps {
  lockedBadges: Badge[];
  mutedCategories: string[];
  unmuteAll: () => void;
  xpBreakdown: XpBreakdownItem[];
  level: RecognitionLevel;
  onOpenBadge: (entries: BadgeDrawerEntry[], index: number) => void;
}

const MOMENTUM_COUNT = 3;
const FAST_XP_COUNT = 5;

/** "Closest to earning": the 3 locked badges nearest their target, plus a
 *  strip of the fastest real XP sources still open (from xpBreakdown, not
 *  invented content). */
export function BadgesMomentum({
  lockedBadges,
  mutedCategories,
  unmuteAll,
  xpBreakdown,
  level,
  onOpenBadge,
}: BadgesMomentumProps) {
  const { t } = useTranslation();
  const [previewBadge, setPreviewBadge] = useState<Badge | null>(null);
  const nearest = closestToEarning(lockedBadges, mutedCategories).slice(
    0,
    MOMENTUM_COUNT,
  );
  const fastestSources = xpBreakdown
    .filter((source) => source.units < source.cap)
    .slice()
    .sort((a, z) => z.perUnit - a.perUnit)
    .slice(0, FAST_XP_COUNT);

  const entries: BadgeDrawerEntry[] = nearest.map((badge) => ({
    badge,
    earned: false,
  }));

  return (
    <section className={styles.sec}>
      <div className={styles.hd}>
        <div>
          <span className={styles.hdEyebrow}>
            {t("members:badges.momentum.eyebrow")}
          </span>
          <h2 className={`${styles.hdTitle} ${styles.hdLvl1}`}>
            <Translation
              i18nKey="members:badges.momentum.heading"
              components={{ em: <em /> }}
            />
          </h2>
        </div>
        {nearest[0] && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreviewBadge(nearest[0] ?? null)}
          >
            {t("members:badges.momentum.previewEarn")}
          </Button>
        )}
      </div>

      {nearest.length > 0 ? (
        <div className={styles.nxGrid}>
          {nearest.map((badge, index) => {
            const percent = progressPercent(badge);
            const tint =
              badge.tint === "jade"
                ? styles.tJade
                : badge.tint === "accent"
                  ? styles.tCoral
                  : styles.tPlum;
            return (
              <article key={badge.key} className={`${styles.nx} ${tint}`}>
                <span className={styles.nxXp}>
                  {t("members:badges.momentum.xpReward", {
                    xp: badge.xpReward ?? 0,
                  })}
                </span>
                <button
                  type="button"
                  className={styles.nxOpen}
                  onClick={() => onOpenBadge(entries, index)}
                >
                  <span className={styles.nxTop}>
                    <BadgeMedallion
                      badge={badge}
                      earned={false}
                      progressPercent={percent}
                      size="sm"
                    />
                    <span>
                      <span className={styles.nxCat}>{badge.category}</span>
                      <h3>{badge.name}</h3>
                    </span>
                  </span>
                  <span className={styles.nxCrit}>
                    {badge.criteria ?? badge.when}
                  </span>
                  {badge.progress && (
                    <span className={styles.nxProg}>
                      <span className={styles.pips}>
                        {Array.from(
                          { length: Math.min(badge.progress.target, 6) },
                          (_, pipIndex) => (
                            <span
                              key={pipIndex}
                              className={`${styles.pip} ${pipIndex < Math.round((percent / 100) * Math.min(badge.progress!.target, 6)) ? styles.pipOn : ""}`}
                            />
                          ),
                        )}
                      </span>
                      <span className={styles.nxProgText}>
                        {t("members:badges.momentum.progress", {
                          units: badge.progress.units,
                          target: badge.progress.target,
                        })}
                      </span>
                    </span>
                  )}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={styles.momentumEmpty}>
          {t("members:badges.momentum.allEarnedDesc")}
          {mutedCategories.length > 0 && (
            <>
              {" "}
              <Button variant="ghost" size="sm" onClick={unmuteAll}>
                {t("members:badges.momentum.unmuteCategory")}
              </Button>
            </>
          )}
        </div>
      )}

      {fastestSources.length > 0 && (
        <div className={styles.fast}>
          <span className={styles.fastLabel}>
            {t("members:badges.momentum.fastestXp")}
          </span>
          <span className={styles.fastRow}>
            {fastestSources.map((source) => {
              const { labelKey } = xpSourceMetaFor(source.key);
              return (
                <span key={source.key} className={styles.fx}>
                  {t(labelKey)} <b>+{source.perUnit}</b>
                </span>
              );
            })}
          </span>
        </div>
      )}

      {previewBadge && (
        <BadgeEarnMoment
          badge={previewBadge}
          level={level}
          onClose={() => setPreviewBadge(null)}
        />
      )}
    </section>
  );
}
