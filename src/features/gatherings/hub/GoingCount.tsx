import { FiUsers } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CalendarEvent } from "../data";
import styles from "./GoingCount.module.css";

/** A card reading "1 going" deters more than it invites. */
const MIN_GOING_TO_SHOW = 3;

export interface GoingCountProps {
  event: CalendarEvent;
  className?: string;
}

/**
 * "{count} going" with a small people icon, shown once a gathering has enough
 * RSVPs to be an invitation. The server already omits the count of a host who
 * chose to hide it, so an absent count renders nothing here.
 */
export function GoingCount({ event, className }: GoingCountProps) {
  const { t } = useTranslation();
  const count = event.attendeeCount;
  if (typeof count !== "number" || count < MIN_GOING_TO_SHOW) return null;
  return (
    <span className={[styles.going, className].filter(Boolean).join(" ")}>
      <FiUsers className={styles.icon} aria-hidden />
      {t("gatherings:spots.going", { count })}
    </span>
  );
}
