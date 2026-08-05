import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LandingSection } from "./api/landingFeatures.api";
import styles from "./AdminLandingPage.module.css";

/** The four raw text fields every section's `copy` is built from — a superset
 *  so one shape can back a controlled form regardless of which section is
 *  active, rather than a per-section union that would force callers to
 *  narrow before rendering. */
export interface LandingCopyFieldsValue {
  quote: string;
  blurb: string;
  cause: string;
  /** Comma-separated in the UI; split into `string[]` only at submit time. */
  tagsText: string;
}

export function emptyLandingCopyValue(): LandingCopyFieldsValue {
  return { quote: "", blurb: "", cause: "", tagsText: "" };
}

/** Seeds the form from an existing feature's `copy` (edit flow). */
export function landingCopyValueFromCopy(
  copy: Record<string, unknown>,
): LandingCopyFieldsValue {
  return {
    quote: typeof copy.quote === "string" ? copy.quote : "",
    blurb: typeof copy.blurb === "string" ? copy.blurb : "",
    cause: typeof copy.cause === "string" ? copy.cause : "",
    tagsText: Array.isArray(copy.tags)
      ? (copy.tags as unknown[]).join(", ")
      : "",
  };
}

/** Trims and reshapes the form value into the exact `copy` payload the
 *  backend's `validateLandingCopy` expects for `section` — the single place
 *  this mapping happens, shared by create (picker) and edit (row editor) so
 *  the two flows can never drift apart. */
export function buildLandingCopy(
  section: LandingSection,
  value: LandingCopyFieldsValue,
): Record<string, unknown> {
  if (section === "member") return { quote: value.quote.trim() };
  if (section === "community") return { blurb: value.blurb.trim() };
  return {
    cause: value.cause.trim(),
    blurb: value.blurb.trim(),
    tags: value.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

/** Mirrors the backend's `validateLandingCopy` requiredness client-side —
 *  member `quote` and changemaker `cause`+`blurb` are required, everything
 *  else (community `blurb`, changemaker `tags`) is optional — so a create
 *  request is never even attempted with copy the server would 400 on. */
export function isLandingCopyValid(
  section: LandingSection,
  value: LandingCopyFieldsValue,
): boolean {
  if (section === "member") return value.quote.trim().length > 0;
  if (section === "changemaker") {
    return value.cause.trim().length > 0 && value.blurb.trim().length > 0;
  }
  return true;
}

/**
 * The per-section copy field group — member `quote` / community optional
 * `blurb` / changemaker `cause`+`blurb`+`tags` — shared between
 * `AdminLandingFeatureEditor` (editing an existing slot) and
 * `AdminLandingEligiblePicker` (composing copy before creating one), so the
 * two flows render and validate the exact same fields.
 */
export function AdminLandingCopyFields({
  section,
  value,
  onChange,
}: {
  section: LandingSection;
  value: LandingCopyFieldsValue;
  onChange: (patch: Partial<LandingCopyFieldsValue>) => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      {section === "member" && (
        <FormField
          className={styles.editorField}
          label={t("admin:landing.editor.quoteLabel")}
          required
          helper={t("admin:landing.editor.quoteHelper")}
        >
          <textarea
            rows={3}
            value={value.quote}
            placeholder={t("admin:landing.editor.quotePlaceholder")}
            onChange={(event) => onChange({ quote: event.target.value })}
          />
        </FormField>
      )}

      {section === "community" && (
        <FormField
          className={styles.editorField}
          label={t("admin:landing.editor.blurbLabel")}
          helper={t("admin:landing.editor.blurbHelperOptional")}
        >
          <textarea
            rows={3}
            value={value.blurb}
            placeholder={t("admin:landing.editor.blurbPlaceholder")}
            onChange={(event) => onChange({ blurb: event.target.value })}
          />
        </FormField>
      )}

      {section === "changemaker" && (
        <>
          <FormField
            className={styles.editorField}
            label={t("admin:landing.editor.causeLabel")}
            required
          >
            <input
              type="text"
              value={value.cause}
              placeholder={t("admin:landing.editor.causePlaceholder")}
              onChange={(event) => onChange({ cause: event.target.value })}
            />
          </FormField>
          <FormField
            className={styles.editorField}
            label={t("admin:landing.editor.blurbLabel")}
            required
          >
            <textarea
              rows={3}
              value={value.blurb}
              placeholder={t("admin:landing.editor.blurbPlaceholder")}
              onChange={(event) => onChange({ blurb: event.target.value })}
            />
          </FormField>
          <FormField
            className={styles.editorField}
            label={t("admin:landing.editor.tagsLabel")}
            helper={t("admin:landing.editor.tagsHelper")}
          >
            <input
              type="text"
              value={value.tagsText}
              placeholder={t("admin:landing.editor.tagsPlaceholder")}
              onChange={(event) => onChange({ tagsText: event.target.value })}
            />
          </FormField>
        </>
      )}
    </>
  );
}
