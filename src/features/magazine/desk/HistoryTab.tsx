import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PieceRecordView } from "../data/pieceRecord.data";
import styles from "./pieceTabs.module.css";

export interface HistoryTabProps {
  record: PieceRecordView;
}

/**
 * The Brief/Care/Money/History/After record view — History tab. A single
 * append-only trail of everything that has happened to the piece (commission,
 * stage moves, sensitivity-read events, system flags). Read-only: no actions,
 * no editing, no deletion — this is the piece's permanent record.
 */
export function HistoryTab({ record }: HistoryTabProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.stack}>
      <div className={styles.card}>
        <h3>{t("magazine:piece.history.heading")}</h3>
        <div className={styles.trail}>
          {record.audit.map((entry, index) => {
            const who = entry.actorId ?? t("magazine:piece.history.unknownActor");
            return (
              <div
                key={`${entry.createdAt}-${index}`}
                className={styles.trailrow}
              >
                <span
                  className={cx(styles.dot, who === "System" && styles.dotAmber)}
                />
                <div>
                  <b>{who}</b> {entry.action}
                  <div className={styles.tiny}>{entry.createdAt}</div>
                </div>
              </div>
            );
          })}
        </div>
        <span className={styles.tiny}>{t("magazine:piece.history.footer")}</span>
      </div>
    </div>
  );
}
