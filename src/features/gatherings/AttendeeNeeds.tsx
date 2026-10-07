import {
  FiCoffee,
  FiEyeOff,
  FiHeart,
  FiMessageCircle,
  FiUsers,
} from "react-icons/fi";
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
 * to give away. The host always receives every answer (PRD-415). An attendee
 * who answered "Who can see you're going?" with "Only the hosts" is listed to
 * the hosts only. That line comes first and in full ink, because it is the
 * one the host acts on: at the door, in photos and in announcements.
 */
export function AttendeeNeeds({
  attendee,
  customQuestion,
  shouldShowGuestCount = true,
}: {
  attendee: AttendeeRow;
  /** The host's own RSVP question, which labels the attendee's answer to it.
   *  A caller without the gathering at hand leaves it out, and a generic
   *  label stands in. */
  customQuestion?: string | null;
  /** False when the caller already prints the guest count on its own row,
   *  such as the Check-in tab's guest row. */
  shouldShowGuestCount?: boolean;
}) {
  const { t } = useTranslation();
  // `undefined` means the viewer is not an organiser and was never sent these
  // fields at all, which is a different thing from an attendee who answered
  // nothing. Nothing renders in that case.
  if (attendee.guestCount === undefined) return null;

  const guestCount = attendee.guestCount;
  const accessNeeds = attendee.accessNeeds?.trim();
  const dietaryNeeds = attendee.dietaryNeeds?.trim();
  // Pronouns have no row here: both organiser lists already print them in
  // the attendee's meta line (`attendeeMeta`, `CheckinGuestRow`).
  const customAnswer = attendee.customAnswer?.trim();
  const isHiddenFromGuests = attendee.detailsVisibility === "justMe";
  const hasAnswers = Boolean(accessNeeds || dietaryNeeds || customAnswer);
  const isGuestCountShown = shouldShowGuestCount && guestCount > 0;
  if (!isGuestCountShown && !hasAnswers && !isHiddenFromGuests) return null;
  const customAnswerLabel =
    customQuestion?.trim() ||
    t("gatherings:manage.attendees.needs.customAnswerLabel");

  return (
    <div className={styles.needs}>
      <span className={styles.privateLabel}>
        {t("gatherings:manage.attendees.needs.privateLabel")}
      </span>
      <ul className={styles.list}>
        {isHiddenFromGuests && (
          <li className={`${styles.item} ${styles.itemPrivate}`}>
            <FiEyeOff aria-hidden />
            <span>
              {t("gatherings:manage.attendees.needs.hiddenFromGuests")}
            </span>
          </li>
        )}
        {isGuestCountShown && (
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
        {customAnswer && (
          <li className={styles.item}>
            <FiMessageCircle aria-hidden />
            <span>
              <span className={styles.itemLabel}>{customAnswerLabel}</span>{" "}
              {customAnswer}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}
