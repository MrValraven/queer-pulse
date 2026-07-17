import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Region } from "./api/partners.api";
import type { SubmitPartnerForm } from "./useSubmitPartnerForm";
import { REGION_OPTIONS } from "./submitPartnerApplication.data";
import styles from "./SubmitPartnerApplicationPage.module.css";

/** All the fields of the "Apply to partner" application form. */
export function SubmitPartnerFields({ form }: { form: SubmitPartnerForm }) {
  const { t } = useTranslation();
  const { state, set, setRegion, errorFor } = form;
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
          onChange={(e) => set("name", e.target.value)}
          placeholder={t("marketing:submitPartner.fields.name.placeholder")}
        />
      </FormField>

      <div className={styles.row}>
        <FormField
          label={t("marketing:submitPartner.fields.logo.label")}
          required
          error={errorFor("logo")}
          helper={t("marketing:submitPartner.fields.logo.helper")}
        >
          <input
            type="text"
            value={state.logo}
            onChange={(e) => set("logo", e.target.value)}
            placeholder={t("marketing:submitPartner.fields.logo.placeholder")}
            maxLength={5}
          />
        </FormField>

        <FormField
          label={t("marketing:submitPartner.fields.city.label")}
          required
          error={errorFor("city")}
        >
          <input
            type="text"
            value={state.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder={t("marketing:submitPartner.fields.city.placeholder")}
          />
        </FormField>
      </div>

      <div className={styles.row}>
        <FormField
          label={t("marketing:submitPartner.fields.region.label")}
          required
        >
          <select
            value={state.region}
            onChange={(e) => setRegion(e.target.value as Region)}
          >
            {REGION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label={t("marketing:submitPartner.fields.regionLabel.label")}
          required
          error={errorFor("regionLabel")}
          helper={t("marketing:submitPartner.fields.regionLabel.helper")}
        >
          <input
            type="text"
            value={state.regionLabel}
            onChange={(e) => set("regionLabel", e.target.value)}
            placeholder={t(
              "marketing:submitPartner.fields.regionLabel.placeholder",
            )}
          />
        </FormField>
      </div>

      <div className={styles.sectionHead}>
        {t("marketing:submitPartner.fields.sectionPitch")}
      </div>

      <FormField
        label={t("marketing:submitPartner.fields.eyebrow.label")}
        required
        error={errorFor("eyebrow")}
        helper={t("marketing:submitPartner.fields.eyebrow.helper")}
      >
        <input
          type="text"
          value={state.eyebrow}
          onChange={(e) => set("eyebrow", e.target.value)}
          placeholder={t("marketing:submitPartner.fields.eyebrow.placeholder")}
        />
      </FormField>

      <FormField
        label={t("marketing:submitPartner.fields.tagline.label")}
        required
        error={errorFor("tagline")}
        helper={t("marketing:submitPartner.fields.tagline.helper")}
      >
        <textarea
          rows={2}
          value={state.tagline}
          onChange={(e) => set("tagline", e.target.value)}
          placeholder={t("marketing:submitPartner.fields.tagline.placeholder")}
        />
      </FormField>

      <FormField
        label={t("marketing:submitPartner.fields.desc.label")}
        required
        error={errorFor("desc")}
        helper={t("marketing:submitPartner.fields.desc.helper")}
      >
        <textarea
          rows={3}
          value={state.desc}
          onChange={(e) => set("desc", e.target.value)}
          placeholder={t("marketing:submitPartner.fields.desc.placeholder")}
        />
      </FormField>

      <FormField
        label={t("marketing:submitPartner.fields.tags.label")}
        helper={t("marketing:submitPartner.fields.tags.helper")}
      >
        <input
          type="text"
          value={state.tags}
          onChange={(e) => set("tags", e.target.value)}
          placeholder={t("marketing:submitPartner.fields.tags.placeholder")}
        />
      </FormField>

      <div className={styles.sectionHead}>
        {t("marketing:submitPartner.fields.sectionPartnering")}
      </div>

      <div className={styles.row}>
        <FormField
          label={t("marketing:submitPartner.fields.tier.label")}
          required
          error={errorFor("tier")}
          helper={t("marketing:submitPartner.fields.tier.helper")}
        >
          <input
            type="text"
            value={state.tier}
            onChange={(e) => set("tier", e.target.value)}
            placeholder={t("marketing:submitPartner.fields.tier.placeholder")}
          />
        </FormField>

        <FormField
          label={t("marketing:submitPartner.fields.since.label")}
          required
          error={errorFor("since")}
          helper={t("marketing:submitPartner.fields.since.helper")}
        >
          <input
            type="text"
            value={state.since}
            onChange={(e) => set("since", e.target.value)}
            placeholder={t("marketing:submitPartner.fields.since.placeholder")}
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
        onChange={(e) => set("handle", e.target.value)}
      />
    </>
  );
}
