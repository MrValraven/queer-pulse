import { FiCheckCircle, FiSlash } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { RsvpStatus } from "./useGatheringRsvp";
import styles from "./GatheringPage.module.css";

/**
 * The sidebar panel for a gathering nobody can still join: called off, or
 * already over (PRD-181, PRD-183).
 *
 * Both used to render the ordinary RSVP control — a live-looking button that
 * the server answered with a 400 the member could not read. This says which of
 * the two it is, and tells someone who WAS coming that their plan has changed,
 * which is the fact they actually need. Contacting the host stays available:
 * "what happened?" is a reasonable next question in both cases.
 */
export function RsvpClosedPanel({
  isCancelled,
  wasAttending,
  messageLabel,
  onMessageHost,
}: {
  isCancelled: boolean;
  /** The viewer held a seat, a waitlist place or a "maybe". */
  wasAttending: boolean;
  messageLabel: string;
  onMessageHost: () => void;
}) {
  const { t } = useTranslation();
  const titleKey = isCancelled
    ? "gatherings:rsvpControl.cancelledTitle"
    : "gatherings:rsvpControl.endedTitle";
  const noteKey = isCancelled
    ? wasAttending
      ? "gatherings:rsvpControl.cancelledAttendingNote"
      : "gatherings:rsvpControl.cancelledNote"
    : wasAttending
      ? "gatherings:rsvpControl.endedAttendingNote"
      : "gatherings:rsvpControl.endedNote";

  return (
    <div className={styles.rsvpPanel}>
      <div className={styles.rsvpConfirm}>
        <div className={styles.rsvpConfirmHead}>
          <span className={styles.rsvpClosedIcon} aria-hidden>
            <FiSlash />
          </span>
          <Translation i18nKey={titleKey} components={{ em: <em /> }} />
        </div>
        <p className={styles.rsvpConfirmNote}>{t(noteKey)}</p>
        <div className={styles.rsvpActions}>
          <Button
            variant="ghost-dark"
            className={styles.fullBtn}
            onClick={onMessageHost}
          >
            {messageLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * The "you're in" panel: going, on the waitlist, or a maybe.
 *
 * `isCountVisible` is the host's "Show attendee count" toggle (ENG-140). With
 * it off, the server withholds the roster AND the counts from anyone but an
 * organiser, so this states the generic line rather than a zero that would
 * read as "nobody is coming".
 */
export function RsvpConfirmedPanel({
  status,
  waitlistPosition,
  goingCount,
  isCountVisible,
  isPending,
  messageLabel,
  onGoing,
  onCancel,
  onOpenDetails,
  onMessageHost,
}: {
  status: RsvpStatus;
  waitlistPosition: number | null;
  goingCount: number;
  isCountVisible: boolean;
  isPending: boolean;
  messageLabel: string;
  /** Upgrade a "maybe" to a real seat. */
  onGoing: () => void;
  onCancel: () => void;
  onOpenDetails: () => void;
  onMessageHost: () => void;
}) {
  const { t } = useTranslation();
  const isWaitlisted = status === "waitlisted";
  const isMaybe = status === "maybe";

  const titleKey = isWaitlisted
    ? "gatherings:rsvpControl.waitlistTitle"
    : isMaybe
      ? "gatherings:rsvpControl.maybeTitle"
      : "gatherings:rsvpControl.goingTitle";

  const note = isWaitlisted
    ? waitlistPosition != null
      ? t("gatherings:rsvpControl.waitlistPosition", {
          position: waitlistPosition,
        })
      : t("gatherings:rsvpControl.waitlistNote")
    : isMaybe
      ? t("gatherings:rsvpControl.maybeNote")
      : isCountVisible
        ? t("gatherings:rsvpControl.goingCount", { count: goingCount })
        : t("gatherings:rsvpControl.goingCountHidden");

  return (
    <div className={styles.rsvpPanel}>
      <div className={styles.rsvpConfirm}>
        <div className={styles.rsvpConfirmHead}>
          <span className={styles.rsvpConfirmIcon} aria-hidden>
            <FiCheckCircle />
          </span>
          <Translation i18nKey={titleKey} components={{ em: <em /> }} />
        </div>
        <p className={styles.rsvpConfirmNote}>{note}</p>
        <div className={styles.rsvpActions}>
          {isMaybe && (
            <Button
              variant="ghost-dark"
              className={styles.fullBtn}
              disabled={isPending}
              onClick={onGoing}
            >
              {t("gatherings:rsvpControl.switchToGoingCta")}
            </Button>
          )}
          {/* Plus-one count and access needs, asked here rather than only from
              a My Events card on another page (PRD-187). A "maybe" is not a
              seat yet, so it is not asked to declare guests. */}
          {!isMaybe && (
            <Button
              variant="ghost-dark"
              className={styles.fullBtn}
              onClick={onOpenDetails}
            >
              {t("gatherings:rsvpControl.yourDetailsCta")}
            </Button>
          )}
          <Button
            variant="ghost-dark"
            className={styles.fullBtn}
            disabled={isPending}
            onClick={onCancel}
          >
            {t("gatherings:rsvpControl.cancelCta")}
          </Button>
          <Button
            variant="ghost-dark"
            className={styles.fullBtn}
            onClick={onMessageHost}
          >
            {messageLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
