import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ListingFormDraft } from "./adminResourceListingForm.utils";
import type {
  ResourceListingCategory,
  ResourceListingStatus,
} from "./api/adminResourceListings.api";
import styles from "./AdminResourceListingsPage.module.css";

interface FieldsProps {
  draft: ListingFormDraft;
  onChange: (changes: Partial<ListingFormDraft>) => void;
}

const CATEGORY_VALUES: ResourceListingCategory[] = [
  "legal_aid",
  "sexual_health_testing",
];
const STATUS_VALUES: ResourceListingStatus[] = ["active", "archived"];

/** What the listing is: category, title, description, and the region it covers. */
export function AdminResourceListingDetailsFields({
  draft,
  onChange,
}: FieldsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor="listing-category">
        {t("admin:adminResourceListings.field.category")}
      </label>
      <Select
        id="listing-category"
        value={draft.category}
        options={CATEGORY_VALUES.map((value) => ({
          value,
          label: t(`admin:adminResourceListings.category.${value}`),
        }))}
        onChange={(value) =>
          onChange({
            category: (value ?? draft.category) as ResourceListingCategory,
          })
        }
      />

      <label className={styles.fieldLabel} htmlFor="listing-title">
        {t("admin:adminResourceListings.field.title")}
      </label>
      <input
        id="listing-title"
        className={styles.textInput}
        value={draft.title}
        onChange={(event) => onChange({ title: event.target.value })}
        required
      />

      <label className={styles.fieldLabel} htmlFor="listing-description">
        {t("admin:adminResourceListings.field.description")}
      </label>
      <textarea
        id="listing-description"
        className={styles.textarea}
        rows={4}
        value={draft.description}
        onChange={(event) => onChange({ description: event.target.value })}
        required
      />

      <label className={styles.fieldLabel} htmlFor="listing-region">
        {t("admin:adminResourceListings.field.region")}
      </label>
      <input
        id="listing-region"
        className={styles.textInput}
        value={draft.region}
        onChange={(event) => onChange({ region: event.target.value })}
      />
    </div>
  );
}

/** How to reach the listing (phone, email, website) plus its publish status. */
export function AdminResourceListingContactFields({
  draft,
  onChange,
}: FieldsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor="listing-phone">
        {t("admin:adminResourceListings.field.phone")}
      </label>
      <input
        id="listing-phone"
        className={styles.textInput}
        type="tel"
        value={draft.phone}
        onChange={(event) => onChange({ phone: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="listing-email">
        {t("admin:adminResourceListings.field.email")}
      </label>
      <input
        id="listing-email"
        className={styles.textInput}
        type="email"
        value={draft.email}
        onChange={(event) => onChange({ email: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="listing-website">
        {t("admin:adminResourceListings.field.website")}
      </label>
      <input
        id="listing-website"
        className={styles.textInput}
        value={draft.website}
        onChange={(event) => onChange({ website: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="listing-status">
        {t("admin:adminResourceListings.field.status")}
      </label>
      <Select
        id="listing-status"
        value={draft.status}
        options={STATUS_VALUES.map((value) => ({
          value,
          label: t(`admin:adminResourceListings.status.${value}`),
        }))}
        onChange={(value) =>
          onChange({ status: (value ?? draft.status) as ResourceListingStatus })
        }
      />
    </div>
  );
}
