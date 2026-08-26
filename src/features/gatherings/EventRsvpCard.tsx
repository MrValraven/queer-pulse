import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { EVENT_IS_FULL } from "./eventRsvp.data";
import { WaitlistSuccess, ReservedSuccess } from "./EventRsvpSuccess";
import { EventRsvpForm, type EventRsvpDraft } from "./EventRsvpForm";
import {
  useRsvp,
  useUnrsvp,
  useUpdateRsvpDetails,
} from "./api/useEventMutations";
import styles from "./EventPage.module.css";

/** A landed RSVP: which state the card confirms, and the draft behind it. */
interface ConfirmedRsvp {
  intent: "going" | "waitlisted";
  draft: EventRsvpDraft;
}

/**
 * The ticket card on the static event page: the RSVP form, then whichever
 * confirmed state the RSVP actually resolved to.
 *
 * The confirmed state is driven by the mutation's own `onSuccess` — never
 * flipped optimistically — so a failed RSVP keeps the form and says so rather
 * than showing a success the server never granted.
 */
export function EventRsvpCard({ slug = "welcome-dinner" }: { slug?: string }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const rsvp = useRsvp(slug);
  const unrsvp = useUnrsvp(slug);
  const updateRsvpDetails = useUpdateRsvpDetails(slug);
  const [confirmed, setConfirmed] = useState<ConfirmedRsvp | null>(null);
  const isFull = EVENT_IS_FULL;

  const submitRsvp = (draft: EventRsvpDraft) => {
    // A full gathering waitlists the member: the request body still says
    // "going", but the mutation is told the intent so it doesn't bump the
    // optimistic going head-count (see `RsvpIntent`).
    const intent: ConfirmedRsvp["intent"] = isFull ? "waitlisted" : "going";
    rsvp.mutate(intent, {
      onSuccess: () => {
        setConfirmed({ intent, draft });
        // The one field of this form the RSVP API can carry, sent as a
        // follow-up patch on the RSVP that just landed. Skipped when the
        // member left it blank.
        const dietaryNeeds = draft.dietaryNeeds.trim();
        if (dietaryNeeds) updateRsvpDetails.mutate({ dietaryNeeds });
      },
      onError: () => showToast(t("gatherings:event.rsvp.errorToast"), "info"),
    });
  };

  const cancelRsvp = () => {
    const previous = confirmed;
    setConfirmed(null);
    unrsvp.mutate(undefined, {
      onError: () => {
        setConfirmed(previous);
        showToast(t("gatherings:event.rsvp.errorToast"), "info");
      },
    });
  };

  if (confirmed?.intent === "waitlisted") {
    return <WaitlistSuccess onLeave={cancelRsvp} />;
  }

  return (
    <div className={styles.ticketCard}>
      {confirmed ? (
        <ReservedSuccess
          selectedTier={confirmed.draft.selectedTier}
          onCancel={cancelRsvp}
        />
      ) : (
        <EventRsvpForm
          isFull={isFull}
          isSubmitting={rsvp.isPending}
          onSubmit={submitRsvp}
        />
      )}
    </div>
  );
}
