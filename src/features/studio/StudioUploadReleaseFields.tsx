import { useId } from "react";
import { Collapse, FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  STUDIO_GENRE_LABEL_KEY,
  STUDIO_RELEASE_TYPE_LABEL_KEY,
  formatOfKind,
} from "./api/studio.adapters";
import {
  STUDIO_BUY_URL_MAX,
  STUDIO_GENRES,
  STUDIO_LIMITS,
  STUDIO_MOODS,
  STUDIO_RELEASE_TYPES_BY_KIND,
  type StudioGenre,
  type StudioMood,
} from "./api/studio.types";
import { StudioUploadGaplessField } from "./StudioUploadGaplessField";
import { StudioUploadRadioCards } from "./StudioUploadRadioCards";
import { StudioUploadSceneField } from "./StudioUploadSceneField";
import { STUDIO_MOOD_LABEL_KEY } from "./studioDiscoveryLabels";
import { RELEASE_FIELD_IDS } from "./studioUpload.data";
import {
  releaseFieldCopyOf,
  releaseFormErrors,
} from "./studioUploadDraft.data";
import type { StudioUploadDraft } from "./useStudioUploadDraft";
import s from "./creator.module.css";
import fieldStyles from "./StudioTrackFields.module.css";

/** The release's own details, controlled by the draft. The type choice hides
 *  when the persona has one type (a DJ's mix, a podcaster's show); a show
 *  reads Show name and About the show and has no genre, mood or scene. */
/** A field's hint and its error, read with the field through FormField's
 *  helper (aria-describedby). The error is deliberately no alert of its
 *  own: the summary above the form announces every refusal once, and focus
 *  lands on the first field, which then reads its error. */
function fieldNoteOf(hint: string | null, error: string | null) {
  if (!hint && !error) return undefined;
  return (
    <>
      {hint}
      {hint && error ? " " : null}
      {error ? <span className={s.fieldError}>{error}</span> : null}
    </>
  );
}

export function StudioUploadReleaseFields({
  draft,
}: {
  draft: StudioUploadDraft;
}) {
  const { t } = useTranslation();
  const typeLegendId = useId();
  const { form, setField } = draft;
  const errors = draft.shouldShowErrors ? releaseFormErrors(form) : {};
  // Artist kinds: the types and the field names follow the persona's format.
  const allowedTypes = draft.persona
    ? STUDIO_RELEASE_TYPES_BY_KIND[draft.persona.kind]
    : [];
  const fieldCopy = releaseFieldCopyOf(
    draft.persona ? formatOfKind(draft.persona.kind) : "music",
  );
  const fieldClass = `${s.field} ${fieldStyles.studioField}`;

  return (
    <>
      <Collapse isOpen={allowedTypes.length > 1}>
        <fieldset className={s.field} aria-labelledby={typeLegendId}>
          <legend id={typeLegendId}>
            {t("studio:uploadFlow.release.typeLabel")}
          </legend>
          <StudioUploadRadioCards
            legendId={typeLegendId}
            value={form.type}
            options={allowedTypes.map((type) => ({
              id: type,
              label: t(STUDIO_RELEASE_TYPE_LABEL_KEY[type]),
            }))}
            onChange={(type) => setField("type", type)}
          />
        </fieldset>
      </Collapse>
      <FormField
        className={fieldClass}
        label={t(fieldCopy.titleLabelKey)}
        required
        helper={fieldNoteOf(null, errors.title ? t(errors.title) : null)}
      >
        <input
          id={RELEASE_FIELD_IDS.title}
          aria-invalid={errors.title ? true : undefined}
          type="text"
          value={form.title}
          maxLength={STUDIO_LIMITS.titleMax}
          onChange={(event) => setField("title", event.target.value)}
        />
      </FormField>
      <Collapse isOpen={fieldCopy.isGenreShown}>
        <FormField
          className={fieldClass}
          label={t("studio:upload.metadata.field.genre")}
        >
          <Select
            id={RELEASE_FIELD_IDS.genre}
            options={[
              { value: "", label: t("studio:uploadFlow.release.genreNone") },
              ...STUDIO_GENRES.map((genre) => ({
                value: genre,
                label: t(STUDIO_GENRE_LABEL_KEY[genre]),
              })),
            ]}
            value={form.genre}
            onChange={(value) =>
              setField("genre", (value ?? "") as StudioGenre | "")
            }
          />
        </FormField>
        <FormField
          className={fieldClass}
          label={t("studio:uploadFlow.release.moodLabel")}
        >
          <Select
            options={[
              { value: "", label: t("studio:uploadFlow.release.moodNone") },
              ...STUDIO_MOODS.map((mood) => ({
                value: mood,
                label: t(STUDIO_MOOD_LABEL_KEY[mood]),
              })),
            ]}
            value={form.mood}
            onChange={(value) =>
              setField("mood", (value ?? "") as StudioMood | "")
            }
          />
        </FormField>
        <StudioUploadSceneField
          value={form.sceneId}
          onChange={(sceneId) => setField("sceneId", sceneId)}
        />
      </Collapse>
      <FormField
        className={fieldClass}
        label={t("studio:uploadFlow.release.dateLabel")}
        helper={t("studio:uploadFlow.release.dateHint")}
      >
        <input
          type="date"
          value={form.releasedOn}
          onChange={(event) => setField("releasedOn", event.target.value)}
        />
      </FormField>
      <FormField
        className={fieldClass}
        label={t(fieldCopy.descriptionLabelKey)}
        helper={fieldNoteOf(
          t("studio:uploadFlow.release.descriptionCount", {
            count: form.description.length,
            max: STUDIO_LIMITS.descriptionMax,
          }),
          errors.description ? t(errors.description) : null,
        )}
      >
        <textarea
          id={RELEASE_FIELD_IDS.description}
          aria-invalid={errors.description ? true : undefined}
          rows={5}
          value={form.description}
          maxLength={STUDIO_LIMITS.descriptionMax}
          onChange={(event) => setField("description", event.target.value)}
        />
      </FormField>
      <Collapse isOpen={fieldCopy.isGenreShown}>
        <StudioUploadGaplessField form={form} setField={setField} />
      </Collapse>
      <FormField
        className={fieldClass}
        label={t("studio:uploadFlow.v3.buyUrlLabel")}
        helper={fieldNoteOf(
          t("studio:uploadFlow.v3.buyUrlHint"),
          errors.buyUrl ? t(errors.buyUrl) : null,
        )}
      >
        <input
          id={RELEASE_FIELD_IDS.buyUrl}
          aria-invalid={errors.buyUrl ? true : undefined}
          type="text"
          inputMode="url"
          autoComplete="url"
          value={form.buyUrl}
          maxLength={STUDIO_BUY_URL_MAX}
          placeholder="https://"
          onChange={(event) => setField("buyUrl", event.target.value)}
        />
      </FormField>
    </>
  );
}
