import { useId } from "react";
import type { IconType } from "react-icons";
import { FiGlobe, FiLock, FiUsers } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  STUDIO_PLAYLIST_VISIBILITY_HINT_KEY,
  STUDIO_PLAYLIST_VISIBILITY_LABEL_KEY,
} from "./api/studio.adapters";
import type { StudioPlaylistVisibility } from "./api/studio.types";
import css from "./StudioPlaylist.module.css";

const OPTIONS: { value: StudioPlaylistVisibility; Icon: IconType }[] = [
  { value: "public", Icon: FiGlobe },
  { value: "connections", Icon: FiUsers },
  { value: "private", Icon: FiLock },
];

/** Who can open a playlist, as three radio cards (native radios, so arrow
 *  keys move between them). Each radio is named by its title and described
 *  by its hint. */
export function StudioPlaylistVisibilityField({
  value,
  onChange,
}: {
  value: StudioPlaylistVisibility;
  onChange: (visibility: StudioPlaylistVisibility) => void;
}) {
  const { t } = useTranslation();
  const groupName = useId();
  return (
    <fieldset className={css.fieldset}>
      <legend className={css.legend}>
        {t("studio:playlist.dialog.visibilityLegend")}
      </legend>
      <div className={css.radioCards}>
        {OPTIONS.map(({ value: option, Icon }) => (
          <label key={option} className={css.radioCard}>
            <input
              type="radio"
              className={css.radioInput}
              name={groupName}
              value={option}
              checked={value === option}
              aria-labelledby={`${groupName}-${option}-title`}
              aria-describedby={`${groupName}-${option}-hint`}
              onChange={() => onChange(option)}
            />
            <Icon aria-hidden className={css.radioIcon} />
            <span className={css.radioText}>
              <span
                id={`${groupName}-${option}-title`}
                className={css.radioTitle}
              >
                {t(STUDIO_PLAYLIST_VISIBILITY_LABEL_KEY[option])}
              </span>
              <span
                id={`${groupName}-${option}-hint`}
                className={css.radioHint}
              >
                {t(STUDIO_PLAYLIST_VISIBILITY_HINT_KEY[option])}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
