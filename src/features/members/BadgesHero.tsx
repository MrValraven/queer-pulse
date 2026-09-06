import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { RecognitionState } from "./api/useRecognition";
import type { Badge } from "./badges.data";
import {
  closestToEarning,
  rarestBadge,
  RARITY_LABEL_KEY,
  unitsRemaining,
} from "./badgeSelectors";
import { badgeDisplayMetaFor } from "./badgeCatalog.data";
import { BadgesDial } from "./BadgesDial";
import { BadgesRungs } from "./BadgesRungs";
import { BadgeCaseCard } from "./BadgeCaseCard";
import styles from "./BadgesPage.module.css";

interface BadgesHeroProps {
  memberName: string;
  since?: string;
  recognition: RecognitionState;
}

/** Page hero: back link, title, stat trio, level dial + rungs, and the
 *  "print your case" action. The plum-gradient surface where level + XP live. */
export function BadgesHero({
  memberName,
  since,
  recognition,
}: BadgesHeroProps) {
  const { t } = useTranslation();
  const [caseCardOpen, setCaseCardOpen] = useState(false);
  const { level, badges, levelLadder, perks } = recognition;
  const totalCatalog = badges.earnedCount + badges.discoverCount;
  const rarest: Badge | null = rarestBadge(badges.earned);
  const closest: Badge | undefined = closestToEarning(badges.locked)[0];
  const closestLeft = closest ? unitsRemaining(closest) : null;
  // Both stat tiles name a badge. The catalogue ships a stable id beside its
  // English display words, so the name resolves here rather than off the wire
  // (see `badgeCatalog.data.ts`); an unmapped id keeps the server's English.
  const rarestMeta = rarest ? badgeDisplayMetaFor(rarest.key) : null;
  const closestMeta = closest ? badgeDisplayMetaFor(closest.key) : null;

  return (
    <>
      <header className={styles.hero}>
        <div className={styles.heroGrid}>
          <div>
            <Link to={routes.accountProfile} className={styles.backLink}>
              <FiArrowLeft aria-hidden /> {t("members:badges.backToProfile")}
            </Link>
            <h1 className={styles.heroTitle}>
              <Translation
                i18nKey="members:badges.pageTitle"
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.who}>
              <b>{memberName}</b>
              {since &&
                ` · ${t("members:profile.hero.memberSince", { since })}`}
            </p>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.statNum}>
                  {badges.earnedCount}
                  <em>/{totalCatalog}</em>
                </div>
                <div className={styles.statLabel}>
                  {t("members:badges.hero.statEarnedLabel")}
                </div>
              </div>
              <div className={styles.stat}>
                <div className={`${styles.statNum} ${styles.statNumSm}`}>
                  {rarest ? (
                    <>
                      {rarestMeta ? t(rarestMeta.nameKey) : rarest.name}
                      <em>{t(RARITY_LABEL_KEY[rarest.rarity])}</em>
                    </>
                  ) : (
                    t("members:badges.hero.statRareNone")
                  )}
                </div>
                <div className={styles.statLabel}>
                  {t("members:badges.hero.statRareLabel")}
                </div>
              </div>
              <div className={styles.stat}>
                <div className={`${styles.statNum} ${styles.statNumSm}`}>
                  {closest ? (
                    <>
                      {closestMeta ? t(closestMeta.nameKey) : closest.name}
                      {closestLeft !== null && (
                        <em>
                          {t("members:badges.hero.toGo", {
                            count: closestLeft,
                          })}
                        </em>
                      )}
                    </>
                  ) : (
                    t("members:badges.hero.statNearAllEarned")
                  )}
                </div>
                <div className={styles.statLabel}>
                  {t("members:badges.hero.statNearLabel")}
                </div>
              </div>
            </div>
            <div className={styles.heroActs}>
              <Button
                variant="ghost-dark"
                onClick={() => setCaseCardOpen(true)}
              >
                {t("members:badges.hero.viewCase")}
              </Button>
              <Button variant="ghost-dark" href="#how-xp">
                {t("members:badges.howToEarnXp")}
              </Button>
            </div>
          </div>
          <BadgesDial level={level} />
        </div>
        <BadgesRungs levelLadder={levelLadder} perksLadder={perks.ladder} />
      </header>
      {caseCardOpen && (
        <BadgeCaseCard
          memberName={memberName}
          level={level}
          earnedBadges={badges.earned}
          onClose={() => setCaseCardOpen(false)}
        />
      )}
    </>
  );
}
