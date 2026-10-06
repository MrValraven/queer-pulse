import { FiBellOff } from "react-icons/fi";
import { Button, Modal } from "../../../../shared/components/ui";
import { cx } from "../../../../shared/lib/cx";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { IssueLastShipDto } from "../../api/issueProduction.api";
import {
  isShipDateAnnounceable,
  magazineTodayIsoDate,
} from "./issueAnnounceRule";
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
  /** The "Announce with the issue" toggle is on and the issue has not been
   *  announced yet, so this ship is expected to ring members' bells. */
  isAnnouncePending?: boolean;
  /** An earlier ship already stamped pieces without ringing the bell
   *  (`hasShippedWithoutAnnouncement`), so only a piece going live for the
   *  first time can carry the announcement now. */
  hasShippedQuietly?: boolean;
  onClose: () => void;
  onShip: () => void;
}

/**
 * The ship-the-issue confirmation. Pieces still behind the publish gate are
 * not blockers here: they hold, and the ship reports why (see
 * `ShipChecklistCard`), so this modal calls that out as a plain note and
 * keeps "Ship it" enabled.
 *
 * The modal also has to say WHEN, because a ship does two different things
 * (PRD-126). An issue dated today or in the past publishes immediately; an
 * issue dated in the future schedules every eligible piece for 09:00
 * Europe/Lisbon on that date and nothing goes live from this click.
 *
 * And it has to say when a ship will go out quietly (PRD-438). The server
 * announces an issue only when it ships from 09:00 Lisbon time on its date
 * (`isShipDateAnnounceable`), and no job comes back later to do it, so with
 * the announcement pending and the clock short of that, the modal says so and
 * says how to announce it: close this and ship on the day. Once an earlier
 * ship has already put pieces out quietly, it says that instead, since only a
 * piece going live for the first time can carry the announcement now.
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
  isAnnouncePending = false,
  hasShippedQuietly = false,
  onClose,
  onShip,
}: ShipIssueModalProps) {
  const { t } = useTranslation();

  if (!open) return null;

  // Both sides are `YYYY-MM-DD`, so a plain string comparison is the whole
  // test, against today in Lisbon: the server's own "today" for a ship.
  const isScheduledShip = Boolean(
    publishesOn && publishesOn > magazineTodayIsoDate(),
  );
  const isQuietShip =
    !hasShippedQuietly &&
    isAnnouncePending &&
    !isShipDateAnnounceable(publishesOn);
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
        {/* The quiet outcome leads: it is the one thing on this modal the
            desk cannot undo after "Ship it", so it reads first. */}
        {hasShippedQuietly && (
          <div className={cx(styles.note, styles.warn, styles.noteStack)}>
            <b>
              <FiBellOff aria-hidden />
              {t("magazine:issue.ship.shippedQuietlyLead")}
            </b>
            <span>{t("magazine:issue.ship.shippedQuietlyBody")}</span>
          </div>
        )}
        {isQuietShip && (
          <div className={cx(styles.note, styles.warn, styles.noteStack)}>
            <b>
              <FiBellOff aria-hidden />
              {t("magazine:issue.ship.quietLead")}
            </b>
            <span>
              {publishesLabel
                ? t("magazine:issue.ship.quietNoteOnDate", {
                    date: publishesLabel,
                  })
                : t("magazine:issue.ship.quietNoteToday")}
            </span>
          </div>
        )}
        <div className={styles.note}>
          <span>
            {isScheduledShip && publishesLabel
              ? t("magazine:issue.ship.schedulesForNote", {
                  date: publishesLabel,
                })
              : t("magazine:issue.ship.publishesNowNote")}
          </span>
        </div>
        {/* Neutral: held pieces are the gate working as designed, so this
            note informs and leaves the warning tint to the quiet ship. */}
        <div className={styles.note}>
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
