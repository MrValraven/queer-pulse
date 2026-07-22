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
          <label className={styles.fieldLabel}>
            {t("economy:postProfileForm.pronounsLabel")}
          </label>
          <input
            className={styles.input}
            type="text"
            placeholder={t("economy:postProfileForm.pronounsPlaceholder")}
            value={form.pronouns}
            onChange={(event) => form.setPronouns(event.target.value)}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            {t("economy:postProfileForm.neighbourhoodLabel")}
          </label>
          <select
            className={styles.select}
            value={form.neighbourhood}
            onChange={(event) => form.setNeighbourhood(event.target.value)}
          >
            <option value="">
              {t("economy:postProfileForm.neighbourhoodPlaceholder")}
            </option>
            {NEIGHBOURHOODS.map((neighbourhoodName) => (
              <option key={neighbourhoodName} value={neighbourhoodName}>
                {neighbourhoodName}
              </option>
            ))}
            <option value={t("economy:postProfileForm.anywhereCentral")}>
              {t("economy:postProfileForm.anywhereCentral")}
            </option>
          </select>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            {t("economy:postProfileForm.budgetLabel")}
          </label>
          <input
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
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            {t("economy:postProfileForm.moveInLabel")}
          </label>
          <select
            className={styles.select}
            value={form.moveInOption}
            onChange={(event) => form.setMoveInOption(event.target.value)}
          >
            <option value="">
              {t("economy:postProfileForm.moveInPlaceholder")}
            </option>
            <option value="now">
              {t("economy:flatmates.filter.moveIn.now")}
            </option>
            <option value="jul2026">
              {t("economy:postProfileForm.moveIn.jul2026")}
            </option>
            <option value="aug2026">
              {t("economy:postProfileForm.moveIn.aug2026")}
            </option>
            <option value="sep2026">
              {t("economy:postProfileForm.moveIn.sep2026")}
            </option>
            <option value="flex">
              {t("economy:flatmates.filter.moveIn.flex")}
            </option>
          </select>
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          {t("economy:postProfileForm.aboutLabel")}
        </label>
        <textarea
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
