import { useRef } from "react";
import { FiCalendar, FiCheck, FiClock, FiUsers } from "react-icons/fi";
import { Button, Modal } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AttendeeRow } from "../api/events.adapters";
import { AttendeeNeeds } from "../AttendeeNeeds";
import { CheckinGuestPhoto } from "./CheckinGuestPhoto";
import styles from "./CheckinGuestDetailsModal.module.css";

/** The photo's largest rendered size, in CSS pixels (see `.photo`). */
const DETAILS_PHOTO_SIZE = 240;

/** Whether `AttendeeNeeds` has a line to show for this guest, read from the
 *  same fields it checks. The guest count is left out because this dialog
 *  prints it among the facts. */
function hasNeedsToShow(attendee: AttendeeRow): boolean {
  if (attendee.guestCount === undefined) return false;
  return Boolean(
    attendee.accessNeeds?.trim() ||
    attendee.dietaryNeeds?.trim() ||
    attendee.customAnswer?.trim() ||
    attendee.detailsVisibility === "justMe",
  );
}

interface CheckinGuestDetailsModalProps {
  /** The guest as the door's lists hold them right now, so an arrival from
   *  a scan or another host shows here as it lands. */
  attendee: AttendeeRow;
  /** False once this gathering is past its attendance window. */
  canCheckIn: boolean;
  isPending: boolean;
  /** The host's own RSVP question, which labels this guest's answer. */
  customRsvpQuestion?: string | null;
  onCheckIn: (memberSlug: string) => void;
  onClose: () => void;
}

/**
 * One guest, large enough to recognise: their photo on the left and what
 * they told the host on the right, so the host can confirm it is them before
 * checking them in. On a phone the dialog is a bottom sheet, the photo
 * shrinks beside the details and the needs run full width underneath.
 *
 * "Check in" shows only while this guest can still be checked in, and takes
 * focus when the dialog opens, so a keyboard host confirms with Enter. For a
 * guest who has already arrived, focus lands on Back instead.
 */
export function CheckinGuestDetailsModal({
  attendee,
  canCheckIn,
  isPending,
  customRsvpQuestion,
  onCheckIn,
  onClose,
}: CheckinGuestDetailsModalProps) {
  const { t } = useTranslation();
  const format = useFormat();
  // The same ref object on every render: `useDismiss` re-runs its setup
  // whenever this ref changes identity. It sits on the dialog's primary
  // action: "Check in" while it shows, Back once the guest has arrived.
  const primaryActionRef = useRef<HTMLButtonElement>(null);
  const arrivedAt = attendee.checkedInAt ?? null;
  const canCheckInHere = !arrivedAt && canCheckIn;
  const guestCount = attendee.guestCount ?? 0;
  const hasNeeds = hasNeedsToShow(attendee);

  return (
    <Modal
      wide
      eyebrow={t("gatherings:checkin.details.eyebrow")}
      title={attendee.name}
      onClose={onClose}
      initialFocusRef={primaryActionRef}
      footer={
        <>
          <Button
            ref={canCheckInHere ? undefined : primaryActionRef}
            type="button"
            variant="ghost"
            className={styles.action}
            onClick={onClose}
          >
            {t("gatherings:checkin.details.backCta")}
          </Button>
          {canCheckInHere && (
            <Button
              ref={primaryActionRef}
              type="button"
              variant="primary"
              className={styles.action}
              disabled={isPending}
              onClick={() => onCheckIn(attendee.slug)}
            >
              {t("gatherings:checkin.details.checkInCta")}
            </Button>
          )}
        </>
      }
    >
      <div className={styles.layout} data-has-needs={hasNeeds}>
        <CheckinGuestPhoto
          attendee={attendee}
          size={DETAILS_PHOTO_SIZE}
          className={styles.photo}
          alt={t("gatherings:checkin.details.photoAlt", {
            name: attendee.name,
          })}
        />
        <div className={styles.details}>
          {arrivedAt ? (
            <p className={`${styles.status} ${styles.statusArrived}`}>
              <FiCheck aria-hidden />
              {t("gatherings:door.arrivedAt", {
                time: format.time(arrivedAt),
              })}
            </p>
          ) : (
            <p className={styles.status}>
              <FiClock aria-hidden />
              {t("gatherings:checkin.details.stillToArrive")}
            </p>
          )}
          {attendee.pronouns && (
            <p className={styles.pronouns}>{attendee.pronouns}</p>
          )}
          {(attendee.rsvpAt || guestCount > 0) && (
            <ul className={styles.facts}>
              {attendee.rsvpAt && (
                <li className={styles.fact}>
                  <FiCalendar aria-hidden />
                  {t("gatherings:attendee.rsvpdOn", {
                    date: format.date(attendee.rsvpAt, {
                      day: "numeric",
                      month: "short",
                    }),
                  })}
                </li>
              )}
              {guestCount > 0 && (
                <li className={styles.fact}>
                  <FiUsers aria-hidden />
                  {t("gatherings:checkin.row.guests", { count: guestCount })}
                </li>
              )}
            </ul>
          )}
        </div>
        {hasNeeds && (
          <div className={styles.needs}>
            <AttendeeNeeds
              attendee={attendee}
              customQuestion={customRsvpQuestion}
              shouldShowGuestCount={false}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
