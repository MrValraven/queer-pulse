import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LadderPill, PerkLadderRow } from "./badges.data";
import styles from "./BadgesPage.module.css";

interface BadgesRungsProps {
  levelLadder: LadderPill[];
  perksLadder: PerkLadderRow[];
}

function headlineFor(perksLadder: PerkLadderRow[], levelNumber: number): string {
  const row = perksLadder.find((entry) => entry.number === levelNumber);
  const firstPerk = row?.perks[0];
  return typeof firstPerk === "string" ? firstPerk : "";
}

/** The hero's 3-rung preview: the level just passed, the current one, and
 *  the next one up (clamped at either end of the ladder). "See all seven
 *  levels" jumps to the full ladder section further down the page. */
export function BadgesRungs({ levelLadder, perksLadder }: BadgesRungsProps) {
  const { t } = useTranslation();
  const currentIndex = levelLadder.findIndex((pill) => pill.state === "current");
  if (currentIndex < 0) return null;

  const start = Math.max(0, Math.min(currentIndex - 1, levelLadder.length - 3));
  const rungs = levelLadder.slice(start, start + 3);

  return (
    <div className={styles.rungs}>
      {rungs.map((pill) => {
        const stateClass =
          pill.state === "current"
            ? styles.rungNow
            : pill.state === "done"
              ? styles.rungPast
              : "";
        const stateLabel =
          pill.state === "current"
            ? t("members:badges.hero.youAreHere")
            : pill.state === "done"
              ? t("members:badges.ladderV2.passed")
              : t("members:badges.ladderV2.ahead");
        return (
          <a
            key={pill.number}
            href="#how-xp"
            className={`${styles.rung} ${stateClass}`}
          >
            <span className={styles.rungHex}>{pill.number}</span>
            <span>
              <span className={styles.rungName}>{pill.name}</span>
              <span className={styles.rungXp}>{stateLabel}</span>
              <span className={styles.rungCap}>{headlineFor(perksLadder, pill.number)}</span>
            </span>
          </a>
        );
      })}
      <a href="#how-xp" className={styles.rungAll}>
        {t("members:badges.hero.seeAllLevels")} <span aria-hidden>→</span>
      </a>
    </div>
  );
}
