import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  PressKitFieldsValue,
  PressKitKind,
} from "./adminPressKitFields.utils";
import styles from "./AdminPressKitPage.module.css";

/**
 * The per-kind field group, shared between the add form and each row's inline
 * editor so the two flows render and validate the exact same fields — the
 * press-kit analogue of `AdminLandingCopyFields`.
 */
export function AdminPressKitFields({
  kind,
  value,
  onChange,
}: {
  kind: PressKitKind;
  value: PressKitFieldsValue;
  onChange: (patch: Partial<PressKitFieldsValue>) => void;
}) {
  const { t } = useTranslation();

  if (kind === "coverage") {
    return (
      <>
        <div className={styles.fieldRow}>
          <FormField
            className={styles.editorField}
            label={t("admin:pressKit.fields.source")}
            required
          >
            <input
              type="text"
              value={value.source}
              placeholder={t("admin:pressKit.fields.sourcePlaceholder")}
              onChange={(event) => onChange({ source: event.target.value })}
            />
          </FormField>
          <FormField
            className={styles.editorField}
            label={t("admin:pressKit.fields.publishedOn")}
          >
            <input
              type="text"
              value={value.publishedOn}
              placeholder={t("admin:pressKit.fields.publishedOnPlaceholder")}
              onChange={(event) =>
                onChange({ publishedOn: event.target.value })
              }
            />
          </FormField>
        </div>
        <FormField
          className={styles.editorField}
          label={t("admin:pressKit.fields.title")}
          required
        >
          <textarea
            rows={2}
            value={value.title}
            placeholder={t("admin:pressKit.fields.titlePlaceholder")}
            onChange={(event) => onChange({ title: event.target.value })}
          />
        </FormField>
        <FormField
          className={styles.editorField}
          label={t("admin:pressKit.fields.meta")}
          helper={t("admin:pressKit.fields.metaHelper")}
        >
          <input
            type="text"
            value={value.meta}
            placeholder={t("admin:pressKit.fields.metaPlaceholder")}
            onChange={(event) => onChange({ meta: event.target.value })}
          />
        </FormField>
        <FormField
          className={styles.editorField}
          label={t("admin:pressKit.fields.url")}
          helper={t("admin:pressKit.fields.urlHelper")}
        >
          <input
            type="url"
            value={value.url}
            placeholder={t("admin:pressKit.fields.urlPlaceholder")}
            onChange={(event) => onChange({ url: event.target.value })}
          />
        </FormField>
      </>
    );
  }

  return (
    <>
      <div className={styles.fieldRow}>
        <FormField
          className={styles.editorField}
          label={t("admin:pressKit.fields.name")}
          required
        >
          <input
            type="text"
            value={value.name}
            placeholder={t("admin:pressKit.fields.namePlaceholder")}
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </FormField>
        <FormField
          className={styles.editorField}
          label={t("admin:pressKit.fields.role")}
        >
          <input
            type="text"
            value={value.role}
            placeholder={t("admin:pressKit.fields.rolePlaceholder")}
            onChange={(event) => onChange({ role: event.target.value })}
          />
        </FormField>
      </div>
      <FormField
        className={styles.editorField}
        label={t("admin:pressKit.fields.description")}
      >
        <textarea
          rows={2}
          value={value.description}
          placeholder={t("admin:pressKit.fields.descriptionPlaceholder")}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </FormField>
      <div className={styles.fieldRow}>
        <FormField
          className={styles.editorField}
          label={t("admin:pressKit.fields.email")}
          required
        >
          <input
            type="email"
            value={value.email}
            placeholder={t("admin:pressKit.fields.emailPlaceholder")}
            onChange={(event) => onChange({ email: event.target.value })}
          />
        </FormField>
        <FormField
          className={styles.editorField}
          label={t("admin:pressKit.fields.languages")}
        >
          <input
            type="text"
            value={value.languages}
            placeholder={t("admin:pressKit.fields.languagesPlaceholder")}
            onChange={(event) => onChange({ languages: event.target.value })}
          />
        </FormField>
      </div>
      <FormField
        className={styles.editorField}
        label={t("admin:pressKit.fields.avatarUrl")}
        helper={t("admin:pressKit.fields.avatarUrlHelper")}
      >
        <input
          type="url"
          value={value.avatarUrl}
          placeholder={t("admin:pressKit.fields.avatarUrlPlaceholder")}
          onChange={(event) => onChange({ avatarUrl: event.target.value })}
        />
      </FormField>
    </>
  );
}
