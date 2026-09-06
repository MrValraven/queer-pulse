import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PerkLadderRow } from "./badges.data";
import { levelNameKeyFor } from "./levelLadder.data";
import {
  usePerkLadderRowLabels,
  usePerkLadderRowStatus,
} from "./usePerkLadderCopy";
import styles from "./BadgesPage.module.css";

interface BadgesLadderProps {
  perksLadder: PerkLadderRow[];
}

/** One rung: its number, its name, the capability it leads with, the rest of
 *  what it opens, and where the member stands against it. Every word comes
 *  from the frontend's own copy, keyed on the ids the row carries, with the
 *  server's English as the fallback for an id this build does not know. */
function BadgesLadderRow({ row }: { row: PerkLadderRow }) {
  const { t } = useTranslation();
  const status = usePerkLadderRowStatus(row);
  const [headline, ...rest] = usePerkLadderRowLabels(row.perks);
  const rowClass =
    row.state === "achieved"
      ? styles.lrowDone
      : row.state === "current"
        ? styles.lrowNow
        : "";
  const levelNameKey = levelNameKeyFor(row.number);
  return (
    <div className={`${styles.lrow} ${rowClass}`}>
      <span className={styles.lnum}>{row.number}</span>
      <div>
        <div className={styles.lname}>
          {levelNameKey ? t(levelNameKey) : row.name}
        </div>
        {headline && <div className={styles.lheadline}>{headline}</div>}
        {rest.length > 0 && (
          <div className={styles.lrest}>{rest.join(" · ")}</div>
        )}
      </div>
      <div className={styles.lright}>
        <div className={styles.lstate}>{status}</div>
      </div>
    </div>
  );
}

/** "What each level opens": one row per level, its headline capability, the
 *  rest of what it grants, and where the member stands against it. Built
 *  directly from the real perks-ladder data (no invented per-level XP). */
export function BadgesLadder({ perksLadder }: BadgesLadderProps) {
  const { t } = useTranslation();
  const topLevel = perksLadder[perksLadder.length - 1];
  // The top rung is named "Pillar" by the server; the ladder's words are
  // owned here and keyed on the level NUMBER (see `levelLadder.data.ts`).
  const topLevelNameKey = topLevel ? levelNameKeyFor(topLevel.number) : null;

  return (
    <section className={styles.sec} id="how-xp">
      <div className={styles.hd}>
        <div>
          <span className={styles.hdEyebrow}>
            {t("members:badges.ladderV2.eyebrow")}
          </span>
          <h2 className={`${styles.hdTitle} ${styles.hdLvl2}`}>
            <Translation
              i18nKey="members:badges.ladderV2.heading"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.hdSub}>{t("members:badges.ladderV2.sub")}</p>
        </div>
      </div>
      <div className={styles.ladder}>
        {perksLadder.map((row) => (
          <BadgesLadderRow key={row.number} row={row} />
        ))}
      </div>
      {topLevel && (
        <div className={styles.beyond}>
          <b>
            {t("members:badges.ladderV2.beyondTitle", {
              name: topLevelNameKey ? t(topLevelNameKey) : topLevel.name,
            })}
          </b>
          <span>{t("members:badges.ladderV2.beyondBody")}</span>
        </div>
      )}
    </section>
  );
}
