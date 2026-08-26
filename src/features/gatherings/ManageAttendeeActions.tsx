import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AttendeeRow } from "./api/events.adapters";
import { useRemoveAttendee, usePromoteAttendee } from "./api/useEventMutations";
import styles from "./ManageGatheringPage.module.css";

/**
 * The trailing controls on one going row: take them off the guest list, or bar
 * them from the gathering outright (LOC-08).
 *
 * The two are deliberately separate. Removing somebody is an administrative
 * correction and they can RSVP again; barring is a safety decision that holds
 * on every path back onto the roster, and it deserves its own confirmation.
 */
export function GoingAttendeeActions({
  slug,
  attendee,
  canBar,
  onBar,
}: {
  slug: string;
  attendee: AttendeeRow;
  canBar: boolean;
  onBar: (target: { slug: string; name: string }) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const removeAttendee = useRemoveAttendee(slug);
  return (
    <>
      <Button
        variant="ghost"
        aria-label={t("gatherings:manage.attendees.removeAria", {
          name: attendee.name,
        })}
        className={`${styles.attActionBtn} ${styles.remove}`}
        disabled={removeAttendee.isPending}
        onClick={() =>
          removeAttendee.mutate(attendee.slug, {
            onSuccess: () =>
              showToast(t("gatherings:manage.attendees.removedToast"), "info"),
            onError: () =>
              showToast(
                t("gatherings:manage.attendees.actionErrorToast"),
                "error",
              ),
          })
        }
      >
        {t("gatherings:manage.attendees.removeCta")}
      </Button>
      {canBar && (
        <Button
          variant="ghost"
          aria-label={t("gatherings:manage.bans.barAria", {
            name: attendee.name,
          })}
          className={`${styles.attActionBtn} ${styles.remove}`}
          onClick={() => onBar({ slug: attendee.slug, name: attendee.name })}
        >
          {t("gatherings:manage.bans.barShortCta")}
        </Button>
      )}
    </>
  );
}

/** The trailing control on one waitlist row: pull them up into a free seat. */
export function WaitlistAttendeeActions({
  slug,
  attendee,
}: {
  slug: string;
  attendee: AttendeeRow;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const promoteAttendee = usePromoteAttendee(slug);
  return (
    <Button
      variant="ghost"
      aria-label={t("gatherings:manage.attendees.promoteAria", {
        name: attendee.name,
      })}
      className={`${styles.attActionBtn} ${styles.promote}`}
      disabled={promoteAttendee.isPending}
      onClick={() =>
        promoteAttendee.mutate(attendee.slug, {
          onSuccess: () =>
            showToast(
              t("gatherings:manage.attendees.promotedToast", {
                name: attendee.name.split(" ")[0]!,
              }),
              "success",
            ),
          onError: () =>
            showToast(
              t("gatherings:manage.attendees.actionErrorToast"),
              "error",
            ),
        })
      }
    >
      {t("gatherings:manage.attendees.promoteCta")}
    </Button>
  );
}
