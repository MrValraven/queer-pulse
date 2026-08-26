import { FiCalendar, FiMessageCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import { TIERS } from "./eventPage.data";
import { EVENT_ICS, downloadIcs } from "./eventRsvp.data";
import styles from "./EventPage.module.css";

/** The waitlist confirmation. It deliberately states no queue position: this
 *  surface never learns one (the real place in line comes from the event
 *  detail's `myWaitlistPosition`, which the in-gathering RSVP control shows),
 *  and inventing a plausible-looking number would be a lie. */
export function WaitlistSuccess({ onLeave }: { onLeave: () => void }) {
  const { t } = useTranslation();

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
          <Translation
            i18nKey="gatherings:event.rsvp.waitlistTitle"
            components={{ em: <em /> }}
          />
        </h3>
        <p className={styles.successText}>
          <Translation
            i18nKey="gatherings:event.rsvp.waitlistBody"
            components={{ strong: <strong /> }}
          />
        </p>
        <div className={styles.successMeta}>
          {t("gatherings:event.rsvp.waitlistMeta")}
        </div>
        <Button variant="ghost-dark" onClick={onLeave}>
          {t("gatherings:event.rsvp.leaveWaitlistCta")}
        </Button>
      </div>
    </div>
  );
}

export function ReservedSuccess({
  selectedTier,
  onCancel,
}: {
  selectedTier: number;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const tier = TIERS[selectedTier]!;

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
        <Translation
          i18nKey="gatherings:event.rsvp.reservedTitle"
          components={{ em: <em /> }}
        />
      </h3>
      <p className={styles.successText}>
        <Translation
          i18nKey="gatherings:event.rsvp.reservedTier"
          values={{ tier: t(tier.nameKey) }}
          components={{ strong: <strong /> }}
        />
        {tier.price > 0 && (
          <>
            {" · "}
            <strong>{fmt.currency(tier.price)}</strong>
          </>
        )}
      </p>
      <p className={styles.successText}>
        <Translation
          i18nKey="gatherings:event.rsvp.confirmationSaved"
          components={{ strong: <strong /> }}
        />
      </p>
      <div className={styles.successActions}>
        <Button variant="ghost-dark" onClick={() => downloadIcs(EVENT_ICS)}>
          <FiCalendar aria-hidden />{" "}
          {t("gatherings:event.rsvp.addToCalendarCta")}
        </Button>
        <Button variant="ghost-dark" to={routes.messages}>
          <FiMessageCircle aria-hidden />{" "}
          {t("gatherings:event.rsvp.messageHostCta")}
        </Button>
      </div>
      <div className={styles.successMeta}>
        {t("gatherings:event.rsvp.cancelPolicy")}
      </div>
      <Button variant="ghost-dark" onClick={onCancel}>
        {t("gatherings:event.rsvp.cancelReservationCta")}
      </Button>
    </div>
  );
}
