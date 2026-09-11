import { useId, useState } from "react";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  MAX_RSVP_CUSTOM_ANSWER_LENGTH,
  MAX_RSVP_PRONOUNS_LENGTH,
} from "../gatherings/gatheringExtras";
import type {
  AskedRsvpQuestions,
  RsvpDetailsAnswerKey,
  RsvpDetailsAnswers,
} from "../gatherings/rsvpDetailsAnswers";
import { sx } from "./myEvents.styles";

/**
 * The answers "Anything we should know?" asks for this gathering, in the My
 * Events form's own field style. Which fields show follows ruling R8 through
 * `askedRsvpQuestions` (`gatherings/rsvpDetailsAnswers.ts`), the same rule the
 * gathering page's form uses: access needs always, food, pronouns and the
 * host's own question when the gathering asks them.
 */
export function RsvpDetailsQuestionFields({
  asked,
  answers,
  onAnswerChange,
}: {
  asked: AskedRsvpQuestions;
  answers: RsvpDetailsAnswers;
  onAnswerChange: (key: RsvpDetailsAnswerKey, value: string) => void;
}) {
  const { t } = useTranslation();
  const { questions, customQuestion } = asked;
  return (
    <>
      <div className={sx("field")}>
        <label className={sx("field-label")} htmlFor="rsvp-access">
          {t("myevents:rsvpModal.accessNeeds")}
        </label>
        <textarea
          id="rsvp-access"
          value={answers.accessNeeds}
          onChange={(event) =>
            onAnswerChange("accessNeeds", event.target.value)
          }
          placeholder={t("myevents:rsvpModal.accessPlaceholder")}
        />
      </div>
      {questions.dietary && (
        <div className={sx("field")}>
          <label className={sx("field-label")} htmlFor="rsvp-dietary">
            {t("myevents:rsvpModal.dietaryNeeds")}
          </label>
          <textarea
            id="rsvp-dietary"
            value={answers.dietaryNeeds}
            onChange={(event) =>
              onAnswerChange("dietaryNeeds", event.target.value)
            }
            placeholder={t("myevents:rsvpModal.dietaryPlaceholder")}
          />
        </div>
      )}
      {questions.pronouns && (
        <div className={sx("field")}>
          <label className={sx("field-label")} htmlFor="rsvp-pronouns">
            {t("myevents:rsvpModal.pronouns")}
          </label>
          <input
            id="rsvp-pronouns"
            type="text"
            maxLength={MAX_RSVP_PRONOUNS_LENGTH}
            value={answers.pronouns}
            onChange={(event) => onAnswerChange("pronouns", event.target.value)}
            placeholder={t("myevents:rsvpModal.pronounsPlaceholder")}
          />
        </div>
      )}
      {customQuestion && (
        <div className={sx("field")}>
          <label className={sx("field-label")} htmlFor="rsvp-custom">
            {customQuestion}
          </label>
          <div id="rsvp-custom-hint" className={sx("field-hint")}>
            {t("myevents:rsvpModal.customQuestionHint")}
          </div>
          <textarea
            id="rsvp-custom"
            aria-describedby="rsvp-custom-hint"
            maxLength={MAX_RSVP_CUSTOM_ANSWER_LENGTH}
            value={answers.customAnswer}
            onChange={(event) =>
              onAnswerChange("customAnswer", event.target.value)
            }
            placeholder={t("myevents:rsvpModal.customAnswerPlaceholder")}
          />
        </div>
      )}
    </>
  );
}

/**
 * "Who's coming": the plus-one checkbox and the guest-name field it reveals.
 * `isBringingGuest` lives in `RsvpDetailsModal` because the save call sends it
 * as `guestCount`; the name field itself is uncontrolled, exactly as before.
 * After the RSVP cutoff a member with no saved guest sees the checkbox held
 * off, with a hint saying why. Switching a plus-one off stays open.
 */
export function RsvpGuestField({
  isBringingGuest,
  isAddingGuestLocked,
  onToggleGuest,
}: {
  isBringingGuest: boolean;
  /** Past the cutoff for a member with no saved guest: the server refuses
   *  the raise, so the plus-one cannot be switched on. */
  isAddingGuestLocked: boolean;
  onToggleGuest: () => void;
}) {
  const { t } = useTranslation();
  const isToggleDisabled = isAddingGuestLocked && !isBringingGuest;
  const closedHintId = useId();
  return (
    <div className={sx("field")}>
      <label className={sx("field-label")}>
        {t("myevents:rsvpModal.whosComing")}
      </label>
      {isToggleDisabled && (
        <div id={closedHintId} className={sx("field-hint")}>
          {t("myevents:rsvpModal.guestClosedHint")}
        </div>
      )}
      <button
        type="button"
        className={sx("guest-row")}
        // aria-disabled keeps the locked row in the tab order, so its hint is
        // announced; the click guard does the locking.
        onClick={() => {
          if (!isToggleDisabled) onToggleGuest();
        }}
        aria-pressed={isBringingGuest}
        aria-disabled={isToggleDisabled}
        aria-describedby={isToggleDisabled ? closedHintId : undefined}
      >
        <span
          className={sx(`guest-cb${isBringingGuest ? " on" : ""}`)}
          aria-hidden="true"
        >
          <svg viewBox="0 0 14 14" aria-hidden>
            <path d="M2.5 7.5 6 11l5.5-7" />
          </svg>
        </span>
        <span className={sx("guest-txt")}>
          {t("myevents:rsvpModal.bringingGuest")}
          <span>{t("myevents:rsvpModal.guestHint")}</span>
        </span>
      </button>
      <div className={`${sx("collapse")} ${isBringingGuest ? sx("show") : ""}`}>
        <div className={sx("guest-name-field")}>
          <input
            type="text"
            placeholder={t("myevents:rsvpModal.guestNamePlaceholder")}
            aria-label={t("myevents:rsvpModal.guestNamePlaceholder")}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * The sliding-scale contribution picker, shown only for a sliding-scale event.
 * Decorative in both modes and owns its own state accordingly: gatherings have
 * no payment/ticketing concept on the backend at all (see `PricingStep`'s
 * removal from the create wizard), so there is nothing real to persist it
 * against yet and nothing above needs to read it.
 */
export function RsvpContributionField() {
  const { t } = useTranslation();
  const [contribution, setContribution] = useState("10");
  return (
    <div className={sx("field")}>
      <label className={sx("field-label")} htmlFor="rsvp-contribution">
        {t("myevents:rsvpModal.contributionLabel")}
      </label>
      <div className={sx("field-hint")}>
        {t("myevents:rsvpModal.slidingHint")}
      </div>
      <Select
        id="rsvp-contribution"
        value={contribution}
        onChange={(value) => setContribution(value ?? "10")}
        options={[
          { value: "0", label: t("myevents:rsvpModal.contribution.free") },
          {
            value: "5",
            label: t("myevents:rsvpModal.contribution.supported"),
          },
          {
            value: "10",
            label: t("myevents:rsvpModal.contribution.standard"),
          },
          {
            value: "15",
            label: t("myevents:rsvpModal.contribution.payItForward"),
          },
        ]}
      />
    </div>
  );
}
