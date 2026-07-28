import { FormField, FilterChips, ChipSelect } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Region } from "./api/partners.api";
import type { SubmitPartnerForm } from "./useSubmitPartnerForm";
import {
  MAX_TAGS,
  REGION_OPTIONS,
  TAG_OPTIONS,
} from "./submitPartnerApplication.data";
import styles from "./SubmitPartnerApplicationPage.module.css";

/** All the fields of the "Apply to partner" application form. */
export function SubmitPartnerFields({ form }: { form: SubmitPartnerForm }) {
  const { t } = useTranslation();
  const { state, set, setName, setLogo, setRegion, toggleTag, errorFor } = form;

  const regionOptions = REGION_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }));

  return (
    <>
      <div className={styles.sectionHead}>
        {t("marketing:submitPartner.fields.sectionOrg")}
      </div>

      <FormField
        label={t("marketing:submitPartner.fields.name.label")}
        required
        error={errorFor("name")}
      >
        <input
          type="text"
          value={state.name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("marketing:submitPartner.fields.name.placeholder")}
        />
      </FormField>

      <FormField
        label={t("marketing:submitPartner.fields.orgType.label")}
        required
        error={errorFor("orgType")}
        helper={t("marketing:submitPartner.fields.orgType.helper")}
      >
        <input
          type="text"
          value={state.orgType}
          onChange={(event) => set("orgType", event.target.value)}
          placeholder={t("marketing:submitPartner.fields.orgType.placeholder")}
        />
      </FormField>

      <div className={styles.row}>
        <FormField
          label={t("marketing:submitPartner.fields.city.label")}
          required
          error={errorFor("city")}
        >
          <input
            type="text"
            value={state.city}
            onChange={(event) => set("city", event.target.value)}
            placeholder={t("marketing:submitPartner.fields.city.placeholder")}
          />
        </FormField>

        <FormField label={t("marketing:submitPartner.fields.region.label")}>
          <FilterChips
            options={regionOptions}
            value={state.region}
            onChange={(value) => setRegion(value as Region)}
            label={t("marketing:submitPartner.fields.region.label")}
          />
        </FormField>
      </div>

      <FormField
        className={styles.logoField}
        label={t("marketing:submitPartner.fields.logo.label")}
        helper={t("marketing:submitPartner.fields.logo.derivedHelper")}
      >
        <input
          type="text"
          value={state.logo}
          onChange={(event) => setLogo(event.target.value)}
          placeholder={t("marketing:submitPartner.fields.logo.placeholder")}
          maxLength={5}
        />
      </FormField>

      <div className={styles.sectionHead}>
        {t("marketing:submitPartner.fields.sectionPitch")}
      </div>

      <FormField
        label={t("marketing:submitPartner.fields.tagline.label")}
        required
        error={errorFor("tagline")}
        helper={t("marketing:submitPartner.fields.tagline.helper")}
      >
        <textarea
          rows={2}
          value={state.tagline}
          onChange={(event) => set("tagline", event.target.value)}
          placeholder={t("marketing:submitPartner.fields.tagline.placeholder")}
        />
      </FormField>

      <FormField
        label={t("marketing:submitPartner.fields.desc.label")}
        required
        error={errorFor("description")}
        helper={t("marketing:submitPartner.fields.desc.helper")}
      >
        <textarea
          rows={3}
          value={state.description}
          onChange={(event) => set("description", event.target.value)}
          placeholder={t("marketing:submitPartner.fields.desc.placeholder")}
        />
      </FormField>

      <FormField
        label={t("marketing:submitPartner.fields.tags.label")}
        helper={t("marketing:submitPartner.fields.tags.pickerHelper")}
        labelAside={t("marketing:submitPartner.fields.tags.count", {
          count: form.tagCount,
          max: MAX_TAGS,
        })}
      >
        <ChipSelect
          options={TAG_OPTIONS}
          selected={state.tags}
          onToggle={toggleTag}
          label={t("marketing:submitPartner.fields.tags.label")}
        />
      </FormField>

      <div className={styles.sectionHead}>
        {t("marketing:submitPartner.fields.sectionContact")}
      </div>

      <div className={styles.row}>
        <FormField label={t("marketing:submitPartner.fields.website.label")}>
          <input
            type="text"
            value={state.website}
            onChange={(event) => set("website", event.target.value)}
            placeholder={t("marketing:submitPartner.fields.website.placeholder")}
          />
        </FormField>

        <FormField label={t("marketing:submitPartner.fields.email.label")}>
          <input
            type="email"
            value={state.email}
            onChange={(event) => set("email", event.target.value)}
            placeholder={t("marketing:submitPartner.fields.email.placeholder")}
          />
        </FormField>
      </div>

      {/* Honeypot — visually hidden; bots fill it, people don't. */}
      <input
        type="text"
        className={styles.honeypot}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={state.handle}
        onChange={(event) => set("handle", event.target.value)}
      />
    </>
  );
}
