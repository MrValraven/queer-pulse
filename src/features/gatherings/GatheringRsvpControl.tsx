import { useEffect, useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import type { GatheringDetail } from "./data";
import { useRsvp, useUnrsvp } from "./api/useEventMutations";
import { useAttendees } from "./api/useAttendees";
import styles from "./GatheringPage.module.css";

/** The contact affordance returned by `useMemberContact` (connect vs. message). */
type ContactAction = (
  member: { slug: string; name: string },
  reason?: string,
) => void;

type RsvpStatus = GatheringDetail["myRsvpStatus"];

/**
 * The in-event RSVP control — RSVP is now an action *inside* the gathering,
 * not a standalone page. It reflects the viewer's own `myRsvpStatus` from the
 * event DTO so a reload still shows "you're going".
 *
 * States:
 * - No active RSVP → a primary flavored RSVP CTA (`gathering.ctaKey`, e.g.
 *   "Reserve a seat") or "Join the waitlist" when the event is full, wired to
 *   `useRsvp("going")`.
 * - Going / waitlisted → a plum-panel confirmed state (jade tick, the live
 *   going count or the viewer's waitlist place) with "Cancel RSVP".
 * - "Message/Connect with the host" stays available as a secondary action in
 *   every state.
 *
 * Demo/live: `useRsvp`/`useUnrsvp` no-op the network call in demo, so the
 * confirmed state is held in local optimistic state here (seeded from
 * `myRsvpStatus`, re-synced when a live refetch resolves new server truth) —
 * the same pattern `GatheringBookmarkButton` uses for its "Save" toggle.
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
  const { showToast } = useToast();
  const rsvp = useRsvp(gathering.slug);
  const unrsvp = useUnrsvp(gathering.slug);
  const { data: attendees } = useAttendees(gathering.slug);

  const [status, setStatus] = useState<RsvpStatus>(
    gathering.myRsvpStatus ?? null,
  );
  useEffect(
    () => setStatus(gathering.myRsvpStatus ?? null),
    [gathering.myRsvpStatus],
  );

  const isWaitlisted = status === "waitlisted";
  const confirmed = status === "going" || isWaitlisted;
  const goingCount = attendees?.goingCount ?? 0;

  const messageHost = () =>
    contact({ slug: gathering.hostSlug, name: gathering.host });
  const messageLabel = connected
    ? t("connect:contact.message")
    : t("gatherings:common.connectCta");

  const handleGoing = () => {
    const next: RsvpStatus = gathering.isFull ? "waitlisted" : "going";
    setStatus(next);
    rsvp.mutate("going", {
      onSuccess: () =>
        showToast(
          t(
            next === "waitlisted"
              ? "gatherings:rsvpControl.waitlistToast"
              : "gatherings:rsvpControl.goingToast",
          ),
          "success",
        ),
      onError: () => setStatus(gathering.myRsvpStatus ?? null),
    });
  };

  const handleCancel = () => {
    setStatus(null);
    unrsvp.mutate(undefined, {
      onSuccess: () =>
        showToast(t("gatherings:rsvpControl.cancelledToast"), "success"),
      onError: () => setStatus(gathering.myRsvpStatus ?? null),
    });
  };

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
              onClick={handleCancel}
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
        onClick={handleGoing}
      >
        {rsvp.isPending
          ? t("gatherings:rsvpControl.pendingCta")
          : gathering.isFull
            ? t("gatherings:rsvpControl.waitlistCta")
            : t(gathering.ctaKey)}
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
