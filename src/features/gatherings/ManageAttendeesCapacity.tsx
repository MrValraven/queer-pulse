import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ManageGatheringPage.module.css";

/** The seats-filled bar. It reads the roster totals, so a name search above
 *  it never changes what it shows. */
export function ManageAttendeesCapacity({
  seatsTaken,
  capacity,
  goingCount,
}: {
  seatsTaken: number;
  capacity: number;
  goingCount: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const percentFilled = capacity
    ? Math.min(100, Math.round((seatsTaken / capacity) * 100))
    : 0;
  return (
    <div className={styles.capWrap}>
      <div className={styles.capLabel}>
        <span>
          {t("gatherings:manage.attendees.seatsFilled", {
            seats: seatsTaken,
            capacity,
          })}
          {seatsTaken !== goingCount && (
            <span className={styles.capNote}>
              {t("gatherings:manage.attendees.seatsFromGuests", {
                count: goingCount,
              })}
            </span>
          )}
        </span>
        <span className={styles.capPct}>
          {fmt.number(percentFilled / 100, {
            style: "percent",
            maximumFractionDigits: 0,
          })}
        </span>
      </div>
      <div className={styles.capBar}>
        <div
          className={styles.capFill}
          style={{ width: `${percentFilled}%` }}
        />
      </div>
    </div>
  );
}
