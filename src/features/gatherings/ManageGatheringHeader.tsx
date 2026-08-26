import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { gatheringDashboardPath } from "./data";
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
 * a local boolean.
 */
export function ManageGatheringHeader({
  title,
  daysToGo,
  slug,
  onEditDetails,
  onMessageAttendees,
}: {
  title: string;
  daysToGo: number;
  slug: string;
  onEditDetails: () => void;
  onMessageAttendees: () => void;
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
          <div className={styles.statusDot} />{" "}
          {t("gatherings:manage.status.approvedDaysToGo", { count: daysToGo })}
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
            variant="primary"
            className={styles.actionBtn}
            to={gatheringDashboardPath(slug)}
          >
            {t("gatherings:manage.actions.dayOfDashboard")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
