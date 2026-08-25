import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GroupListingForm } from "./useGroupListingForm";
import styles from "./ApplicationModals.module.css";
import fields from "./GroupListingFields.module.css";

/**
 * The edit-a-group-room form body. Presentational: every value lives in
 * `useGroupListingForm`. The field set is deliberately the backend's create
 * shape, so a group norm cannot be edited away after approval.
 *
 * `maxLength` on each control mirrors the backend's own bounds
 * (`CreateGroupListingDto`), so the member hits a stop in the field rather than
 * a 400 after submitting. The price and access fields carry their norm as
 * helper text, since those two are why the group's listings are trusted.
 */
export function GroupListingFields({ form }: { form: GroupListingForm }) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.field}>
        <label htmlFor="gl-title">
          {t("economy:groupListing.field.titleLabel")}
        </label>
        <input
          id="gl-title"
          type="text"
          maxLength={160}
          value={form.title}
          onChange={(event) => form.setTitle(event.target.value)}
          placeholder={t("economy:groupListing.field.titlePlaceholder")}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="gl-neighbourhood">
          {t("economy:groupListing.field.neighbourhoodLabel")}
        </label>
        <input
          id="gl-neighbourhood"
          type="text"
          maxLength={120}
          value={form.neighbourhood}
          onChange={(event) => form.setNeighbourhood(event.target.value)}
          placeholder={t("economy:groupListing.field.neighbourhoodPlaceholder")}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="gl-price">
          {t("economy:groupListing.field.priceLabel")}
        </label>
        <input
          id="gl-price"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          value={form.price}
          aria-invalid={form.hasPriceError}
          aria-describedby={
            form.hasPriceError ? "gl-price-error" : "gl-price-hint"
          }
          onChange={(event) => form.setPrice(event.target.value)}
          placeholder={t("economy:groupListing.field.pricePlaceholder")}
        />
        {form.hasPriceError ? (
          <p id="gl-price-error" className={fields.error} role="alert">
            {t("economy:groupListing.field.priceError")}
          </p>
        ) : (
          <p id="gl-price-hint" className={fields.hint}>
            {t("economy:groupListing.field.priceHint")}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="gl-description">
          {t("economy:groupListing.field.descriptionLabel")}
        </label>
        <textarea
          id="gl-description"
          rows={5}
          maxLength={4000}
          value={form.description}
          onChange={(event) => form.setDescription(event.target.value)}
          placeholder={t("economy:groupListing.field.descriptionPlaceholder")}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="gl-access">
          {t("economy:groupListing.field.accessLabel")}
        </label>
        <textarea
          id="gl-access"
          rows={3}
          maxLength={2000}
          value={form.accessibilityInfo}
          aria-describedby="gl-access-hint"
          onChange={(event) => form.setAccessibilityInfo(event.target.value)}
          placeholder={t("economy:groupListing.field.accessPlaceholder")}
        />
        <p id="gl-access-hint" className={fields.hint}>
          {t("economy:groupListing.field.accessHint")}
        </p>
      </div>
    </>
  );
}
