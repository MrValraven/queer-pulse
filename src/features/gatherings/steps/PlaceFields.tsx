import { useId } from "react";
import { FiLink } from "react-icons/fi";
import { Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Field, FieldRow, TextInput } from "../CreateGatheringFields";
import { GATE_ANCHOR, HOODS } from "../createGathering.data";
import type { GatheringForm } from "../useGatheringForm";
import { VenuePicker } from "../VenuePicker";
import { ONLINE_HOOD_VALUE } from "./dateNotes.data";
import styles from "./WhenWhereChapter.module.css";

/** The join link an online gathering asks for, with the same validation and
 *  hints the wizard has always used. */
function JoinLinkField({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const inputId = `${fieldId}-onlineUrl`;
  return (
    <Field
      label={t("gatherings:create.step2.joinLinkLabel")}
      htmlFor={inputId}
      isOptional
      anchorId={GATE_ANCHOR.joinLink}
      hint={
        form.onlineUrlValid
          ? t("gatherings:create.step2.joinLinkHint")
          : undefined
      }
      error={
        form.onlineUrlValid
          ? undefined
          : t("gatherings:create.step2.joinLinkInvalid")
      }
    >
      <TextInput
        id={inputId}
        icon={FiLink}
        type="url"
        inputMode="url"
        placeholder={t("gatherings:create.step2.joinLinkPlaceholder")}
        aria-invalid={!form.onlineUrlValid}
        aria-describedby={
          form.onlineUrlValid ? `${inputId}-hint` : `${inputId}-error`
        }
        value={form.onlineUrl}
        onChange={(event) => form.setOnlineUrl(event.target.value)}
      />
    </Field>
  );
}

/** The street address and arrival directions a gathering with a door asks
 *  for. Both are shared only with confirmed attendees. */
function AddressFields({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  return (
    <>
      <Field
        label={
          <>
            {t("gatherings:create.v2.when.addressLabel")}
            <span className={styles.labelNote}>
              {t("gatherings:create.v2.when.addressNote")}
            </span>
          </>
        }
        htmlFor={`${fieldId}-address`}
      >
        <TextInput
          id={`${fieldId}-address`}
          type="text"
          autoComplete="off"
          placeholder={t("gatherings:create.step2.addressPlaceholder")}
          value={form.address}
          onChange={(event) => form.setAddress(event.target.value)}
        />
      </Field>
      <Field
        label={t("gatherings:create.v2.when.directionsLabel")}
        htmlFor={`${fieldId}-directions`}
        isOptional
      >
        <TextInput
          id={`${fieldId}-directions`}
          type="text"
          placeholder={t("gatherings:create.step2.directionsPlaceholder")}
          value={form.directions}
          onChange={(event) => form.setDirections(event.target.value)}
        />
      </Field>
    </>
  );
}

/**
 * Neighbourhood, venue, and then either the join link or the address.
 *
 * An online gathering has no door, so it asks a different question: the join
 * link in place of a street address and arrival directions (PRD-182), and no
 * venue. The wizard once asked every host for a street address and collected
 * no link at all, so a host running something on video had nowhere to put it
 * and their attendees saw a locked address row about an address that did not
 * exist.
 */
export function PlaceFields({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const isOnline = form.hood === ONLINE_HOOD_VALUE;
  const hoodId = `${fieldId}-hood`;
  const venueId = `${fieldId}-venue`;

  return (
    <>
      <FieldRow>
        <Field
          label={t("gatherings:create.step2.hoodLabel")}
          htmlFor={hoodId}
          anchorId={GATE_ANCHOR.hood}
        >
          <Select
            id={hoodId}
            placeholder={t("gatherings:create.step2.hoodPlaceholder")}
            options={HOODS.map((hood) => ({
              value: hood.value,
              label: t(hood.labelKey),
            }))}
            value={form.hood || null}
            onChange={(value) => form.setHood(value ?? "")}
          />
        </Field>
        {!isOnline && (
          <Field
            label={t("gatherings:create.step2.venueLabel")}
            htmlFor={venueId}
            labelId={`${venueId}-label`}
          >
            <VenuePicker
              id={venueId}
              labelledBy={`${venueId}-label`}
              value={{
                text: form.venue,
                listingId: form.venueListingId,
                venueListing: form.venueListing,
              }}
              onChange={(selection) => {
                form.setVenue(selection.text);
                form.setVenueListingId(selection.listingId);
                form.setVenueListing(selection.venueListing);
              }}
            />
          </Field>
        )}
      </FieldRow>
      {isOnline ? <JoinLinkField form={form} /> : <AddressFields form={form} />}
    </>
  );
}
