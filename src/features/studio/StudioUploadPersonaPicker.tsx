import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import s from "./creator.module.css";

/** Which persona the release belongs to. Skipped with one persona; locked
 *  once the draft exists (a release cannot move between personas). */
export function StudioUploadPersonaPicker({
  personas,
  value,
  isLocked,
  onChange,
}: {
  personas: StudioArtistRefView[];
  value: string;
  isLocked: boolean;
  onChange: (persona: StudioArtistRefView) => void;
}) {
  const { t } = useTranslation();
  const legendId = useId();
  if (personas.length < 2) return null;
  return (
    <fieldset
      className={s.field}
      aria-labelledby={legendId}
      disabled={isLocked}
    >
      <legend id={legendId}>
        {t("studio:uploadFlow.release.personaLabel")}
      </legend>
      <div className={s.typeOptions}>
        {personas.map((persona) => (
          <label key={persona.id}>
            <input
              type="radio"
              name="studio-upload-persona"
              value={persona.id}
              checked={value === persona.id}
              onChange={() => onChange(persona)}
            />{" "}
            {persona.name}{" "}
            <span className={s.fileMeta}>{t(persona.kindLabelKey)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
