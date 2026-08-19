import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PerkLadderRow } from "./badges.data";
import styles from "./BadgesPage.module.css";

interface BadgesLadderProps {
  perksLadder: PerkLadderRow[];
}

/** "What each level opens": one row per level, its headline capability, the
 *  rest of what it grants, and where the member stands against it. Built
 *  directly from the real perks-ladder data (no invented per-level XP). */
export function BadgesLadder({ perksLadder }: BadgesLadderProps) {
  const { t } = useTranslation();
  const topLevel = perksLadder[perksLadder.length - 1];

  return (
    <section className={styles.sec} id="how-xp">
      <div className={styles.hd}>
        <div>
          <span className={styles.hdEyebrow}>{t("members:badges.ladderV2.eyebrow")}</span>
          <h2 className={`${styles.hdTitle} ${styles.hdLvl2}`}>
            <Translation i18nKey="members:badges.ladderV2.heading" components={{ em: <em /> }} />
          </h2>
          <p className={styles.hdSub}>{t("members:badges.ladderV2.sub")}</p>
        </div>
      </div>
      <div className={styles.ladder}>
        {perksLadder.map((row) => {
          const rowClass =
            row.state === "achieved"
              ? styles.lrowDone
              : row.state === "current"
                ? styles.lrowNow
                : "";
          const [headline, ...rest] = row.perks;
          return (
            <div key={row.number} className={`${styles.lrow} ${rowClass}`}>
              <span className={styles.lnum}>{row.number}</span>
              <div>
                <div className={styles.lname}>{row.name}</div>
                {headline && <div className={styles.lheadline}>{headline}</div>}
                {rest.length > 0 && <div className={styles.lrest}>{rest.join(" · ")}</div>}
              </div>
              <div className={styles.lright}>
                <div className={styles.lstate}>{row.status}</div>
              </div>
            </div>
          );
        })}
      </div>
      {topLevel && (
        <div className={styles.beyond}>
          <b>{t("members:badges.ladderV2.beyondTitle", { name: topLevel.name })}</b>
          <span>{t("members:badges.ladderV2.beyondBody")}</span>
        </div>
      )}
    </section>
  );
}
