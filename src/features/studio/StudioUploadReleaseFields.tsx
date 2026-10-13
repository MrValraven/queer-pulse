import { useId } from "react";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  STUDIO_GENRE_LABEL_KEY,
  STUDIO_RELEASE_TYPE_LABEL_KEY,
} from "./api/studio.adapters";
import {
  STUDIO_GENRES,
  STUDIO_LIMITS,
  STUDIO_RELEASE_TYPES_BY_KIND,
  type StudioGenre,
} from "./api/studio.types";
import { releaseFormErrors } from "./studioUploadDraft.data";
import type { StudioUploadDraft } from "./useStudioUploadDraft";
import s from "./creator.module.css";

/** The release's own details: type, title, genre, date and liner notes, all
 *  controlled by the draft. The type choice hides for a DJ persona (mix is
 *  its only type). */
export function StudioUploadReleaseFields({
  draft,
}: {
  draft: StudioUploadDraft;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const titleErrorId = useId();
  const genreId = useId();
  const dateId = useId();
  const descriptionId = useId();
  const descriptionCountId = useId();
  const descriptionErrorId = useId();
  const typeLegendId = useId();
  const { form, setField } = draft;
  const errors = draft.shouldShowErrors ? releaseFormErrors(form) : {};
  const allowedTypes =
    STUDIO_RELEASE_TYPES_BY_KIND[draft.persona?.kind ?? "musician"];

  return (
    <>
      {allowedTypes.length > 1 && (
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
      )}
      <div className={s.field}>
        <label htmlFor={titleId}>
          {t("studio:upload.metadata.field.title")}
        </label>
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
          {t("studio:uploadFlow.release.descriptionLabel")}
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
    </>
  );
}
