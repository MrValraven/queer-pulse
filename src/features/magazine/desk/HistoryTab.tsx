import { cx } from "../../../shared/lib/cx";
import { useFormat, type Formatters } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PieceRecordView } from "../data/pieceRecord.data";
import styles from "./pieceTabs.module.css";

export interface HistoryTabProps {
  record: PieceRecordView;
}

/**
 * A trail entry's timestamp as an absolute "4 Aug, 14:02" — the record is a
 * permanent log, so a fixed moment reads better here than "3 days ago". The
 * demo fixture ships display copy rather than an ISO timestamp, so anything
 * unparseable is printed exactly as it arrived instead of as "Invalid Date".
 */
function formatEventWhen(when: string, formatters: Formatters): string {
  const moment = new Date(when);
  if (Number.isNaN(moment.getTime())) return when;
  const day = formatters.date(moment, { day: "numeric", month: "short" });
  return `${day}, ${formatters.time(moment)}`;
}

/**
 * The Brief/Care/Money/History/After record view — History tab. A single
 * append-only trail of everything that has happened to the piece (commission,
 * stage moves, sensitivity-read events, system flags). Rows arrive already
 * resolved to a name and a human phrase, so no uuid or `action` enum is
 * rendered here. Read-only: no actions, no editing, no deletion — this is the
 * piece's permanent record.
 */
export function HistoryTab({ record }: HistoryTabProps) {
  const { t } = useTranslation();
  const formatters = useFormat();
  return (
    <div className={styles.stack}>
      <div className={styles.card}>
        <h3>{t("magazine:piece.history.heading")}</h3>
        <div className={styles.trail}>
          {record.audit.map((entry) => (
            <div key={entry.id} className={styles.trailrow}>
              <span
                className={cx(styles.dot, entry.isSystem && styles.dotAmber)}
              />
              <div>
                <b>{entry.who || t("magazine:piece.history.unknownActor")}</b>{" "}
                {entry.what}
                <div className={styles.tiny}>
                  {formatEventWhen(entry.when, formatters)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <span className={styles.tiny}>{t("magazine:piece.history.footer")}</span>
      </div>
    </div>
  );
}
