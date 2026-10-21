import { useState } from "react";
import { Button, Modal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRsvpDetailsQuestions } from "../gatherings/api/useRsvpDetails";
import {
  answersFromSaved,
  askedAnswersPayload,
  askedRsvpQuestions,
  type RsvpDetailsAnswerKey,
  type RsvpDetailsAnswers,
} from "../gatherings/rsvpDetailsAnswers";
import { RsvpVisibilityField } from "../gatherings/RsvpVisibilityField";
import type {
  AcceptInviteDetailsDto,
  RsvpDetailsVisibility,
} from "../gatherings/api/events.api";
import {
  acceptInviteErrorMessage,
  isInviteNoLongerOpenError,
} from "./myEvents.rsvpErrors";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { RsvpDetailsQuestionFields } from "./RsvpDetailsFields";

/** The setting the server applies to an RSVP that never chose, the same
 *  default both RSVP details modals open on. */
const VISIBILITY_DEFAULT: RsvpDetailsVisibility = "everyone";

/** The accept's details. The shared answer payload types each answer as
 *  nullable, and the accept leaves an unasked one out, so a null goes out as
 *  absent. */
function acceptDetailsFrom(
  visibility: RsvpDetailsVisibility,
  payload: ReturnType<typeof askedAnswersPayload>,
): AcceptInviteDetailsDto {
  return {
    visibility,
    accessNeeds: payload.accessNeeds ?? undefined,
    dietaryNeeds: payload.dietaryNeeds ?? undefined,
    pronouns: payload.pronouns ?? undefined,
    customAnswer: payload.customAnswer ?? undefined,
  };
}

/**
 * Accepting an invite opens this first, so the invitee picks who sees they're
 * going and answers the event's questions before the accept is sent. The
 * answers ride on the accept itself, so the RSVP the server writes holds them
 * from the start. It opens empty: a pending invitee has no RSVP to load yet.
 * The event's questions come from its detail fetch, which a pending invitee
 * may read. Mounted only while open, keyed on the invite id.
 */
export function AcceptInviteDetailsModal() {
  const { t } = useTranslation();
  const { acceptDetails, closeAcceptDetails, acceptInvite, byId, toast } =
    useMyEvents();
  const inviteId = acceptDetails.inviteId;
  const ev = inviteId ? byId(inviteId) : undefined;
  const { data: eventQuestions } = useRsvpDetailsQuestions(ev?.slug);
  const asked = askedRsvpQuestions(
    eventQuestions?.rsvpQuestions,
    eventQuestions?.customRsvpQuestion,
  );

  const [visibility, setVisibility] =
    useState<RsvpDetailsVisibility>(VISIBILITY_DEFAULT);
  const [answers, setAnswers] = useState<RsvpDetailsAnswers>(() =>
    answersFromSaved(null),
  );
  const [isAccepting, setIsAccepting] = useState(false);

  const updateAnswer = (key: RsvpDetailsAnswerKey, value: string) =>
    setAnswers((current) => ({ ...current, [key]: value }));

  const accept = () => {
    if (!inviteId || isAccepting) return;
    setIsAccepting(true);
    acceptInvite(
      inviteId,
      acceptDetailsFrom(visibility, askedAnswersPayload(answers, asked)),
      {
        onSuccess: () => {
          setIsAccepting(false);
          closeAcceptDetails();
        },
        onError: (error) => {
          setIsAccepting(false);
          toast(acceptInviteErrorMessage(error, t), "info");
          // An invite answered or withdrawn elsewhere cannot be retried, so
          // the modal closes and the My Events refetch takes the card away.
          if (isInviteNoLongerOpenError(error)) closeAcceptDetails();
        },
      },
    );
  };

  return (
    <Modal
      onClose={closeAcceptDetails}
      eyebrow={t("myevents:acceptModal.eyebrow")}
      title={
        <Translation
          i18nKey="myevents:acceptModal.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("myevents:acceptModal.sub")}
      footer={
        <>
          <Button variant="ghost" onClick={closeAcceptDetails}>
            {t("myevents:acceptModal.cancelCta")}
          </Button>
          <Button variant="jade" onClick={accept} disabled={isAccepting || !ev}>
            {t("myevents:acceptModal.acceptCta")}
          </Button>
        </>
      }
    >
      {ev && <h4 className={sx("accept-evname")}>{ev.title}</h4>}
      <RsvpDetailsQuestionFields
        asked={asked}
        answers={answers}
        onAnswerChange={updateAnswer}
      />
      <RsvpVisibilityField
        value={visibility}
        onChange={setVisibility}
        note={t("myevents:rsvpModal.privacyNote")}
        labelClassName={sx("field-label")}
      />
    </Modal>
  );
}
