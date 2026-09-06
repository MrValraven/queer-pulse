import { ChipSelect, FilterChips, FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Region } from "./api/partners.api";
import type { PartnerProfileDraft } from "./partnerProfileDraft";
import {
  MAX_TAGS,
  REGION_OPTIONS,
  TAG_OPTIONS,
} from "./submitPartnerApplication.data";
import styles from "./PartnerProfileEditPage.module.css";

/** Narrow setter shared by the three field groups: one field, one value. */
export type SetPartnerProfileField = <Field extends keyof PartnerProfileDraft>(
  field: Field,
  value: PartnerProfileDraft[Field],
) => void;

interface FieldGroupProps {
  draft: PartnerProfileDraft;
  onChange: SetPartnerProfileField;
}

/**
 * Who and where the organisation is. Labels are the application form's own
 * (`submitPartner.fields.*`): these are the same fields, asked again, and
 * asking them in two different sets of words would read as two different
 * questions.
 */
export function PartnerProfileOrgFields({ draft, onChange }: FieldGroupProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.sectionHead}>
        {t("marketing:submitPartner.fields.sectionOrg")}
      </div>

      <div className={styles.row}>
        <FormField label={t("marketing:submitPartner.fields.city.label")}>
          <input
            type="text"
            value={draft.city}
            onChange={(event) => onChange("city", event.target.value)}
            placeholder={t("marketing:submitPartner.fields.city.placeholder")}
          />
        </FormField>

        <FormField
          label={t("marketing:partnerProfileEdit.fields.regionLabel.label")}
          helper={t("marketing:partnerProfileEdit.fields.regionLabel.helper")}
        >
          <input
            type="text"
            value={draft.regionLabel}
            onChange={(event) => onChange("regionLabel", event.target.value)}
          />
        </FormField>
      </div>

      <FormField label={t("marketing:submitPartner.fields.region.label")}>
        <FilterChips
          options={REGION_OPTIONS.map((option) => ({
            value: option.value,
            label: t(option.labelKey),
          }))}
          value={draft.region}
          onChange={(value) => onChange("region", value as Region)}
          label={t("marketing:submitPartner.fields.region.label")}
        />
      </FormField>

      <FormField
        label={t("marketing:submitPartner.fields.logo.label")}
        helper={t("marketing:submitPartner.fields.logo.derivedHelper")}
      >
        <input
          type="text"
          value={draft.logo}
          onChange={(event) => onChange("logo", event.target.value)}
          placeholder={t("marketing:submitPartner.fields.logo.placeholder")}
          maxLength={5}
        />
      </FormField>
    </>
  );
}

/** What the organisation does, in its own words. */
export function PartnerProfilePitchFields({
  draft,
  onChange,
}: FieldGroupProps) {
  const { t } = useTranslation();

  const toggleTag = (value: string) => {
    const next = new Set(draft.tags);
    if (next.has(value)) next.delete(value);
    else if (next.size < MAX_TAGS) next.add(value);
    onChange("tags", next);
  };

  return (
    <>
      <div className={styles.sectionHead}>
        {t("marketing:submitPartner.fields.sectionPitch")}
      </div>

      <FormField
        label={t("marketing:submitPartner.fields.tagline.label")}
        helper={t("marketing:submitPartner.fields.tagline.helper")}
      >
        <textarea
          rows={2}
          value={draft.tagline}
          onChange={(event) => onChange("tagline", event.target.value)}
        />
      </FormField>

      <FormField
        label={t("marketing:submitPartner.fields.desc.label")}
        helper={t("marketing:submitPartner.fields.desc.helper")}
      >
        <textarea
          rows={3}
          value={draft.desc}
          onChange={(event) => onChange("desc", event.target.value)}
        />
      </FormField>

      <FormField
        label={t("marketing:partnerProfileEdit.fields.about.label")}
        helper={t("marketing:partnerProfileEdit.fields.about.helper")}
      >
        <textarea
          rows={7}
          value={draft.about}
          onChange={(event) => onChange("about", event.target.value)}
        />
      </FormField>

      <FormField
        label={t("marketing:partnerProfileEdit.fields.funding.label")}
        helper={t("marketing:partnerProfileEdit.fields.funding.helper")}
      >
        <textarea
          rows={2}
          value={draft.funding}
          onChange={(event) => onChange("funding", event.target.value)}
        />
      </FormField>

      <FormField
        label={t("marketing:submitPartner.fields.tags.label")}
        helper={t("marketing:submitPartner.fields.tags.pickerHelper")}
        labelAside={t("marketing:submitPartner.fields.tags.count", {
          count: draft.tags.size,
          max: MAX_TAGS,
        })}
      >
        <ChipSelect
          options={TAG_OPTIONS}
          selected={draft.tags}
          onToggle={toggleTag}
          label={t("marketing:submitPartner.fields.tags.label")}
        />
      </FormField>
    </>
  );
}

/**
 * The block PRD-263 is really about: a partner whose phone number or address
 * changed had no way at all to correct it on a page a person in crisis may be
 * reading.
 */
export function PartnerProfileContactFields({
  draft,
  onChange,
}: FieldGroupProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.sectionHead}>
        {t("marketing:submitPartner.fields.sectionContact")}
      </div>

      <div className={styles.row}>
        <FormField label={t("marketing:partnerProfileEdit.fields.phone.label")}>
          <input
            type="tel"
            autoComplete="tel"
            value={draft.phone}
            onChange={(event) => onChange("phone", event.target.value)}
          />
        </FormField>

        <FormField
          label={t("marketing:partnerProfileEdit.fields.phoneNote.label")}
          helper={t("marketing:partnerProfileEdit.fields.phoneNote.helper")}
        >
          <input
            type="text"
            value={draft.phoneNote}
            onChange={(event) => onChange("phoneNote", event.target.value)}
          />
        </FormField>
      </div>

      <div className={styles.row}>
        <FormField label={t("marketing:submitPartner.fields.email.label")}>
          <input
            type="email"
            autoComplete="email"
            value={draft.email}
            onChange={(event) => onChange("email", event.target.value)}
            placeholder={t("marketing:submitPartner.fields.email.placeholder")}
          />
        </FormField>

        <FormField label={t("marketing:submitPartner.fields.website.label")}>
          <input
            type="text"
            value={draft.website}
            onChange={(event) => onChange("website", event.target.value)}
            placeholder={t(
              "marketing:submitPartner.fields.website.placeholder",
            )}
          />
        </FormField>
      </div>

      <FormField label={t("marketing:listBusiness.step3.addressLabel")}>
        <input
          type="text"
          autoComplete="street-address"
          value={draft.address}
          onChange={(event) => onChange("address", event.target.value)}
        />
      </FormField>
    </>
  );
}
