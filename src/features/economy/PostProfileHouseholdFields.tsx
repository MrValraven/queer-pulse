import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HOUSEHOLD_NORM_FIELDS } from "./flatmates.data";
import type { usePostProfileFormState } from "./usePostProfileFormState";
import styles from "./FlatmatesPage.module.css";

/** Optional shared-living preferences (smoking, pets, guests, cleanliness,
 * sleep, out-at-home). Ordinary data — always visible, no consent needed. */
export function PostProfileHouseholdFields({
  form,
}: {
  form: ReturnType<typeof usePostProfileFormState>;
}) {
  const { t } = useTranslation();
  const fieldId = useId();

  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel}>
        {t("economy:postProfileForm.householdLabel")}
      </label>
      <p className={styles.fieldHint}>
        {t("economy:postProfileForm.householdHint")}
      </p>
      <div className={styles.normGrid}>
        {HOUSEHOLD_NORM_FIELDS.map((field) => (
          <div key={field.key} className={styles.fieldGroup}>
            <label
              className={styles.fieldSubLabel}
              htmlFor={`${fieldId}-${field.key}`}
            >
              {t(field.labelKey)}
            </label>
            <select
              id={`${fieldId}-${field.key}`}
              className={styles.select}
              value={form.householdNorms[field.key] ?? ""}
              onChange={(event) =>
                form.setHouseholdNorm(field.key, event.target.value)
              }
            >
              <option value="">
                {t("economy:postProfileForm.householdNoPreference")}
              </option>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
