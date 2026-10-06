import { useId } from "react";
import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LandingSection } from "./api/landingFeatures.api";
import {
  isKickerSection,
  LANDING_KICKER_MAX_LENGTH,
  type LandingCopyFieldsValue,
} from "./adminLandingCopyFields.utils";
import styles from "./AdminLandingPage.module.css";

/**
 * The per-section copy field group (member `quote` / community optional
 * `blurb` / changemaker `cause`+`blurb`+`tags` / gathering and story
 * optional short kicker line, stored as `blurb`), shared between
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
  const kickerCountId = useId();

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

      {isKickerSection(section) && (
        <div className={styles.kickerGroup}>
          <FormField
            className={styles.editorField}
            label={t("admin:landing.editor.kickerLabel")}
            helper={t("admin:landing.editor.kickerHelper", {
              max: LANDING_KICKER_MAX_LENGTH,
            })}
          >
            <input
              type="text"
              value={value.blurb}
              maxLength={LANDING_KICKER_MAX_LENGTH}
              aria-describedby={kickerCountId}
              placeholder={t(
                `admin:landing.editor.kickerPlaceholder.${section}`,
              )}
              onChange={(event) => onChange({ blurb: event.target.value })}
            />
          </FormField>
          <span id={kickerCountId} className={styles.kickerCount}>
            {t("admin:landing.editor.kickerCount", {
              count: value.blurb.length,
              max: LANDING_KICKER_MAX_LENGTH,
            })}
          </span>
        </div>
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
