import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ManageGatheringPage.module.css";

/** Split a `"Title: subtitle"` heading so the half after the colon renders as
 *  the coral italic emphasis the display type calls for. */
function renderTitle(title: string) {
  const idx = title.indexOf(":");
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx).trim()}: <em>{title.slice(idx + 1).trim()}</em>
    </>
  );
}

/**
 * The manage dashboard's page header: status line and the host's three primary
 * actions. "Message attendees" posts a real announcement in both modes now
 * (LOC-06); it used to be hidden in live, because the only send behind it was
 * a local boolean. "Open check-in" switches to the Check-in tab, and leads as
 * the primary action while the door is open.
 */
export function ManageGatheringHeader({
  title,
  daysToGo,
  onEditDetails,
  onMessageAttendees,
  isCheckinLive,
  isCheckinActive,
  onOpenCheckin,
}: {
  title: string;
  daysToGo: number;
  onEditDetails: () => void;
  onMessageAttendees: () => void;
  /** The door window is open now, so Check-in leads as the primary action. */
  isCheckinLive: boolean;
  /** Check-in is the tab on show, so its button steps back to ghost. */
  isCheckinActive: boolean;
  /** Switches the page to its Check-in tab. */
  onOpenCheckin: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.header}>
      <div className={styles.eyebrow}>
        <div className={styles.phDot} /> {t("gatherings:manage.eyebrow")}
      </div>
      <div className={styles.title}>{renderTitle(title)}</div>
      <div className={styles.phRow}>
        <div className={styles.status}>
          <div
            className={isCheckinLive ? styles.liveDot : styles.statusDot}
            aria-hidden
          />{" "}
          {isCheckinLive
            ? t("gatherings:checkin.state.live")
            : t("gatherings:manage.status.approvedDaysToGo", {
                count: daysToGo,
              })}
        </div>
        <div className={styles.actions}>
          <Button
            variant="ghost"
            className={styles.actionBtn}
            onClick={onEditDetails}
          >
            {t("gatherings:manage.actions.editDetails")}
          </Button>
          <Button
            variant="ghost"
            className={styles.actionBtn}
            onClick={onMessageAttendees}
          >
            {t("gatherings:manage.actions.messageAttendees")}
          </Button>
          <Button
            variant={isCheckinLive && !isCheckinActive ? "primary" : "ghost"}
            className={styles.actionBtn}
            onClick={onOpenCheckin}
          >
            {t("gatherings:manage.actions.openCheckin")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
