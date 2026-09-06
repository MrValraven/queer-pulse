import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetail } from "./data";
import { useAttendees } from "./api/useAttendees";
import type { GatheringRsvpState } from "./useGatheringRsvp";
import { GatheringRsvpDetailsModal } from "./GatheringRsvpDetailsModal";
import { RsvpClosedPanel, RsvpConfirmedPanel } from "./GatheringRsvpPanels";
import styles from "./GatheringPage.module.css";

/** The contact affordance returned by `useMemberContact` (connect vs. message). */
type ContactAction = (
  member: { slug: string; name: string },
  reason?: string,
) => void;

/**
 * The in-event RSVP control — RSVP is an action *inside* the gathering, not a
 * standalone page. It reflects the viewer's own `myRsvpStatus` from the event
 * DTO so a reload still shows "you're going".
 *
 * States:
 * - Cancelled or already over → a plain closed panel, no RSVP action at all.
 *   Both are server-enforced (each answers an RSVP with a 400), so a live
 *   button here would be a button that lies (PRD-181, PRD-183).
 * - No active RSVP → the flavored RSVP CTA (`gathering.ctaKey`, e.g. "Reserve
 *   a seat"), or "Join the waitlist" when full, plus "Maybe" — the API and My
 *   Events both supported "maybe" while this surface offered only a seat, so a
 *   member browsing could not mark interest without committing one (PRD-188).
 * - Going / waitlisted / maybe → a plum-panel confirmed state with the live
 *   going count or the viewer's waitlist place, "Your details" (plus-one and
 *   access needs, PRD-187) and "Cancel RSVP".
 * - "Message/Connect with the host" stays available in every state.
 *
 * The RSVP state machine itself lives in `useGatheringRsvp`, shared with the
 * page hero so the two affordances can never disagree.
 */
export function GatheringRsvpControl({
  gathering,
  connected,
  contact,
  rsvp,
}: {
  gathering: GatheringDetail;
  connected: boolean;
  contact: ContactAction;
  /** Shared with the hero's RSVP button — see `GatheringDetailBody`. */
  rsvp: GatheringRsvpState;
}) {
  const { t } = useTranslation();
  const [isDetailsOpen, setDetailsOpen] = useState(false);

  // The host's "Show attendee count" toggle (ENG-140). With it off, the server
  // answers this route with an empty roster and zeroed counts for anyone but
  // an organiser, so asking at all is a wasted request AND its zero would read
  // as "nobody is going". Passing `undefined` disables the query outright and
  // the confirmed panel states the generic line instead.
  const isCountVisible =
    gathering.viewerIsOrganizer === true ||
    gathering.showAttendeeCount !== false;
  const { data: attendees } = useAttendees(
    isCountVisible ? gathering.slug : undefined,
  );
  const goingCount = attendees?.goingCount ?? gathering.goingCount ?? 0;

  const messageHost = () =>
    contact({ slug: gathering.hostSlug, name: gathering.host });
  const messageLabel = connected
    ? t("connect:contact.message")
    : t("gatherings:common.connectCta");

  if (!rsvp.canRsvp) {
    return (
      <RsvpClosedPanel
        isCancelled={rsvp.isCancelled}
        wasAttending={rsvp.isConfirmed || rsvp.isMaybe}
        messageLabel={messageLabel}
        onMessageHost={messageHost}
      />
    );
  }

  if (rsvp.isConfirmed || rsvp.isMaybe) {
    return (
      <>
        <RsvpConfirmedPanel
          status={rsvp.status}
          waitlistPosition={gathering.waitlistPosition ?? null}
          goingCount={goingCount}
          isCountVisible={isCountVisible}
          isPending={rsvp.isPending}
          messageLabel={messageLabel}
          onGoing={rsvp.goOrWaitlist}
          onCancel={rsvp.cancelRsvp}
          onOpenDetails={() => setDetailsOpen(true)}
          onMessageHost={messageHost}
        />
        {isDetailsOpen && (
          <GatheringRsvpDetailsModal
            slug={gathering.slug}
            onClose={() => setDetailsOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className={styles.rsvpPanel}>
      <Button
        className={styles.fullBtn}
        disabled={rsvp.isPending}
        onClick={rsvp.goOrWaitlist}
      >
        {rsvp.isPending
          ? t("gatherings:rsvpControl.pendingCta")
          : gathering.isFull
            ? t("gatherings:rsvpControl.waitlistCta")
            : t(gathering.ctaKey)}
      </Button>
      {/* "Maybe" is not offered on a full gathering: there is no seat to be
          undecided about, and the honest next step there is the waitlist. */}
      {!gathering.isFull && (
        <Button
          variant="ghost"
          className={styles.fullBtn}
          disabled={rsvp.isPending}
          onClick={rsvp.markMaybe}
        >
          {t("gatherings:rsvpControl.maybeCta")}
        </Button>
      )}
      <Button variant="ghost" className={styles.fullBtn} onClick={messageHost}>
        {messageLabel}
      </Button>
    </div>
  );
}
