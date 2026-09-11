import { FiCheckCircle, FiClock, FiSlash } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { RsvpStatus } from "./useGatheringRsvp";
import styles from "./GatheringPage.module.css";

/** Why nobody new can join: called off, already over, or past the host's
 *  RSVP cutoff. */
export type RsvpClosedReason = "cancelled" | "ended" | "rsvpClosed";

function closedTitleKey(reason: RsvpClosedReason): string {
  if (reason === "cancelled") return "gatherings:rsvpControl.cancelledTitle";
  if (reason === "ended") return "gatherings:rsvpControl.endedTitle";
  return "gatherings:rsvpControl.rsvpClosedTitle";
}

function closedNoteKey(reason: RsvpClosedReason, wasAttending: boolean) {
  if (reason === "cancelled") {
    return wasAttending
      ? "gatherings:rsvpControl.cancelledAttendingNote"
      : "gatherings:rsvpControl.cancelledNote";
  }
  if (reason === "ended") {
    return wasAttending
      ? "gatherings:rsvpControl.endedAttendingNote"
      : "gatherings:rsvpControl.endedNote";
  }
  return "gatherings:gathering.rsvpClosedBanner";
}

/**
 * The sidebar panel for a gathering nobody new can join: called off, already
 * over (PRD-181, PRD-183), or past the host's RSVP cutoff (Create Gathering
 * v2).
 *
 * The first two used to render the ordinary RSVP control: a live-looking
 * button the server answered with a 400 the member could not read. This says which of
 * them it is, and tells someone who WAS coming that their plan has changed,
 * which is the fact they actually need. Contacting the host stays available:
 * "what happened?" is a reasonable next question in every case.
 */
export function RsvpClosedPanel({
  reason,
  wasAttending,
  rsvpClosedNote,
  messageLabel,
  onMessageHost,
}: {
  reason: RsvpClosedReason;
  /** The viewer held a seat, a waitlist place or a "maybe". */
  wasAttending: boolean;
  /** For `rsvpClosed`: when RSVPs closed, already in words. */
  rsvpClosedNote?: string;
  messageLabel: string;
  onMessageHost: () => void;
}) {
  const { t } = useTranslation();
  const titleKey = closedTitleKey(reason);
  const note =
    reason === "rsvpClosed" && rsvpClosedNote
      ? rsvpClosedNote
      : t(closedNoteKey(reason, wasAttending));

  return (
    <div className={styles.rsvpPanel}>
      <div className={styles.rsvpConfirm}>
        <div className={styles.rsvpConfirmHead}>
          <span className={styles.rsvpClosedIcon} aria-hidden>
            <FiSlash />
          </span>
          <Translation i18nKey={titleKey} components={{ em: <em /> }} />
        </div>
        <p className={styles.rsvpConfirmNote}>{note}</p>
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

/** "RSVPs close in 3 hours", above the RSVP buttons while they still work. */
export function RsvpClosesNote({ text }: { text: string }) {
  return (
    <p className={styles.rsvpCutoffNote}>
      <FiClock aria-hidden />
      <span>{text}</span>
    </p>
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
  canSwitchToGoing,
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
  /** False once the host's RSVP cutoff has passed: the server refuses a
   *  maybe becoming a seat from then on. */
  canSwitchToGoing: boolean;
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
      ? t(
          canSwitchToGoing
            ? "gatherings:rsvpControl.maybeNote"
            : "gatherings:rsvpControl.maybeClosedNote",
        )
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
          {isMaybe && canSwitchToGoing && (
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
