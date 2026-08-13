import { FiCheckCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetail } from "./data";
import { useRsvp, useUnrsvp } from "./api/useEventMutations";
import { useAttendees } from "./api/useAttendees";
import styles from "./GatheringPage.module.css";

/** The contact affordance returned by `useMemberContact` (connect vs. message). */
type ContactAction = (
  member: { slug: string; name: string },
  reason?: string,
) => void;

/**
 * The in-event RSVP control — RSVP is now an action *inside* the gathering,
 * not a standalone page. It reflects the viewer's own `myRsvpStatus` from the
 * event DTO so a reload still shows "you're going".
 *
 * States:
 * - No active RSVP → a primary "I'm going" (or "Join the waitlist" when the
 *   event is full), wired to `useRsvp("going")`.
 * - Going / waitlisted → a plum-panel confirmed state (jade tick, the live
 *   going count or the viewer's waitlist place) with "Cancel RSVP".
 * - "Message the host" stays available as a secondary action in every state.
 *
 * Demo/live: the RSVP mutations no-op in demo (the head-count still bumps
 * optimistically via `useAttendees`), and `myRsvpStatus` is `null` in the demo
 * registry, so demo shows the plain RSVP action without faking persistence.
 */
export function GatheringRsvpControl({
  gathering,
  connected,
  contact,
}: {
  gathering: GatheringDetail;
  connected: boolean;
  contact: ContactAction;
}) {
  const { t } = useTranslation();
  const rsvp = useRsvp(gathering.slug);
  const unrsvp = useUnrsvp(gathering.slug);
  const { data: attendees } = useAttendees(gathering.slug);

  const status = gathering.myRsvpStatus ?? null;
  const isWaitlisted = status === "waitlisted";
  const confirmed = status === "going" || isWaitlisted;
  const goingCount = attendees?.goingCount ?? 0;

  const messageHost = () =>
    contact({ slug: gathering.hostSlug, name: gathering.host });
  const messageLabel = connected
    ? t("connect:contact.message")
    : t(gathering.ctaKey);

  if (confirmed) {
    return (
      <div className={styles.rsvpPanel}>
        <div className={styles.rsvpConfirm}>
          <div className={styles.rsvpConfirmHead}>
            <span className={styles.rsvpConfirmIcon} aria-hidden>
              <FiCheckCircle />
            </span>
            <Translation
              i18nKey={
                isWaitlisted
                  ? "gatherings:rsvpControl.waitlistTitle"
                  : "gatherings:rsvpControl.goingTitle"
              }
              components={{ em: <em /> }}
            />
          </div>
          <p className={styles.rsvpConfirmNote}>
            {isWaitlisted
              ? gathering.waitlistPosition != null
                ? t("gatherings:rsvpControl.waitlistPosition", {
                    position: gathering.waitlistPosition,
                  })
                : t("gatherings:rsvpControl.waitlistNote")
              : t("gatherings:rsvpControl.goingCount", { count: goingCount })}
          </p>
          <div className={styles.rsvpActions}>
            <Button
              variant="ghost-dark"
              className={styles.fullBtn}
              disabled={unrsvp.isPending}
              onClick={() => unrsvp.mutate()}
            >
              {t("gatherings:rsvpControl.cancelCta")}
            </Button>
            <Button
              variant="ghost-dark"
              className={styles.fullBtn}
              onClick={messageHost}
            >
              {messageLabel}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.rsvpPanel}>
      <Button
        className={styles.fullBtn}
        disabled={rsvp.isPending}
        onClick={() => rsvp.mutate("going")}
      >
        {rsvp.isPending
          ? t("gatherings:rsvpControl.pendingCta")
          : t(
              gathering.isFull
                ? "gatherings:rsvpControl.waitlistCta"
                : "gatherings:rsvpControl.goingCta",
            )}
      </Button>
      <Button
        variant="ghost"
        className={styles.fullBtn}
        onClick={messageHost}
      >
        {messageLabel}
      </Button>
    </div>
  );
}
