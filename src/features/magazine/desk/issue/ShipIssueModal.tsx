import { Button, Modal } from "../../../../shared/components/ui";
import { cx } from "../../../../shared/lib/cx";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { todayIso } from "../../../../shared/lib/date";
import type { IssueLastShipDto } from "../../api/issueProduction.api";
import styles from "../pieceTabs.module.css";

export interface ShipIssueModalProps {
  open: boolean;
  issueNumber: string;
  /** The publish date to name in the confirmation copy, if known (e.g. "1 September 2026"). */
  publishesLabel?: string;
  /** The issue's own `YYYY-MM-DD` publish date, or `null` while unscheduled.
   *  Date-only on both sides, so comparing it with today never slips a day. */
  publishesOn?: string | null;
  /** What the previous ship did, so a re-ship names what it held last time. */
  lastShip?: IssueLastShipDto | null;
  onClose: () => void;
  onShip: () => void;
}

/**
 * The ship-the-issue confirmation. Pieces still behind the publish gate are
 * not blockers here: they hold, and the ship reports why (see
 * `ShipChecklistCard`), so this modal calls that out as a warn note rather
 * than disabling "Ship it".
 *
 * The modal also has to say WHEN, because a ship does two different things
 * (PRD-126). An issue dated today or in the past publishes immediately; an
 * issue dated in the future schedules every eligible piece for 09:00
 * Europe/Lisbon on that date and nothing goes live from this click.
 *
 * Self-contained: renders nothing while `open` is false, matching the repo's
 * "mount modals only while open" convention even if a caller keeps this
 * mounted across the toggle.
 */
export function ShipIssueModal({
  open,
  issueNumber,
  publishesLabel,
  publishesOn,
  lastShip,
  onClose,
  onShip,
}: ShipIssueModalProps) {
  const { t } = useTranslation();

  if (!open) return null;

  // Both sides are `YYYY-MM-DD`, so a plain string comparison is the whole
  // test: no `Date` parsing, and no timezone that could move the boundary.
  const isScheduledShip = Boolean(publishesOn && publishesOn > todayIso());
  const heldLastTime = lastShip?.held ?? [];

  function handleShip() {
    onShip();
    onClose();
  }

  return (
    <Modal
      title={t("magazine:issue.ship.modalTitle", { number: issueNumber })}
      sub={
        publishesLabel
          ? t("magazine:issue.ship.modalSubWithDate", { date: publishesLabel })
          : t("magazine:issue.ship.modalSubNoDate")
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("magazine:issue.ship.notYet")}
          </Button>
          <Button variant="plum" onClick={handleShip}>
            {t("magazine:issue.ship.shipIt")}
          </Button>
        </>
      }
    >
      <div className={styles.stack}>
        <div className={styles.note}>
          <span>
            {isScheduledShip && publishesLabel
              ? t("magazine:issue.ship.schedulesForNote", {
                  date: publishesLabel,
                })
              : t("magazine:issue.ship.publishesNowNote")}
          </span>
        </div>
        <div className={cx(styles.note, styles.warn)}>
          <span>{t("magazine:issue.ship.warnNote")}</span>
        </div>
        {heldLastTime.length > 0 && (
          <div className={cx(styles.note, styles.noteStack)}>
            <b>
              {t("magazine:issue.ship.heldLastTimeHeading", {
                count: heldLastTime.length,
              })}
            </b>
            <span>{heldLastTime.map((piece) => piece.title).join(", ")}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
