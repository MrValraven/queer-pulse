import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { XpLedgerEntry } from "./badges.data";
import { XpSparkline } from "./XpSparkline";
import styles from "./BadgesPage.module.css";

interface BadgesLedgerProps {
  xpLedger: XpLedgerEntry[];
  totalBadgeCount: number;
  totalLevelCount: number;
}

const VISIBLE_ROWS = 6;

const INTEGRITY_ITEMS = [1, 2, 3, 4, 5] as const;

/** "Receipts": every dated XP event with a running total, plus the trust
 *  bullets explaining why the list can be relied on. Reads `xpLedger`, which
 *  is `[]` in live mode until the backend adds real event logging. */
export function BadgesLedger({ xpLedger, totalBadgeCount, totalLevelCount }: BadgesLedgerProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [showAll, setShowAll] = useState(false);
  const rows = showAll ? xpLedger : xpLedger.slice(0, VISIBLE_ROWS);
  const runningTotals: number[] = [];
  let runningTotal = xpLedger.reduce((sum, entry) => sum + entry.xp, 0);
  xpLedger.forEach((entry) => {
    runningTotals.push(runningTotal);
    runningTotal -= entry.xp;
  });

  return (
    <section className={styles.sec}>
      <div className={styles.hd}>
        <div>
          <span className={styles.hdEyebrow}>{t("members:badges.ledger.eyebrow")}</span>
          <h2 className={`${styles.hdTitle} ${styles.hdLvl1}`}>
            <Translation i18nKey="members:badges.ledger.heading" components={{ em: <em /> }} />
          </h2>
          <p className={styles.hdSub}>
            {xpLedger.length > 0
              ? t("members:badges.ledger.subWithCount", { count: xpLedger.length })
              : t("members:badges.ledger.subEmpty")}
          </p>
        </div>
      </div>
      <div className={styles.ledWrap}>
        <div className={styles.ledger}>
          {xpLedger.length === 0 ? (
            <div className={styles.lgEmpty}>
              <b>{t("members:badges.ledger.emptyTitle")}</b>
              {t("members:badges.ledger.emptyBody")}
            </div>
          ) : (
            <>
              <XpSparkline entries={xpLedger} />
              <div className={`${styles.lgRow} ${styles.lgRowHead}`}>
                <span>{t("members:badges.ledger.colDate")}</span>
                <span>{t("members:badges.ledger.colWhat")}</span>
                <span>{t("members:badges.ledger.colXp")}</span>
                <span>{t("members:badges.ledger.colTotal")}</span>
              </div>
              {rows.map((entry, index) => (
                <div key={`${entry.createdAt}-${index}`} className={`${styles.lgRow} ${entry.xp < 0 ? styles.lgAdj : ""}`}>
                  <span className={styles.lgDate}>
                    {fmt.date(new Date(entry.createdAt), { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span className={styles.lgWhat}>
                    {entry.description}
                    {entry.reason && <span className={styles.lgWhy}>{entry.reason}</span>}
                  </span>
                  <span className={styles.lgXp}>{entry.xp < 0 ? "−" : "+"}{Math.abs(entry.xp)}</span>
                  <span className={styles.lgTotal}>{runningTotals[index]!.toLocaleString()}</span>
                </div>
              ))}
              {xpLedger.length > VISIBLE_ROWS && (
                <button type="button" className={styles.lgMore} onClick={() => setShowAll((value) => !value)}>
                  {showAll ? t("members:badges.ledger.showLess") : t("members:badges.ledger.showAll", { count: xpLedger.length })}
                </button>
              )}
            </>
          )}
        </div>
        <aside className={styles.integrity}>
          <h4>{t("members:badges.ledger.integrityHeading")}</h4>
          {INTEGRITY_ITEMS.map((item) => (
            <div key={item} className={styles.ig}>
              <span className={styles.igIcon} aria-hidden>
                <FiCheck />
              </span>
              <p>
                <b>{t(`members:badges.ledger.integrity${item}Title`)}</b> {t(`members:badges.ledger.integrity${item}Body`)}
              </p>
            </div>
          ))}
        </aside>
      </div>
      <div className={styles.footnote}>
        <span>{t("members:badges.ledger.footnoteCount", { badges: totalBadgeCount, levels: totalLevelCount })}</span>
        <span>{t("members:badges.ledger.footnoteContact")}</span>
      </div>
    </section>
  );
}
