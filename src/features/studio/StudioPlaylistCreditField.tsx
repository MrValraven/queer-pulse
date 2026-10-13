import { useId } from "react";
import { FiUser } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import css from "./StudioPlaylist.module.css";

/** "Show as": the member, or one of their musician or DJ personas. Renders
 *  nothing for a member with no persona (the choice does not exist). Each
 *  radio is named by its title and described by its hint. */
export function StudioPlaylistCreditField({
  personas,
  value,
  onChange,
}: {
  personas: StudioArtistRefView[];
  value: string | null;
  onChange: (subprofileId: string | null) => void;
}) {
  const { t } = useTranslation();
  const groupName = useId();
  if (personas.length === 0) return null;
  return (
    <fieldset className={css.fieldset}>
      <legend className={css.legend}>
        {t("studio:playlist.dialog.creditLegend")}
      </legend>
      <div className={css.radioCards}>
        <label className={css.radioCard}>
          <input
            type="radio"
            className={css.radioInput}
            name={groupName}
            checked={value === null}
            aria-labelledby={`${groupName}-you-title`}
            aria-describedby={`${groupName}-you-hint`}
            onChange={() => onChange(null)}
          />
          <FiUser aria-hidden className={css.radioIcon} />
          <span className={css.radioText}>
            <span id={`${groupName}-you-title`} className={css.radioTitle}>
              {t("studio:playlist.dialog.creditYou")}
            </span>
            <span id={`${groupName}-you-hint`} className={css.radioHint}>
              {t("studio:playlist.dialog.creditYouHint")}
            </span>
          </span>
        </label>
        {personas.map((persona, personaIndex) => (
          <label key={persona.id} className={css.radioCard}>
            <input
              type="radio"
              className={css.radioInput}
              name={groupName}
              checked={value === persona.id}
              aria-labelledby={`${groupName}-persona-${personaIndex}-title`}
              aria-describedby={`${groupName}-persona-${personaIndex}-hint`}
              onChange={() => onChange(persona.id)}
            />
            <span className={css.creditAvatar} aria-hidden>
              <ImageSlot
                src={persona.avatarUrl ?? undefined}
                tint={persona.tint}
                width={28}
                height={28}
                radius={9999}
                shape="circle"
                initials={persona.initials}
                placeholder=""
              />
            </span>
            <span className={css.radioText}>
              <span
                id={`${groupName}-persona-${personaIndex}-title`}
                className={css.radioTitle}
              >
                {persona.name}
              </span>
              <span
                id={`${groupName}-persona-${personaIndex}-hint`}
                className={css.radioHint}
              >
                {t("studio:playlist.dialog.creditPersonaHint", {
                  name: persona.name,
                })}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
