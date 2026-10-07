import { useId } from "react";
import {
  ChipSelect,
  FormField,
  Select,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import {
  ONLINE_PAYMENT_METHODS,
  ONLINE_SESSION_FORMATS,
  PAYMENT_LABEL_KEYS,
  PROFESSIONAL_REGISTRATION_BODIES,
  REGISTRATION_BODY_LABEL_KEYS,
  REGISTRATION_NUMBER_MAX,
  SESSION_FORMAT_LABEL_KEYS,
  shouldAskRegistration,
  shouldAskSessionFormats,
  type ListingOnlineDetailsDraft,
  type OnlinePaymentMethod,
  type OnlineSessionFormat,
  type ProfessionalRegistrationBody,
} from "../listingOnline.data";
import type { ListingForm } from "../useListingForm";
import styles from "../ListBusinessPage.module.css";
import sellingStyles from "./OnlineSelling.module.css";

const KEY = "marketing:listBusiness.online";

/**
 * Ways to pay, then the two answers only some categories ask: session formats
 * (Health & therapy, Classes & courses, Creative services) and professional
 * registration (Health & therapy). Session formats stay hidden for an
 * `intimacy`-only listing because `shouldAskSessionFormats` never counts that
 * category; a second category that asks shows them. Fragment, so each field
 * stays a direct child of the caller's column.
 */
export function OnlinePaymentFields({
  form,
  details,
  variant,
}: {
  form: ListingForm;
  details: ListingOnlineDetailsDraft;
  variant: "online" | "place";
}) {
  const { t } = useTranslation();
  const isAskingSessions = shouldAskSessionFormats(form.draft.cats);
  const isAskingRegistration = shouldAskRegistration(form.draft.cats);
  // A place already meets people in person, so "In person in Lisbon" is
  // left off its online section. A format picked before stays visible so it
  // can still be unpicked.
  const sessionFormats = ONLINE_SESSION_FORMATS.filter(
    (format) =>
      variant === "online" ||
      format !== "inPerson" ||
      details.sessionFormats.includes(format),
  );

  return (
    <>
      <FormField
        className={styles.lbField}
        id={ANCHOR.payments}
        label={t(`${KEY}.payments.label`)}
      >
        <ChipSelect
          label={t(`${KEY}.payments.label`)}
          options={ONLINE_PAYMENT_METHODS.map((method) => ({
            value: method,
            label: t(PAYMENT_LABEL_KEYS[method]),
          }))}
          selected={new Set(details.payments)}
          onToggle={(value) => form.togglePayment(value as OnlinePaymentMethod)}
        />
      </FormField>
      {isAskingSessions && (
        <FormField
          className={styles.lbField}
          id={ANCHOR.sessionFormats}
          label={t(`${KEY}.sessions.label`)}
          helper={t(`${KEY}.sessions.helper`)}
        >
          <ChipSelect
            label={t(`${KEY}.sessions.label`)}
            options={sessionFormats.map((format) => ({
              value: format,
              label: t(SESSION_FORMAT_LABEL_KEYS[format]),
            }))}
            selected={new Set(details.sessionFormats)}
            onToggle={(value) =>
              form.toggleSessionFormat(value as OnlineSessionFormat)
            }
          />
        </FormField>
      )}
      {isAskingRegistration && (
        <OnlineRegistrationField form={form} details={details} />
      )}
    </>
  );
}

/**
 * Professional registration: the body, then the number. Two controls, so the
 * outer field leaves them unwired and each gets its own visible label from an
 * inner field, and names the shared helper in its description so it is
 * announced with either.
 */
function OnlineRegistrationField({
  form,
  details,
}: {
  form: ListingForm;
  details: ListingOnlineDetailsDraft;
}) {
  const { t } = useTranslation();
  const helperId = useId();
  const { registration } = details;
  return (
    <FormField
      className={styles.lbField}
      id={ANCHOR.registration}
      label={t(`${KEY}.registration.label`)}
      helper={t(`${KEY}.registration.helper`)}
      helperId={helperId}
    >
      <>
        <div className={styles.twoCol}>
          <FormField
            className={`${styles.lbField} ${sellingStyles.subField}`}
            label={t(`${KEY}.registration.bodyLabel`)}
          >
            <Select
              label={t(`${KEY}.registration.bodyLabel`)}
              aria-describedby={helperId}
              options={[
                {
                  value: "none",
                  label: t(`${KEY}.registration.body.none`),
                },
                ...PROFESSIONAL_REGISTRATION_BODIES.map((body) => ({
                  value: body,
                  label: t(REGISTRATION_BODY_LABEL_KEYS[body]),
                })),
              ]}
              value={registration.body || "none"}
              onChange={(value) =>
                form.setOnlineDetail({
                  registration:
                    value && value !== "none"
                      ? {
                          body: value as ProfessionalRegistrationBody,
                          number: registration.number,
                        }
                      : { body: "", number: "" },
                })
              }
            />
          </FormField>
          <FormField
            className={`${styles.lbField} ${sellingStyles.subField}`}
            label={t(`${KEY}.registration.numberLabel`)}
          >
            <input
              type="text"
              aria-describedby={helperId}
              maxLength={REGISTRATION_NUMBER_MAX}
              disabled={registration.body === ""}
              value={registration.number}
              onChange={(event) =>
                form.setOnlineDetail({
                  registration: { ...registration, number: event.target.value },
                })
              }
            />
          </FormField>
        </div>
      </>
    </FormField>
  );
}
