import { FiCoffee, FiEyeOff, FiHeart, FiUsers } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AttendeeRow } from "./api/events.adapters";
import styles from "./AttendeeNeeds.module.css";

/**
 * What one attendee typed into "Anything we should know?" (LOC-07), shown to
 * the host and co-hosts only.
 *
 * Somebody who writes "I use a wheelchair, I need step-free entry" and chooses
 * "everyone can see this" used to reach nobody at all: the answers were stored
 * and read by no code path, and the organiser's list carried a name, an avatar
 * and a status. They were writing to the host, so the host now reads them.
 *
 * PRIVACY IS STATED, not implied. The block is marked as private to the
 * organisers on every row that carries one, because a host glancing at a list
 * on a shared screen at a door needs to know which lines are somebody else's
 * to give away. An attendee who chose "just me" has their free text withheld
 * server-side, and that choice is named here rather than rendered as silence.
 */
export function AttendeeNeeds({ attendee }: { attendee: AttendeeRow }) {
  const { t } = useTranslation();
  // `undefined` means the viewer is not an organiser and was never sent these
  // fields at all, which is a different thing from an attendee who answered
  // nothing. Nothing renders in that case.
  if (attendee.guestCount === undefined) return null;

  const guestCount = attendee.guestCount;
  const accessNeeds = attendee.accessNeeds?.trim();
  const dietaryNeeds = attendee.dietaryNeeds?.trim();
  const isWithheld = attendee.detailsVisibility === "justMe";
  if (!guestCount && !accessNeeds && !dietaryNeeds && !isWithheld) return null;

  return (
    <div className={styles.needs}>
      <span className={styles.privateLabel}>
        {t("gatherings:manage.attendees.needs.privateLabel")}
      </span>
      <ul className={styles.list}>
        {guestCount > 0 && (
          <li className={styles.item}>
            <FiUsers aria-hidden />
            <span>
              {t("gatherings:manage.attendees.needs.guests", {
                count: guestCount,
              })}
            </span>
          </li>
        )}
        {accessNeeds && (
          <li className={styles.item}>
            <FiHeart aria-hidden />
            <span>
              <span className={styles.itemLabel}>
                {t("gatherings:manage.attendees.needs.accessLabel")}
              </span>{" "}
              {accessNeeds}
            </span>
          </li>
        )}
        {dietaryNeeds && (
          <li className={styles.item}>
            <FiCoffee aria-hidden />
            <span>
              <span className={styles.itemLabel}>
                {t("gatherings:manage.attendees.needs.dietaryLabel")}
              </span>{" "}
              {dietaryNeeds}
            </span>
          </li>
        )}
        {isWithheld && !accessNeeds && !dietaryNeeds && (
          <li className={`${styles.item} ${styles.itemMuted}`}>
            <FiEyeOff aria-hidden />
            <span>{t("gatherings:manage.attendees.needs.withheld")}</span>
          </li>
        )}
      </ul>
    </div>
  );
}
