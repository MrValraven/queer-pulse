import { FiAlertTriangle, FiClock, FiLink, FiMapPin } from "react-icons/fi";
import { safeHref } from "../../../shared/lib/safeHref";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import { gigCountdown } from "./gigDate";
import styles from "./GigRowMeta.module.css";

/**
 * The secondary lines of a gig row: city and venue, then doors, the ticket
 * indicator and the relative countdown. Each piece appears only when the gig
 * has it. A ticket link that is present but cannot be used (no http, https or
 * mailto scheme) shows an amber warning that names the fix.
 */
export function GigRowMeta({ item }: { item: SubprofileItemView }) {
  const { t, language } = useTranslation();
  const hasTicketLink = Boolean(item.ticketUrl?.trim());
  const isTicketValid = safeHref(item.ticketUrl) !== null;
  const countdown = gigCountdown(item.date ?? "", language);
  const hasPlaceLine = Boolean(item.subtitle || item.venue);
  const placeTitle = [item.subtitle, item.venue].filter(Boolean).join(", ");
  const hasDetailLine = Boolean(item.doors || hasTicketLink || countdown);

  return (
    <>
      {hasPlaceLine && (
        <p className={styles.line} title={placeTitle}>
          {item.subtitle && (
            <span className={styles.text}>{item.subtitle}</span>
          )}
          {item.venue && (
            <span className={`${styles.item} ${styles.venue}`}>
              <FiMapPin className={styles.icon} aria-hidden />
              <span className={styles.venueText}>{item.venue}</span>
            </span>
          )}
        </p>
      )}
      {hasDetailLine && (
        <p className={styles.line}>
          {item.doors && (
            <span className={styles.item}>
              <FiClock className={styles.icon} aria-hidden />
              <span className={styles.text}>
                {t("subprofiles:gigEditor.row.doors", { time: item.doors })}
              </span>
            </span>
          )}
          {hasTicketLink && isTicketValid && (
            <span className={styles.item}>
              <FiLink className={styles.icon} aria-hidden />
              <span className={styles.text}>
                {t("subprofiles:gigEditor.row.tickets")}
              </span>
            </span>
          )}
          {hasTicketLink && !isTicketValid && (
            <span className={`${styles.item} ${styles.warning}`}>
              <FiAlertTriangle className={styles.icon} aria-hidden />
              <span className={styles.text}>
                {t("subprofiles:gigEditor.row.ticketInvalid")}
              </span>
            </span>
          )}
          {countdown && <span className={styles.countdown}>{countdown}</span>}
        </p>
      )}
    </>
  );
}
