import { Link } from "react-router-dom";
import { FiEyeOff } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import css from "./StudioHiddenTrack.module.css";

/** The line under a track's title while "Hide explicit tracks" hides it: an
 *  eye-off icon and a link to the setting. Render it only where no link or
 *  button wraps it (every current call site qualifies). */
export function StudioHiddenTrackNote() {
  const { t } = useTranslation();
  return (
    <span className={css.note}>
      <FiEyeOff aria-hidden className={css.noteIcon} />
      <Link to={routes.studioSettings} className={css.noteLink}>
        {t("studio:hiddenTrack.label")}
      </Link>
    </span>
  );
}

/** Stands in the play button's cell for a hidden track: its number (or
 *  nothing, where the row shows none), inert, so the row keeps its grid and
 *  offers nothing to press. */
export function StudioHiddenTrackNumber({ position }: { position?: number }) {
  return (
    <span className={css.number} aria-hidden>
      {position ?? ""}
    </span>
  );
}
