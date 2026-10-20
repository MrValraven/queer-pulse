import { useId } from "react";
import { Collapse, Select } from "../../shared/components/ui";
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
import { StudioUploadSceneField } from "./StudioUploadSceneField";
import { STUDIO_MOOD_LABEL_KEY } from "./studioDiscoveryLabels";
import {
  releaseFieldCopyOf,
  releaseFormErrors,
} from "./studioUploadDraft.data";
import type { StudioUploadDraft } from "./useStudioUploadDraft";
import s from "./creator.module.css";

/** The release's own details, controlled by the draft. The type choice hides
 *  when the persona has one type (a DJ's mix, a podcaster's show); a show
 *  reads Show name and About the show and has no genre, mood or scene. */
export function StudioUploadReleaseFields({
  draft,
}: {
  draft: StudioUploadDraft;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const titleErrorId = useId();
  const genreId = useId();
  const moodId = useId();
  const dateId = useId();
  const descriptionId = useId();
  const descriptionCountId = useId();
  const descriptionErrorId = useId();
  const buyUrlId = useId();
  const buyUrlHintId = useId();
  const buyUrlErrorId = useId();
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

  return (
    <>
      <Collapse isOpen={allowedTypes.length > 1}>
        <fieldset className={s.field} aria-labelledby={typeLegendId}>
          <legend id={typeLegendId}>
            {t("studio:uploadFlow.release.typeLabel")}
          </legend>
          <div className={s.typeOptions}>
            {allowedTypes.map((type) => (
              <label key={type}>
                <input
                  type="radio"
                  name="studio-release-type"
                  value={type}
                  checked={form.type === type}
                  onChange={() => setField("type", type)}
                />{" "}
                {t(STUDIO_RELEASE_TYPE_LABEL_KEY[type])}
              </label>
            ))}
          </div>
        </fieldset>
      </Collapse>
      <div className={s.field}>
        <label htmlFor={titleId}>{t(fieldCopy.titleLabelKey)}</label>
        <input
          id={titleId}
          type="text"
          value={form.title}
          maxLength={STUDIO_LIMITS.titleMax}
          required
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? titleErrorId : undefined}
          onChange={(event) => setField("title", event.target.value)}
        />
        {errors.title && (
          <p id={titleErrorId} className={s.fieldError}>
            {t(errors.title)}
          </p>
        )}
      </div>
      <Collapse isOpen={fieldCopy.isGenreShown}>
        <div className={s.field}>
          <label htmlFor={genreId}>
            {t("studio:upload.metadata.field.genre")}
          </label>
          <Select
            id={genreId}
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
        </div>
        <div className={s.field}>
          <label htmlFor={moodId}>
            {t("studio:uploadFlow.release.moodLabel")}
          </label>
          <Select
            id={moodId}
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
        </div>
        <StudioUploadSceneField
          value={form.sceneId}
          onChange={(sceneId) => setField("sceneId", sceneId)}
        />
      </Collapse>
      <div className={s.field}>
        <label htmlFor={dateId}>
          {t("studio:uploadFlow.release.dateLabel")}
        </label>
        <input
          id={dateId}
          type="date"
          value={form.releasedOn}
          onChange={(event) => setField("releasedOn", event.target.value)}
        />
        <p className={s.fhint}>{t("studio:uploadFlow.release.dateHint")}</p>
      </div>
      <div className={s.field}>
        <label htmlFor={descriptionId}>
          {t(fieldCopy.descriptionLabelKey)}
        </label>
        <textarea
          id={descriptionId}
          rows={5}
          value={form.description}
          maxLength={STUDIO_LIMITS.descriptionMax}
          aria-describedby={[
            descriptionCountId,
            errors.description && descriptionErrorId,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={errors.description ? true : undefined}
          onChange={(event) => setField("description", event.target.value)}
        />
        <p id={descriptionCountId} className={s.fieldCount}>
          {t("studio:uploadFlow.release.descriptionCount", {
            count: form.description.length,
            max: STUDIO_LIMITS.descriptionMax,
          })}
        </p>
        {errors.description && (
          <p id={descriptionErrorId} className={s.fieldError}>
            {t(errors.description)}
          </p>
        )}
      </div>
      <Collapse isOpen={fieldCopy.isGenreShown}>
        <StudioUploadGaplessField form={form} setField={setField} />
      </Collapse>
      <div className={s.field}>
        <label htmlFor={buyUrlId}>
          {t("studio:uploadFlow.v3.buyUrlLabel")}
        </label>
        <input
          id={buyUrlId}
          type="text"
          inputMode="url"
          autoComplete="url"
          value={form.buyUrl}
          maxLength={STUDIO_BUY_URL_MAX}
          placeholder="https://"
          aria-invalid={errors.buyUrl ? true : undefined}
          aria-describedby={[buyUrlHintId, errors.buyUrl && buyUrlErrorId]
            .filter(Boolean)
            .join(" ")}
          onChange={(event) => setField("buyUrl", event.target.value)}
        />
        <p id={buyUrlHintId} className={s.fhint}>
          {t("studio:uploadFlow.v3.buyUrlHint")}
        </p>
        {errors.buyUrl && (
          <p id={buyUrlErrorId} className={s.fieldError}>
            {t(errors.buyUrl)}
          </p>
        )}
      </div>
    </>
  );
}
