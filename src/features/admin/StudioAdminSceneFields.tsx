import { useId, type ReactNode } from "react";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_DISCOVERY_LIMITS } from "../studio/api/studio.types";
import { ImageUploadField } from "../subprofiles/ImageUploadField";
import css from "./StudioAdminScenes.module.css";

export interface SceneFieldValues {
  name: string;
  city: string;
  slug: string;
  blurb: string;
}

export interface SceneFieldErrors {
  name?: string;
  city?: string;
  slug?: string;
}

/** The scene form's fields: name, city, address, blurb with its count and
 *  the cover. Each error folds open under its field. */
export function StudioAdminSceneFields({
  values,
  errors,
  onChange,
  coverValue,
  onCoverChange,
}: {
  values: SceneFieldValues;
  errors: SceneFieldErrors;
  onChange: (field: keyof SceneFieldValues, value: string) => void;
  /** What the upload field shows: the new key, the saved URL, or "". */
  coverValue: string;
  /** Null removes the cover. */
  onCoverChange: (coverKey: string | null) => void;
}) {
  const { t } = useTranslation();
  const nameId = useId();
  const cityId = useId();
  const slugId = useId();
  const slugHintId = useId();
  const blurbId = useId();
  const blurbCountId = useId();
  const fieldError = (key: string | undefined): ReactNode => (
    <Collapse isOpen={key !== undefined}>
      <p className={css.error}>{key ? t(key) : null}</p>
    </Collapse>
  );
  return (
    <>
      <label htmlFor={nameId} className={css.fieldLabel}>
        {t("admin:studioAdmin.sceneDialog.nameLabel")}
      </label>
      <input
        id={nameId}
        type="text"
        className={css.textInput}
        value={values.name}
        maxLength={STUDIO_DISCOVERY_LIMITS.sceneNameMaxLength}
        aria-invalid={errors.name ? true : undefined}
        onChange={(event) => onChange("name", event.target.value)}
      />
      {fieldError(errors.name)}
      <label htmlFor={cityId} className={css.fieldLabel}>
        {t("admin:studioAdmin.sceneDialog.cityLabel")}
      </label>
      <input
        id={cityId}
        type="text"
        className={css.textInput}
        value={values.city}
        maxLength={STUDIO_DISCOVERY_LIMITS.sceneCityMaxLength}
        aria-invalid={errors.city ? true : undefined}
        onChange={(event) => onChange("city", event.target.value)}
      />
      {fieldError(errors.city)}
      <label htmlFor={slugId} className={css.fieldLabel}>
        {t("admin:studioAdmin.sceneDialog.slugLabel")}
      </label>
      <input
        id={slugId}
        type="text"
        className={css.textInput}
        value={values.slug}
        maxLength={STUDIO_DISCOVERY_LIMITS.sceneSlugMaxLength}
        aria-invalid={errors.slug ? true : undefined}
        aria-describedby={slugHintId}
        onChange={(event) => onChange("slug", event.target.value)}
      />
      <p id={slugHintId} className={css.fieldHint}>
        {t("admin:studioAdmin.sceneDialog.slugHint")}
      </p>
      {fieldError(errors.slug)}
      <label htmlFor={blurbId} className={css.fieldLabel}>
        {t("admin:studioAdmin.sceneDialog.blurbLabel")}
      </label>
      <textarea
        id={blurbId}
        className={css.textarea}
        rows={4}
        value={values.blurb}
        maxLength={STUDIO_DISCOVERY_LIMITS.sceneBlurbMaxLength}
        aria-describedby={blurbCountId}
        onChange={(event) => onChange("blurb", event.target.value)}
      />
      <p id={blurbCountId} className={css.fieldHint}>
        {t("admin:studioAdmin.sceneDialog.blurbCount", {
          count: values.blurb.length,
          max: STUDIO_DISCOVERY_LIMITS.sceneBlurbMaxLength,
        })}
      </p>
      <span className={css.fieldLabel}>
        {t("admin:studioAdmin.sceneDialog.coverLabel")}
      </span>
      <ImageUploadField
        value={coverValue}
        onChange={(key) => onCoverChange(key || null)}
        kind="work-image"
        size={160}
        placeholder={t("admin:studioAdmin.sceneDialog.coverPlaceholder")}
      />
    </>
  );
}
