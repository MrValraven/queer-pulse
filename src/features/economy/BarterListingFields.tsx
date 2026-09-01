import { FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Mode } from "./barter.data";
import type { BarterCategoryKey } from "./api/barter.api";
import {
  BARTER_MODES,
  BARTER_MODE_LABEL_KEY,
  POSTABLE_CATEGORIES,
  type BarterListingFormValues,
} from "./barterListingForm";
import styles from "./BarterListingFields.module.css";

/**
 * Every field a swap has, labelled and wired. Used by the edit form; the post
 * strip on the board uses the shorter inline shape but shares this module's
 * `POSTABLE_CATEGORIES` so neither can offer a category the other refuses.
 *
 * Each control is named by its `FormField` label rather than a placeholder,
 * which is what gives it an accessible name (a placeholder is not one).
 * Whether a headline is required follows the mode: an `offering` post needs
 * something on offer, a `seeking` post needs something wanted, and `both`
 * needs each. That is the same rule the server enforces, so the form asks for
 * exactly what will be accepted.
 */
export function BarterListingFields({
  values,
  onChange,
  disabled = false,
}: {
  values: BarterListingFormValues;
  onChange: (next: BarterListingFormValues) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const isOfferRequired = values.mode !== "seeking";
  const isWantRequired = values.mode !== "offering";

  const setValue = <FieldName extends keyof BarterListingFormValues>(
    field: FieldName,
    value: BarterListingFormValues[FieldName],
  ) => onChange({ ...values, [field]: value });

  return (
    <div className={styles.fields}>
      <div className={styles.row}>
        <FormField label={t("economy:barterEdit.field.mode")}>
          <Select
            options={BARTER_MODES.map((mode) => ({
              value: mode,
              label: t(BARTER_MODE_LABEL_KEY[mode]),
            }))}
            value={values.mode}
            onChange={(next) => setValue("mode", (next as Mode) ?? values.mode)}
            disabled={disabled}
          />
        </FormField>

        <FormField label={t("economy:barterEdit.field.category")}>
          <Select
            options={POSTABLE_CATEGORIES.map((category) => ({
              value: category.value,
              label: t(category.labelKey),
            }))}
            value={values.category}
            onChange={(next) =>
              setValue("category", next as BarterCategoryKey | null)
            }
            disabled={disabled}
          />
        </FormField>
      </div>

      <FormField
        label={t("economy:barterEdit.field.offer")}
        required={isOfferRequired}
        helper={t("economy:barterEdit.field.offerHelper")}
      >
        <input
          type="text"
          maxLength={160}
          value={values.offer}
          disabled={disabled}
          onChange={(event) => setValue("offer", event.target.value)}
        />
      </FormField>

      <FormField
        label={t("economy:barterEdit.field.offerDetail")}
        helper={t("economy:barterEdit.field.offerDetailHelper")}
      >
        <textarea
          rows={4}
          maxLength={2000}
          value={values.offerDetail}
          disabled={disabled}
          onChange={(event) => setValue("offerDetail", event.target.value)}
        />
      </FormField>

      <FormField
        label={t("economy:barterEdit.field.want")}
        required={isWantRequired}
        helper={t("economy:barterEdit.field.wantHelper")}
      >
        <input
          type="text"
          maxLength={160}
          value={values.want}
          disabled={disabled}
          onChange={(event) => setValue("want", event.target.value)}
        />
      </FormField>

      <FormField
        label={t("economy:barterEdit.field.wantDetail")}
        helper={t("economy:barterEdit.field.wantDetailHelper")}
      >
        <textarea
          rows={4}
          maxLength={2000}
          value={values.wantDetail}
          disabled={disabled}
          onChange={(event) => setValue("wantDetail", event.target.value)}
        />
      </FormField>

      <FormField
        label={t("economy:barterEdit.field.tags")}
        helper={t("economy:barterEdit.field.tagsHelper")}
      >
        <input
          type="text"
          value={values.tags}
          disabled={disabled}
          onChange={(event) => setValue("tags", event.target.value)}
        />
      </FormField>
    </div>
  );
}
