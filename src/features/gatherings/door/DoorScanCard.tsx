import { FiArchive } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "../GatheringDashboardPage.module.css";

/**
 * The door's card-reader panel: the one control that starts a check-in from a
 * membership card.
 *
 * Rendered only while the gathering is inside its attendance window. Past it
 * the server refuses the write, so the whole panel comes down with the per-row
 * buttons rather than standing there as a door onto a gathering that ended over
 * a month ago.
 */
export function DoorScanCard({ onOpen }: { onOpen: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>{t("gatherings:door.scan.heading")}</div>
      <div className={styles.cardBody}>
        <p className={styles.doorLead}>{t("gatherings:door.scan.lead")}</p>
        <Button variant="primary" className={styles.scanBtn} onClick={onOpen}>
          {t("gatherings:door.scan.openCta")}
        </Button>
      </div>
    </div>
  );
}

/**
 * What the host sees when a check-in they just attempted was refused because
 * this gathering is past its attendance window.
 *
 * Announced (`role="alert"`) and persistent: the refusal is deterministic, so
 * it stays on the page instead of passing by in a toast, and it carries no
 * retry. The words are the platform's own account of what it did, because the
 * host reading them did nothing wrong.
 */
export function DoorClosedNotice() {
  const { t } = useTranslation();
  return (
    <div className={styles.doorClosedAlert} role="alert">
      <FiArchive aria-hidden />
      <span>{t("gatherings:door.checkInClosedNotice")}</span>
    </div>
  );
}
