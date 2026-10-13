import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isStudioGenre, STUDIO_GENRE_LABEL_KEY } from "./api/studio.adapters";
import { STUDIO_GENRES, type StudioGenre } from "./api/studio.types";
import css from "./StudioSearch.module.css";

/** The genre beside the type filter. It narrows releases and tracks (the
 *  server ignores it for artists and playlists). */
export function StudioSearchGenreSelect({
  value,
  onChange,
}: {
  value: StudioGenre | null;
  onChange: (genre: StudioGenre | null) => void;
}) {
  const { t } = useTranslation();
  const selectId = useId();
  return (
    <div className={css.genreField}>
      <label htmlFor={selectId}>{t("studio:searchPage.genreLabel")}</label>
      <select
        id={selectId}
        value={value ?? ""}
        onChange={(event) =>
          onChange(
            isStudioGenre(event.target.value) ? event.target.value : null,
          )
        }
      >
        <option value="">{t("studio:searchPage.genreAny")}</option>
        {STUDIO_GENRES.map((genre) => (
          <option key={genre} value={genre}>
            {t(STUDIO_GENRE_LABEL_KEY[genre])}
          </option>
        ))}
      </select>
    </div>
  );
}
