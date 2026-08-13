import { useId } from "react";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MODAL_TAGS, NEIGHBOURHOODS } from "./flatmates.data";
import type { usePostProfileFormState } from "./usePostProfileFormState";
import styles from "./FlatmatesPage.module.css";

/** The controlled field markup for `PostProfileForm`, split out to keep the
 * form component under the 200-line limit. Takes the whole
 * `usePostProfileFormState()` return value as one prop rather than ~14
 * individual props. */
export function PostProfileFormFields({
  form,
}: {
  form: ReturnType<typeof usePostProfileFormState>;
}) {
  const { t } = useTranslation();
  const fieldId = useId();

  return (
    <div className={styles.fields}>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          {t("economy:postProfileForm.lookingForLabel")}
        </label>
        <div className={styles.typeToggle}>
          {(["seeking", "offering"] as const).map((typeOption) => (
            <button
              key={typeOption}
              type="button"
              className={[
                styles.ttOpt,
                form.listingType === typeOption && styles.ttOptOn,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => form.setListingType(typeOption)}
            >
              <div className={styles.ttTitle}>
                {typeOption === "seeking"
                  ? t("economy:flatmates.filter.seeking")
                  : t("economy:flatmates.filter.offering")}
              </div>
              <div className={styles.ttDesc}>
                {typeOption === "seeking"
                  ? t("economy:postProfileForm.seekingDesc")
                  : t("economy:postProfileForm.offeringDesc")}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label
            className={styles.fieldLabel}
            htmlFor={`${fieldId}-neighbourhood`}
          >
            {t("economy:postProfileForm.neighbourhoodLabel")}
          </label>
          <Select
            id={`${fieldId}-neighbourhood`}
            placeholder={t(
              "economy:postProfileForm.neighbourhoodPlaceholder",
            )}
            value={form.neighbourhood || null}
            onChange={(value) => form.setNeighbourhood(value ?? "")}
            options={[
              ...NEIGHBOURHOODS.map((neighbourhoodName) => ({
                value: neighbourhoodName,
                label: neighbourhoodName,
              })),
              {
                value: t("economy:postProfileForm.anywhereCentral"),
                label: t("economy:postProfileForm.anywhereCentral"),
              },
            ]}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor={`${fieldId}-budget`}>
            {t("economy:postProfileForm.budgetLabel")}
          </label>
          <input
            id={`${fieldId}-budget`}
            className={styles.input}
            type="number"
            min={0}
            inputMode="numeric"
            required
            placeholder={t("economy:postProfileForm.budgetPlaceholder")}
            value={form.budget}
            onChange={(event) => form.setBudget(event.target.value)}
          />
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor={`${fieldId}-movein`}>
          {t("economy:postProfileForm.moveInLabel")}
        </label>
        <Select
          id={`${fieldId}-movein`}
          placeholder={t("economy:postProfileForm.moveInPlaceholder")}
          value={form.moveInOption || null}
          onChange={(value) => form.setMoveInOption(value ?? "")}
          options={[
            { value: "now", label: t("economy:flatmates.filter.moveIn.now") },
            {
              value: "jul2026",
              label: t("economy:postProfileForm.moveIn.jul2026"),
            },
            {
              value: "aug2026",
              label: t("economy:postProfileForm.moveIn.aug2026"),
            },
            {
              value: "sep2026",
              label: t("economy:postProfileForm.moveIn.sep2026"),
            },
            { value: "flex", label: t("economy:flatmates.filter.moveIn.flex") },
          ]}
        />
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor={`${fieldId}-about`}>
          {t("economy:postProfileForm.aboutLabel")}
        </label>
        <textarea
          id={`${fieldId}-about`}
          className={styles.textarea}
          rows={4}
          placeholder={t("economy:postProfileForm.aboutPlaceholder")}
          value={form.about}
          onChange={(event) => form.setAbout(event.target.value)}
        />
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          {t("economy:postProfileForm.lifestyleTagsLabel")}
        </label>
        <div className={styles.lfGrid}>
          {MODAL_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={[
                styles.lfOpt,
                form.selectedLifestyleTags.has(tag) && styles.lfOptOn,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => form.toggleLifestyleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
