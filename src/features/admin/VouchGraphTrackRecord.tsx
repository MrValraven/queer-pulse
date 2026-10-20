import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { monthDate, type VouchPerson } from "./trustGraph/trustGraphModel";
import styles from "./vouchGraphInspector.module.css";

/** The join month: the full ISO time when it reads, else the 'YYYY-MM'. */
function joinedMonthDate(person: VouchPerson): Date {
  const joinedAt = new Date(person.joinedAt);
  return Number.isNaN(joinedAt.getTime()) ? monthDate(person.joined) : joinedAt;
}

/** A quiet "Joined {month}" line and, for anyone who has vouched, B4's
 *  track record card below it: how many members they vouched for and how
 *  many of those were later flagged or suspended. */
export function VouchGraphTrackRecord({ person }: { person: VouchPerson }) {
  const { t } = useTranslation();
  const format = useFormat();
  const { vouchesGiven, laterFlaggedCount } = person.trackRecord;
  const hasTrackRecord = vouchesGiven > 0;
  const joinedMonth = format.date(joinedMonthDate(person), {
    month: "short",
    year: "numeric",
  });

  return (
    <div className={styles.insStats}>
      <p className={styles.joinedLine}>
        {t("admin:vouchGraph.inspector.joinPath.joinedOn", {
          when: joinedMonth,
        })}
      </p>
      {hasTrackRecord && (
        <div className={styles.stat}>
          <div className={styles.statL}>
            {t("admin:vouchGraph.inspector.trackRecord.title")}
          </div>
          <div className={styles.statV}>
            {t("admin:vouchGraph.inspector.trackRecord.given", {
              count: vouchesGiven,
            })}
          </div>
          <div
            className={styles.statNote}
            data-tone={laterFlaggedCount > 0 ? "warn" : "clean"}
          >
            {laterFlaggedCount > 0
              ? t("admin:vouchGraph.inspector.trackRecord.flagged", {
                  count: laterFlaggedCount,
                })
              : t("admin:vouchGraph.inspector.trackRecord.clean")}
          </div>
        </div>
      )}
    </div>
  );
}
