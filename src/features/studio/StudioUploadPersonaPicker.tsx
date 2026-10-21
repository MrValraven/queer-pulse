import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import { StudioUploadRadioCards } from "./StudioUploadRadioCards";
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
  const lockedReasonId = useId();
  if (personas.length < 2) return null;
  return (
    <fieldset
      className={s.field}
      aria-labelledby={legendId}
      aria-describedby={isLocked ? lockedReasonId : undefined}
      disabled={isLocked}
    >
      <legend id={legendId}>
        {t("studio:uploadFlow.release.personaLabel")}
      </legend>
      <StudioUploadRadioCards
        legendId={legendId}
        value={value}
        options={personas.map((persona) => ({
          id: persona.id,
          label: persona.name,
          meta: t(persona.kindLabelKey),
        }))}
        onChange={(personaId) => {
          const persona = personas.find((item) => item.id === personaId);
          if (persona) onChange(persona);
        }}
      />
      {/* A locked choice says why, beside it and to screen readers. */}
      <p id={lockedReasonId} className={s.fhint}>
        {isLocked ? t("studio:uploadFlow.release.personaLockedReason") : ""}
      </p>
    </fieldset>
  );
}
