import { useMemo, useState } from "react";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Badge, BadgeDrawerEntry } from "./badges.data";
import { progressPercent, rarestBadge } from "./badgeSelectors";
import { BadgeGridCard } from "./BadgeGridCard";
import { BadgeMedallion } from "./BadgeMedallion";
import { BadgesCaseControls, type BadgeSortMode } from "./BadgesCaseControls";
import styles from "./BadgesPage.module.css";

interface BadgesCaseProps {
  earnedBadges: Badge[];
  lockedBadges: Badge[];
  mutedCategories: string[];
  isCategoryMuted: (category: string) => boolean;
  toggleCategory: (category: string) => void;
  getStoryNote: (badgeKey: string) => string;
  onOpenBadge: (entries: BadgeDrawerEntry[], index: number) => void;
}

const RARITY_RANK: Record<Badge["rarity"], number> = {
  legendary: 0,
  rare: 1,
  common: 2,
};

function sortPool(
  pool: Badge[],
  earnedKeys: Set<string>,
  sortMode: BadgeSortMode,
): Badge[] {
  const sorted = pool.slice();
  if (sortMode === "rare")
    sorted.sort((a, z) => RARITY_RANK[a.rarity] - RARITY_RANK[z.rarity]);
  else if (sortMode === "xp")
    sorted.sort((a, z) => (z.xpReward ?? 0) - (a.xpReward ?? 0));
  else {
    sorted.sort((a, z) => {
      const earnedDiff =
        Number(earnedKeys.has(z.key)) - Number(earnedKeys.has(a.key));
      if (earnedDiff !== 0) return earnedDiff;
      return progressPercent(z) - progressPercent(a);
    });
  }
  return sorted;
}

/** "The case": the badge grid with category filter chips, sort, mute
 *  popover, and the show-locked switch. */
export function BadgesCase({
  earnedBadges,
  lockedBadges,
  mutedCategories,
  isCategoryMuted,
  toggleCategory,
  getStoryNote,
  onOpenBadge,
}: BadgesCaseProps) {
  const { t } = useTranslation();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortMode, setSortMode] = useState<BadgeSortMode>("close");
  const [showLocked, setShowLocked] = useState(true);

  const allBadges = useMemo(
    () => [...earnedBadges, ...lockedBadges],
    [earnedBadges, lockedBadges],
  );
  const earnedKeys = useMemo(
    () => new Set(earnedBadges.map((badge) => badge.key)),
    [earnedBadges],
  );
  const categories = useMemo(
    () => Array.from(new Set(allBadges.map((badge) => badge.category))).sort(),
    [allBadges],
  );
  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    allBadges.forEach((badge) => {
      counts[badge.category] = (counts[badge.category] ?? 0) + 1;
    });
    return counts;
  }, [allBadges]);

  const visiblePool = allBadges.filter((badge) => {
    if (categoryFilter !== "all" && badge.category !== categoryFilter)
      return false;
    if (categoryFilter === "all" && isCategoryMuted(badge.category))
      return false;
    return showLocked || earnedKeys.has(badge.key);
  });

  if (earnedBadges.length === 0) {
    const previewBadges = lockedBadges.slice(0, 3);
    return (
      <section className={styles.sec} id="the-case">
        <CaseHeading
          t={t}
          sub={t("members:badges.case.sub", {
            earned: 0,
            remaining: lockedBadges.length,
          })}
        />
        <div className={styles.caseEmpty}>
          <div>
            <h3>
              <Translation
                i18nKey="members:badges.case.emptyTitle"
                components={{ em: <em /> }}
              />
            </h3>
            <p>{t("members:badges.case.emptyDesc")}</p>
          </div>
          <div className={styles.caseEmptyMeds}>
            {previewBadges.map((badge) => (
              <div key={badge.key} className={styles.caseEmptyMed}>
                <BadgeMedallion badge={badge} earned={false} size="sm" />
                <span>{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const grouped = sortMode === "cat";
  const rendered = grouped
    ? null
    : promoteRarestEarned(
        sortPool(visiblePool, earnedKeys, sortMode),
        earnedKeys,
      );

  return (
    <section className={styles.sec} id="the-case">
      <CaseHeading
        t={t}
        sub={t("members:badges.case.sub", {
          earned: earnedBadges.length,
          remaining: lockedBadges.length,
        })}
      />
      <BadgesCaseControls
        categories={categories}
        countsByCategory={countsByCategory}
        totalCount={allBadges.length}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        mutedCategories={mutedCategories}
        isCategoryMuted={isCategoryMuted}
        toggleCategory={toggleCategory}
        showLocked={showLocked}
        onToggleShowLocked={() => setShowLocked((value) => !value)}
        sortMode={sortMode}
        onSortModeChange={setSortMode}
      />
      {grouped ? (
        categories.map((category) => {
          const rows = visiblePool.filter(
            (badge) => badge.category === category,
          );
          if (rows.length === 0) return null;
          return (
            <section key={category} className={styles.grp}>
              <div className={styles.grpHd}>
                <span className={styles.grpCount}>
                  {rows.filter((badge) => earnedKeys.has(badge.key)).length}/
                  {rows.length}
                </span>
                <h3>{category}</h3>
              </div>
              <div className={styles.bxGrid} role="list">
                {rows.map((badge) => (
                  <BadgeGridCard
                    key={badge.key}
                    badge={badge}
                    earned={earnedKeys.has(badge.key)}
                    story={getStoryNote(badge.key)}
                    onOpen={() =>
                      onOpenBadge(
                        rows.map((b) => ({
                          badge: b,
                          earned: earnedKeys.has(b.key),
                        })),
                        rows.indexOf(badge),
                      )
                    }
                  />
                ))}
              </div>
            </section>
          );
        })
      ) : (
        <div className={styles.bxGrid} role="list">
          {(rendered ?? []).map(({ badge, isHero }, index) => (
            <BadgeGridCard
              key={badge.key}
              badge={badge}
              earned={earnedKeys.has(badge.key)}
              story={getStoryNote(badge.key)}
              hero={isHero}
              onOpen={() =>
                onOpenBadge(
                  (rendered ?? []).map((entry) => ({
                    badge: entry.badge,
                    earned: earnedKeys.has(entry.badge.key),
                  })),
                  index,
                )
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CaseHeading({ t, sub }: { t: (key: string) => string; sub: string }) {
  return (
    <div className={styles.hd}>
      <div>
        <span className={styles.hdEyebrow}>
          {t("members:badges.case.eyebrow")}
        </span>
        <h2 className={`${styles.hdTitle} ${styles.hdLvl3}`}>
          <Translation
            i18nKey="members:badges.case.heading"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.hdSub}>{sub}</p>
      </div>
    </div>
  );
}

function promoteRarestEarned(
  pool: Badge[],
  earnedKeys: Set<string>,
): { badge: Badge; isHero: boolean }[] {
  const earnedInPool = pool.filter((badge) => earnedKeys.has(badge.key));
  const rarest = rarestBadge(earnedInPool);
  if (!rarest) return pool.map((badge) => ({ badge, isHero: false }));
  const withoutRarest = pool.filter((badge) => badge.key !== rarest.key);
  return [
    { badge: rarest, isHero: true },
    ...withoutRarest.map((badge) => ({ badge, isHero: false })),
  ];
}
