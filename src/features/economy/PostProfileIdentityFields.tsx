import { useId } from "react";
import { Select } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PronounField } from "../../shared/identity/PronounField";
import {
  parsePronouns,
  serializePronouns,
} from "../../shared/identity/pronouns";
import {
  IDENTITY_HOUSEHOLD_FIELDS,
  IDENTITY_VISIBILITY_OPTIONS,
  SAFE_SPACE_NEEDS,
} from "./flatmates.data";
import type { usePostProfileFormState } from "./usePostProfileFormState";
import styles from "./FlatmatesPage.module.css";

/** The GDPR Art.9 special-category section: pronouns, gender identity, and
 * safe-space needs. All of it is optional and stays disabled until the member
 * gives explicit, purpose-scoped consent — unchecking the box clears it. The
 * safe-space chips are affirming/values statements only, never exclusions. */
export function PostProfileIdentityFields({
  form,
}: {
  form: ReturnType<typeof usePostProfileFormState>;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const enabled = form.specialCategoryConsent;

  return (
    <div className={styles.identitySection}>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          {t("economy:postProfileForm.identityLabel")}
        </label>
        <p className={styles.fieldHint}>
          {t("economy:postProfileForm.identityHint")}
        </p>
      </div>

      <label className={styles.consentRow}>
        <input
          type="checkbox"
          className={styles.consentCheckbox}
          checked={enabled}
          onChange={(event) =>
            form.setSpecialCategoryConsent(event.target.checked)
          }
        />
        <span className={styles.consentCopy}>
          <Translation
            i18nKey="economy:postProfileForm.consentLabel"
            components={{ em: <em /> }}
          />
        </span>
      </label>

      <fieldset
        className={styles.identityFields}
        disabled={!enabled}
        aria-hidden={!enabled}
      >
        <div className={styles.fieldGroup}>
          <PronounField
            value={parsePronouns(form.pronouns)}
            onChange={(next) => form.setPronouns(serializePronouns(next))}
            labels={{
              field: t("economy:postProfileForm.pronounsLabel"),
              writeOwn: t("economy:postProfileForm.pronounsWriteOwn"),
              placeholder: t("economy:postProfileForm.pronounsPlaceholder"),
              add: t("economy:postProfileForm.pronounsAdd"),
              removeAria: (pronoun) =>
                t("economy:postProfileForm.pronounsRemoveAria", { pronoun }),
            }}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldSubLabel} htmlFor={`${fieldId}-gender`}>
            {t("economy:postProfileForm.genderLabel")}
          </label>
          <input
            id={`${fieldId}-gender`}
            className={styles.input}
            type="text"
            placeholder={t("economy:postProfileForm.genderPlaceholder")}
            value={form.genderIdentity}
            onChange={(event) => form.setGenderIdentity(event.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldSubLabel}>
            {t("economy:postProfileForm.safeSpaceLabel")}
          </label>
          <p className={styles.fieldHint}>
            {t("economy:postProfileForm.safeSpaceHint")}
          </p>
          <div className={styles.lfGrid}>
            {SAFE_SPACE_NEEDS.map((need) => (
              <button
                key={need}
                type="button"
                className={[
                  styles.lfOpt,
                  form.safeSpaceNeeds.has(need) && styles.lfOptOn,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => form.toggleSafeSpaceNeed(need)}
              >
                {need}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldSubLabel}>
            {t("economy:postProfileForm.identityHousehold.label")}
          </label>
          <p className={styles.fieldHint}>
            {t("economy:postProfileForm.identityHousehold.hint")}
          </p>
          <div className={styles.normGrid}>
            {IDENTITY_HOUSEHOLD_FIELDS.map((field) => (
              <div key={field.key} className={styles.fieldGroup}>
                <label
                  className={styles.fieldSubLabel}
                  htmlFor={`${fieldId}-${field.key}`}
                >
                  {t(field.labelKey)}
                </label>
                <Select
                  id={`${fieldId}-${field.key}`}
                  options={[
                    {
                      value: "",
                      label: t("economy:postProfileForm.householdNoPreference"),
                    },
                    ...field.options.map((option) => ({
                      value: option,
                      label: option,
                    })),
                  ]}
                  value={form.identityHousehold[field.key] ?? ""}
                  onChange={(value) =>
                    form.setIdentityHouseholdField(field.key, value ?? "")
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label
            className={styles.fieldSubLabel}
            htmlFor={`${fieldId}-visibility`}
          >
            {t("economy:postProfileForm.visibilityLabel")}
          </label>
          <Select
            id={`${fieldId}-visibility`}
            options={IDENTITY_VISIBILITY_OPTIONS.map((option) => ({
              value: String(option.value),
              label: t(option.labelKey),
            }))}
            value={form.identityVisibility}
            onChange={(value) =>
              form.setIdentityVisibility(
                value as typeof form.identityVisibility,
              )
            }
          />
        </div>
      </fieldset>
    </div>
  );
}
