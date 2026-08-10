import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  AdminPressContactDTO,
  AdminPressCoverageDTO,
  PressContactInput,
  PressCoverageInput,
} from "./api/pressKit.api";
import styles from "./AdminPressKitPage.module.css";

/** Which press-kit entity a form/row is editing. `"team"` matches the tab id. */
export type PressKitKind = "coverage" | "team";

/** A superset of every coverage + contact field, so one shape backs the
 *  controlled form regardless of which tab is active — mirroring
 *  `LandingCopyFieldsValue`. Optional-in-the-model fields (`url`, `avatarUrl`)
 *  are `""` in the UI and only collapsed to `null` at submit time. */
export interface PressKitFieldsValue {
  source: string;
  title: string;
  meta: string;
  publishedOn: string;
  url: string;
  name: string;
  role: string;
  description: string;
  languages: string;
  email: string;
  avatarUrl: string;
}

export function emptyPressKitValue(): PressKitFieldsValue {
  return {
    source: "",
    title: "",
    meta: "",
    publishedOn: "",
    url: "",
    name: "",
    role: "",
    description: "",
    languages: "",
    email: "",
    avatarUrl: "",
  };
}

/** Seeds the form from an existing coverage row (edit flow). */
export function pressValueFromCoverage(
  coverage: AdminPressCoverageDTO,
): PressKitFieldsValue {
  return {
    ...emptyPressKitValue(),
    source: coverage.source,
    title: coverage.title,
    meta: coverage.meta,
    publishedOn: coverage.publishedOn,
    url: coverage.url ?? "",
  };
}

/** Seeds the form from an existing contact row (edit flow). */
export function pressValueFromContact(
  contact: AdminPressContactDTO,
): PressKitFieldsValue {
  return {
    ...emptyPressKitValue(),
    name: contact.name,
    role: contact.role,
    description: contact.description,
    languages: contact.languages,
    email: contact.email,
    avatarUrl: contact.avatarUrl ?? "",
  };
}

/** Reshapes the form value into the exact coverage payload the backend
 *  expects — the single place this mapping happens, shared by create + edit. */
export function buildCoverageInput(
  value: PressKitFieldsValue,
): PressCoverageInput {
  const url = value.url.trim();
  return {
    source: value.source.trim(),
    title: value.title.trim(),
    meta: value.meta.trim(),
    publishedOn: value.publishedOn.trim(),
    url: url ? url : null,
  };
}

/** Reshapes the form value into the exact contact payload the backend expects. */
export function buildContactInput(
  value: PressKitFieldsValue,
): PressContactInput {
  const avatarUrl = value.avatarUrl.trim();
  return {
    name: value.name.trim(),
    role: value.role.trim(),
    description: value.description.trim(),
    languages: value.languages.trim(),
    email: value.email.trim(),
    avatarUrl: avatarUrl ? avatarUrl : null,
  };
}

/** Mirrors the backend's requiredness client-side so a request is never made
 *  with a payload the server would 400 on: coverage needs a source + title,
 *  a contact needs a name + email. */
export function isPressKitValid(
  kind: PressKitKind,
  value: PressKitFieldsValue,
): boolean {
  if (kind === "coverage") {
    return value.source.trim().length > 0 && value.title.trim().length > 0;
  }
  return value.name.trim().length > 0 && value.email.trim().length > 0;
}

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
