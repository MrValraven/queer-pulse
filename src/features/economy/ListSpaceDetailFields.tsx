import { ChipSelect, DatePicker } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ListSpacePhotoField } from "./ListSpacePhotoField";
import {
  LIST_SPACE_FEATURE_OPTIONS,
  LIST_SPACE_IDEAL_FOR_OPTIONS,
  type ListSpaceChipOption,
} from "./listSpaceOptions.data";
import type { ListSpaceForm } from "./useListSpaceForm";
import styles from "./ApplicationModals.module.css";
import check from "./ListSpaceFields.module.css";

/** Turns a curated option list into the chip row's options, translated for
 * reading while the stored value stays the canonical English string. */
function chipOptions(
  options: ListSpaceChipOption[],
  translate: (key: string) => string,
) {
  return options.map((option) => ({
    value: option.value,
    label: translate(option.labelKey),
  }));
}

/**
 * The second half of the "list a space" form: everything that makes a listing
 * read like a home rather than a row in a table. Photos, the long description,
 * when it's free, the shortest stay, what the place has, and who it suits.
 *
 * All of it reaches the detail page, and none of it used to be asked for, so a
 * member-created home arrived photoless with an empty "About this home".
 * Presentational: state lives in `useListSpaceForm`.
 */
export function ListSpaceDetailFields({ form }: { form: ListSpaceForm }) {
  const { t } = useTranslation();
  const { values, setField } = form;

  return (
    <>
      <div className={styles.field}>
        <label htmlFor="ls-blurb">{t("economy:listSpace.blurbLabel")}</label>
        <input
          id="ls-blurb"
          type="text"
          maxLength={200}
          value={values.blurb}
          onChange={(event) => setField("blurb", event.target.value)}
          placeholder={t("economy:listSpace.blurbPlaceholder")}
          aria-describedby="ls-blurb-hint"
        />
        <p id="ls-blurb-hint" className={check.fieldHint}>
          {t("economy:listSpace.blurbHint")}
        </p>
      </div>

      <div className={styles.field}>
        <label htmlFor="ls-description">
          {t("economy:listSpace.descriptionLabel")}
        </label>
        <textarea
          id="ls-description"
          maxLength={4000}
          value={values.description}
          onChange={(event) => setField("description", event.target.value)}
          placeholder={t("economy:listSpace.descriptionPlaceholder")}
          aria-describedby="ls-description-hint"
        />
        <p id="ls-description-hint" className={check.fieldHint}>
          {t("economy:listSpace.descriptionHint")}
        </p>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label id="ls-available-label" htmlFor="ls-available">
            {t("economy:listSpace.availableLabel")}
          </label>
          <DatePicker
            mode="date"
            id="ls-available"
            labelledBy="ls-available-label"
            clearable
            value={values.availableFrom || null}
            onChange={(value) => setField("availableFrom", value ?? "")}
          />
          <p className={check.fieldHint}>
            {t("economy:listSpace.availableHint")}
          </p>
        </div>
        <div className={styles.field}>
          <label htmlFor="ls-min-stay">
            {t("economy:listSpace.minStayLabel")}
          </label>
          <input
            id="ls-min-stay"
            type="number"
            min={0}
            max={60}
            value={values.minStayMonths}
            onChange={(event) => setField("minStayMonths", event.target.value)}
            placeholder={t("economy:listSpace.minStayPlaceholder")}
            aria-describedby="ls-min-stay-hint"
          />
          <p id="ls-min-stay-hint" className={check.fieldHint}>
            {t("economy:listSpace.minStayHint")}
          </p>
        </div>
      </div>

      <div className={styles.field}>
        <p className={check.chipLabel} id="ls-features-label">
          {t("economy:listSpace.featuresLabel")}
        </p>
        <ChipSelect
          labelledBy="ls-features-label"
          options={chipOptions(LIST_SPACE_FEATURE_OPTIONS, t)}
          selected={new Set(values.features)}
          onToggle={(value) => form.toggleChip("features", value)}
        />
      </div>

      <div className={styles.field}>
        <p className={check.chipLabel} id="ls-ideal-label">
          {t("economy:listSpace.idealForLabel")}
        </p>
        <p className={check.fieldHint} id="ls-ideal-hint">
          {t("economy:listSpace.idealForHint")}
        </p>
        <ChipSelect
          labelledBy="ls-ideal-label"
          options={chipOptions(LIST_SPACE_IDEAL_FOR_OPTIONS, t)}
          selected={new Set(values.idealFor)}
          onToggle={(value) => form.toggleChip("idealFor", value)}
        />
      </div>

      <div className={check.guide}>
        <p className={check.guideTitle}>
          {t("economy:listSpace.photoGuide.title")}
        </p>
        <ul className={check.guideList}>
          <li>{t("economy:listSpace.photoGuide.lit")}</li>
          <li>{t("economy:listSpace.photoGuide.rooms")}</li>
          <li>{t("economy:listSpace.photoGuide.consent")}</li>
        </ul>
      </div>

      <ListSpacePhotoField form={form} />
    </>
  );
}
