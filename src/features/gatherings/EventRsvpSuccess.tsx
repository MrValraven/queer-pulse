import { FiCalendar, FiMessageCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { TIERS } from "./eventPage.data";
import { EVENT_ICS, downloadIcs } from "./eventRsvp.data";
import styles from "./EventPage.module.css";

export function WaitlistSuccess({
  waitlistPos,
  email,
  onLeave,
}: {
  waitlistPos: number;
  email: string;
  onLeave: () => void;
}) {
  return (
    <div className={styles.ticketCard}>
      <div className={styles.successCard}>
        <div className={styles.successIcon}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--jade-soft)"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 6v6l4 2" />
            <circle cx={12} cy={12} r={10} />
          </svg>
        </div>
        <h3 className={styles.successTitle}>
          You're <em>#{waitlistPos}</em> on the waitlist.
        </h3>
        <p className={styles.successText}>
          This gathering is full, but we'll <strong>email {email}</strong> the
          moment a spot opens — usually within a day or two of someone
          cancelling.
        </p>
        <div className={styles.successMeta}>
          You can leave the waitlist at any time.
        </div>
        <Button variant="ghost-dark" onClick={onLeave}>
          Leave the waitlist
        </Button>
      </div>
    </div>
  );
}

export function ReservedSuccess({
  selectedTier,
  email,
  onCancel,
}: {
  selectedTier: number;
  email: string;
  onCancel: () => void;
}) {
  return (
    <div className={styles.successCard}>
      <div className={styles.successIcon}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--jade-soft)"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className={styles.successTitle}>
        You're <em>going.</em>
      </h3>
      <p className={styles.successText}>
        Reserved on the <strong>{TIERS[selectedTier]!.name}</strong> tier
        {TIERS[selectedTier]!.price !== "€0" && (
          <>
            {" · "}
            <strong>{TIERS[selectedTier]!.price}</strong>
          </>
        )}
      </p>
      <p className={styles.successText}>
        A confirmation is on its way to <strong>{email}</strong>.
      </p>
      <div className={styles.successActions}>
        <Button variant="ghost-dark" onClick={() => downloadIcs(EVENT_ICS)}>
          <FiCalendar aria-hidden /> Add to calendar
        </Button>
        <Button variant="ghost-dark" to={routes.messages}>
          <FiMessageCircle aria-hidden /> Message host
        </Button>
      </div>
      <div className={styles.successMeta}>
        You can cancel up to 48 hours before the event.
      </div>
      <Button variant="ghost-dark" onClick={onCancel}>
        Cancel my reservation
      </Button>
    </div>
  );
}
