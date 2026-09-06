import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LadderPill, PerkLadderRow } from "./badges.data";
import { levelNameKeyFor } from "./levelLadder.data";
import { perkLadderEntryLabelKeyFor } from "./perkCatalog.data";
import styles from "./BadgesPage.module.css";

interface BadgesRungsProps {
  levelLadder: LadderPill[];
  perksLadder: PerkLadderRow[];
}

/** The capability a rung leads with. The entry carries a stable id and the
 *  server's English beside it, so an id this build does not know still reads
 *  as a sentence (see `perkCatalog.data.ts`). A level that opens nothing
 *  extra has no entry and shows nothing, as it always has. */
function useHeadlineFor(
  perksLadder: PerkLadderRow[],
  levelNumber: number,
): string {
  const { t } = useTranslation();
  const row = perksLadder.find((entry) => entry.number === levelNumber);
  const firstPerk = row?.perks[0];
  if (!firstPerk) return "";
  const labelKey = perkLadderEntryLabelKeyFor(firstPerk.id);
  return labelKey ? t(labelKey) : firstPerk.label;
}

/** One of the three preview rungs. Split out so the headline lookup can be a
 *  hook (it needs `t`) instead of a bare function called inside a loop. */
function BadgesRung({
  pill,
  perksLadder,
}: {
  pill: LadderPill;
  perksLadder: PerkLadderRow[];
}) {
  const { t } = useTranslation();
  const headline = useHeadlineFor(perksLadder, pill.number);
  const stateClass =
    pill.state === "current"
      ? styles.rungNow
      : pill.state === "done"
        ? styles.rungPast
        : "";
  const levelNameKey = levelNameKeyFor(pill.number);
  const stateLabel =
    pill.state === "current"
      ? t("members:badges.hero.youAreHere")
      : pill.state === "done"
        ? t("members:badges.ladderV2.passed")
        : t("members:badges.ladderV2.ahead");
  return (
    <a href="#how-xp" className={`${styles.rung} ${stateClass}`}>
      <span className={styles.rungHex}>{pill.number}</span>
      <span>
        <span className={styles.rungName}>
          {levelNameKey ? t(levelNameKey) : pill.name}
        </span>
        <span className={styles.rungXp}>{stateLabel}</span>
        <span className={styles.rungCap}>{headline}</span>
      </span>
    </a>
  );
}

/** The hero's 3-rung preview: the level just passed, the current one, and
 *  the next one up (clamped at either end of the ladder). "See all seven
 *  levels" jumps to the full ladder section further down the page. */
export function BadgesRungs({ levelLadder, perksLadder }: BadgesRungsProps) {
  const { t } = useTranslation();
  const currentIndex = levelLadder.findIndex(
    (pill) => pill.state === "current",
  );
  if (currentIndex < 0) return null;

  const start = Math.max(0, Math.min(currentIndex - 1, levelLadder.length - 3));
  const rungs = levelLadder.slice(start, start + 3);

  return (
    <div className={styles.rungs}>
      {rungs.map((pill) => (
        <BadgesRung key={pill.number} pill={pill} perksLadder={perksLadder} />
      ))}
      <a href="#how-xp" className={styles.rungAll}>
        {t("members:badges.hero.seeAllLevels")} <FiArrowRight aria-hidden />
      </a>
    </div>
  );
}
