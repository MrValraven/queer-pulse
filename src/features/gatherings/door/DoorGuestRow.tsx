import { FiCheck, FiRotateCcw } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AttendeeRow } from "../api/events.adapters";
import { AttendeeNeeds } from "../AttendeeNeeds";
import styles from "../GatheringDashboardPage.module.css";

/**
 * One person at the door.
 *
 * The arrival state is a word and an icon, never a colour alone, and the undo
 * sits on the row it undoes: a host who taps the wrong name is holding a phone
 * with a queue in front of them and should not have to go looking.
 *
 * The attendee's own answers ride along (LOC-07) because the door is exactly
 * where "I need step-free entry" has to be readable, and they are marked as
 * private to the organisers for the same reason.
 */
export function DoorGuestRow({
  attendee,
  isPending,
  onCheckIn,
  onUndo,
}: {
  attendee: AttendeeRow;
  isPending: boolean;
  onCheckIn: (memberSlug: string) => void;
  onUndo: (memberSlug: string) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const arrivedAt = attendee.checkedInAt ?? null;

  return (
    <div className={styles.attRow}>
      <div
        className={styles.attAv}
        style={{ background: attendee.background, color: attendee.color }}
      >
        {attendee.initials}
      </div>
      <div className={styles.attInfo}>
        <div className={styles.attName}>{attendee.name}</div>
        {attendee.pronouns && (
          <div className={styles.attMeta}>{attendee.pronouns}</div>
        )}
        <AttendeeNeeds attendee={attendee} />
      </div>
      <div>
        {arrivedAt ? (
          <>
            <div className={`${styles.checkinChip} ${styles.chipIn}`}>
              <FiCheck aria-hidden />{" "}
              {t("gatherings:door.arrivedAt", { time: fmt.time(arrivedAt) })}
            </div>
            <Button
              variant="ghost"
              disabled={isPending}
              aria-label={t("gatherings:door.undoAria", {
                name: attendee.name,
              })}
              onClick={() => onUndo(attendee.slug)}
            >
              <FiRotateCcw aria-hidden /> {t("gatherings:door.undoCta")}
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            disabled={isPending}
            aria-label={t("gatherings:door.checkInAria", {
              name: attendee.name,
            })}
            onClick={() => onCheckIn(attendee.slug)}
          >
            {t("gatherings:door.checkInCta")}
          </Button>
        )}
      </div>
    </div>
  );
}
