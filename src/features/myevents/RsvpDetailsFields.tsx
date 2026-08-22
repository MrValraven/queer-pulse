import { useState } from "react";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { sx } from "./myEvents.styles";

/**
 * "Who's coming" — the plus-one checkbox and the guest-name field it reveals.
 * `isBringingGuest` lives in `RsvpDetailsModal` because the save call sends it
 * as `guestCount`; the name field itself is uncontrolled, exactly as before.
 */
export function RsvpGuestField({
  isBringingGuest,
  onToggleGuest,
}: {
  isBringingGuest: boolean;
  onToggleGuest: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={sx("field")}>
      <label className={sx("field-label")}>
        {t("myevents:rsvpModal.whosComing")}
      </label>
      <button
        type="button"
        className={sx("guest-row")}
        onClick={onToggleGuest}
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
