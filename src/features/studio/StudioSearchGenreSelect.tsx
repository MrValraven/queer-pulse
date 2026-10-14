import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  isStudioFormat,
  isStudioGenre,
  isStudioMood,
  STUDIO_FORMAT_LABEL_KEY,
  STUDIO_GENRE_LABEL_KEY,
} from "./api/studio.adapters";
import {
  STUDIO_FORMATS,
  STUDIO_GENRES,
  STUDIO_MOODS,
  type StudioFormat,
  type StudioGenre,
  type StudioMood,
} from "./api/studio.types";
import { STUDIO_MOOD_LABEL_KEY } from "./studioDiscoveryLabels";
import css from "./StudioSearch.module.css";

/** One vocabulary select beside the type filter: "Any" first, then every
 *  value in list order. Genre and mood narrow releases and tracks (the
 *  server ignores both for artists and playlists). */
function StudioSearchVocabularySelect<Value extends string>({
  labelKey,
  anyKey,
  values,
  labelKeys,
  isValue,
  value,
  onChange,
}: {
  labelKey: string;
  anyKey: string;
  values: readonly Value[];
  labelKeys: Record<Value, string>;
  isValue: (candidate: string) => candidate is Value;
  value: Value | null;
  onChange: (value: Value | null) => void;
}) {
  const { t } = useTranslation();
  const selectId = useId();
  return (
    <div className={css.facetField}>
      <label htmlFor={selectId}>{t(labelKey)}</label>
      <select
        id={selectId}
        value={value ?? ""}
        onChange={(event) =>
          onChange(isValue(event.target.value) ? event.target.value : null)
        }
      >
        <option value="">{t(anyKey)}</option>
        {values.map((option) => (
          <option key={option} value={option}>
            {t(labelKeys[option])}
          </option>
        ))}
      </select>
    </div>
  );
}

export function StudioSearchGenreSelect({
  value,
  onChange,
}: {
  value: StudioGenre | null;
  onChange: (genre: StudioGenre | null) => void;
}) {
  return (
    <StudioSearchVocabularySelect
      labelKey="studio:searchPage.genreLabel"
      anyKey="studio:searchPage.genreAny"
      values={STUDIO_GENRES}
      labelKeys={STUDIO_GENRE_LABEL_KEY}
      isValue={isStudioGenre}
      value={value}
      onChange={onChange}
    />
  );
}

export function StudioSearchMoodSelect({
  value,
  onChange,
}: {
  value: StudioMood | null;
  onChange: (mood: StudioMood | null) => void;
}) {
  return (
    <StudioSearchVocabularySelect
      labelKey="studio:searchPage.moodLabel"
      anyKey="studio:searchPage.moodAny"
      values={STUDIO_MOODS}
      labelKeys={STUDIO_MOOD_LABEL_KEY}
      isValue={isStudioMood}
      value={value}
      onChange={onChange}
    />
  );
}

/** Artist kinds: the format select, beside type, genre and mood. Format
 *  narrows releases, tracks and artists. */
export function StudioSearchFormatSelect({
  value,
  onChange,
}: {
  value: StudioFormat | null;
  onChange: (format: StudioFormat | null) => void;
}) {
  return (
    <StudioSearchVocabularySelect
      labelKey="studio:searchPage.formatLabel"
      anyKey="studio:searchPage.formatAny"
      values={STUDIO_FORMATS}
      labelKeys={STUDIO_FORMAT_LABEL_KEY}
      isValue={isStudioFormat}
      value={value}
      onChange={onChange}
    />
  );
}
